import { deleteAcademicState, readAcademicState, updateAcademicState } from "./academicStorage";
import { getActiveStudentId, getStudentStorageKey } from "./studentIdentity";

const SNAPSHOT_KEY = "snapshot";
const UPDATES_KEY = "pending-updates";

const dispatchAcademicEvent = (name: string, detail?: unknown) => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(name, detail === undefined ? undefined : { detail }));
  }
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

export const normalizeSectionTitle = (title = "") =>
  String(title || "")
    .replace(/\s*\([^)]*\)/g, "")
    .trim()
    .toLowerCase();

export const normalizeItemKey = (rawKeyOrItem: any): string => {
  if (typeof rawKeyOrItem === "object" && rawKeyOrItem !== null) {
    const sec = normalizeSectionTitle(rawKeyOrItem.section || "");
    const name = String(rawKeyOrItem.name || rawKeyOrItem.title || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
    const obt = Number(rawKeyOrItem.obtained) || 0;
    const tot = Number(rawKeyOrItem.total) || 0;
    return `${sec}#${name}#${obt}#${tot}`;
  }
  const str = String(rawKeyOrItem || "").trim();
  const parts = str.split("#");
  if (parts.length >= 4) {
    const sec = normalizeSectionTitle(parts[0]);
    const name = parts[1].trim().replace(/\s+/g, " ").toLowerCase();
    const obt = Number(parts[2]) || 0;
    const tot = Number(parts[3]) || 0;
    return `${sec}#${name}#${obt}#${tot}`;
  }
  return str.toLowerCase();
};

export const normalizeAttendanceRecordKey = (rawKeyOrRecord: any): string => {
  if (typeof rawKeyOrRecord === "object" && rawKeyOrRecord !== null) {
    const date = String(rawKeyOrRecord.date || "")
      .trim()
      .replace(/[-/]/g, "");
    const status = formatAttendanceStatus(rawKeyOrRecord.status);
    return `${date}#${status}`;
  }
  const str = String(rawKeyOrRecord || "").trim();
  const parts = str.split("#");
  const date = (parts[0] || "").trim().replace(/[-/]/g, "");
  const status = formatAttendanceStatus(parts[1] || "");
  return `${date}#${status}`;
};

export const findMatchingCourse = (
  currentKey: string,
  currentCourse: any,
  snapshotMap: Record<string, any> | null | undefined,
) => {
  if (!snapshotMap) return null;
  if (snapshotMap[currentKey]) return snapshotMap[currentKey];

  const currentCode =
    getCourseCode(currentCourse?.rawTitle || "") ||
    getCourseCode(currentCourse?.title || "") ||
    getCourseCode(currentCourse?.id || "") ||
    getCourseCode(currentKey);
  const currentClean = getCleanCourseTitle(
    currentCourse?.rawTitle || currentCourse?.title || currentCourse?.id || currentKey,
  )
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  for (const [snapKey, snapCourse] of Object.entries(snapshotMap)) {
    if (snapKey === currentKey) return snapCourse;
    if (currentCode) {
      const snapCode =
        getCourseCode(snapCourse?.rawTitle || "") ||
        getCourseCode(snapCourse?.title || "") ||
        getCourseCode(snapCourse?.id || "") ||
        getCourseCode(snapKey);
      if (snapCode && snapCode === currentCode) return snapCourse;
    }
    if (currentClean) {
      const snapClean = getCleanCourseTitle(
        snapCourse?.rawTitle || snapCourse?.title || snapCourse?.id || snapKey,
      )
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      if (snapClean && snapClean === currentClean) return snapCourse;
    }
  }
  return null;
};

export const isCourseMarksUpdated = (pendingUpdates: any, course: any) => {
  if (!pendingUpdates?.newMarks?.length || !course) return false;
  const key = getNormalizedCourseKey(course);
  const code = getCourseCode(course.title || "") || getCourseCode(course.id || "");
  const cleanTitle = getCleanCourseTitle(course.title || course.id || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  return pendingUpdates.newMarks.some((m: any) => {
    if (m.courseKey === key || m.courseId === course.id || m.courseTitle === course.title) return true;
    if (code) {
      const mCode =
        getCourseCode(m.courseTitle || "") ||
        getCourseCode(m.courseId || "") ||
        getCourseCode(m.courseKey || "");
      if (mCode && mCode === code) return true;
    }
    if (cleanTitle) {
      const mClean = getCleanCourseTitle(m.courseTitle || m.courseId || m.courseKey || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      if (mClean && mClean === cleanTitle) return true;
    }
    return false;
  });
};

export const isSectionMarksUpdated = (pendingUpdates: any, course: any, sectionTitle: any) => {
  if (!pendingUpdates?.newMarks?.length || !course || !sectionTitle) return false;
  const key = getNormalizedCourseKey(course);
  const code = getCourseCode(course.title || "") || getCourseCode(course.id || "");
  const cleanTitle = getCleanCourseTitle(course.title || course.id || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const courseMatch = pendingUpdates.newMarks.find((m: any) => {
    if (m.courseKey === key || m.courseId === course.id || m.courseTitle === course.title) return true;
    if (code) {
      const mCode =
        getCourseCode(m.courseTitle || "") ||
        getCourseCode(m.courseId || "") ||
        getCourseCode(m.courseKey || "");
      if (mCode && mCode === code) return true;
    }
    if (cleanTitle) {
      const mClean = getCleanCourseTitle(m.courseTitle || m.courseId || m.courseKey || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      if (mClean && mClean === cleanTitle) return true;
    }
    return false;
  });
  if (!courseMatch) return false;
  const target = normalizeSectionTitle(sectionTitle);
  return (courseMatch.sections || []).some((s: any) => normalizeSectionTitle(s) === target);
};

export const isAssessmentMarksUpdated = (pendingUpdates: any, course: any, assessmentTitle: any) => {
  if (!pendingUpdates?.newMarks?.length || !course || !assessmentTitle) return false;
  const key = getNormalizedCourseKey(course);
  const code = getCourseCode(course.title || "") || getCourseCode(course.id || "");
  const cleanTitle = getCleanCourseTitle(course.title || course.id || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const courseMatch = pendingUpdates.newMarks.find((m: any) => {
    if (m.courseKey === key || m.courseId === course.id || m.courseTitle === course.title) return true;
    if (code) {
      const mCode =
        getCourseCode(m.courseTitle || "") ||
        getCourseCode(m.courseId || "") ||
        getCourseCode(m.courseKey || "");
      if (mCode && mCode === code) return true;
    }
    if (cleanTitle) {
      const mClean = getCleanCourseTitle(m.courseTitle || m.courseId || m.courseKey || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      if (mClean && mClean === cleanTitle) return true;
    }
    return false;
  });
  if (!courseMatch) return false;
  const target = String(assessmentTitle).trim().replace(/\s+/g, " ").toLowerCase();
  return (courseMatch.assessmentNames || []).some(
    (a: any) => String(a).trim().replace(/\s+/g, " ").toLowerCase() === target,
  );
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
    const items: any[] = [];

    (c.sections || []).forEach((sec: any) => {
      if (sec.id?.endsWith("Grand_Total_Marks") || sec.title === "Grand Total Marks") return;
      const secTitle = (sec.title || "").replace(/\s*\([^)]*\)/g, "").trim();

      (sec.rows || []).forEach((row: any) => {
        let name = (row.title || "").trim();
        if (/^\d+$/.test(name) && secTitle) {
          const singularSec = secTitle.replace(/s$/i, "");
          name = `${singularSec} ${name}`;
        }
        const obt = Number(row.obtained) || 0;
        const tot = Number(row.total) || 0;
        const scoreStr = tot > 0 ? `${obt}/${tot}` : `${obt}`;
        const itemKey = `${normalizeSectionTitle(secTitle)}#${name.trim().toLowerCase()}#${obt}#${tot}`;
        const label = scoreStr ? `${name} (${scoreStr})` : name;

        items.push({
          key: itemKey,
          label,
          name: row.title || name,
          obtained: obt,
          total: tot,
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

  const newMarks: any[] = [];

  if (prevMarks) {
    Object.entries(currentMarksMap).forEach(([key, curr]) => {
      const prev = findMatchingCourse(key, curr, prevMarks);
      if (prev && Array.isArray(prev.items)) {
        const prevKeys = new Set(prev.items.map(normalizeItemKey));
        const added = curr.items.filter((it: any) => !prevKeys.has(normalizeItemKey(it)));

        if (added.length > 0 && added.length < 5) {
          newMarks.push({
            courseId: curr.id || key,
            courseKey: key,
            courseTitle: curr.title,
            sections: Array.from(new Set(added.map((it: any) => it.section).filter(Boolean))),
            assessmentNames: added.map((it: any) => it.name),
            items: added.map((it: any) => it.label),
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
      const matchedCourse = findMatchingCourse(key, current, mergedMarks);
      const targetKey = matchedCourse
        ? Object.keys(mergedMarks).find((k) => mergedMarks[k] === matchedCourse) || key
        : key;
      const previousItems = matchedCourse?.items || [];
      const seenItems = new Map(
        previousItems.map((item: any) => [normalizeItemKey(item), item]),
      );
      current.items.forEach((item: any) => seenItems.set(normalizeItemKey(item), item));
      const updatedCourseData = {
        ...matchedCourse,
        ...current,
        items: [...seenItems.values()],
      };
      mergedMarks[targetKey] = updatedCourseData;
      if (targetKey !== key) {
        mergedMarks[key] = updatedCourseData;
      }
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
        key: `${r.date}#${statusStr}`,
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

  const newAttendance: any[] = [];

  if (prevAttendance) {
    Object.entries(currentAttendanceMap).forEach(([key, curr]) => {
      const prev = findMatchingCourse(key, curr, prevAttendance);

      if (prev && Array.isArray(prev.records)) {
        const prevKeys = new Set(prev.records.map(normalizeAttendanceRecordKey));
        const added = curr.records.filter((r: any) => !prevKeys.has(normalizeAttendanceRecordKey(r)));
        if (added.length > 0 && added.length < 5) {
          newAttendance.push({
            subjectKey: key,
            subjectTitle: curr.title,
            courseTitle: curr.title,
            records: added.map((r: any) => r.label),
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
      const matchedCourse = findMatchingCourse(key, current, mergedAttendance);
      const targetKey = matchedCourse
        ? Object.keys(mergedAttendance).find((k) => mergedAttendance[k] === matchedCourse) || key
        : key;
      const previousRecords = matchedCourse?.records || [];
      const seenRecords = new Map(
        previousRecords.map((record: any) => [normalizeAttendanceRecordKey(record), record]),
      );
      current.records.forEach((record: any) => seenRecords.set(normalizeAttendanceRecordKey(record), record));
      const updatedAttendanceData = {
        ...matchedCourse,
        ...current,
        records: [...seenRecords.values()],
      };
      mergedAttendance[targetKey] = updatedAttendanceData;
      if (targetKey !== key) {
        mergedAttendance[key] = updatedAttendanceData;
      }
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
