import {
  deleteAppData,
  migrateLocalStorageJson,
  migrateLocalStorageValue,
  setAppData,
  updateAppData,
} from "./appStorage";

const PROFILE_IMAGE_KEY = "profile-image";
const AI_CONTEXT_KEY = "ai-context";
const AI_MESSAGES_KEY = "ai-messages";
const MARKED_MARKS_KEY = "marked-marks";
const MARKED_ATTENDANCE_KEY = "marked-attendance";

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

export const getProfileImage = async () => {
  const stored = await migrateLocalStorageValue(PROFILE_IMAGE_KEY, "superflex_user_custom_image");
  if (!stored) return "/Login/GetImage";
  if (stored instanceof Blob) return blobToDataUrl(stored);

  if (typeof stored === "string" && stored.startsWith("data:")) {
    const blob = await (await fetch(stored)).blob();
    await setAppData(PROFILE_IMAGE_KEY, blob);
  }
  return stored;
};

export const hasCustomProfileImage = async () =>
  Boolean(await migrateLocalStorageValue(PROFILE_IMAGE_KEY, "superflex_user_custom_image"));

export const setProfileImage = async (image) => {
  const blob = image instanceof Blob ? image : await (await fetch(image)).blob();
  await setAppData(PROFILE_IMAGE_KEY, blob);
  return image instanceof Blob ? blobToDataUrl(image) : image;
};
export const deleteProfileImage = async () => {
  localStorage.removeItem("superflex_user_custom_image");
  await deleteAppData(PROFILE_IMAGE_KEY);
};

export const getAiContext = async () =>
  (await migrateLocalStorageJson(AI_CONTEXT_KEY, "superflex_ai_context", {})) || {};
export const setAiContext = (context) => setAppData(AI_CONTEXT_KEY, context);
export const updateAiContext = (updater) => updateAppData(AI_CONTEXT_KEY, updater);

export const getAiMessages = async () =>
  (await migrateLocalStorageJson(AI_MESSAGES_KEY, "superflex_ai_messages", [])) || [];
export const setAiMessages = (messages) => setAppData(AI_MESSAGES_KEY, messages.slice(-100));
export const deleteAiMessages = async () => {
  localStorage.removeItem("superflex_ai_messages");
  await deleteAppData(AI_MESSAGES_KEY);
};

export const getMarkedMarks = async () =>
  (await migrateLocalStorageJson(MARKED_MARKS_KEY, "superflex_marked_marks", [])) || [];
export const setMarkedMarks = (items) => setAppData(MARKED_MARKS_KEY, items);

export const getMarkedAttendance = async () =>
  (await migrateLocalStorageJson(MARKED_ATTENDANCE_KEY, "superflex_marked_attendance", [])) || [];
export const setMarkedAttendance = (items) => setAppData(MARKED_ATTENDANCE_KEY, items);
