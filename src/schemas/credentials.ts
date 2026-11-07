import * as z from "zod/mini";
import { nonEmptyStringSchema } from "./common";

const timestampSchema = z.number().check(z.nonnegative(), z.refine(Number.isSafeInteger));
export const credentialPayloadSchema = z.object({
  username: nonEmptyStringSchema,
  password: z.string().check(z.minLength(1)),
  savedAt: timestampSchema,
});
export const pendingLoginSchema = z.object({
  username: nonEmptyStringSchema,
  password: z.string().check(z.minLength(1)),
  timestamp: timestampSchema,
});
export const credentialRecordSchema = z.object({
  version: z.union([z.literal(2), z.literal(3)]),
  kdf: z.object({
    name: z.literal("PBKDF2"),
    hash: z.literal("SHA-256"),
    salt: z.base64().check(z.minLength(1)),
    iterations: z.number().check(z.refine(Number.isSafeInteger), z.minimum(1), z.maximum(10000000)),
  }),
  iv: z.base64().check(z.minLength(1)),
  ciphertext: z.base64().check(z.minLength(1)),
  wrappedKey: z.optional(z.base64().check(z.minLength(1))),
  wrapIv: z.optional(z.base64().check(z.minLength(1))),
  autoFill: z.optional(z.boolean()),
  maskedUsername: z.optional(z.string()),
  savedAt: z.optional(timestampSchema),
});
export type CredentialRecord = z.infer<typeof credentialRecordSchema>;
