import { describe, expect, it } from "vitest";
import { cn } from "../../src/utils/cn";

describe("cn", () => {
  it("keeps conditional classes", () => {
    expect(cn("flex", { "items-center": true })).toBe("flex items-center");
  });

  it("lets caller classes override component defaults", () => {
    expect(cn("rounded-2xl px-6", "rounded-full px-4")).toBe("rounded-full px-4");
  });

  it("preserves dark and responsive variants", () => {
    expect(cn("bg-white dark:bg-black", "sm:px-6")).toBe("bg-white dark:bg-black sm:px-6");
  });
});
