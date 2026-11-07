import { describe, expect, it } from "vitest";
import { getStudentStorageKey } from "./studentIdentity";

describe("getStudentStorageKey", () => {
  it("normalizes explicit student IDs before building storage keys", () => {
    expect(getStudentStorageKey("marked-marks", "  ab-123 ")).toBe("marked-marks:AB-123");
  });

  it("returns null for missing or blank student IDs", () => {
    expect(getStudentStorageKey("marked-marks", "")).toBeNull();
    expect(getStudentStorageKey("marked-marks", "   ")).toBeNull();
  });
});
