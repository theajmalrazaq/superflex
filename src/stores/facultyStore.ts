import { create } from "zustand";
import { facultyResponseSchema } from "../schemas/teacher";
import { parseFacultyPages } from "../utils/facultyDirectory";
import { sendExtensionMessage } from "../utils/extensionApi";
import type { Teacher } from "../types/teacher";

interface FacultyDirectory {
  status: "loading" | "ready" | "error";
  teachers: Teacher[];
}
interface FacultyState {
  directories: Record<string, FacultyDirectory>;
  load: (campusId: string, force?: boolean) => void;
}

export const useFacultyStore = create<FacultyState>((set, get) => ({
  directories: {},
  load: (campusId, force = false) => {
    const current = get().directories[campusId];
    if (current?.status === "loading" || (!force && current?.status === "ready")) return;
    const update = (directory: FacultyDirectory) =>
      set((state) => ({ directories: { ...state.directories, [campusId]: directory } }));
    update({ status: "loading", teachers: [] });
    sendExtensionMessage({ type: "SUPERFLEX_GET_CAMPUS_FACULTY", campusId }, (response, error) => {
      const parsed = facultyResponseSchema.safeParse(response);
      if (error || !parsed.success) {
        update({ status: "error", teachers: [] });
        return;
      }
      try {
        const teachers = parseFacultyPages(parsed.data.pages);
        update({ status: teachers.length ? "ready" : "error", teachers });
      } catch {
        update({ status: "error", teachers: [] });
      }
    });
  },
}));
