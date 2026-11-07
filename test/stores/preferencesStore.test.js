import { describe, expect, it } from "vitest";
import { readNavOrder, resolveNavOrder } from "../../src/stores/preferencesStore";

const localStorageMock = (() => {
  const values = new Map();
  return {
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

  it("rejects malformed persisted navigation state", () => {
    expect(persistedPreferencesSchema.safeParse({ navOrder: ["Home", "Marks"] }).success).toBe(
      true,
    );
    expect(persistedPreferencesSchema.safeParse({ navOrder: "Home" }).success).toBe(false);
  });

  it("validates cached portal navigation links", () => {
    expect(
      sidebarLinksSchema.safeParse([
        { href: "/Student/Marks", text: "Marks", path: "/Student/Marks" },
      ]).success,
    ).toBe(true);
    expect(sidebarLinksSchema.safeParse([{ href: "/Student/Marks" }]).success).toBe(false);
  });

  it("preserves an explicitly stored empty navigation order", () => {
    globalThis.localStorage = localStorageMock;
    localStorageMock.setItem("superflex-nav-order", "[]");
    const stored = readNavOrder();
    expect(stored).toEqual([]);
    expect(
      resolveNavOrder(stored, persistedPreferencesSchema.safeParse({ navOrder: ["Marks"] }), [
        "Home",
      ]),
    ).toEqual([]);
  });

  it("falls back to persisted or current navigation order when local storage is missing or invalid", () => {
    globalThis.localStorage = localStorageMock;
    localStorageMock.removeItem("superflex-nav-order");
    expect(readNavOrder()).toBeNull();
    expect(
      resolveNavOrder(null, persistedPreferencesSchema.safeParse({ navOrder: ["Marks"] }), [
        "Home",
      ]),
    ).toEqual(["Marks"]);

    localStorageMock.setItem("superflex-nav-order", "not-json");
    expect(readNavOrder()).toBeNull();
    expect(
      resolveNavOrder(null, persistedPreferencesSchema.safeParse({ navOrder: "bad" }), ["Home"]),
    ).toEqual(["Home"]);
  });
});
