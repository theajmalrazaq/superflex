import { deleteAppData, getAppData, setAppData, updateAppData } from "./appStorage";
import { getStudentStorageKey } from "./studentIdentity";

const PROFILE_IMAGE_KEY = "profile-image";
const MARKED_MARKS_KEY = "marked-marks";
const MARKED_ATTENDANCE_KEY = "marked-attendance";
const DEFAULT_PROFILE_IMAGE = "/Login/GetImage";
const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

export const getProfileImage = async () => {
  const key = getStudentStorageKey(PROFILE_IMAGE_KEY);
  const stored = key ? await getAppData(key) : null;
  if (!stored) {
    const legacyDefault = await getAppData(PROFILE_IMAGE_KEY);
    return legacyDefault === DEFAULT_PROFILE_IMAGE ? legacyDefault : DEFAULT_PROFILE_IMAGE;
  }
  if (stored instanceof Blob) return blobToDataUrl(stored);

  if (typeof stored === "string" && stored.startsWith("data:")) {
    const blob = await (await fetch(stored)).blob();
    await setAppData(key, blob);
  }
  return stored;
};

export const hasCustomProfileImage = async () => {
  const key = getStudentStorageKey(PROFILE_IMAGE_KEY);
  return Boolean(key && (await getAppData(key)));
};

export const setProfileImage = async (image) => {
  const key = getStudentStorageKey(PROFILE_IMAGE_KEY);
  if (!key) return DEFAULT_PROFILE_IMAGE;
  const blob = image instanceof Blob ? image : await (await fetch(image)).blob();
  await setAppData(key, blob);
  return image instanceof Blob ? blobToDataUrl(image) : image;
};
export const deleteProfileImage = async () => {
  const key = getStudentStorageKey(PROFILE_IMAGE_KEY);
  if (key) await deleteAppData(key);
};

export const getAiContext = async (studentId) => {
  const key = getStudentStorageKey("ai-context", studentId);
  return key ? (await getAppData(key)) || {} : {};
};
export const updateAiContext = (updater, studentId) => {
  const key = getStudentStorageKey("ai-context", studentId);
  return key ? updateAppData(key, updater) : Promise.resolve(null);
};

export const getAiMessages = async (studentId) => {
  const key = getStudentStorageKey("ai-messages", studentId);
  return key ? (await getAppData(key)) || [] : [];
};
export const setAiMessages = (messages, studentId) => {
  const key = getStudentStorageKey("ai-messages", studentId);
  return key ? setAppData(key, messages.slice(-100)) : Promise.resolve(null);
};
export const deleteAiMessages = async (studentId) => {
  const key = getStudentStorageKey("ai-messages", studentId);
  if (!key) return;
  await deleteAppData(key);
};

export const getMarkedMarks = async (studentId) => {
  const key = getStudentStorageKey(MARKED_MARKS_KEY, studentId);
  return key ? (await getAppData(key)) || [] : [];
};
export const setMarkedMarks = (items, studentId) => {
  const key = getStudentStorageKey(MARKED_MARKS_KEY, studentId);
  return key ? setAppData(key, items) : Promise.resolve(null);
};

export const getMarkedAttendance = async (studentId) => {
  const key = getStudentStorageKey(MARKED_ATTENDANCE_KEY, studentId);
  return key ? (await getAppData(key)) || [] : [];
};
export const setMarkedAttendance = (items, studentId) => {
  const key = getStudentStorageKey(MARKED_ATTENDANCE_KEY, studentId);
  return key ? setAppData(key, items) : Promise.resolve(null);
};
