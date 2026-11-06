import { describe, expect, it, beforeEach } from "vitest";
import {
  saveCredentials,
  getDecryptedCredentials,
  clearSavedCredentials,
  hasSavedCredentials,
  savePendingLogin,
  getPendingLogin,
  clearPendingLogin,
} from "./credentialStorage";

// Mock chrome.storage.local for node/vitest environment
const storageMock = new Map();
globalThis.chrome = {
  storage: {
    local: {
      get: (keys, cb) => {
        const res = {};
        for (const k of keys) {
          if (storageMock.has(k)) res[k] = storageMock.get(k);
        }
        cb(res);
      },
      set: (obj, cb) => {
        for (const [k, v] of Object.entries(obj)) {
          storageMock.set(k, v);
        }
        cb?.();
      },
      remove: (keys, cb) => {
        for (const k of keys) storageMock.delete(k);
        cb?.();
      },
    },
  },
};

const sessionStore = new Map();
globalThis.sessionStorage = {
  getItem: (k) => sessionStore.get(k) || null,
  setItem: (k, v) => sessionStore.set(k, String(v)),
  removeItem: (k) => sessionStore.delete(k),
  clear: () => sessionStore.clear(),
};

describe("credentialStorage vault", () => {
  beforeEach(() => {
    storageMock.clear();
    sessionStore.clear();
  });

  it("encrypts and decrypts credentials accurately via AES-GCM", async () => {
    const username = "21K-1234";
    const password = "SuperSecretPassword#2026";

    const saved = await saveCredentials(username, password);
    expect(saved).toBe(true);

    const has = await hasSavedCredentials();
    expect(has).toBe(true);

    const decrypted = await getDecryptedCredentials();
    expect(decrypted).not.toBeNull();
    expect(decrypted.username).toBe(username);
    expect(decrypted.password).toBe(password);
    expect(decrypted.maskedUsername).toBe("21K***34");
  });

  it("wipes credentials on clearSavedCredentials", async () => {
    await saveCredentials("21K-9999", "pass123");
    expect(await hasSavedCredentials()).toBe(true);

    await clearSavedCredentials();
    expect(await hasSavedCredentials()).toBe(false);
    expect(await getDecryptedCredentials()).toBeNull();
  });

  it("handles pending login in sessionStorage across login redirect", () => {
    savePendingLogin("21K-5555", "secret");
    const pending = getPendingLogin();
    expect(pending).not.toBeNull();
    expect(pending.username).toBe("21K-5555");
    expect(pending.password).toBe("secret");

    clearPendingLogin();
    expect(getPendingLogin()).toBeNull();
  });
});
