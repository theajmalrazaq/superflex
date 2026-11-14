import { describe, expect, it } from "vitest";
import {
  extensionRequestSchema,
  extensionResponseSchema,
  geminiModelListSchema,
  geminiSettingsSchema,
  streamEventSchema,
  getGeminiText,
} from "../../src/schemas/gemini";
import { teacherSelectionsSchema } from "../../src/schemas/teacher";
import { createManualTeacher } from "../../src/utils/teacherSelection";
import { extractFacultyEmail } from "../../src/utils/facultyDirectory";
import { parseAcademicDate } from "../../src/utils/academicDate";
import { parseFloatOrZero } from "../../src/utils/marksProcessor";
import { questionText } from "../../src/utils/markdown";

describe("external data schemas", () => {
  it("validates message discriminators and required action payloads", () => {
    expect(
      extensionRequestSchema.safeParse({ type: "SUPERFLEX_AI_PERMISSION_SET", status: "anything" })
        .success,
    ).toBe(false);
    expect(
      extensionRequestSchema.safeParse({
        type: "SUPERFLEX_AI_SELECT_MODEL",
        model: { id: "../bad?key=value", name: "Bad" },
      }).success,
    ).toBe(false);
    expect(
      extensionRequestSchema.safeParse({ type: "SUPERFLEX_AI_CHAT", payload: { contents: "bad" } })
        .success,
    ).toBe(false);
    expect(
      extensionRequestSchema.safeParse({
        type: "SUPERFLEX_AI_CHAT",
        payload: {
          contents: [{ role: "user", parts: [{ text: "Hello" }] }],
          system_instruction: { parts: [{ text: "Instructions" }] },
          generationConfig: { maxOutputTokens: 2048 },
        },
      }).success,
    ).toBe(true);
    expect(extensionResponseSchema.safeParse({ models: "bad" }).success).toBe(false);
    expect(extensionResponseSchema.safeParse({ unknown: true }).success).toBe(false);
    expect(streamEventSchema.safeParse({ type: "CHUNK", fullText: 12 }).success).toBe(false);
  });

  it("recovers from corrupted persisted model settings and handles textless response parts", () => {
    expect(
      geminiSettingsSchema.parse({
        superflex_gemini_model: { id: 42 },
        superflex_gemini_models: "bad",
      }),
    ).toEqual({
      superflex_gemini_api_key: "",
      superflex_gemini_model: null,
      superflex_gemini_models: [],
    });
    expect(
      getGeminiText({
        candidates: [
          { content: { parts: [{ text: "Hello" }, { functionCall: {} }, { text: " world" }] } },
        ],
      }),
    ).toBe("Hello world");
    expect(
      getGeminiText({
        candidates: [
          {
            content: {
              parts: [{ text: "Thinking deeply...", thought: true }, { text: "Final answer" }],
            },
          },
        ],
      }),
    ).toBe("Final answer");
    expect(getGeminiText({ candidates: "invalid" })).toBe("");
    expect(
      geminiModelListSchema.parse({ models: [{ name: "models/embedding" }] }).models[0]
        .supportedGenerationMethods,
    ).toEqual([]);
  });

  it("validates complete emails instead of matching a valid-looking substring", () => {
    expect(createManualTeacher("Professor", "wrong@@nu.edu.pk")).toBeNull();
    expect(createManualTeacher("Professor", "")).toMatchObject({ email: "" });
    expect(extractFacultyEmail("Contact <o'connor+office@nu.edu.pk>, office hours 12-2")).toBe(
      "o'connor+office@nu.edu.pk",
    );
    expect(extractFacultyEmail("Contact wrong@@nu.edu.pk")).toBe("");
    expect(extractFacultyEmail("Email:teacher@nu.edu.pk; Office:12")).toBe("teacher@nu.edu.pk");
    expect(teacherSelectionsSchema.safeParse({ course: { name: "Missing fields" } }).success).toBe(
      false,
    );
  });
});

describe("native parsing with schema validation", () => {
  it("rejects impossible calendar dates rather than rolling them into another month", () => {
    expect(parseAcademicDate("2026-02-30")).toBeNull();
    expect(parseAcademicDate("29/02/2025", "day-first")).toBeNull();
    expect(parseAcademicDate("29/02/2024", "day-first")?.getDate()).toBe(29);
    expect(parseAcademicDate("2026-11-07")?.getMonth()).toBe(10);
  });

  it("does not manufacture scores by stripping arbitrary characters", () => {
    expect(parseFloatOrZero("12/20")).toBe(0);
    expect(parseFloatOrZero("unknown12")).toBe(0);
    expect(parseFloatOrZero("1e2")).toBe(100);
    expect(parseFloatOrZero("1,234.5%")).toBe(1234.5);
    expect(parseFloatOrZero(Infinity)).toBe(0);
    expect(parseFloatOrZero(true)).toBe(0);
  });

  it("extracts readable question text through the same Markdown grammar", () => {
    expect(questionText("- Check marks\n- And attendance")).toBe("Check marks And attendance");
    expect(
      questionText(
        "Compare **marks** using [this guide](https://example.test/a_(b)). ![ignore](https://example.test/image.png)",
      ),
    ).toBe("Compare marks using this guide.");
  });
});
