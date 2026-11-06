/**
 * Secure Credential Storage & Encryption for SuperFlex Auto-Fill.
 * Uses Web Crypto API (PBKDF2 + AES-GCM 256-bit) to encrypt Roll No and Password.
 * Stored strictly in chrome.storage.local to isolate from web page scripts.
 */

const STORAGE_KEY = "superflex_encrypted_credentials";
const DEVICE_KEY = "superflex_credential_device_key";
const SESSION_PENDING_KEY = "superflex_pending_login";
const DISMISSED_KEY = "superflex_autofill_prompt_dismissed";
const VAULT_VERSION = 3;
const PBKDF2_ITERATIONS = 600000;
const MIN_PASSPHRASE_LENGTH = 8;

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function getStorageItem(key) {
  return new Promise((resolve) => {
    try {
      if (globalThis.chrome?.storage?.local) {
        chrome.storage.local.get([key], (res) => {
          resolve(res?.[key] ?? null);
        });
      } else {
        const item = localStorage.getItem(key);
        resolve(item ? JSON.parse(item) : null);
      }
    } catch {
      resolve(null);
    }
  });
}

function setStorageItem(key, value) {
  return new Promise((resolve) => {
    try {
      if (globalThis.chrome?.storage?.local) {
        chrome.storage.local.set({ [key]: value }, () => resolve(true));
      } else {
        localStorage.setItem(key, JSON.stringify(value));
        resolve(true);
      }
    } catch {
      resolve(false);
    }
  });
}

function removeStorageItem(key) {
  return new Promise((resolve) => {
    try {
      if (globalThis.chrome?.storage?.local) {
        chrome.storage.local.remove([key], () => resolve(true));
      } else {
        localStorage.removeItem(key);
        resolve(true);
      }
    } catch {
      resolve(false);
    }
  });
}

async function deriveVaultKey(
  passphrase,
  saltBase64,
  iterations = PBKDF2_ITERATIONS,
  extractable = false,
) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: base64ToBuffer(saltBase64),
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    extractable,
    ["encrypt", "decrypt"],
  );
}

async function getOrCreateDeviceKey() {
  let encodedKey = await getStorageItem(DEVICE_KEY);
  if (!encodedKey) {
    encodedKey = bufferToBase64(crypto.getRandomValues(new Uint8Array(32)));
    if (!(await setStorageItem(DEVICE_KEY, encodedKey))) return null;
  }

  return crypto.subtle.importKey("raw", base64ToBuffer(encodedKey), { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

async function getVaultKey(record, passphrase) {
  if (record.wrappedKey && record.wrapIv) {
    const deviceKey = await getOrCreateDeviceKey();
    if (deviceKey) {
      try {
        const rawKey = await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: base64ToBuffer(record.wrapIv) },
          deviceKey,
          base64ToBuffer(record.wrappedKey),
        );
        return crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, [
          "encrypt",
          "decrypt",
        ]);
      } catch {}
    }
  }

  if (typeof passphrase !== "string" || passphrase.length < MIN_PASSPHRASE_LENGTH) {
    return null;
  }
  return deriveVaultKey(passphrase, record.kdf.salt, record.kdf.iterations || PBKDF2_ITERATIONS);
}

/**
 * Encrypts and securely saves credentials into chrome.storage.local.
 * Automatically generates a cryptographically random passphrase if none is provided.
 */
export async function saveCredentials(username, password, passphrase) {
  if (!username || !password) return false;

  let activePassphrase = passphrase;
  if (!activePassphrase) {
    activePassphrase = bufferToBase64(crypto.getRandomValues(new Uint8Array(32)));
  } else if (
    typeof activePassphrase !== "string" ||
    activePassphrase.length < MIN_PASSPHRASE_LENGTH
  ) {
    return false;
  }

  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltBase64 = bufferToBase64(salt);
    const key = await deriveVaultKey(activePassphrase, saltBase64, PBKDF2_ITERATIONS, true);
    const rawKey = await crypto.subtle.exportKey("raw", key);
    const deviceKey = await getOrCreateDeviceKey();
    if (!deviceKey) return false;
    const wrapIv = crypto.getRandomValues(new Uint8Array(12));
    const wrappedKey = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: wrapIv },
      deviceKey,
      rawKey,
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const payload = JSON.stringify({
      username: username.trim(),
      password,
      savedAt: Date.now(),
    });

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(payload),
    );

    const record = {
      version: VAULT_VERSION,
      kdf: {
        name: "PBKDF2",
        hash: "SHA-256",
        iterations: PBKDF2_ITERATIONS,
        salt: saltBase64,
      },
      iv: bufferToBase64(iv),
      ciphertext: bufferToBase64(encrypted),
      wrapIv: bufferToBase64(wrapIv),
      wrappedKey: bufferToBase64(wrappedKey),
      savedAt: Date.now(),
      autoFill: true,
      maskedUsername: maskUsername(username),
    };

    if (!(await setStorageItem(STORAGE_KEY, record))) return false;
    clearPendingLogin();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("superflex-credentials-updated", { detail: { hasCredentials: true } }),
      );
    }
    return true;
  } catch (err) {
    console.error("[SuperFlex] Failed to encrypt and save credentials:", err);
    return false;
  }
}

/**
 * Retrieves and decrypts saved credentials.
 */
export async function getDecryptedCredentials(passphrase) {
  try {
    const record = await getStorageItem(STORAGE_KEY);
    if (!record || !record.ciphertext || !record.iv) return null;
    if (![2, VAULT_VERSION].includes(record.version) || !record.kdf?.salt || !record.ciphertext) {
      return null;
    }

    const key = await getVaultKey(record, passphrase);
    if (!key) return null;
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBuffer(record.iv) },
      key,
      base64ToBuffer(record.ciphertext),
    );

    const data = JSON.parse(new TextDecoder().decode(decrypted));
    return {
      username: data.username,
      password: data.password,
      savedAt: data.savedAt,
      autoFill: record.autoFill !== false,
      maskedUsername: record.maskedUsername || maskUsername(data.username),
    };
  } catch (err) {
    console.error("[SuperFlex] Failed to decrypt credentials:", err);
    return null;
  }
}

/**
 * Fast check if credentials exist without performing decryption.
 */
export async function hasSavedCredentials() {
  const record = await getStorageItem(STORAGE_KEY);
  return Boolean(record && record.ciphertext && record.iv);
}

/**
 * Returns non-sensitive vault information without decrypting credentials.
 */
export async function getCredentialMetadata() {
  const record = await getStorageItem(STORAGE_KEY);
  if (!record || !record.ciphertext || !record.iv) {
    return { hasCredentials: false };
  }

  return {
    hasCredentials: true,
    version: record.version || 1,
    rememberedOnDevice: Boolean(record.wrappedKey && record.wrapIv),
    maskedUsername: record.maskedUsername || "Saved account",
    savedAt: record.savedAt || null,
  };
}

/**
 * Deletes saved credentials from extension storage.
 */
export async function clearSavedCredentials() {
  await removeStorageItem(STORAGE_KEY);
  await removeStorageItem(DEVICE_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("superflex-credentials-updated", { detail: { hasCredentials: false } }),
    );
  }
}

/**
 * Temporarily records login details during sign-in so HomePage can offer to remember them.
 */
export function savePendingLogin(username, password) {
  try {
    if (!username || !password) return;
    sessionStorage.setItem(
      SESSION_PENDING_KEY,
      JSON.stringify({
        username: username.trim(),
        password,
        timestamp: Date.now(),
      }),
    );
  } catch {}
}

export function getPendingLogin() {
  try {
    const raw = sessionStorage.getItem(SESSION_PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Ignore stale entries (> 5 minutes)
    if (Date.now() - parsed.timestamp > 5 * 60 * 1000) {
      clearPendingLogin();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingLogin() {
  try {
    sessionStorage.removeItem(SESSION_PENDING_KEY);
  } catch {}
}

export function isAutofillPromptDismissed() {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

export function dismissAutofillPrompt(forever = false) {
  clearPendingLogin();
  if (forever) {
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {}
  }
}

export function resetAutofillDismissal() {
  try {
    localStorage.removeItem(DISMISSED_KEY);
  } catch {}
}

function maskUsername(username) {
  const clean = String(username || "").trim();
  if (clean.length <= 4) return clean;
  return clean.slice(0, 3) + "***" + clean.slice(-2);
}
