import { describe, expect, it } from "vitest";

const localStorageMock = (() => {
  const values = new Map();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    key: (index: number) => [...values.keys()][index] ?? null,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
})();
import {
  customBackgroundSchema,
  persistedPreferencesSchema,
  sidebarLinksSchema,
  themeModeSchema,
} from "../../src/stores/preferencesSchemas";

describe("preference schemas", () => {
  it("accepts supported theme modes only", () => {
    expect(themeModeSchema.safeParse("dark").success).toBe(true);
    expect(themeModeSchema.safeParse("system").success).toBe(false);
  });

  it("rejects malformed background settings", () => {
    expect(
      customBackgroundSchema.safeParse({ enabled: true, url: "https://example.com/bg" }).success,
    ).toBe(true);
    expect(customBackgroundSchema.safeParse({ enabled: "yes", url: null }).success).toBe(false);
  });

  it("validates persisted preferences and ignores removed layout data", () => {
    expect(persistedPreferencesSchema.safeParse({ themeMode: "system" }).success).toBe(false);
    expect(persistedPreferencesSchema.parse({ themeMode: "dark", navOrder: "obsolete" })).toEqual({
      themeMode: "dark",
    });
  });

  it("validates cached portal navigation links", () => {
    expect(
      sidebarLinksSchema.safeParse([
        { href: "/Student/Marks", text: "Marks", path: "/Student/Marks" },
      ]).success,
    ).toBe(true);
    expect(sidebarLinksSchema.safeParse([{ href: "/Student/Marks" }]).success).toBe(false);
  });
});

describe("centralized preference persistence", () => {
  it("migrates legacy preferences and discards removed navigation ordering", async () => {
    const { createPreferencesStore } = await import("../../src/stores/preferencesStore");
    globalThis.localStorage = localStorageMock;
    localStorageMock.clear();
    localStorageMock.setItem("superflex-theme-mode", "dark");
    localStorageMock.setItem("superflex_ai_enabled", "false");
    localStorageMock.setItem("superflex-nav-order", "[]");
    localStorageMock.setItem(
      "superflex-preferences-v1",
      JSON.stringify({ version: 0, state: { navOrder: ["Marks"] } }),
    );
    const store = createPreferencesStore();
    expect(store.getState()).toMatchObject({ themeMode: "dark", aiEnabled: false });
    expect(store.getState()).not.toHaveProperty("navOrder");
    expect(localStorageMock.getItem("superflex-nav-order")).toBeNull();
    store.getState().setAiEnabled(true);
    const reloaded = createPreferencesStore();
    expect(reloaded.getState().aiEnabled).toBe(true);
    expect(localStorageMock.getItem("superflex_ai_enabled")).toBe("true");
  });

  it("preserves theme and AI preferences when upgrading past the rearranging feature", async () => {
    const { createPreferencesStore } = await import("../../src/stores/preferencesStore");
    localStorageMock.clear();
    localStorageMock.setItem("superflex-nav-order", '["Home"]');
    localStorageMock.setItem(
      "superflex-preferences-v1",
      JSON.stringify({
        version: 1,
        state: { navOrder: ["Marks"], themeMode: "dark", aiEnabled: false },
      }),
    );
    expect(createPreferencesStore().getState()).toMatchObject({
      themeMode: "dark",
      aiEnabled: false,
    });
  });

  it("rejects unsafe backgrounds and continues working when storage is unavailable", async () => {
    const { createPreferencesStore } = await import("../../src/stores/preferencesStore");
    localStorageMock.clear();
    const store = createPreferencesStore();
    store.getState().setCustomBackground({ enabled: true, url: "javascript:alert(1)" });
    expect(store.getState().customBackground.enabled).toBe(false);
    const original = globalThis.localStorage;
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() {
        throw new Error("blocked");
      },
    });
    try {
      expect(() => store.getState().setThemeMode("dark")).not.toThrow();
      expect(store.getState().themeMode).toBe("dark");
    } finally {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        writable: true,
        value: original,
      });
    }
  });
});
