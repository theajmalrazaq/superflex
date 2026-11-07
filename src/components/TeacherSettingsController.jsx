import React, { useEffect, useMemo, useRef, useState } from "react";
import SuperFlexSettingsModal from "./SuperFlexSettingsModal";
import { getCampusFromRollNumber } from "../data/facultyDirectories";
import { parseFacultyPages } from "../utils/facultyDirectory";
import { sendExtensionMessage } from "../utils/extensionApi";
import { getActiveStudentId, getStudentStorageKey } from "../utils/studentIdentity";
import { readLocalJson } from "../utils/jsonStorage";

const SELECTIONS_KEY = "superflex_course_teachers_v1";
const COURSES_KEY = "superflex_cached_courses_v1";
const ONBOARDING_KEY = "superflex_teacher_onboarding_complete_v1";
const FIRST_TIME_SETUP_KEY = "superflex_first_time_setup_v1";

export default function TeacherSettingsController() {
  const [courses, setCourses] = useState(() =>
    readLocalJson(getStudentStorageKey(COURSES_KEY), []),
  );
  const [rollNumber, setRollNumber] = useState(getActiveStudentId);
  const [selections, setSelections] = useState(() =>
    readLocalJson(getStudentStorageKey(SELECTIONS_KEY), {}),
  );
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("settings");
  const [initialTab, setInitialTab] = useState("teachers");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const requests = useRef(new Set());
  const campus = useMemo(() => getCampusFromRollNumber(rollNumber), [rollNumber]);

  useEffect(() => {
    const openSettings = () => {
      setCourses(readLocalJson(getStudentStorageKey(COURSES_KEY), []));
      setRollNumber(getActiveStudentId());
      setSelections(readLocalJson(getStudentStorageKey(SELECTIONS_KEY), {}));
      setMode("settings");
      setInitialTab("teachers");
      setOpen(true);
    };

    const openGlobalSettings = (event) => {
      setCourses(readLocalJson(getStudentStorageKey(COURSES_KEY), []));
      setRollNumber(getActiveStudentId());
      setSelections(readLocalJson(getStudentStorageKey(SELECTIONS_KEY), {}));
      setMode("settings");
      setInitialTab(event?.detail?.tab || "teachers");
      setOpen(true);
    };

    const updateCourseData = (event) => {
      const { nextCourses = [], nextRollNumber = "" } = event.detail || {};
      setCourses(nextCourses);
      setRollNumber(nextRollNumber);
      setSelections(readLocalJson(getStudentStorageKey(SELECTIONS_KEY, nextRollNumber), {}));
      if (
        localStorage.getItem(FIRST_TIME_SETUP_KEY) !== "complete" &&
        nextCourses.length &&
        nextRollNumber
      ) {
        setMode("setup");
        setInitialTab("teachers");
        setOpen(true);
      }
    };

    window.addEventListener("superflex-open-teacher-settings", openSettings);
    window.addEventListener("superflex-open-global-settings", openGlobalSettings);
    window.addEventListener("superflex-teacher-course-data", updateCourseData);
    return () => {
      window.removeEventListener("superflex-open-teacher-settings", openSettings);
      window.removeEventListener("superflex-open-global-settings", openGlobalSettings);
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

    sendExtensionMessage(
      { type: "SUPERFLEX_GET_CAMPUS_FACULTY", campusId: campus.id },
      (response, error) => {
        if (error || !response?.pages) {
          setError(true);
          setLoading(false);
          return;
        }
        const parsedTeachers = parseFacultyPages(response.pages);
        setTeachers(parsedTeachers);
        setError(!parsedTeachers.length || response.pages.every((page) => page.error));
        setLoading(false);
      },
    );
  }, [open, campus, retryKey]);

  const updateSelection = (courseId, teacher) => {
    setSelections((current) => {
      const next = { ...current, [courseId]: teacher };
      const key = getStudentStorageKey(SELECTIONS_KEY);
      if (key) localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("superflex-teachers-updated", { detail: next }));
      return next;
    });
  };

  const finish = () => {
    const key = getStudentStorageKey(SELECTIONS_KEY);
    if (key) localStorage.setItem(key, JSON.stringify(selections));
    localStorage.setItem(FIRST_TIME_SETUP_KEY, "complete");
    localStorage.setItem(ONBOARDING_KEY, "complete");
    setOpen(false);
  };

  return (
    <SuperFlexSettingsModal
      open={open && (courses.length > 0 || mode === "settings")}
      mode={mode}
      initialTab={initialTab}
      courses={courses}
      campus={campus}
      teachers={teachers}
      loadingTeachers={loading}
      errorTeachers={error}
      selections={selections}
      onSelectTeacher={updateSelection}
      onSave={finish}
      onClose={finish}
      onRetryTeachers={() => {
        setTeachers([]);
        setRetryKey((key) => key + 1);
      }}
    />
  );
}
