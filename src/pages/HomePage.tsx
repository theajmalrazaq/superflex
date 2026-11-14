import TeacherAvatar from "../components/TeacherAvatar";
import { useCurrentTime } from "../hooks/useCurrentTime";
import { useTeacherStore } from "../stores/teacherStore";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PageLayout from "../components/layouts/PageLayout";
import { useAiSync } from "../hooks/useAiSync";
import { processCourseMarks } from "../utils/marksProcessor";
import {
  User,
  Users,
  Building,
  Award,
  Activity,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  Camera,
  Sun,
  Moon,
} from "lucide-react";
import { usePreferencesStore } from "../stores/preferencesStore";
import NotificationBanner from "../components/ui/NotificationBanner";
import StatsCard from "../components/ui/StatsCard";
import Skeleton, { MarksSkeleton, AttendanceSkeleton } from "../components/ui/Skeleton";
import {
  parseHomeAttendanceReport,
  parseHomeMarksReport,
  parseHomeProfile,
  parseHomeStudyPlan,
} from "../parsers/home";
import { findFlexPageRoot } from "../parsers/dom";
import { getExtensionUrl } from "../utils/extensionApi";
import {
  checkAndRecordMarksSnapshot,
  checkAndRecordAttendanceSnapshot,
  getPendingUpdates,
  clearPendingUpdateType,
  isCourseMarksUpdated,
  isSectionMarksUpdated,
  isAssessmentMarksUpdated,
} from "../utils/academicSnapshot";
import { useProfileImage } from "../hooks/useProfileImage";
import { parseAcademicDate } from "../utils/academicDate";
import { setActiveStudentId } from "../utils/studentIdentity";

const EMPTY_PROFILE_SECTIONS: ReturnType<typeof parseHomeProfile>["sections"] = [];

const fetchPortalDocument = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Portal request failed (${response.status})`);
  const html = await response.text();
  return new DOMParser().parseFromString(html, "text/html");
};

const ReportLoadError = ({ report, onRetry }) => (
  <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
    <p className="text-sm font-semibold text-rose-600 dark:text-rose-300">
      Could not load {report}.
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="rounded-full bg-[#230052] px-4 py-2 text-xs font-bold text-white dark:bg-white dark:text-[#0a192f]"
    >
      Retry
    </button>
  </div>
);

const SectionAccordion = ({ section, isOpen, onToggle, course, pendingUpdates }) => {
  const rows = section.rows || [];
  const hasSectionUpdate = isSectionMarksUpdated(pendingUpdates, course, section.title);

  return (
    <div className="mb-2.5 overflow-hidden rounded-xl border border-black/[0.06] bg-[#fafafa] dark:border-white/[0.1] dark:bg-white/[0.04] sm:mb-3 sm:rounded-[18px]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2.5 bg-transparent px-3 py-2.5 text-left transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.04] sm:gap-3 sm:px-4 sm:py-3.5"
      >
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg sm:h-8 sm:w-8 sm:rounded-xl ${isOpen ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]" : "bg-white text-slate-500 dark:bg-white/10 dark:text-slate-300"}`}
          >
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
          <span className="truncate text-[13px] font-semibold text-foreground sm:text-sm">
            {section.title}
          </span>
          {hasSectionUpdate && (
            <span className="flex shrink-0 items-center justify-center p-0.5">
              <span
                className="h-2 w-2 rounded-full bg-[#230052] animate-pulse ring-2 ring-[#230052]/30 dark:bg-white dark:ring-white/40"
                title="New marks uploaded in this section"
              />
            </span>
          )}
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-foreground/55">
            {rows.length}
          </span>
        </div>
        <div className="shrink-0 text-xs font-semibold text-foreground/60">
          <span className="font-bold text-foreground">{section.obtained.toFixed(1)}</span>
          <span className="text-foreground/45"> / {section.weight.toFixed(1)}</span>
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-foreground/10">
          <table className="sf-data-table w-full border-collapse text-left">
            <thead>
              <tr className="bg-foreground/[0.02]">
                <th className="w-16 border-b border-foreground/10 p-3 text-[11px] font-bold text-foreground/50">
                  Assessment
                </th>
                <th className="border-b border-foreground/10 p-3 text-right text-[11px] font-bold text-foreground/50">
                  Score
                </th>
                <th className="w-24 border-b border-foreground/10 p-3 text-right text-[11px] font-bold text-foreground/50">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {rows.map((row, index) => {
                const percentage = row.total > 0 ? (row.obtained / row.total) * 100 : 0;
                const isRowUpdated = isAssessmentMarksUpdated(pendingUpdates, course, row.title);
                return (
                  <tr
                    key={index}
                    className={`transition-colors hover:bg-foreground/[0.02] ${row.included ? "" : "opacity-40"} ${isRowUpdated ? "bg-[#230052]/[0.04] dark:bg-white/[0.05]" : ""}`}
                  >
                    <td className="p-3 text-[13px] font-semibold text-foreground sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span>{row.title}</span>
                        {!row.included && (
                          <span className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[10px] font-bold text-foreground/55">
                            Dropped
                          </span>
                        )}
                        {isRowUpdated && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#230052]/10 px-2 py-0.5 text-[10px] font-bold text-[#230052] dark:bg-white/15 dark:text-white">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#230052] animate-pulse dark:bg-white" />
                            New
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right text-xs font-bold text-foreground sm:text-sm">
                      {row.ungraded ? "—" : row.obtained}{" "}
                      <span className="text-[11px] font-normal text-foreground/40 sm:text-xs">
                        / {row.total}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {row.ungraded ? (
                        <span className="rounded-full border border-foreground/10 bg-foreground/[0.05] px-2 py-1 text-[10px] font-bold text-foreground/55">
                          Pending
                        </span>
                      ) : !row.included ? (
                        <span className="rounded-full border border-foreground/10 bg-foreground/[0.05] px-2 py-1 text-[10px] font-bold text-foreground/55">
                          Dropped
                        </span>
                      ) : (
                        <span
                          className={`rounded-full border px-2 py-1 text-[10px] font-bold ${percentage >= 80 ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500" : percentage >= 60 ? "border-amber-500/20 bg-amber-500/10 text-amber-500" : "border-rose-500/20 bg-rose-500/10 text-rose-500"}`}
                        >
                          {percentage.toFixed(0)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const HeatmapTooltip = ({ hoveredDot }: { hoveredDot: { record: any; rect: DOMRect } }) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ left: number; top: number; below: boolean } | null>(null);

  useLayoutEffect(() => {
    const el = tooltipRef.current;
    if (!el || typeof window === "undefined") return;
    const width = el.offsetWidth || 180;
    const height = el.offsetHeight || 28;
    const margin = 12;
    const halfW = width / 2;
    const targetCenterX = hoveredDot.rect.left + hoveredDot.rect.width / 2;
    const clampedLeft = Math.min(
      Math.max(targetCenterX, halfW + margin),
      Math.max(halfW + margin, window.innerWidth - halfW - margin),
    );
    const below = hoveredDot.rect.top - height - 10 < margin;
    const top = below ? hoveredDot.rect.bottom + 8 : hoveredDot.rect.top - 8;
    setCoords({ left: clampedLeft, top, below });
  }, [hoveredDot]);

  const statusText = /\bp\b|present/i.test(hoveredDot.record.status)
    ? "Present"
    : /\bl\b|late/i.test(hoveredDot.record.status)
      ? "Late"
      : "Absent";
  const statusColor =
    statusText === "Present"
      ? "text-emerald-600 dark:text-emerald-400"
      : statusText === "Late"
        ? "text-amber-600 dark:text-amber-400"
        : "text-rose-600 dark:text-rose-400";

  const content = (
    <div
      ref={tooltipRef}
      className={`pointer-events-none fixed z-[9999] -translate-x-1/2 transform transition-opacity duration-75 ${coords?.below ? "" : "-translate-y-full"} ${coords ? "opacity-100" : "opacity-0"}`}
      style={{
        left: coords?.left ?? hoveredDot.rect.left + hoveredDot.rect.width / 2,
        top: coords?.top ?? hoveredDot.rect.top - 8,
      }}
    >
      <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-black/10 bg-white/95 px-3 py-1.5 text-[11px] font-medium text-slate-900 shadow-lg backdrop-blur-md dark:border-white/20 dark:bg-zinc-900/95 dark:text-white dark:shadow-2xl">
        <span className="font-semibold text-slate-900 dark:text-white">
          {hoveredDot.record.date}
        </span>
        <span className="text-slate-400 dark:text-white/40">·</span>
        <span className={`font-bold ${statusColor}`}>{statusText}</span>
        {hoveredDot.record.type && (
          <>
            <span className="text-slate-400 dark:text-white/40">·</span>
            <span className="text-slate-600 dark:text-white/70">{hoveredDot.record.type}</span>
          </>
        )}
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(content, document.body);
  }
  return content;
};

const AttendanceHeatmap = ({ subjects, updatedSubjectKeys = new Set() }) => {
  const ROWS_PER_COL = 15;
  const [hoveredDot, setHoveredDot] = useState<{
    key: string;
    record: any;
    rect: DOMRect;
  } | null>(null);

  useEffect(() => {
    if (!hoveredDot) return;
    const dismiss = (event?: Event) => {
      if (
        event?.type === "pointerdown" &&
        event.target instanceof Element &&
        event.target.closest("[data-heatmap-dot]")
      ) {
        return;
      }
      setHoveredDot(null);
    };
    window.addEventListener("scroll", dismiss, { capture: true, passive: true });
    document.addEventListener("pointerdown", dismiss);
    return () => {
      window.removeEventListener("scroll", dismiss, { capture: true });
      document.removeEventListener("pointerdown", dismiss);
    };
  }, [hoveredDot]);

  const renderDotButton = (record: any, dotKey: string, variant: "mobile" | "desktop") => {
    const status = String(record.status || "").trim();
    const color = /\bp\b|present/i.test(status)
      ? "bg-[#230052] dark:bg-white"
      : /\ba\b|absent/i.test(status)
        ? "bg-rose-500"
        : "bg-slate-200 dark:bg-white/15";
    const isSelected = hoveredDot?.key === dotKey;

    return (
      <button
        key={dotKey}
        type="button"
        data-heatmap-dot
        role="listitem"
        aria-label={`${record.date}: ${status || "Unknown attendance status"}`}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setHoveredDot((prev) => (prev?.key === dotKey ? null : { key: dotKey, record, rect }));
        }}
        onMouseEnter={(e) => {
          if (typeof window !== "undefined" && window.matchMedia?.("(hover: hover)").matches) {
            setHoveredDot({
              key: dotKey,
              record,
              rect: e.currentTarget.getBoundingClientRect(),
            });
          }
        }}
        onMouseLeave={() => {
          if (typeof window !== "undefined" && window.matchMedia?.("(hover: hover)").matches) {
            setHoveredDot(null);
          }
        }}
        className={
          variant === "mobile"
            ? "flex h-6 w-6 shrink-0 touch-manipulation items-center justify-center rounded-[5px] transition-transform active:scale-90"
            : "flex shrink-0 cursor-pointer items-center justify-center rounded-[3px] transition-transform hover:scale-125"
        }
      >
        <span
          className={`${variant === "mobile" ? "h-6 w-6 rounded-[5px]" : "h-3.5 w-3.5 rounded-[3px]"} ${color} ${isSelected ? "ring-2 ring-foreground/60 ring-offset-1 ring-offset-background dark:ring-white/80" : ""}`}
        />
      </button>
    );
  };

  return (
    <div className="min-w-0 flex-1 space-y-4" aria-label="Attendance by subject">
      <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-foreground/55 sm:text-[10px] sm:text-foreground/50">
        <span>Each square represents one class session</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <i className="h-3 w-3 rounded-[3px] bg-[#230052] dark:bg-white sm:h-2.5 sm:w-2.5" />{" "}
            Present
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-3 w-3 rounded-[3px] bg-rose-500 sm:h-2.5 sm:w-2.5" /> Absent
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-5 sm:grid sm:max-h-[390px] sm:grid-cols-2 sm:gap-x-4 sm:gap-y-5 sm:overflow-y-auto sm:px-1 sm:pb-0 sm:pr-2 md:grid-cols-3 xl:grid-cols-5">
        {subjects.map((subject, index) => {
          const records = [...(subject.records || [])].sort(
            (a, b) =>
              (parseAcademicDate(a.date, "day-first")?.getTime() || 0) -
              (parseAcademicDate(b.date, "day-first")?.getTime() || 0),
          );
          const isUpdated = updatedSubjectKeys.has(subject.title);
          const columns = [];
          for (let i = 0; i < records.length; i += ROWS_PER_COL) {
            columns.push(records.slice(i, i + ROWS_PER_COL));
          }
          if (columns.length === 0 && records.length === 0) {
            columns.push([]);
          }

          return (
            <div
              key={`${subject.title}-${index}`}
              className="flex w-full flex-col items-start py-1 sm:min-w-0"
            >
              {/* Mobile: larger 24x24 squares with compact 6px gap */}
              <div
                className="mb-2 flex flex-wrap gap-1.5 py-0.5 sm:hidden"
                role="list"
                aria-label={`${subject.title} class sessions`}
              >
                {records.map((record, recordIndex) =>
                  renderDotButton(record, `${index}-m-${record.date}-${recordIndex}`, "mobile"),
                )}
              </div>

              {/* Desktop / tablet: stacked vertical columns */}
              <div
                className="mb-2 hidden min-h-[180px] flex-row items-end gap-1.5 px-2 py-1 sm:flex"
                role="list"
                aria-label={`${subject.title} class sessions`}
              >
                {columns.map((colRecords, colIndex) => (
                  <div key={colIndex} className="flex flex-col-reverse gap-1">
                    {colRecords.map((record, recordIndex) =>
                      renderDotButton(
                        record,
                        `${index}-d-${colIndex}-${record.date}-${recordIndex}`,
                        "desktop",
                      ),
                    )}
                  </div>
                ))}
              </div>

              <div className="flex w-full items-center gap-1.5">
                {isUpdated && (
                  <span
                    className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 animate-pulse ring-2 ring-emerald-500/30"
                    title="New attendance marked!"
                  />
                )}
                <p
                  className="w-full truncate text-[13px] font-semibold text-foreground"
                  title={subject.title}
                >
                  {subject.title}
                </p>
              </div>
              <p className="mt-0.5 text-[11px] font-medium text-foreground/55">
                {subject.percentage.toFixed(0)}% · {subject.present}P / {subject.absent}A
              </p>
            </div>
          );
        })}
      </div>

      {hoveredDot && <HeatmapTooltip hoveredDot={hoveredDot} />}
    </div>
  );
};

function HomePage() {
  const now = useCurrentTime();
  const [profile] = useState(() => {
    if (typeof document === "undefined") return null;
    const root = findFlexPageRoot(document);
    if (!root) return null;
    const snapshot = root.cloneNode(true) as HTMLElement;
    snapshot.querySelectorAll("script").forEach((script) => script.remove());
    snapshot.querySelector("#NotificationDetail")?.remove();
    const parsed = parseHomeProfile(snapshot);
    if (parsed.universityInfo?.["Roll No"]) {
      setActiveStudentId(parsed.universityInfo["Roll No"]);
    }
    return parsed;
  });
  const universityInfo = profile?.universityInfo || null;
  const personalInfo = profile?.personalInfo || null;
  const profileSections = profile?.sections || EMPTY_PROFILE_SECTIONS;
  const [activeMainTab, setActiveMainTab] = useState(() => {
    if (typeof window === "undefined") return "stats";
    return new URLSearchParams(window.location.search).get("tab") === "info" ? "info" : "stats";
  });
  const selectMainTab = (tab: "stats" | "info") => {
    setActiveMainTab(tab);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (tab === "info") {
      url.searchParams.set("tab", "info");
    } else {
      url.searchParams.delete("tab");
    }
    window.history.replaceState(null, "", url.toString());
  };
  const [alerts, setAlerts] = useState(() => profile?.alerts || []);
  const profileImage = useProfileImage();
  const themeMode = usePreferencesStore((state) => state.themeMode);
  const setThemeMode = usePreferencesStore((state) => state.setThemeMode);
  const toggleTheme = () => setThemeMode(themeMode === "dark" ? "light" : "dark");

  const [attendanceData, setAttendanceData] = useState(null);
  const [coursesData, setCoursesData] = useState([]);
  const teacherSelections = useTeacherStore((state) => state.selections);
  const [courseSelection, setCourseSelection] = useState<{
    activeCourse: string | null;
    openCategoryIdx: number | null;
  }>({ activeCourse: null, openCategoryIdx: null });
  const { activeCourse, openCategoryIdx } = courseSelection;
  function selectCourse(courseId: string) {
    setCourseSelection((current) =>
      current.activeCourse === courseId
        ? current
        : { activeCourse: courseId, openCategoryIdx: null },
    );
  }
  function toggleCategory(index: number) {
    setCourseSelection((current) => ({
      ...current,
      openCategoryIdx: current.openCategoryIdx === index ? null : index,
    }));
  }

  const [links, setLinks] = useState<Record<string, string>>({});

  const [loadingMarks, setLoadingMarks] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [marksError, setMarksError] = useState(false);
  const [attendanceError, setAttendanceError] = useState(false);
  const [studyPlanError, setStudyPlanError] = useState(false);
  const [studyPlanData, setStudyPlanData] = useState(null);
  const [pendingUpdates, setPendingUpdates] = useState(null);

  useEffect(() => {
    let active = true;
    const handleUpdates = async () => {
      const updates = await getPendingUpdates();
      if (active) setPendingUpdates(updates);
    };
    handleUpdates();
    window.addEventListener("superflex-academic-updates-detected", handleUpdates);
    window.addEventListener("superflex-academic-updates-cleared", handleUpdates);
    window.addEventListener("superflex-student-identity-changed", handleUpdates);
    return () => {
      active = false;
      window.removeEventListener("superflex-academic-updates-detected", handleUpdates);
      window.removeEventListener("superflex-academic-updates-cleared", handleUpdates);
      window.removeEventListener("superflex-student-identity-changed", handleUpdates);
    };
  }, []);

  const updatedAttendanceSubjectTitles = useMemo(() => {
    const set = new Set();
    (pendingUpdates?.newAttendance || []).forEach((item) => {
      if (item.subjectTitle) set.add(item.subjectTitle);
      if (item.courseTitle) set.add(item.courseTitle);
      if (item.subjectKey) set.add(item.subjectKey);
    });
    return set;
  }, [pendingUpdates]);

  const combinedAlerts = useMemo(() => {
    const dynamic = [];
    if (pendingUpdates?.newMarks?.length > 0) {
      dynamic.push({
        type: "update",
        title: "New Marks Uploaded",
        message: (
          <div className="space-y-1.5 pt-0.5">
            {pendingUpdates.newMarks.map((m, idx) => {
              const itemsList = m.items || [];
              const displayItems = itemsList.slice(0, 3).join(", ");
              const extraCount = itemsList.length - 3;
              return (
                <div key={idx} className="flex flex-wrap items-baseline gap-1.5">
                  <span className="font-bold text-foreground">{m.courseTitle || m.courseId}:</span>
                  <span className="text-foreground/80">{displayItems}</span>
                  {extraCount > 0 && (
                    <span className="text-[11px] font-semibold text-[#230052]/70 dark:text-white/70">
                      +{extraCount} more
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ),
        dismissible: true,
        key: "update-marks",
      });
    }
    if (pendingUpdates?.newAttendance?.length > 0) {
      dynamic.push({
        type: "update",
        title: "New Attendance Marked",
        message: (
          <div className="space-y-1.5 pt-0.5">
            {pendingUpdates.newAttendance.map((a, idx) => {
              const recordsList = a.records || [];
              const displayRecords = recordsList.slice(0, 3).join(", ");
              const extraCount = recordsList.length - 3;
              return (
                <div key={idx} className="flex flex-wrap items-baseline gap-1.5">
                  <span className="font-bold text-foreground">
                    {a.subjectTitle || a.courseTitle}:
                  </span>
                  <span className="text-foreground/80">
                    {displayRecords || `${a.newCount} session${a.newCount > 1 ? "s" : ""} marked`}
                  </span>
                  {extraCount > 0 && (
                    <span className="text-[11px] font-semibold text-[#230052]/70 dark:text-white/70">
                      +{extraCount} more
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ),
        dismissible: true,
        key: "update-attendance",
      });
    }
    return [...dynamic, ...(alerts || [])];
  }, [pendingUpdates, alerts]);

  const handleDismissAlert = (alertToDismiss) => {
    if (alertToDismiss.key === "update-marks") {
      clearPendingUpdateType("marks");
    } else if (alertToDismiss.key === "update-attendance") {
      clearPendingUpdateType("attendance");
    } else {
      setAlerts((prev) => prev.filter((a) => a !== alertToDismiss));
    }
  };

  const activeCourseData = useMemo(
    () => coursesData.find((course) => course.id === activeCourse),
    [coursesData, activeCourse],
  );
  const rollNumber = universityInfo?.["Roll No"] || "";

  useEffect(() => {
    if (!rollNumber) return;
    setActiveStudentId(rollNumber);
    if (!coursesData.length) return;
    useTeacherStore.getState().setCourses(coursesData.map(({ id, title }) => ({ id, title })));
    window.setTimeout(
      () =>
        window.dispatchEvent(
          new CustomEvent("superflex-teacher-course-data", {
            detail: {
              nextCourses: coursesData.map(({ id, title }) => ({ id, title })),
              nextRollNumber: rollNumber,
            },
          }),
        ),
      0,
    );
  }, [coursesData, rollNumber]);

  useEffect(() => {
    if (attendanceData?.length && rollNumber) void checkAndRecordAttendanceSnapshot(attendanceData);
  }, [attendanceData, rollNumber]);

  useEffect(() => {
    if (coursesData.length && rollNumber) void checkAndRecordMarksSnapshot(coursesData);
  }, [coursesData, rollNumber]);

  const mostAbsentSubject = useMemo(() => {
    if (!attendanceData?.length) return null;
    return attendanceData.reduce((previous, current) =>
      previous.absent > current.absent ? previous : current,
    );
  }, [attendanceData]);

  const greetingHeading = useMemo(() => {
    const hour = now.getHours();
    const rawName = personalInfo?.Name?.trim();
    const name = rawName ? rawName.split(" ")[0] : "";
    const timeGreeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
    return name ? `${timeGreeting}, ${name}` : timeGreeting;
  }, [personalInfo?.Name, now]);

  const greetingSubheading = useMemo(() => {
    const hour = now.getHours();
    const roasts = [
      "Dil thaam ke marks dekhein.",
      "Duaon pe chalti hui degree.",
      "Damage control mode shuru karein.",
      "Chai peo aur hosla rakho.",
      "FLEX khol hi liya hai toh sabr karein.",
      "Survival mode: Always ON.",
    ];
    const index = Math.abs((now.getDate() * 7 + hour) % roasts.length);
    return roasts[index];
  }, [now]);

  useEffect(() => {
    const scrollbarStyle = `
      .scrollbar-hide::-webkit-scrollbar { width: 6px; }
      .scrollbar-hide::-webkit-scrollbar-track { background: transparent; }
      .scrollbar-hide::-webkit-scrollbar-thumb { background-color: rgba(255, 255, 255, 0.1); border-radius: 20px; }
      .scrollbar-hide::-webkit-scrollbar-thumb:hover { background-color: rgba(255, 255, 255, 0.2); }
    `;
    const styleElement = document.createElement("style");
    styleElement.textContent = scrollbarStyle;
    document.head.appendChild(styleElement);

    const targetElement = findFlexPageRoot(document);
    if (targetElement) {
      targetElement.querySelectorAll<HTMLElement>("script").forEach((script) => script.remove());
      targetElement.querySelector<HTMLElement>("#NotificationDetail")?.remove();
      document.querySelector<HTMLElement>(".m-scroll-top")?.remove();

      document.querySelector<HTMLElement>(".m-scroll-top")?.remove();
      targetElement.remove();
    }

    return () => {
      styleElement.remove();
    };
  }, []);

  const profileData = useMemo(() => {
    if (!personalInfo || !personalInfo["Name"]) return null;
    return {
      studentName: personalInfo["Name"],
      personalInfo: personalInfo,
      universityInfo: universityInfo,
      profileSections: profileSections,
      alerts: alerts,
    };
  }, [personalInfo, universityInfo, profileSections, alerts]);

  useAiSync({
    data: profileData,
    syncKey: "profile",
    isEnabled: !!profileData,
  });

  useAiSync({
    data: attendanceData,
    dataKey: "attendance",
    syncKey: "attendance",
    isEnabled: !!attendanceData,
  });

  useAiSync({
    data: coursesData,
    dataKey: "marks",
    syncKey: "marks",
    isEnabled: !!coursesData && coursesData.length > 0,
  });

  useAiSync({
    data: studyPlanData,
    dataKey: "studyPlan",
    syncKey: "studyPlan",
    isEnabled: !!studyPlanData,
  });

  const handleLinksFound = (foundLinks) => {
    const linkMap: Record<string, string> = {};
    foundLinks.forEach((l) => {
      if (l.text.includes("Attendance")) linkMap.attendance = l.href;
      if (l.text.includes("Marks") && !l.text.includes("PLO")) linkMap.marks = l.href;
      if (l.text.includes("Study Plan")) linkMap.studyPlan = l.href;
    });
    setLinks(linkMap);
    if (linkMap.attendance) void fetchAttendance(linkMap.attendance);
    if (linkMap.marks) void fetchMarks(linkMap.marks);
    if (linkMap.studyPlan) void fetchStudyPlan(linkMap.studyPlan);
  };

  async function fetchAttendance(url: string) {
    setLoadingAttendance(true);
    setAttendanceError(false);
    try {
      const doc = await fetchPortalDocument(url);
      const parsedAttendance = parseHomeAttendanceReport(doc);
      setAttendanceData(parsedAttendance);
    } catch (e) {
      console.error("Attendance fetch error", e);
      setAttendanceError(true);
    } finally {
      setLoadingAttendance(false);
    }
  }

  async function fetchMarks(url: string) {
    setLoadingMarks(true);
    setMarksError(false);
    try {
      const doc = await fetchPortalDocument(url);
      const parsedCourses = parseHomeMarksReport(doc).map((course) => processCourseMarks(course));

      setCoursesData(parsedCourses);
      if (parsedCourses.length) selectCourse(parsedCourses[0].id);
    } catch (e) {
      console.error("Marks fetch error", e);
      setMarksError(true);
    } finally {
      setLoadingMarks(false);
    }
  }

  async function fetchStudyPlan(url: string) {
    setStudyPlanError(false);
    try {
      const doc = await fetchPortalDocument(url);
      setStudyPlanData(parseHomeStudyPlan(doc));
    } catch (e) {
      console.error("Study Plan fetch error", e);
      setStudyPlanError(true);
    }
  }

  return (
    <PageLayout
      currentPage={window.location.pathname}
      onLinksFound={handleLinksFound}
      fullWidth={true}
    >
      <div className="relative">
        <div className="relative z-10 mx-auto w-full max-w-[1680px] space-y-5 px-4 pb-6 pt-[max(1.75rem,env(safe-area-inset-top))] sm:space-y-7 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          {/* Mobile App Hero Header (Overview vs Profile) */}
          {activeMainTab === "stats" ? (
            <header className="pb-1 pt-1 sm:hidden">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold tracking-wide text-white backdrop-blur-md dark:bg-white/10">
                  {rollNumber || universityInfo?.Section || "FLEX"}
                </span>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${themeMode === "dark" ? "light" : "dark"} mode`}
                    title={`Switch to ${themeMode === "dark" ? "light" : "dark"} mode`}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform active:scale-95 dark:bg-white/10"
                  >
                    {themeMode === "dark" ? (
                      <Sun size={17} strokeWidth={2.2} />
                    ) : (
                      <Moon size={17} strokeWidth={2.2} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => selectMainTab("info")}
                    aria-label="Open student profile"
                    className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/45 bg-white/20 transition-transform active:scale-95 dark:border-white/20 dark:bg-white/10"
                  >
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        const fallbackUrl = getExtensionUrl("assets/favicon.png");
                        if (fallbackUrl) event.currentTarget.src = fallbackUrl;
                        else event.currentTarget.hidden = true;
                      }}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-1.5">
                <h1 className="min-w-0 text-[28px] font-extrabold leading-[1.1] tracking-[-0.035em] text-white">
                  {greetingHeading}
                </h1>
                <p className="text-xs font-medium leading-relaxed text-white/80">
                  {greetingSubheading}
                </p>
              </div>
            </header>
          ) : (
            <header className="flex flex-col items-center pb-2.5 pt-1 text-center sm:hidden">
              <div className="flex w-full items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={() => selectMainTab("stats")}
                  aria-label="Back to Overview"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform active:scale-95 dark:bg-white/10"
                >
                  <ArrowLeft size={18} strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${themeMode === "dark" ? "light" : "dark"} mode`}
                  title={`Switch to ${themeMode === "dark" ? "light" : "dark"} mode`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform active:scale-95 dark:bg-white/10"
                >
                  {themeMode === "dark" ? (
                    <Sun size={17} strokeWidth={2.2} />
                  ) : (
                    <Moon size={17} strokeWidth={2.2} />
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("superflex-open-profile-image"))
                }
                aria-label="Change profile picture"
                title="Change profile picture"
                className="group relative mt-1 rounded-full transition-transform active:scale-95"
              >
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-24 w-24 rounded-full border-2 border-white/50 bg-white object-cover"
                  onError={(event) => {
                    const fallbackUrl = getExtensionUrl("assets/favicon.png");
                    if (fallbackUrl) event.currentTarget.src = fallbackUrl;
                    else event.currentTarget.hidden = true;
                  }}
                />
                <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#230052] text-white shadow-md dark:border-[#0a192f] dark:bg-white dark:text-[#0a192f]">
                  <Camera size={14} strokeWidth={2.3} />
                </span>
              </button>

              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/25 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md dark:bg-white/10">
                <span className="font-bold opacity-90">@</span>
                <span>
                  {(rollNumber || personalInfo?.Name || "student")
                    .toLowerCase()
                    .replace(/\s+/g, "")}
                </span>
              </div>

              <p className="mt-3 text-xs font-semibold text-white/95">
                {universityInfo?.Degree || "Student"}
                {universityInfo?.Batch ? ` · Batch ${universityInfo.Batch}` : ""}
              </p>
              <p className="mt-0.5 text-xs font-medium text-white/80">
                {universityInfo?.Campus ? `${universityInfo.Campus} Campus` : "FAST NUCES"}
                {universityInfo?.Section ? ` (${universityInfo.Section})` : ""}
              </p>
            </header>
          )}

          {/* Desktop Header */}
          <header className="hidden flex-col justify-between gap-3.5 sm:flex sm:flex-row sm:items-center sm:gap-5">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => {
                  if (activeMainTab === "info") {
                    window.dispatchEvent(new CustomEvent("superflex-open-profile-image"));
                  } else {
                    selectMainTab("info");
                  }
                }}
                aria-label={
                  activeMainTab === "info" ? "Change profile picture" : "Open student profile"
                }
                title={activeMainTab === "info" ? "Change profile picture" : "Open student profile"}
                className="group relative h-10 w-10 shrink-0 rounded-full border-2 border-white/80 bg-white transition-transform hover:scale-105 active:scale-95 sm:h-14 sm:w-14"
              >
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-full w-full rounded-full object-cover"
                  onError={(event) => {
                    const fallbackUrl = getExtensionUrl("assets/favicon.png");
                    if (fallbackUrl) event.currentTarget.src = fallbackUrl;
                    else event.currentTarget.hidden = true;
                  }}
                />
                {activeMainTab === "info" && (
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-[#230052] text-white shadow-sm dark:border-[#0a192f] dark:bg-white dark:text-[#0a192f]">
                    <Camera size={10} strokeWidth={2.3} />
                  </span>
                )}
              </button>
              <div className="min-w-0">
                <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/80 dark:text-white/80 sm:mb-1 sm:text-[10px]">
                  Student dashboard
                </p>
                <h1 className="truncate text-xl font-bold leading-tight tracking-[-0.045em] text-white sm:text-4xl">
                  {greetingHeading}
                </h1>
                <p className="mt-0.5 text-xs text-white/80 sm:mt-1 sm:text-sm">
                  {greetingSubheading}
                </p>
              </div>
            </div>

            <div className="flex w-fit items-center gap-1 rounded-full border border-white/60 bg-white/45 p-1 backdrop-blur-md dark:border-white/10 dark:bg-black/35">
              <button
                type="button"
                onClick={() => selectMainTab("stats")}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm ${
                  activeMainTab === "stats"
                    ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]"
                    : "text-slate-600 hover:text-[#230052] dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                <Activity size={14} className="sm:h-4 sm:w-4" />
                Overview
              </button>
              <button
                type="button"
                onClick={() => selectMainTab("info")}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm ${
                  activeMainTab === "info"
                    ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]"
                    : "text-slate-600 hover:text-[#230052] dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                <User size={14} className="sm:h-4 sm:w-4" />
                Profile
              </button>
            </div>
          </header>

          <NotificationBanner alerts={combinedAlerts} onDismissAlert={handleDismissAlert} />
          {studyPlanError && (
            <ReportLoadError report="study plan" onRetry={() => fetchStudyPlan(links.studyPlan)} />
          )}

          {}
          {activeMainTab === "stats" && (
            <div className="space-y-4 sm:space-y-7">
              <section aria-labelledby="overview-heading" className="space-y-2.5 sm:space-y-4">
                <div className="hidden flex-col gap-0.5 sm:flex sm:flex-row sm:items-end sm:justify-between sm:gap-1">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/80 sm:text-[10px]">
                      Overview
                    </p>
                    <h2
                      id="overview-heading"
                      className="text-base font-bold tracking-tight text-white sm:text-xl"
                    >
                      Academic snapshot
                    </h2>
                  </div>
                  <p className="text-[11px] text-white/75 sm:text-xs">
                    Live metrics from your marks and attendance records.
                  </p>
                </div>

                <div className="sf-mobile-cards-scroll pb-1 scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-4 sm:pb-0 xl:grid-cols-4 xl:gap-5">
                  <StatsCard
                    variant="dashboard"
                    icon={GraduationCap}
                    iconTone="plum"
                    label="Degree Program"
                    value={universityInfo?.Degree || "..."}
                    subValue={
                      universityInfo?.Campus
                        ? `${universityInfo.Campus} Campus`
                        : "Active enrollment"
                    }
                  />
                  <StatsCard
                    variant="dashboard"
                    icon={Users}
                    iconTone="lavender"
                    label="Section"
                    value={universityInfo?.Section || "..."}
                    subValue={
                      universityInfo?.Batch ? `Batch of ${universityInfo.Batch}` : "Current cohort"
                    }
                  />
                  <StatsCard
                    variant="dashboard"
                    icon={Award}
                    iconTone="neutral"
                    label="Registered Courses"
                    value={marksError ? "Unavailable" : coursesData.length || 0}
                    subValue={marksError ? "Marks could not be loaded" : "Current semester"}
                  />
                  <StatsCard
                    variant="dashboard"
                    icon={Activity}
                    iconTone="lavender"
                    label="Critical Attendance"
                    value={
                      loadingAttendance ? (
                        <Skeleton className="my-1 h-6 w-24" />
                      ) : attendanceError ? (
                        "Unavailable"
                      ) : (
                        mostAbsentSubject?.title || "None"
                      )
                    }
                    subValue={
                      loadingAttendance ? (
                        <Skeleton className="h-3 w-16" />
                      ) : attendanceError ? (
                        "Attendance could not be loaded"
                      ) : mostAbsentSubject ? (
                        `${mostAbsentSubject.absent} Absents taken`
                      ) : (
                        "No attendance data"
                      )
                    }
                  />
                </div>
              </section>

              <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-6 lg:grid-cols-2 xl:gap-8">
                <div className="flex h-full flex-col gap-3.5 overflow-hidden rounded-[22px] border border-black/[0.05] bg-white p-4 text-slate-900 shadow-none dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:gap-6 sm:rounded-[24px] sm:p-7 xl:p-8">
                  <div className="flex items-center justify-between gap-3 sm:min-h-[52px] sm:gap-4">
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[28%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f] sm:h-12 sm:w-12">
                        <Award size={18} className="sm:h-[22px] sm:w-[22px]" />
                      </span>
                      <div className="min-w-0 space-y-0.5 sm:space-y-1">
                        <h3 className="truncate text-base font-bold tracking-[-0.02em] text-foreground sm:text-lg">
                          Assessments
                        </h3>
                        <p className="hidden truncate text-xs text-foreground/50 sm:block">
                          Let's see how badly those quizzes went.
                        </p>
                      </div>
                    </div>
                    {links.marks && (
                      <a
                        href={links.marks}
                        className="flex h-7 items-center gap-1 rounded-full bg-[#230052] px-3 text-xs font-bold text-white transition-colors hover:bg-[#370c72] dark:bg-white dark:text-[#0a192f] sm:h-9 sm:gap-1.5 sm:px-4"
                      >
                        <span className="sm:hidden">See all</span>
                        <span className="hidden items-center gap-1.5 sm:inline-flex">
                          Details <ArrowRight size={11} />
                        </span>
                      </a>
                    )}
                  </div>
                  {loadingMarks ? (
                    <MarksSkeleton />
                  ) : marksError ? (
                    <ReportLoadError report="marks" onRetry={() => fetchMarks(links.marks)} />
                  ) : coursesData.length ? (
                    <>
                      <div className="w-full overflow-x-auto scrollbar-hide">
                        <div className="flex w-fit gap-1.5 rounded-full bg-slate-100 p-1 dark:bg-white/[0.08]">
                          {coursesData.map((course) => {
                            const hasUpdate = isCourseMarksUpdated(pendingUpdates, course);
                            const isActive = activeCourse === course.id;
                            return (
                              <button
                                key={course.id}
                                type="button"
                                onClick={() => selectCourse(course.id)}
                                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all sm:px-5 sm:py-2 ${
                                  isActive
                                    ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]"
                                    : "text-slate-600 hover:text-[#230052] dark:text-slate-300 dark:hover:text-white"
                                }`}
                              >
                                {hasUpdate && (
                                  <span className="flex shrink-0 items-center justify-center p-0.5">
                                    <span
                                      className={`h-2 w-2 rounded-full animate-pulse ring-2 ${
                                        isActive
                                          ? "bg-white ring-white/40 dark:bg-[#0a192f] dark:ring-[#0a192f]/40"
                                          : "bg-[#230052] ring-[#230052]/30 dark:bg-white dark:ring-white/40"
                                      }`}
                                      title="New marks uploaded for this course"
                                    />
                                  </span>
                                )}
                                {course.id}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {activeCourseData && (
                        <div key={activeCourse}>
                          <div className="mb-3 flex flex-col gap-1 sm:mb-4 sm:gap-2">
                            <h2 className="text-[15px] font-bold leading-tight text-foreground sm:text-xl">
                              {activeCourseData.title}
                            </h2>
                            {teacherSelections[activeCourseData.id] && (
                              <div className="flex items-center gap-2 text-xs text-foreground/60">
                                <TeacherAvatar
                                  teacher={teacherSelections[activeCourseData.id]}
                                  size="xs"
                                  className="rounded-full"
                                />
                                <span>
                                  Instructor:{" "}
                                  <span className="font-semibold text-foreground">
                                    {teacherSelections[activeCourseData.id].name}
                                  </span>
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-foreground/60">
                                {activeCourseData.id}
                              </span>
                              <span className="text-xs text-foreground/50">
                                {activeCourseData.sections
                                  .filter((section) => !section.id.endsWith("Grand_Total_Marks"))
                                  .reduce(
                                    (sum, section) => sum + (section.rows?.length || 0),
                                    0,
                                  )}{" "}
                                Assessments
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2.5 sm:space-y-3">
                            {activeCourseData.sections
                              .filter((section) => !section.id.endsWith("Grand_Total_Marks"))
                              .map((section, index) => (
                                <SectionAccordion
                                  key={index}
                                  section={section}
                                  course={activeCourseData}
                                  pendingUpdates={pendingUpdates}
                                  isOpen={openCategoryIdx === index}
                                  onToggle={() => toggleCategory(index)}
                                />
                              ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                      <div className="mb-4 rounded-3xl bg-foreground/5 p-6">
                        <Award size={40} className="text-foreground/40" />
                      </div>
                      <h4 className="text-lg font-bold text-foreground/60">
                        No Assessments Uploaded
                      </h4>
                      <p className="mt-1 text-xs text-foreground/40">
                        Enjoy the peace while it lasts.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex h-full flex-col gap-3.5 rounded-[22px] border border-black/[0.05] bg-white p-4 text-slate-900 shadow-none dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:gap-6 sm:rounded-[24px] sm:p-7 xl:p-8">
                  <div className="flex items-center justify-between gap-3 sm:min-h-[52px] sm:gap-4">
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[28%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f] sm:h-12 sm:w-12">
                        <Activity size={18} className="sm:h-[22px] sm:w-[22px]" />
                      </span>
                      <div className="min-w-0 space-y-0.5 sm:space-y-1">
                        <h3 className="truncate text-base font-bold tracking-[-0.02em] text-foreground sm:text-lg">
                          Attendance Overview
                        </h3>
                        <p className="hidden truncate text-xs text-foreground/50 sm:block">
                          Ek aur chutti aur game over?
                        </p>
                      </div>
                    </div>
                    {links.attendance && (
                      <a
                        href={links.attendance}
                        className="flex h-7 items-center gap-1 rounded-full bg-[#230052] px-3 text-xs font-bold text-white transition-colors hover:bg-[#370c72] dark:bg-white dark:text-[#0a192f] sm:h-9 sm:gap-1.5 sm:px-4"
                      >
                        <span className="sm:hidden">See all</span>
                        <span className="hidden items-center gap-1.5 sm:inline-flex">
                          Details <ArrowRight size={11} />
                        </span>
                      </a>
                    )}
                  </div>
                  {loadingAttendance ? (
                    <AttendanceSkeleton />
                  ) : attendanceError ? (
                    <ReportLoadError
                      report="attendance"
                      onRetry={() => fetchAttendance(links.attendance)}
                    />
                  ) : attendanceData?.length ? (
                    <AttendanceHeatmap
                      subjects={attendanceData}
                      updatedSubjectKeys={updatedAttendanceSubjectTitles}
                    />
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                      <div className="mb-4 rounded-3xl bg-foreground/5 p-6">
                        <Activity size={40} className="text-foreground/40" />
                      </div>
                      <h4 className="text-lg font-bold text-foreground/60">
                        No Attendance Records
                      </h4>
                      <p className="mt-1 text-xs text-foreground/40">
                        Attendance hasn't been uploaded. Innocent until proven absent.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {}
          {activeMainTab === "info" && <ProfileInfoTabs profileSections={profileSections} />}
        </div>
      </div>
    </PageLayout>
  );
}

const ProfileInfoTabs = ({ profileSections }) => {
  if (!profileSections || profileSections.length === 0) {
    return (
      <div className="rounded-[22px] border border-black/[0.05] bg-white p-6 text-center text-sm text-slate-500 dark:border-white/[0.14] dark:bg-black dark:text-slate-400 sm:rounded-[24px] sm:p-8">
        Profile information is not available yet.
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-8">
      {profileSections.map((section, idx) => (
        <div
          key={idx}
          className="overflow-hidden rounded-[22px] border border-black/[0.05] bg-white px-5 pt-5 pb-3 text-[#101027] shadow-none dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:rounded-[24px] sm:p-8"
        >
          {/* Section Header */}
          <div className="mb-3 flex items-center gap-2.5 sm:mb-6 sm:gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[28%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f] sm:h-12 sm:w-12">
              {(() => {
                const title = section.title.toLowerCase();
                if (title.includes("personal")) return <User size={18} className="sm:h-6 sm:w-6" />;
                if (title.includes("university"))
                  return <Building size={18} className="sm:h-6 sm:w-6" />;
                if (title.includes("guardian") || title.includes("family"))
                  return <Users size={18} className="sm:h-6 sm:w-6" />;
                return <Activity size={18} className="sm:h-6 sm:w-6" />;
              })()}
            </div>
            <h3 className="text-base font-bold tracking-[-0.02em] text-foreground sm:text-xl">
              {section.title}
            </h3>
          </div>

          {/* Mobile Grouped Key-Value Rows (matches Screenshot 3) */}
          <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08] sm:hidden">
            {Object.entries(section.data as Record<string, string>).map(([key, val], i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-2.5">
                <span className="shrink-0 text-[13px] font-semibold text-[#101027] dark:text-white">
                  {key}
                </span>
                <span className="min-w-0 truncate text-right text-xs font-medium text-[#667085] dark:text-[#9ca3b3]">
                  {val}
                </span>
              </div>
            ))}
          </div>

          {/* Desktop 3-Column Grid */}
          <div className="hidden grid-cols-1 gap-3 sm:grid sm:grid-cols-2 xl:grid-cols-3">
            {Object.entries(section.data as Record<string, string>).map(([key, val], i) => (
              <div
                key={i}
                className="flex min-h-[84px] flex-col justify-center rounded-[20px] bg-[#f6f6f8] p-4 transition-colors hover:bg-[#eeeeF2] dark:bg-black dark:hover:bg-black"
              >
                <span className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[#230052]/70 dark:text-white">
                  {key}
                </span>
                <span className="break-words text-sm font-semibold leading-relaxed text-[#101010] dark:text-[#f5f6fb]">
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomePage;
