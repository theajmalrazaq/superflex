const ACTIVE_STUDENT_KEY = "superflex_active_student_id_v1";

const normalizeStudentId = (studentId) =>
  String(studentId || "")
    .trim()
    .toUpperCase();

export const getActiveStudentId = () => {
  try {
    return normalizeStudentId(localStorage.getItem(ACTIVE_STUDENT_KEY));
  } catch {
    return "";
  }
};

export const getStudentStorageKey = (key, studentId = getActiveStudentId()) => {
  const normalizedStudentId = normalizeStudentId(studentId);
  return normalizedStudentId
    ? `${key}:${encodeURIComponent(normalizedStudentId)}`
    : null;
};

const notifyIdentityChanged = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("superflex-student-identity-changed"));
  }
};

export const setActiveStudentId = (studentId) => {
  const nextStudentId = normalizeStudentId(studentId);
  if (!nextStudentId) return false;

  const currentStudentId = getActiveStudentId();
  try {
    localStorage.setItem(ACTIVE_STUDENT_KEY, nextStudentId);
  } catch {
    return false;
  }

  if (currentStudentId !== nextStudentId) {
    if (typeof window !== "undefined") window.superflex_ai_context = null;
    notifyIdentityChanged();
  }
  return true;
};

export const clearActiveStudentId = () => {
  const hadStudentId = Boolean(getActiveStudentId());
  try {
    localStorage.removeItem(ACTIVE_STUDENT_KEY);
  } catch {
    return false;
  }

  if (typeof window !== "undefined") window.superflex_ai_context = null;
  if (hadStudentId) notifyIdentityChanged();
  return true;
};
