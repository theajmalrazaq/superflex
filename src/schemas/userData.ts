import * as z from "zod/mini";

export const aiMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  switchedModel: z.optional(z.string()),
});
export const aiMessagesSchema = z.array(aiMessageSchema);
export const bookmarkIdsSchema = z.array(z.string());
export type AiMessage = z.infer<typeof aiMessageSchema>;
