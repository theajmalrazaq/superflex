import type * as z from "zod/mini";
import { getStudentStorageKey } from "./studentIdentity";

export function readLocalJson<T>(key: string, fallback: T, schema: z.ZodMiniType<T>): T {
  if (!key || typeof localStorage === "undefined") return fallback;
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    const data: unknown = JSON.parse(value);
    const parsed = schema.safeParse(data);
    return parsed.success ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}

export function readStudentJson<T>(
  key: string,
  fallback: T,
  studentId: string | undefined,
  schema: z.ZodMiniType<T>,
): T {
  return readLocalJson(getStudentStorageKey(key, studentId), fallback, schema);
}
