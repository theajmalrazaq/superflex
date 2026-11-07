import * as z from "zod/mini";
import { nonEmptyStringSchema } from "./common";

export const modelIdSchema = nonEmptyStringSchema.check(
  z.refine((id) => {
    const modelId = id.startsWith("models/") ? id.slice(7) : id;
    return (
      !!modelId &&
      Array.from(modelId).every((char) =>
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._".includes(char),
      )
    );
  }),
);
export const geminiModelSchema = z.object({
  id: modelIdSchema,
  name: nonEmptyStringSchema,
  description: z.optional(z.string()),
  contextWindow: z.optional(z.number().check(z.positive())),
  provider: z.optional(z.string()),
  tier: z.optional(z.string()),
  isFlash: z.optional(z.boolean()),
});
export const geminiModelsSchema = z.array(geminiModelSchema);
export const geminiModelListSchema = z.object({
  models: z.array(
    z.object({
      name: modelIdSchema,
      displayName: z.optional(z.string()),
      description: z.optional(z.string()),
      supportedGenerationMethods: z._default(z.array(z.string()), []),
      inputTokenLimit: z.optional(z.number().check(z.positive())),
    }),
  ),
});
const textPartSchema = z.object({ text: z.optional(z.string()) });
export const geminiResponseSchema = z.object({
  candidates: z.optional(
    z.array(z.object({ content: z.optional(z.object({ parts: z.array(textPartSchema) })) })),
  ),
  error: z.optional(z.object({ message: z.string() })),
});
const contentSchema = z.object({
  role: z.enum(["user", "model"]),
  parts: z.array(z.object({ text: z.string() })),
});
export const geminiPayloadSchema = z.looseObject({
  contents: z.array(contentSchema).check(z.minLength(1)),
  systemInstruction: z.optional(z.looseObject({ parts: z.array(z.object({ text: z.string() })) })),
  system_instruction: z.optional(z.looseObject({ parts: z.array(z.object({ text: z.string() })) })),
  generationConfig: z.optional(
    z.looseObject({
      temperature: z.optional(z.number()),
      maxOutputTokens: z.optional(z.number().check(z.refine(Number.isSafeInteger), z.positive())),
    }),
  ),
});
export const streamRequestSchema = z.object({
  type: z.literal("START"),
  payload: geminiPayloadSchema,
});
export const extensionRequestSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("SUPERFLEX_RESET_STORAGE_ONCE") }),
  z.object({ type: z.literal("SUPERFLEX_AI_PERMISSION_GET") }),
  z.object({
    type: z.literal("SUPERFLEX_AI_PERMISSION_SET"),
    status: z.enum(["granted", "denied"]),
  }),
  z.object({ type: z.literal("SUPERFLEX_AI_CONFIG") }),
  z.object({ type: z.literal("SUPERFLEX_AI_SAVE_KEY"), apiKey: nonEmptyStringSchema }),
  z.object({ type: z.literal("SUPERFLEX_AI_REFRESH_MODELS") }),
  z.object({ type: z.literal("SUPERFLEX_AI_SELECT_MODEL"), model: geminiModelSchema }),
  z.object({ type: z.literal("SUPERFLEX_AI_CHAT"), payload: geminiPayloadSchema }),
  z.object({
    type: z.literal("SUPERFLEX_GET_CAMPUS_FACULTY"),
    campusId: z.enum(["karachi", "lahore", "islamabad", "cfd", "multan", "peshawar"]),
  }),
]);
export function getGeminiText(value: unknown): string {
  const parsed = geminiResponseSchema.safeParse(value);
  return parsed.success
    ? parsed.data.candidates?.[0]?.content?.parts.map((part) => part.text || "").join("") || ""
    : "";
}

export const geminiSettingsSchema = z.object({
  superflex_gemini_api_key: z.catch(nonEmptyStringSchema, ""),
  superflex_gemini_model: z.catch(z.nullable(geminiModelSchema), null),
  superflex_gemini_models: z.catch(geminiModelsSchema, []),
});

export const extensionResponseSchema = z
  .object({
    error: z.optional(z.string()),
    status: z.optional(z.enum(["granted", "denied"])),
    configured: z.optional(z.boolean()),
    model: z.optional(z.nullable(geminiModelSchema)),
    availableModels: z.optional(geminiModelsSchema),
    models: z.optional(geminiModelsSchema),
    text: z.optional(z.string()),
    modelSwitched: z.optional(z.boolean()),
    success: z.optional(z.boolean()),
    reset: z.optional(z.boolean()),
    pages: z.optional(
      z.array(
        z.object({ url: z.httpUrl(), html: z.optional(z.string()), error: z.optional(z.string()) }),
      ),
    ),
  })
  .check(z.refine((response) => Object.keys(response).length > 0));
export type ExtensionResponse = z.infer<typeof extensionResponseSchema>;
export const streamEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("CHUNK"), text: z.string(), fullText: z.string() }),
  z.object({
    type: z.literal("DONE"),
    fullText: z.string(),
    modelSwitched: z.boolean(),
    model: geminiModelSchema,
  }),
  z.object({ type: z.literal("ERROR"), error: z.string() }),
]);
