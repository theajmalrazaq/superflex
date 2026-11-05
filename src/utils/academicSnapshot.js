const SNAPSHOT_STORAGE_KEY = "superflex_academic_snapshot_v1";
const UPDATES_STORAGE_KEY = "superflex_academic_updates_v1";

export const getAcademicSnapshot = () => {
  try {
    return JSON.parse(localStorage.getItem(SNAPSHOT_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
};

export const getPendingUpdates = () => {
  try {
    return JSON.parse(localStorage.getItem(UPDATES_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
};

export const clearPendingUpdates = () => {
  try {
    localStorage.removeItem(UPDATES_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("superflex-academic-updates-cleared"));
  } catch {}
};

/**
 * Compares incoming marks against previous snapshot and records any new assessments
 */
export const checkAndRecordMarksSnapshot = (currentCourses) => {
  if (!Array.isArray(currentCourses) || currentCourses.length === 0) return { newMarks: [] };

  const prevSnapshot = getAcademicSnapshot() || {};
  const prevMarks = prevSnapshot.marks || null;

  // Build current marks map: courseId -> Array of assessment items
  const currentMarksMap = {};
  currentCourses.forEach((c) => {
    const items = [];
    (c.sections || []).forEach((sec) => {
      if (sec.id?.endsWith("Grand_Total_Marks") || sec.title === "Grand Total Marks") return;
      (sec.rows || []).forEach((row) => {
        items.push(`${sec.title} - ${row.title} (${row.obtained}/${row.total})`);
      });
    });
    currentMarksMap[c.id] = {
      title: c.title,
      items,
    };
  });

  const newMarks = [];

  if (prevMarks) {
    // Diff against previous marks
    Object.entries(currentMarksMap).forEach(([courseId, curr]) => {
      const prev = prevMarks[courseId];
      if (!prev) {
        if (curr.items.length > 0) {
          newMarks.push({
            courseId,
            courseTitle: curr.title,
            newCount: curr.items.length,
            sample: curr.items.slice(-2).join(", "),
          });
        }
      } else {
        const prevSet = new Set(prev.items || []);
        const added = curr.items.filter((item) => !prevSet.has(item));
        if (added.length > 0) {
          newMarks.push({
            courseId,
            courseTitle: curr.title,
            newCount: added.length,
            sample: added.slice(-2).join(", "),
          });
        }
      }
    });
  }

  // Update snapshot with latest marks
  const nextSnapshot = {
    ...prevSnapshot,
    timestamp: Date.now(),
    marks: currentMarksMap,
  };
  try {
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(nextSnapshot));
  } catch {}

  if (newMarks.length > 0) {
    const existing = getPendingUpdates() || { newMarks: [], newAttendance: [] };
    const merged = {
      ...existing,
      detectedAt: Date.now(),
      newMarks: [...(existing.newMarks || []), ...newMarks].filter(
        (v, i, a) => a.findIndex((t) => t.courseId === v.courseId) === i,
      ),
    };
    try {
      localStorage.setItem(UPDATES_STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(
        new CustomEvent("superflex-academic-updates-detected", { detail: merged }),
      );
    } catch {}
  }

  return { newMarks };
};

/**
 * Compares incoming attendance against previous snapshot and records any new sessions
 */
export const checkAndRecordAttendanceSnapshot = (currentSubjects) => {
  if (!Array.isArray(currentSubjects) || currentSubjects.length === 0) return { newAttendance: [] };

  const prevSnapshot = getAcademicSnapshot() || {};
  const prevAttendance = prevSnapshot.attendance || null;

  // Build current attendance map: subjectKey -> Array of date#status
  const currentAttendanceMap = {};
  currentSubjects.forEach((s) => {
    const key = s.title || s.id;
    const records = (s.records || []).map((r) => `${r.date}#${r.status || ""}`);
    currentAttendanceMap[key] = {
      title: s.title || s.id,
      id: s.id,
      records,
      percentage: s.percentage,
      absent: s.absent,
    };
  });

  const newAttendance = [];

  if (prevAttendance) {
    // Diff against previous attendance
    Object.entries(currentAttendanceMap).forEach(([key, curr]) => {
      const prev = prevAttendance[key];
      if (!prev) {
        if (curr.records.length > 0) {
          newAttendance.push({
            subjectKey: key,
            subjectTitle: curr.title,
            courseTitle: curr.title,
            newCount: curr.records.length,
            sample: curr.records.slice(-1)[0]?.replace("#", ": "),
          });
        }
      } else {
        const prevSet = new Set(prev.records || []);
        const added = curr.records.filter((rec) => !prevSet.has(rec));
        if (added.length > 0) {
          newAttendance.push({
            subjectKey: key,
            subjectTitle: curr.title,
            courseTitle: curr.title,
            newCount: added.length,
            sample: added.slice(-1)[0]?.replace("#", ": "),
          });
        }
      }
    });
  }

  // Update snapshot with latest attendance
  const nextSnapshot = {
    ...prevSnapshot,
    timestamp: Date.now(),
    attendance: currentAttendanceMap,
  };
  try {
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(nextSnapshot));
  } catch {}

  if (newAttendance.length > 0) {
    const existing = getPendingUpdates() || { newMarks: [], newAttendance: [] };
    const merged = {
      ...existing,
      detectedAt: Date.now(),
      newAttendance: [...(existing.newAttendance || []), ...newAttendance].filter(
        (v, i, a) => a.findIndex((t) => t.subjectKey === v.subjectKey) === i,
      ),
    };
    try {
      localStorage.setItem(UPDATES_STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(
        new CustomEvent("superflex-academic-updates-detected", { detail: merged }),
      );
    } catch {}
  }

  return { newAttendance };
};
