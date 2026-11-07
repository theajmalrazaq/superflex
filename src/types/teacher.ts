import type * as z from "zod/mini";
import type { teacherSchema, facultyPageSchema } from "../schemas/teacher";

export type Teacher = z.infer<typeof teacherSchema>;
export type FacultyPage = z.infer<typeof facultyPageSchema>;
