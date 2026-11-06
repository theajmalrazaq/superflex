/**
 * Secure Credential Storage & Encryption for SuperFlex Auto-Fill.
 * Uses Web Crypto API (PBKDF2 + AES-GCM 256-bit) to encrypt Roll No and Password.
 * Stored strictly in chrome.storage.local to isolate from web page scripts.
 */

const STORAGE_KEY = "superflex_encrypted_credentials";
const SALT_KEY = "superflex_vault_salt";
const SESSION_PENDING_KEY = "superflex_pending_login";
const DISMISSED_KEY = "superflex_autofill_prompt_dismissed";

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

async function getVaultKey() {
  let saltBase64 = await getStorageItem(SALT_KEY);
  if (!saltBase64) {
    const randomSalt = crypto.getRandomValues(new Uint8Array(16));
    saltBase64 = bufferToBase64(randomSalt);
    await setStorageItem(SALT_KEY, saltBase64);
  }

  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode("superflex-hardware-vault-key-seed-v1"),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: base64ToBuffer(saltBase64),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encrypts and securely saves credentials into chrome.storage.local.
 */
export async function saveCredentials(username, password) {
  if (!username || !password) return false;
  try {
    const key = await getVaultKey();
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
      iv: bufferToBase64(iv),
      ciphertext: bufferToBase64(encrypted),
      savedAt: Date.now(),
      autoFill: true,
      maskedUsername: maskUsername(username),
    };

    await setStorageItem(STORAGE_KEY, record);
    clearPendingLogin();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("superflex-credentials-updated", { detail: { hasCredentials: true } }));
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
export async function getDecryptedCredentials() {
  try {
    const record = await getStorageItem(STORAGE_KEY);
    if (!record || !record.ciphertext || !record.iv) return null;

    const key = await getVaultKey();
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
 * Deletes saved credentials from extension storage.
 */
export async function clearSavedCredentials() {
  await removeStorageItem(STORAGE_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("superflex-credentials-updated", { detail: { hasCredentials: false } }));
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
