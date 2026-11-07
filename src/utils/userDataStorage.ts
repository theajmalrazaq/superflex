import { aiMessagesSchema, bookmarkIdsSchema, type AiMessage } from "../schemas/userData";
import type {
  AttendanceCourse,
  MarkCourse,
  ProfileSection,
  PortalAlert,
  StudyPlanSemester,
  TranscriptSemester,
} from "../parsers/types";
import type { Teacher } from "../types/teacher";

export interface AiContext {
  attendance?: AttendanceCourse[];
  marks?: MarkCourse[];
  studentName?: string;
  rollNumber?: string;
  personalInfo?: Record<string, string>;
  universityInfo?: Record<string, string>;
  profileSections?: ProfileSection[];
  alerts?: PortalAlert[];
  transcript?: TranscriptSemester[];
  mcaData?: typeof import("../constants/mcaData").MCA_DATA;
  studyPlan?: StudyPlanSemester[];
  teachers?: Record<string, Teacher>;
  lastScanned?: string;
  lastSync?: Record<string, string>;
}

import { deleteAppData, getAppData, setAppData, updateAppData } from "./appStorage";
import { getStudentStorageKey } from "./studentIdentity";

const PROFILE_IMAGE_KEY = "profile-image";
const MARKED_MARKS_KEY = "marked-marks";
const MARKED_ATTENDANCE_KEY = "marked-attendance";
const DEFAULT_PROFILE_IMAGE = "/Login/GetImage";
const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
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

export const getAiContext = async (studentId?: string): Promise<AiContext> => {
  const key = getStudentStorageKey("ai-context", studentId);
  return key ? (await getAppData(key)) || {} : {};
};
export const updateAiContext = (
  updater: (current: AiContext | null) => AiContext | null,
  studentId?: string,
) => {
  const key = getStudentStorageKey("ai-context", studentId);
  return key ? updateAppData(key, updater) : Promise.resolve(null);
};

export const getAiMessages = async (studentId?: string) => {
  const key = getStudentStorageKey("ai-messages", studentId);
  const parsed = aiMessagesSchema.safeParse(key ? await getAppData(key) : []);
  return parsed.success ? parsed.data : [];
};
export const setAiMessages = (messages: AiMessage[], studentId?: string) => {
  const parsed = aiMessagesSchema.safeParse(messages);
  if (!parsed.success) return Promise.resolve(null);
  const key = getStudentStorageKey("ai-messages", studentId);
  return key ? setAppData(key, parsed.data.slice(-100)) : Promise.resolve(null);
};
export const deleteAiMessages = async (studentId?: string) => {
  const key = getStudentStorageKey("ai-messages", studentId);
  if (!key) return;
  await deleteAppData(key);
};

export const getMarkedMarks = async (studentId?: string) => {
  const key = getStudentStorageKey(MARKED_MARKS_KEY, studentId);
  const parsed = bookmarkIdsSchema.safeParse(key ? await getAppData(key) : []);
  return parsed.success ? parsed.data : [];
};
export const setMarkedMarks = (items: string[], studentId?: string) => {
  const parsed = bookmarkIdsSchema.safeParse(items);
  if (!parsed.success) return Promise.resolve(null);
  const key = getStudentStorageKey(MARKED_MARKS_KEY, studentId);
  return key ? setAppData(key, parsed.data) : Promise.resolve(null);
};

export const getMarkedAttendance = async (studentId?: string) => {
  const key = getStudentStorageKey(MARKED_ATTENDANCE_KEY, studentId);
  const parsed = bookmarkIdsSchema.safeParse(key ? await getAppData(key) : []);
  return parsed.success ? parsed.data : [];
};
export const setMarkedAttendance = (items: string[], studentId?: string) => {
  const parsed = bookmarkIdsSchema.safeParse(items);
  if (!parsed.success) return Promise.resolve(null);
  const key = getStudentStorageKey(MARKED_ATTENDANCE_KEY, studentId);
  return key ? setAppData(key, parsed.data) : Promise.resolve(null);
};
