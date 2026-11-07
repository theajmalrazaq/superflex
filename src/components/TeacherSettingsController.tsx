import { useFacultyStore } from "../stores/facultyStore";
import { useTeacherStore } from "../stores/teacherStore";
import { cachedCoursesSchema } from "../schemas/teacher";
import React, { useEffect, useMemo, useState } from "react";
import SuperFlexSettingsModal from "./SuperFlexSettingsModal";
import { getCampusFromRollNumber } from "../data/facultyDirectories";

const ONBOARDING_KEY = "superflex_teacher_onboarding_complete_v1";
const FIRST_TIME_SETUP_KEY = "superflex_first_time_setup_v1";

export default function TeacherSettingsController() {
  const courses = useTeacherStore((state) => state.courses);
  const rollNumber = useTeacherStore((state) => state.studentId);
  const selections = useTeacherStore((state) => state.selections);
  const updateSelection = useTeacherStore((state) => state.selectTeacher);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("settings");
  const [initialTab, setInitialTab] = useState("teachers");
  const campus = useMemo(() => getCampusFromRollNumber(rollNumber), [rollNumber]);
  const directory = useFacultyStore((state) => (campus ? state.directories[campus.id] : undefined));
  const loadFaculty = useFacultyStore((state) => state.load);
  useEffect(() => {
    const openSettings = () => {
      useTeacherStore.getState().refresh();
      setMode("settings");
      setInitialTab("teachers");
      setOpen(true);
    };

    const openGlobalSettings = (event) => {
      useTeacherStore.getState().refresh();
      setMode("settings");
      setInitialTab(event?.detail?.tab || "teachers");
      setOpen(true);
    };

    const updateCourseData = (event) => {
      const { nextCourses = [], nextRollNumber = "" } = event.detail || {};
      const parsed = cachedCoursesSchema.safeParse(nextCourses);
      if (
        !parsed.success ||
        String(nextRollNumber).trim().toUpperCase() !== useTeacherStore.getState().studentId
      )
        return;
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
    if (open && campus) loadFaculty(campus.id);
  }, [open, campus, loadFaculty]);

  const finish = () => {
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
      teachers={directory?.teachers || []}
      loadingTeachers={directory?.status === "loading"}
      errorTeachers={directory?.status === "error"}
      selections={selections}
      onSelectTeacher={updateSelection}
      onSave={finish}
      onClose={finish}
      onRetryTeachers={() => {
        if (campus) loadFaculty(campus.id, true);
      }}
    />
  );
}
