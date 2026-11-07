import * as z from "zod/mini";
import { nonEmptyStringSchema, optionalEmailSchema, optionalHttpUrlSchema } from "./common";

export const teacherSchema = z.object({
  id: nonEmptyStringSchema,
  name: nonEmptyStringSchema,
  email: optionalEmailSchema,
  designation: z.string(),
  image: optionalHttpUrlSchema,
  source: z.string(),
});
export const teacherSelectionsSchema = z.record(z.string(), teacherSchema);
export const cachedCoursesSchema = z.array(
  z.object({ id: nonEmptyStringSchema, title: nonEmptyStringSchema }),
);
export const facultyPageSchema = z.object({
  url: z.httpUrl(),
  html: z.optional(z.string()),
  error: z.optional(z.string()),
});
export const facultyResponseSchema = z.object({ pages: z.array(facultyPageSchema) });
