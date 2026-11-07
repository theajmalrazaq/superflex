import { create } from "zustand";
import { cachedCoursesSchema, teacherSchema, teacherSelectionsSchema } from "../schemas/teacher";
import { nonEmptyStringSchema } from "../schemas/common";
import { getActiveStudentId, getStudentStorageKey } from "../utils/studentIdentity";
import { readStudentJson } from "../utils/jsonStorage";
import type { Teacher } from "../types/teacher";

export const TEACHER_SELECTIONS_KEY = "superflex_course_teachers_v1";
export const TEACHER_COURSES_KEY = "superflex_cached_courses_v1";
type Course = { id: string; title: string };
interface TeacherState {
  studentId: string;
  courses: Course[];
  selections: Record<string, Teacher>;
  refresh: () => void;
  setCourses: (courses: Course[]) => void;
  selectTeacher: (courseId: string, teacher: Teacher) => void;
}
export const readTeacherSelections = (studentId?: string) =>
  readStudentJson(TEACHER_SELECTIONS_KEY, {}, studentId, teacherSelectionsSchema);
export const readCachedCourses = (studentId?: string) =>
  readStudentJson(TEACHER_COURSES_KEY, [], studentId, cachedCoursesSchema);

function currentStudent() {
  const studentId = getActiveStudentId();
  return {
    studentId,
    courses: readCachedCourses(studentId),
    selections: readTeacherSelections(studentId),
  };
}
function save(key: string, studentId: string, value: unknown) {
  const storageKey = getStudentStorageKey(key, studentId);
  if (storageKey) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {}
  }
}

export const createTeacherStore = () =>
  create<TeacherState>((set, get) => ({
    ...currentStudent(),
    refresh: () => set(currentStudent()),
    setCourses: (value) => {
      const parsed = cachedCoursesSchema.safeParse(value);
      const studentId = getActiveStudentId();
      if (!parsed.success || !studentId) return;
      if (get().studentId !== studentId) get().refresh();
      set({ courses: parsed.data });
      save(TEACHER_COURSES_KEY, studentId, parsed.data);
    },
    selectTeacher: (courseId, value) => {
      const parsed = teacherSchema.safeParse(value);
      const parsedId = nonEmptyStringSchema.safeParse(courseId);
      const studentId = getActiveStudentId();
      if (!parsed.success || !parsedId.success || !studentId) return;
      if (get().studentId !== studentId) get().refresh();
      const selections = { ...get().selections, [parsedId.data]: parsed.data };
      set({ selections });
      save(TEACHER_SELECTIONS_KEY, studentId, selections);
    },
  }));
export const useTeacherStore = createTeacherStore();
if (typeof window !== "undefined") {
  window.addEventListener("superflex-student-identity-changed", () =>
    useTeacherStore.getState().refresh(),
  );
  window.addEventListener("storage", (event) => {
    const studentId = getActiveStudentId();
    if (
      event.key === null ||
      event.key === getStudentStorageKey(TEACHER_SELECTIONS_KEY, studentId) ||
      event.key === getStudentStorageKey(TEACHER_COURSES_KEY, studentId)
    )
      useTeacherStore.getState().refresh();
  });
}
