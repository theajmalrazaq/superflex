import * as z from "zod/mini";

export const nonEmptyStringSchema = z.string().check(z.trim(), z.minLength(1));
export const httpUrlSchema = z.httpUrl();
export const optionalHttpUrlSchema = z.union([z.literal(""), httpUrlSchema]);
export const emailAddressSchema = z.email({ pattern: z.regexes.html5Email });
export const optionalEmailSchema = z.union([z.literal(""), emailAddressSchema]);

export function parseJson<T>(text: string, schema: z.ZodMiniType<T>): T | null {
  try {
    const parsed = schema.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
