import { beforeEach, describe, expect, it, vi } from "vitest";

const memoryStore = new Map<string, any>();
const localStore = new Map<string, string>();

vi.stubGlobal("localStorage", {
  getItem: (k: string) => localStore.get(k) ?? null,
  setItem: (k: string, v: string) => localStore.set(k, String(v)),
  removeItem: (k: string) => localStore.delete(k),
  clear: () => localStore.clear(),
});

vi.mock("../../src/utils/academicStorage", () => ({
  readAcademicState: vi.fn(async (key: string) => memoryStore.get(key) ?? null),
  writeAcademicState: vi.fn(async (key: string, val: any) => {
    memoryStore.set(key, val);
  }),
  deleteAcademicState: vi.fn(async (key: string) => {
    memoryStore.delete(key);
  }),
  updateAcademicState: vi.fn(async (key: string, updater: (cur: any) => any) => {
    const cur = memoryStore.get(key) ?? null;
    const next = updater(cur);
    if (next === null || next === undefined) {
      memoryStore.delete(key);
    } else {
      memoryStore.set(key, next);
    }
    return next;
  }),
}));

import {
  checkAndRecordMarksSnapshot,
  clearPendingUpdateType,
  findMatchingCourse,
  getNormalizedCourseKey,
  getPendingUpdates,
  isCourseMarksUpdated,
  isSectionMarksUpdated,
  isAssessmentMarksUpdated,
  normalizeItemKey,
  normalizeSectionTitle,
} from "../../src/utils/academicSnapshot";
import { setActiveStudentId } from "../../src/utils/studentIdentity";

describe("academicSnapshot synchronization & diffing", () => {
  beforeEach(() => {
    memoryStore.clear();
    localStore.clear();
    setActiveStudentId("21K-1234");
  });

  it("normalizes section titles by stripping percentages and weightage", () => {
    expect(normalizeSectionTitle("Assignments (10%)")).toBe("assignments");
    expect(normalizeSectionTitle("Assignments (10 Weightage)")).toBe("assignments");
    expect(normalizeSectionTitle("Assignments")).toBe("assignments");
    expect(normalizeSectionTitle(" Quizzes ( 15% ) ")).toBe("quizzes");
  });

  it("normalizes item keys regardless of section formatting, numeric precision, or bare numeric titles", () => {
    const key1 = normalizeItemKey("Assignments (10%)#Assignment 1#10#10");
    const key2 = normalizeItemKey("Assignments#Assignment 1#10.0#10.00");
    const key3 = normalizeItemKey({
      section: "Assignments (10%)",
      title: "Assignment 1",
      obtained: 10,
      total: 10,
    });
    const key4 = normalizeItemKey({
      section: "Assignments (10%)",
      name: "1",
      obtained: 10,
      total: 10,
    });
    const key5 = normalizeItemKey("Assignments#1#10#10");
    expect(key1).toBe("assignments#assignment 1#10#10");
    expect(key2).toBe("assignments#assignment 1#10#10");
    expect(key3).toBe("assignments#assignment 1#10#10");
    expect(key4).toBe("assignments#assignment 1#10#10");
    expect(key5).toBe("assignments#assignment 1#10#10");
  });

  it("matches courses across different page key styles via findMatchingCourse", () => {
    const snapshotMap = {
      CS2001: {
        id: "m_tabs_6_1",
        title: "CS2001 - Data Structures",
        rawTitle: "CS2001 - Data Structures",
        items: [],
      },
    };

    const courseFromHome = {
      id: "tab_0",
      title: "Data Structures",
      rawTitle: "Data Structures",
    };

    const match = findMatchingCourse("datastructures", courseFromHome, snapshotMap);
    expect(match).toBeDefined();
    expect(match?.title).toBe("CS2001 - Data Structures");
  });

  it("does not report false updates when switching between Home and Marks representations", async () => {
    // 1. Initial snapshot recorded from HomePage
    const homeCourses = [
      {
        id: "m_tabs_6_1",
        title: "CS2001 - Data Structures",
        sections: [
          {
            id: "sec_assignments",
            title: "Assignments",
            weight: 10,
            rows: [
              { title: "Assignment 1", obtained: 10, total: 10, weight: 5 },
              { title: "Assignment 2", obtained: 8.5, total: 10, weight: 5 },
            ],
          },
        ],
      },
    ];

    const initialResult = await checkAndRecordMarksSnapshot(homeCourses);
    expect(initialResult.newMarks).toHaveLength(0);

    // 2. Navigating to MarksPage where section title has '(10%)'
    const marksPageCourses = [
      {
        id: "m_tabs_6_1",
        title: "CS2001 - Data Structures",
        sections: [
          {
            id: "m_tabs_6_1-Assignments",
            title: "Assignments (10%)",
            weight: 10,
            rows: [
              { title: "Assignment 1", obtained: 10, total: 10, weight: 5 },
              { title: "Assignment 2", obtained: 8.5, total: 10, weight: 5 },
            ],
          },
        ],
      },
    ];

    const marksResult = await checkAndRecordMarksSnapshot(marksPageCourses);
    // MUST BE ZERO! No false positive updates!
    expect(marksResult.newMarks).toHaveLength(0);

    const pending = await getPendingUpdates();
    expect(pending?.newMarks || []).toHaveLength(0);
  });

  it("accurately detects real new marks when an assessment is added", async () => {
    const existingCourses = [
      {
        id: "m_tabs_6_1",
        title: "CS2001 - Data Structures",
        sections: [
          {
            id: "sec_assignments",
            title: "Assignments (10%)",
            weight: 10,
            rows: [{ title: "Assignment 1", obtained: 10, total: 10, weight: 5 }],
          },
        ],
      },
    ];

    await checkAndRecordMarksSnapshot(existingCourses);

    // Next fetch contains Assignment 2
    const updatedCourses = [
      {
        id: "m_tabs_6_1",
        title: "CS2001 - Data Structures",
        sections: [
          {
            id: "sec_assignments",
            title: "Assignments",
            weight: 10,
            rows: [
              { title: "Assignment 1", obtained: 10, total: 10, weight: 5 },
              { title: "Assignment 2", obtained: 9, total: 10, weight: 5 },
            ],
          },
        ],
      },
    ];

    const result = await checkAndRecordMarksSnapshot(updatedCourses);
    expect(result.newMarks).toHaveLength(1);
    expect(result.newMarks[0].assessmentNames).toContain("Assignment 2");

    // Course update checks
    const pending = await getPendingUpdates();
    expect(isCourseMarksUpdated(pending, updatedCourses[0])).toBe(true);
    expect(isSectionMarksUpdated(pending, updatedCourses[0], "Assignments (10%)")).toBe(true);
    expect(isAssessmentMarksUpdated(pending, updatedCourses[0], "Assignment 2")).toBe(true);

    // Clear pending update for marks
    await clearPendingUpdateType("marks");
    const cleared = await getPendingUpdates();
    expect(cleared?.newMarks || []).toHaveLength(0);
  });

  it("merges legacy split course keys in snapshot without false notifications", async () => {
    // Simulate legacy split snapshot where Home saved under 'datastructures' and Marks saved under 'CS2001'
    memoryStore.set("snapshot:21K-1234", {
      timestamp: Date.now(),
      marks: {
        datastructures: {
          id: "tab_0",
          title: "Data Structures",
          rawTitle: "Data Structures",
          items: [{ key: "Assignments#1#10#10", name: "1", section: "Assignments", obtained: 10, total: 10 }],
        },
        CS2001: {
          id: "m_tabs_6_1",
          title: "Data Structures",
          rawTitle: "CS2001 - Data Structures",
          items: [{ key: "Quizzes#1#8#10", name: "1", section: "Quizzes", obtained: 8, total: 10 }],
        },
      },
    });

    const courses = [
      {
        id: "m_tabs_6_1",
        title: "CS2001 - Data Structures",
        sections: [
          {
            id: "sec_assignments",
            title: "Assignments (10%)",
            weight: 10,
            rows: [
              { title: "1", obtained: 10, total: 10, weight: 5 },
              { title: "2", obtained: 0, total: 10, weight: 5, ungraded: true },
            ],
          },
          {
            id: "sec_quizzes",
            title: "Quizzes (10%)",
            weight: 10,
            rows: [{ title: "1", obtained: 8, total: 10, weight: 5 }],
          },
        ],
      },
    ];

    // Navigating Home -> Marks (suppressNotifications: true) -> Home (suppressNotifications: false)
    await checkAndRecordMarksSnapshot(courses, { suppressNotifications: true });
    expect(await getPendingUpdates()).toBeNull();

    const homeResult = await checkAndRecordMarksSnapshot(courses);
    expect(homeResult.newMarks).toHaveLength(0);
    expect(await getPendingUpdates()).toBeNull();

    // Verify split keys were consolidated into canonical CS2001 key
    const savedSnapshot = memoryStore.get("snapshot:21K-1234");
    expect(savedSnapshot.marks.datastructures).toBeUndefined();
    expect(savedSnapshot.marks.CS2001.items).toHaveLength(2);
  });
});
