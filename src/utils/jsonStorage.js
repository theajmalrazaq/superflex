import { getStudentStorageKey } from "./studentIdentity";

export function readLocalJson(key, fallback) {
  if (!key || typeof localStorage === "undefined") return fallback;
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function readStudentJson(key, fallback, studentId) {
  return readLocalJson(getStudentStorageKey(key, studentId), fallback);
}
