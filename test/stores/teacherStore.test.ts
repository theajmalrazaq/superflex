import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTeacherStore, TEACHER_SELECTIONS_KEY } from "../../src/stores/teacherStore";
import {
  clearActiveStudentId,
  getStudentStorageKey,
  setActiveStudentId,
} from "../../src/utils/studentIdentity";

const values = new Map<string, string>();
const teacher = {
  id: "one",
  name: "Professor",
  email: "teacher@nu.edu.pk",
  designation: "Lecturer",
  image: "",
  source: "manual",
};
beforeEach(() => {
  values.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
});

describe("per-student shared teacher state", () => {
  it("notifies subscribers and restores each student's own selections", () => {
    setActiveStudentId("23K-1234");
    const store = createTeacherStore();
    const changed = vi.fn();
    store.subscribe(changed);
    store.getState().selectTeacher("course-a", teacher);
    expect(changed).toHaveBeenCalledOnce();
    expect(store.getState().selections["course-a"]).toEqual(teacher);
    setActiveStudentId("23L-5678");
    store.getState().selectTeacher("course-b", { ...teacher, id: "two" });
    expect(Object.keys(store.getState().selections)).toEqual(["course-b"]);
    setActiveStudentId("23K-1234");
    store.getState().refresh();
    expect(Object.keys(store.getState().selections)).toEqual(["course-a"]);
    clearActiveStudentId();
    store.getState().refresh();
    expect(store.getState().selections).toEqual({});
    store.getState().selectTeacher("logged-out", teacher);
    expect(store.getState().selections).toEqual({});
  });

  it("ignores malformed persisted records and preserves valid state on invalid writes", () => {
    setActiveStudentId("23K-1234");
    values.set(getStudentStorageKey(TEACHER_SELECTIONS_KEY)!, '{"course":{"name":12}}');
    const store = createTeacherStore();
    expect(store.getState().selections).toEqual({});
    store.getState().selectTeacher("valid", teacher);
    store.getState().selectTeacher("invalid", { ...teacher, email: "wrong@@example.com" });
    expect(Object.keys(store.getState().selections)).toEqual(["valid"]);
    expect(createTeacherStore().getState().selections).toEqual(store.getState().selections);
  });
});
