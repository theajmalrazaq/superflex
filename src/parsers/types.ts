export type PortalAlert = {
  type: "error" | "info";
  message: string;
};

export type SemesterOption = {
  label: string;
  value: string;
  selected: boolean;
};

export type AttendanceRecord = {
  date: string;
  day: string;
  time: string;
  status: string;
  type: string;
};

export type AttendanceCourse = {
  id: string;
  title: string;
  creditHours?: number;
  allowedAbsents?: number;
  percentage: number;
  records: AttendanceRecord[];
  present: number;
  late: number;
  absent: number;
};

export type RegistrationTable = {
  title: string;
  headers: string[];
  rows: string[][];
};

export type ProfileSection = {
  title: string;
  data: Record<string, string>;
};

export type HomeProfileData = {
  alerts: PortalAlert[];
  sections: ProfileSection[];
  universityInfo: Record<string, string>;
  personalInfo: Record<string, string>;
};

export type RawMarkRow = {
  title: string;
  weight: number;
  obtained: number;
  total: number;
  avg: number;
  stdDev: number;
  min: number;
  max: number;
  included: boolean;
};

export type RawMarkSection = {
  id: string;
  title: string;
  weight: number;
  rows: RawMarkRow[];
};

export type RawMarkCourse = {
  id: string;
  title: string;
  sections: RawMarkSection[];
};

export type MarkRow = RawMarkRow;

export type MarkStats = {
  weightedAvg: number;
  weightedStdDev: number;
  weightedMin: number;
  weightedMax: number;
};

export type MarkSection = {
  id: string;
  title: string;
  weight: number;
  obtained: number;
  rows: MarkRow[];
  stats: MarkStats;
};

export type MarkCourse = {
  id: string;
  title: string;
  sections: MarkSection[];
  grandTotalStats: { weight: number; obtained: number; percentage: number };
};

export type StudyPlanCourse = {
  code: string;
  title: string;
  crHrs: number;
  type: string;
};

export type StudyPlanSemester = {
  title: string;
  crHrs: number;
  courses: StudyPlanCourse[];
};

export type TranscriptCourse = {
  code: string;
  description: string;
  section: string;
  crHrs: number;
  grade: string;
  points: number;
  type: string;
  mca: string | null;
  gradingScheme: string | null;
  schemeDetailId: string | null;
};

export type TranscriptSemester = {
  title: string;
  summary: { crRegistered: number; crEarned: number; cgpa: number; sgpa: number };
  courses: TranscriptCourse[];
};
