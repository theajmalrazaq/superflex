import { describe, expect, it } from "vitest";
import {
  customBackgroundSchema,
  persistedPreferencesSchema,
  sidebarLinksSchema,
  themeModeSchema,
} from "./preferencesSchemas";

describe("preference schemas", () => {
  it("accepts supported theme modes only", () => {
    expect(themeModeSchema.safeParse("dark").success).toBe(true);
    expect(themeModeSchema.safeParse("system").success).toBe(false);
  });

  it("rejects malformed background settings", () => {
    expect(customBackgroundSchema.safeParse({ enabled: true, url: "https://example.com/bg" }).success).toBe(true);
    expect(customBackgroundSchema.safeParse({ enabled: "yes", url: null }).success).toBe(false);
  });

  it("rejects malformed persisted navigation state", () => {
    expect(persistedPreferencesSchema.safeParse({ navOrder: ["Home", "Marks"] }).success).toBe(true);
    expect(persistedPreferencesSchema.safeParse({ navOrder: "Home" }).success).toBe(false);
  });

  it("validates cached portal navigation links", () => {
    expect(sidebarLinksSchema.safeParse([
      { href: "/Student/Marks", text: "Marks", path: "/Student/Marks" },
    ]).success).toBe(true);
    expect(sidebarLinksSchema.safeParse([{ href: "/Student/Marks" }]).success).toBe(false);
  });
});
