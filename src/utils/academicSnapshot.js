import {
  deleteAcademicState,
  readAcademicState,
  updateAcademicState,
  writeAcademicState,
} from "./academicStorage";

const SNAPSHOT_KEY = "snapshot";
const UPDATES_KEY = "pending-updates";
const LEGACY_SNAPSHOT_STORAGE_KEY = "superflex_academic_snapshot_v1";
const LEGACY_UPDATES_STORAGE_KEY = "superflex_academic_updates_v1";

let migrationPromise;

const migrateLegacyAcademicState = () => {
  if (migrationPromise) return migrationPromise;
  migrationPromise = (async () => {
    const [snapshot, updates] = await Promise.all([
      readAcademicState(SNAPSHOT_KEY),
      readAcademicState(UPDATES_KEY),
    ]);

    try {
      const legacySnapshot = JSON.parse(
        localStorage.getItem(LEGACY_SNAPSHOT_STORAGE_KEY) || "null",
      );
      const legacyUpdates = JSON.parse(localStorage.getItem(LEGACY_UPDATES_STORAGE_KEY) || "null");
      if (!snapshot && legacySnapshot) await writeAcademicState(SNAPSHOT_KEY, legacySnapshot);
      if (!updates && legacyUpdates) await writeAcademicState(UPDATES_KEY, legacyUpdates);
      localStorage.removeItem(LEGACY_SNAPSHOT_STORAGE_KEY);
      localStorage.removeItem(LEGACY_UPDATES_STORAGE_KEY);
    } catch {
      // Invalid legacy data is intentionally discarded.
    }
  })();
  return migrationPromise;
};

const dispatchAcademicEvent = (name, detail) => {
  window.dispatchEvent(new CustomEvent(name, detail === undefined ? undefined : { detail }));
};

/**
 * Extracts clean display title, removing section codes like "(BCS-7A)" or "(Lab)"
 */
export const getCleanCourseTitle = (raw = "") => {
  if (!raw) return "";
  let name = String(raw).trim();
  name = name.replace(/\s*\([^)]*\)\s*$/g, "").trim();
  const parts = name.split(/[-–:]\s*/);
  if (parts.length > 1 && /^[A-Z]{2,4}\s*\d{3,4}/i.test(parts[0].trim())) {
    return parts.slice(1).join(" - ").trim();
  }
  return name;
};

/**
 * Extracts course code (e.g. "CS4001") if present
 */
export const getCourseCode = (raw = "") => {
  if (!raw) return "";
  const match = String(raw).match(/([A-Z]{2,4}\s*[-–]?\s*\d{3,4})/i);
  return match ? match[1].replace(/[\s-–]+/g, "").toUpperCase() : "";
};

/**
 * Returns a stable, normalized course key across home, marks, and attendance pages
 */
export const getNormalizedCourseKey = (course = {}) => {
  if (!course) return "";
  const idStr = String(course.id || "");
  const titleStr = String(course.title || "");
  const code = getCourseCode(titleStr) || getCourseCode(idStr);
  if (code) return code;
  const cleanTitle = getCleanCourseTitle(titleStr || idStr);
  return cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, "");
};

/**
 * Formats attendance status string into human-friendly text
 */
export const formatAttendanceStatus = (status = "") => {
  const s = String(status).trim().toUpperCase();
  if (s.includes("P") || s === "PRESENT") return "Present";
  if (s.includes("A") || s === "ABSENT") return "Absent";
  if (s.includes("L") || s === "LATE") return "Late";
  return status || "Present";
};

/**
 * Formats a clean date, e.g. "24-Oct"
 */
export const formatCleanDate = (rawDate = "") => {
  if (!rawDate) return "";
  const str = String(rawDate).trim();
  return str.replace(/[-/]\d{4}$/, "");
};

export const getAcademicSnapshot = async () => {
  try {
    await migrateLegacyAcademicState();
    return await readAcademicState(SNAPSHOT_KEY);
  } catch {
    return null;
  }
};

export const getPendingUpdates = async () => {
  try {
    await migrateLegacyAcademicState();
    return await updateAcademicState(UPDATES_KEY, (current) => {
      if (!current) return null;
      const data = { ...current };

      // Sanitize any corrupted legacy dump where a course has >= 10 "new sessions" in attendance
      if (Array.isArray(data.newAttendance)) {
        data.newAttendance = data.newAttendance.filter((a) => (a.newCount || 0) < 10);
      }

      // Sanitize any corrupted legacy dump where an entire semester of marks was dumped
      if (Array.isArray(data.newMarks)) {
        const totalNew = data.newMarks.reduce(
          (sum, mark) => sum + (mark.newCount || mark.items?.length || 0),
          0,
        );
        data.newMarks =
          totalNew > 10
            ? []
            : data.newMarks.filter((mark) => (mark.newCount || mark.items?.length || 0) < 5);
      }

      const hasAny = (data.newMarks?.length || 0) > 0 || (data.newAttendance?.length || 0) > 0;
      return hasAny ? data : null;
    });
  } catch {
    return null;
  }
};

export const clearPendingUpdates = async () => {
  try {
    await migrateLegacyAcademicState();
    await deleteAcademicState(UPDATES_KEY);
    dispatchAcademicEvent("superflex-academic-updates-cleared");
  } catch {}
};

export const clearPendingUpdateType = async (type) => {
  try {
    await migrateLegacyAcademicState();
    const existing = await updateAcademicState(UPDATES_KEY, (current) => {
      if (!current) return null;
      const next = { ...current };
      if (type === "marks") delete next.newMarks;
      else if (type === "attendance") delete next.newAttendance;
      const hasRemaining =
        (next.newMarks?.length || 0) > 0 || (next.newAttendance?.length || 0) > 0;
      return hasRemaining ? next : null;
    });
    if (existing) {
      dispatchAcademicEvent("superflex-academic-updates-detected", existing);
    } else {
      dispatchAcademicEvent("superflex-academic-updates-cleared");
    }
  } catch {}
};

/**
 * Checks if a course has pending marks updates
 */
export const isCourseMarksUpdated = (pendingUpdates, course) => {
  if (!pendingUpdates?.newMarks?.length || !course) return false;
  const key = getNormalizedCourseKey(course);
  return pendingUpdates.newMarks.some(
    (m) => m.courseKey === key || m.courseId === course.id || m.courseTitle === course.title,
  );
};

/**
 * Checks if a specific section (e.g. "Quizzes", "Assignments") has pending marks updates
 */
export const isSectionMarksUpdated = (pendingUpdates, course, sectionTitle) => {
  if (!pendingUpdates?.newMarks?.length || !course || !sectionTitle) return false;
  const key = getNormalizedCourseKey(course);
  const courseMatch = pendingUpdates.newMarks.find(
    (m) => m.courseKey === key || m.courseId === course.id || m.courseTitle === course.title,
  );
  if (!courseMatch) return false;
  const target = String(sectionTitle).trim().toLowerCase();
  return (courseMatch.sections || []).some((s) => String(s).trim().toLowerCase() === target);
};

/**
 * Checks if a specific assessment row (e.g. "Quiz 3") has pending marks updates
 */
export const isAssessmentMarksUpdated = (pendingUpdates, course, assessmentTitle) => {
  if (!pendingUpdates?.newMarks?.length || !course || !assessmentTitle) return false;
  const key = getNormalizedCourseKey(course);
  const courseMatch = pendingUpdates.newMarks.find(
    (m) => m.courseKey === key || m.courseId === course.id || m.courseTitle === course.title,
  );
  if (!courseMatch) return false;
  const target = String(assessmentTitle).trim().toLowerCase();
  return (courseMatch.assessmentNames || []).some((a) => String(a).trim().toLowerCase() === target);
};

/**
 * Compares incoming marks against previous snapshot and records any new assessments
 */
export const checkAndRecordMarksSnapshot = async (currentCourses) => {
  if (!Array.isArray(currentCourses) || currentCourses.length === 0) return { newMarks: [] };

  await migrateLegacyAcademicState();
  const prevSnapshot = (await getAcademicSnapshot()) || {};
  const prevMarks = prevSnapshot.marks || null;

  // Build current marks map: normalizedKey -> { id, title, items }
  const currentMarksMap = {};
  currentCourses.forEach((c) => {
    const key = getNormalizedCourseKey(c);
    const displayTitle = getCleanCourseTitle(c.title || c.id) || c.title || c.id;
    const items = [];

    (c.sections || []).forEach((sec) => {
      if (sec.id?.endsWith("Grand_Total_Marks") || sec.title === "Grand Total Marks") return;
      const secTitle = (sec.title || "").trim();

      (sec.rows || []).forEach((row) => {
        let name = (row.title || "").trim();
        if (/^\d+$/.test(name) && secTitle) {
          const singularSec = secTitle.replace(/s$/i, "");
          name = `${singularSec} ${name}`;
        }
        const scoreStr = row.total > 0 ? `${row.obtained}/${row.total}` : `${row.obtained}`;
        const itemKey = `${secTitle}#${row.title}#${row.obtained}#${row.total}`;
        const label = scoreStr ? `${name} (${scoreStr})` : name;

        items.push({
          key: itemKey,
          label,
          name: row.title || name,
          obtained: row.obtained,
          total: row.total,
          section: secTitle,
        });
      });
    });

    currentMarksMap[key] = {
      id: c.id,
      title: displayTitle,
      rawTitle: c.title,
      items,
    };
  });

  const newMarks = [];

  if (prevMarks) {
    Object.entries(currentMarksMap).forEach(([key, curr]) => {
      const prev = prevMarks[key];
      if (prev && Array.isArray(prev.items)) {
        const prevKeys = new Set(prev.items.map((it) => (typeof it === "string" ? it : it.key)));
        const added = curr.items.filter((it) => !prevKeys.has(it.key));
        // Only record if 1 to 4 new items are added (prevents whole-semester dump)
        if (added.length > 0 && added.length < 5) {
          newMarks.push({
            courseId: curr.id || key,
            courseKey: key,
            courseTitle: curr.title,
            sections: Array.from(new Set(added.map((it) => it.section).filter(Boolean))),
            assessmentNames: added.map((it) => it.name),
            items: added.map((it) => it.label),
            newCount: added.length,
          });
        }
      }
    });
  }

  // Keep every record already seen. Home uses a compact marks parser, while the
  // Marks page has the complete list; replacing one with the other made old
  // assessments look new again on every navigation.
  await updateAcademicState(SNAPSHOT_KEY, (latestSnapshot) => {
    const latestMarks = latestSnapshot?.marks || prevMarks || {};
    const mergedMarks = { ...latestMarks };
    Object.entries(currentMarksMap).forEach(([key, current]) => {
      const previousItems = mergedMarks[key]?.items || [];
      const seenItems = new Map(
        previousItems.map((item) => [typeof item === "string" ? item : item.key, item]),
      );
      current.items.forEach((item) => seenItems.set(item.key, item));
      mergedMarks[key] = { ...mergedMarks[key], ...current, items: [...seenItems.values()] };
    });
    return { ...latestSnapshot, timestamp: Date.now(), marks: mergedMarks };
  });

  if (newMarks.length > 0) {
    const merged = await updateAcademicState(UPDATES_KEY, (latestUpdates) => ({
      ...latestUpdates,
      detectedAt: Date.now(),
      newMarks: [...(latestUpdates?.newMarks || []), ...newMarks].filter(
        (value, index, all) =>
          all.findIndex(
            (item) => item.courseKey === value.courseKey || item.courseId === value.courseId,
          ) === index,
      ),
    }));
    dispatchAcademicEvent("superflex-academic-updates-detected", merged);
  }

  return { newMarks };
};

/**
 * Compares incoming attendance against previous snapshot and records any new sessions
 */
export const checkAndRecordAttendanceSnapshot = async (currentSubjects) => {
  if (!Array.isArray(currentSubjects) || currentSubjects.length === 0) return { newAttendance: [] };

  await migrateLegacyAcademicState();
  const prevSnapshot = (await getAcademicSnapshot()) || {};
  const prevAttendance = prevSnapshot.attendance || null;

  // Build current attendance map: normalizedKey -> { id, title, records, ... }
  const currentAttendanceMap = {};
  currentSubjects.forEach((s) => {
    const key = getNormalizedCourseKey(s);
    const displayTitle = getCleanCourseTitle(s.title || s.id) || s.title || s.id;
    const records = (s.records || []).map((r) => {
      const dateStr = formatCleanDate(r.date);
      const statusStr = formatAttendanceStatus(r.status);
      return {
        key: `${r.date}#${r.status || ""}`,
        label: `${dateStr} (${statusStr})`,
        date: r.date,
        status: statusStr,
      };
    });

    currentAttendanceMap[key] = {
      id: s.id,
      title: displayTitle,
      rawTitle: s.title,
      records,
      percentage: s.percentage,
      absent: s.absent,
    };
  });

  const newAttendance = [];

  if (prevAttendance) {
    Object.entries(currentAttendanceMap).forEach(([key, curr]) => {
      const prev = prevAttendance[key];
      // Only check for additions if previous records existed for this course
      if (prev && Array.isArray(prev.records)) {
        const prevKeys = new Set(prev.records.map((r) => (typeof r === "string" ? r : r.key)));
        const added = curr.records.filter((r) => !prevKeys.has(r.key));
        if (added.length > 0 && added.length < 5) {
          newAttendance.push({
            subjectKey: key,
            subjectTitle: curr.title,
            courseTitle: curr.title,
            records: added.map((r) => r.label),
            newCount: added.length,
          });
        }
      }
    });
  }

  await updateAcademicState(SNAPSHOT_KEY, (latestSnapshot) => {
    const latestAttendance = latestSnapshot?.attendance || prevAttendance || {};
    const mergedAttendance = { ...latestAttendance };
    Object.entries(currentAttendanceMap).forEach(([key, current]) => {
      const previousRecords = mergedAttendance[key]?.records || [];
      const seenRecords = new Map(
        previousRecords.map((record) => [typeof record === "string" ? record : record.key, record]),
      );
      current.records.forEach((record) => seenRecords.set(record.key, record));
      mergedAttendance[key] = {
        ...mergedAttendance[key],
        ...current,
        records: [...seenRecords.values()],
      };
    });
    return { ...latestSnapshot, timestamp: Date.now(), attendance: mergedAttendance };
  });

  if (newAttendance.length > 0) {
    const merged = await updateAcademicState(UPDATES_KEY, (latestUpdates) => ({
      ...latestUpdates,
      detectedAt: Date.now(),
      newAttendance: [...(latestUpdates?.newAttendance || []), ...newAttendance].filter(
        (value, index, all) =>
          all.findIndex((item) => item.subjectKey === value.subjectKey) === index,
      ),
    }));
    dispatchAcademicEvent("superflex-academic-updates-detected", merged);
  }

  return { newAttendance };
};
