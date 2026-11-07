import { deleteAcademicState, readAcademicState, updateAcademicState } from "./academicStorage";
import { getActiveStudentId, getStudentStorageKey } from "./studentIdentity";

const SNAPSHOT_KEY = "snapshot";
const UPDATES_KEY = "pending-updates";

const dispatchAcademicEvent = (name: string, detail?: unknown) => {
  window.dispatchEvent(new CustomEvent(name, detail === undefined ? undefined : { detail }));
};

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

export const getCourseCode = (raw = "") => {
  if (!raw) return "";
  const match = String(raw).match(/([A-Z]{2,4}\s*[-–]?\s*\d{3,4})/i);
  return match ? match[1].replace(/[\s-–]+/g, "").toUpperCase() : "";
};

export const getNormalizedCourseKey = (course: { id?: string; title?: string } = {}) => {
  if (!course) return "";
  const idStr = String(course.id || "");
  const titleStr = String(course.title || "");
  const code = getCourseCode(titleStr) || getCourseCode(idStr);
  if (code) return code;
  const cleanTitle = getCleanCourseTitle(titleStr || idStr);
  return cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, "");
};

export const formatAttendanceStatus = (status = "") => {
  const s = String(status).trim().toUpperCase();
  if (s.includes("P") || s === "PRESENT") return "Present";
  if (s.includes("A") || s === "ABSENT") return "Absent";
  if (s.includes("L") || s === "LATE") return "Late";
  return status || "Present";
};

export const formatCleanDate = (rawDate = "") => {
  if (!rawDate) return "";
  const str = String(rawDate).trim();
  return str.replace(/[-/]\d{4}$/, "");
};

export const getAcademicSnapshot = async (studentId = getActiveStudentId()) => {
  try {
    const key = getStudentStorageKey(SNAPSHOT_KEY, studentId);
    return key ? await readAcademicState(key) : null;
  } catch {
    return null;
  }
};

export const getPendingUpdates = async () => {
  const studentId = getActiveStudentId();
  try {
    const key = getStudentStorageKey(UPDATES_KEY, studentId);
    if (!key) return null;
    const updates = await updateAcademicState(key, (current) => {
      if (!current) return null;
      const data = { ...current };

      if (Array.isArray(data.newAttendance)) {
        data.newAttendance = data.newAttendance.filter((a) => (a.newCount || 0) < 10);
      }

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
    return getActiveStudentId() === studentId ? updates : null;
  } catch {
    return null;
  }
};

export const clearPendingUpdates = async () => {
  const studentId = getActiveStudentId();
  try {
    const key = getStudentStorageKey(UPDATES_KEY, studentId);
    if (!key) return;
    await deleteAcademicState(key);
    if (getActiveStudentId() === studentId) {
      dispatchAcademicEvent("superflex-academic-updates-cleared");
    }
  } catch {}
};

export const clearPendingUpdateType = async (type) => {
  const studentId = getActiveStudentId();
  try {
    const key = getStudentStorageKey(UPDATES_KEY, studentId);
    if (!key) return;
    const existing = await updateAcademicState(key, (current) => {
      if (!current) return null;
      const next = { ...current };
      if (type === "marks") delete next.newMarks;
      else if (type === "attendance") delete next.newAttendance;
      const hasRemaining =
        (next.newMarks?.length || 0) > 0 || (next.newAttendance?.length || 0) > 0;
      return hasRemaining ? next : null;
    });
    if (getActiveStudentId() !== studentId) return;
    if (existing) {
      dispatchAcademicEvent("superflex-academic-updates-detected", existing);
    } else {
      dispatchAcademicEvent("superflex-academic-updates-cleared");
    }
  } catch {}
};

export const isCourseMarksUpdated = (pendingUpdates, course) => {
  if (!pendingUpdates?.newMarks?.length || !course) return false;
  const key = getNormalizedCourseKey(course);
  return pendingUpdates.newMarks.some(
    (m) => m.courseKey === key || m.courseId === course.id || m.courseTitle === course.title,
  );
};

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

export const checkAndRecordMarksSnapshot = async (currentCourses) => {
  if (!Array.isArray(currentCourses) || currentCourses.length === 0) return { newMarks: [] };
  const studentId = getActiveStudentId();
  const snapshotKey = getStudentStorageKey(SNAPSHOT_KEY, studentId);
  const updatesKey = getStudentStorageKey(UPDATES_KEY, studentId);
  if (!snapshotKey || !updatesKey) return { newMarks: [] };
  const prevSnapshot = (await getAcademicSnapshot(studentId)) || {};
  const prevMarks = prevSnapshot.marks || null;

  const currentMarksMap: Record<string, any> = {};
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

  if (getActiveStudentId() !== studentId) return { newMarks: [] };
  await updateAcademicState(snapshotKey, (latestSnapshot) => {
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
    if (getActiveStudentId() !== studentId) return { newMarks: [] };
    const merged = await updateAcademicState(updatesKey, (latestUpdates) => ({
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

export const checkAndRecordAttendanceSnapshot = async (currentSubjects) => {
  if (!Array.isArray(currentSubjects) || currentSubjects.length === 0) return { newAttendance: [] };
  const studentId = getActiveStudentId();
  const snapshotKey = getStudentStorageKey(SNAPSHOT_KEY, studentId);
  const updatesKey = getStudentStorageKey(UPDATES_KEY, studentId);
  if (!snapshotKey || !updatesKey) return { newAttendance: [] };
  const prevSnapshot = (await getAcademicSnapshot(studentId)) || {};
  const prevAttendance = prevSnapshot.attendance || null;

  const currentAttendanceMap: Record<string, any> = {};
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

  if (getActiveStudentId() !== studentId) return { newAttendance: [] };
  await updateAcademicState(snapshotKey, (latestSnapshot) => {
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
    if (getActiveStudentId() !== studentId) return { newAttendance: [] };
    const merged = await updateAcademicState(updatesKey, (latestUpdates) => ({
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
