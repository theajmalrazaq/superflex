import React, { useEffect, useMemo, useRef, useState } from "react";
import TeacherSelectionModal from "./TeacherSelectionModal";
import { getCampusFromRollNumber } from "../data/facultyDirectories";
import { parseFacultyPages } from "../utils/facultyDirectory";

const SELECTIONS_KEY = "superflex_course_teachers_v1";
const COURSES_KEY = "superflex_cached_courses_v1";
const ROLL_NUMBER_KEY = "superflex_student_roll_number_v1";
const ONBOARDING_KEY = "superflex_teacher_onboarding_complete_v1";

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") || fallback;
  } catch {
    return fallback;
  }
};

export default function TeacherSettingsController() {
  const [courses, setCourses] = useState(() => readJson(COURSES_KEY, []));
  const [rollNumber, setRollNumber] = useState(() => localStorage.getItem(ROLL_NUMBER_KEY) || "");
  const [selections, setSelections] = useState(() => readJson(SELECTIONS_KEY, {}));
  const [open, setOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const requests = useRef(new Set());
  const campus = useMemo(() => getCampusFromRollNumber(rollNumber), [rollNumber]);

  useEffect(() => {
    const openSettings = () => {
      setCourses(readJson(COURSES_KEY, []));
      setRollNumber(localStorage.getItem(ROLL_NUMBER_KEY) || "");
      setSelections(readJson(SELECTIONS_KEY, {}));
      setOpen(true);
    };
    const updateCourseData = (event) => {
      const { nextCourses = [], nextRollNumber = "" } = event.detail || {};
      setCourses(nextCourses);
      setRollNumber(nextRollNumber);
      if (localStorage.getItem(ONBOARDING_KEY) !== "complete" && nextCourses.length && nextRollNumber) {
        setOpen(true);
      }
    };

    window.addEventListener("superflex-open-teacher-settings", openSettings);
    window.addEventListener("superflex-teacher-course-data", updateCourseData);
    return () => {
      window.removeEventListener("superflex-open-teacher-settings", openSettings);
      window.removeEventListener("superflex-teacher-course-data", updateCourseData);
    };
  }, []);

  useEffect(() => {
    if (!open || !campus) return;
    const requestKey = `${campus.id}:${retryKey}`;
    if (requests.current.has(requestKey)) return;
    requests.current.add(requestKey);
    setLoading(true);
    setError(false);

    chrome.runtime.sendMessage({ type: "SUPERFLEX_GET_CAMPUS_FACULTY", campusId: campus.id }, (response) => {
      if (chrome.runtime.lastError || !response?.pages) {
        setError(true);
        setLoading(false);
        return;
      }
      const parsedTeachers = parseFacultyPages(response.pages);
      setTeachers(parsedTeachers);
      setError(!parsedTeachers.length || response.pages.every((page) => page.error));
      setLoading(false);
    });
  }, [open, campus, retryKey]);

  const updateSelection = (courseId, teacher) => {
    setSelections((current) => {
      const next = { ...current, [courseId]: teacher };
      localStorage.setItem(SELECTIONS_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("superflex-teachers-updated", { detail: next }));
      return next;
    });
  };

  const finish = () => {
    localStorage.setItem(SELECTIONS_KEY, JSON.stringify(selections));
    localStorage.setItem(ONBOARDING_KEY, "complete");
    setOpen(false);
  };

  return (
    <TeacherSelectionModal
      open={open && courses.length > 0}
      courses={courses}
      campus={campus}
      teachers={teachers}
      loading={loading}
      error={error}
      selections={selections}
      onSelect={updateSelection}
      onSave={finish}
      onSkip={finish}
      onRetry={() => {
        setTeachers([]);
        setRetryKey((key) => key + 1);
      }}
    />
  );
}
