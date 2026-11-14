import { create } from "zustand";
import { facultyResponseSchema, teacherSchema } from "../schemas/teacher";
import { parseFacultyPages } from "../utils/facultyDirectory";
import { sendExtensionMessage } from "../utils/extensionApi";
import type { Teacher } from "../types/teacher";

const FACULTY_CACHE_PREFIX = "superflex_faculty_dir_v1:";
const FACULTY_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface FacultyDirectory {
  status: "loading" | "ready" | "error";
  teachers: Teacher[];
}
interface FacultyState {
  directories: Record<string, FacultyDirectory>;
  load: (campusId: string, force?: boolean) => void;
}

function readCachedFaculty(campusId: string): Teacher[] | null {
  try {
    const raw = globalThis.localStorage?.getItem(`${FACULTY_CACHE_PREFIX}${campusId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { timestamp?: unknown; teachers?: unknown };
    if (
      typeof parsed?.timestamp !== "number" ||
      Date.now() - parsed.timestamp > FACULTY_CACHE_TTL_MS ||
      !Array.isArray(parsed.teachers)
    ) {
      return null;
    }
    const teachers = parsed.teachers
      .map((item) => teacherSchema.safeParse(item))
      .filter((result) => result.success)
      .map((result) => result.data);
    return teachers.length ? teachers : null;
  } catch {
    return null;
  }
}

function writeCachedFaculty(campusId: string, teachers: Teacher[]) {
  try {
    globalThis.localStorage?.setItem(
      `${FACULTY_CACHE_PREFIX}${campusId}`,
      JSON.stringify({ timestamp: Date.now(), teachers }),
    );
  } catch {}
}

export const useFacultyStore = create<FacultyState>((set, get) => ({
  directories: {},
  load: (campusId, force = false) => {
    const current = get().directories[campusId];
    if (current?.status === "loading" || (!force && current?.status === "ready")) return;
    const update = (directory: FacultyDirectory) =>
      set((state) => ({ directories: { ...state.directories, [campusId]: directory } }));
    if (!force) {
      const cached = readCachedFaculty(campusId);
      if (cached) {
        update({ status: "ready", teachers: cached });
        return;
      }
    }
    update({ status: "loading", teachers: [] });
    sendExtensionMessage({ type: "SUPERFLEX_GET_CAMPUS_FACULTY", campusId }, (response, error) => {
      const parsed = facultyResponseSchema.safeParse(response);
      if (error || !parsed.success) {
        update({ status: "error", teachers: [] });
        return;
      }
      try {
        const teachers = parseFacultyPages(parsed.data.pages);
        if (teachers.length) writeCachedFaculty(campusId, teachers);
        update({ status: teachers.length ? "ready" : "error", teachers });
      } catch {
        update({ status: "error", teachers: [] });
      }
    });
  },
}));
