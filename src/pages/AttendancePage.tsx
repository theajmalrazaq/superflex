import { useCurrentTime } from "../hooks/useCurrentTime";
import { useTeacherStore } from "../stores/teacherStore";
import React, { useEffect, useState, useRef } from "react";

import { PageSkeleton } from "../components/ui/Skeleton";
import PageLayout from "../components/layouts/PageLayout";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  BookOpen,
  Bookmark,
  Percent,
  Mail,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import NotificationBanner from "../components/ui/NotificationBanner";
import SuperTabs from "../components/ui/SuperTabs";
import AttendanceReviewModal from "../components/AttendanceReviewModal";
import StatsCard from "../components/ui/StatsCard";
import BookmarksModal from "../components/ui/BookmarksModal";
import { findAttendanceForm, parseAttendancePage } from "../parsers/attendance";
import { findFlexPageRoot } from "../parsers/dom";
import { useAiSync } from "../hooks/useAiSync";
import {
  checkAndRecordAttendanceSnapshot,
  clearPendingUpdateType,
} from "../utils/academicSnapshot";
import { getMarkedAttendance, setMarkedAttendance } from "../utils/userDataStorage";
import { parseAcademicDate } from "../utils/academicDate";

const AttendanceCourseTabs = ({ courses, selectedId, onSelect }) => (
  <div
    className="flex w-full max-w-full gap-2 overflow-x-auto pb-0.5 scrollbar-hide sm:inline-flex sm:w-fit sm:rounded-full sm:bg-white/55 sm:p-1.5 sm:shadow-sm sm:shadow-black/[0.03] sm:backdrop-blur-xl sm:dark:bg-black/25 sm:dark:shadow-none"
    aria-label="Select course"
  >
    {courses.map((course) => {
      const cr =
        course.creditHours ||
        (/\blab\b/i.test(`${course.title} ${course.id}`)
          ? 1
          : /\b(?:pak(?:istan)?\s*studies|islamic\s*(?:studies|ethics)|islamiat|ethics|quranic|ideology|constitution)\b/i.test(
                `${course.title} ${course.id}`,
              )
            ? 2
            : 3);
      const allowed = course.allowedAbsents || (cr === 3 ? 6 : cr <= 2 ? 3 : 6);
      const isOver = course.absent > allowed;
      const isAtLimit = course.absent === allowed;
      const isActive = selectedId === course.id;
      return (
        <button
          key={course.id}
          type="button"
          onClick={() => onSelect(course.id)}
          aria-pressed={isActive}
          title={`${course.title} (${cr} Cr Hr · ${course.absent}/${allowed} absents)`}
          className={`flex shrink-0 items-center justify-between gap-2.5 rounded-full px-4 py-2 text-xs font-bold transition-colors sm:min-w-[120px] sm:gap-3 sm:py-2.5 ${
            isActive
              ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]"
              : "bg-white text-[#101027] hover:bg-white/90 dark:bg-white/10 dark:text-slate-200 sm:bg-transparent sm:text-slate-600 sm:hover:bg-white/80 sm:hover:text-[#230052]"
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            {isOver ? (
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-rose-500 animate-pulse"
                title="Debarment limit exceeded"
              />
            ) : isAtLimit ? (
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-amber-500"
                title="At absent limit"
              />
            ) : null}
            <span className="truncate">
              {course.title.match(/[A-Z]{2,5}\s?-?\d{3,4}/i)?.[0] || course.id}
            </span>
          </div>
          <span className="shrink-0 text-[10px] opacity-70">{course.percentage.toFixed(0)}%</span>
        </button>
      );
    })}
  </div>
);

const AttendanceMetric = ({ icon, label, value, subValue, tone = undefined }) => (
  <StatsCard
    icon={icon}
    label={label}
    value={value}
    subValue={subValue}
    valueClassName={tone}
    variant="dashboard"
  />
);

const AttendanceCard = ({ record, index, isMarked, onToggleMark, onRequestReview }) => {
  const status = String(record.status || "").trim();
  const isPresent = /^p$|present/i.test(status);
  const isLate = /^l$|late/i.test(status);
  const isAbsent = !isPresent && !isLate;
  const stateLabel = isPresent ? "Present" : isLate ? "Late" : "Absent";
  const stateColor = isPresent
    ? "text-emerald-700 bg-emerald-500/10 dark:text-emerald-300"
    : isLate
      ? "text-amber-700 bg-amber-500/10 dark:text-amber-300"
      : "text-rose-700 bg-rose-500/10 dark:text-rose-300";
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-black/[0.05] px-3 py-2.5 last:border-b-0 dark:border-white/[0.08]">
      <span className="w-6 text-center text-[10px] font-semibold text-foreground/35">{index}</span>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">{record.date}</span>
          <span className="shrink-0 text-[10px] text-foreground/45">{record.day}</span>
        </div>
        <div className="mt-0.5 flex min-w-0 items-center gap-3 text-[10px] text-foreground/50">
          <span className="flex shrink-0 items-center gap-1">
            <Clock size={11} />
            {record.time || "N/A"}
          </span>
          <span className="truncate">{record.type || "Lecture"}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${stateColor}`}>
          {stateLabel}
        </span>
        {isAbsent && (
          <button
            type="button"
            onClick={onRequestReview}
            aria-label={`Request attendance review for ${record.date}`}
            title="Draft an email to request an attendance review"
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/45 hover:bg-[#230052]/10 hover:text-[#230052] dark:hover:bg-white/15 dark:hover:text-white"
          >
            <Mail size={15} />
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onToggleMark}
        aria-label={isMarked ? `Remove bookmark for ${record.date}` : `Bookmark ${record.date}`}
        title={isMarked ? "Remove bookmark" : "Bookmark session"}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isMarked ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]" : "text-foreground/40 hover:bg-black/5 hover:text-[#230052] dark:hover:bg-white/10 dark:hover:text-white"}`}
      >
        <Bookmark size={15} fill={isMarked ? "currentColor" : "none"} />
      </button>
    </div>
  );
};

const BookmarksMenu = ({ markedRecords, courses, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const bookmarkedDetails = [];
  if (markedRecords.size > 0 && courses.length > 0) {
    courses.forEach((course) => {
      course.records.forEach((record, idx) => {
        const uniqueId = `${course.id}-${idx}`;
        if (markedRecords.has(uniqueId)) {
          const status = String(record.status || "");
          const isPresent = /^p$|present/i.test(status);
          const isLate = /^l$|late/i.test(status);
          bookmarkedDetails.push({
            id: uniqueId,
            title: record.date,
            subtitle: course.title,
            badge: isPresent ? "Present" : isLate ? "Late" : "Absent",
            badgeClass: isPresent
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : isLate
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-300",
            courseId: course.id,
          });
        }
      });
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="View bookmarks"
        title="View Bookmarks"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/55 text-[#230052] shadow-sm backdrop-blur-xl transition-colors hover:bg-white/80 dark:border-white/10 dark:bg-black/25 dark:text-white dark:hover:bg-white/10"
      >
        <Bookmark size={20} fill={bookmarkedDetails.length > 0 ? "currentColor" : "none"} />
      </button>
      <BookmarksModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        items={bookmarkedDetails}
        emptyHint="Bookmark an attendance session to find it here."
        onSelect={(item) => onNavigate(item.courseId)}
      />
    </>
  );
};

function AttendancePage() {
  const now = useCurrentTime();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [recordFilter, setRecordFilter] = useState("all");
  const [alerts, setAlerts] = useState([]);
  const teacherAssignments = useTeacherStore((state) => state.selections);
  const [reviewRequest, setReviewRequest] = useState(null);
  const [markedRecords, setMarkedRecords] = useState(new Set<string>());
  const [markedRecordsLoaded, setMarkedRecordsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const loadMarkedAttendance = async () => {
      setMarkedRecordsLoaded(false);
      const items = await getMarkedAttendance();
      if (active) {
        setMarkedRecords(new Set(items));
        setMarkedRecordsLoaded(true);
      }
    };
    void loadMarkedAttendance();
    window.addEventListener("superflex-student-identity-changed", loadMarkedAttendance);
    return () => {
      active = false;
      window.removeEventListener("superflex-student-identity-changed", loadMarkedAttendance);
    };
  }, []);

  useEffect(() => {
    if (markedRecordsLoaded) setMarkedAttendance([...markedRecords]);
  }, [markedRecords, markedRecordsLoaded]);

  const [semesters, setSemesters] = useState([]);
  const hiddenFormRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void clearPendingUpdateType("attendance");
  }, []);

  useEffect(() => {
    const parseData = async () => {
      try {
        const root = findFlexPageRoot(document);
        if (!root) {
          setLoading(false);
          return;
        }

        const portalForm = findAttendanceForm(document);
        const parsed = parseAttendancePage(root, portalForm);
        setAlerts(parsed.alerts);
        setSemesters(parsed.semesters);
        if (portalForm && parsed.semesters.length && hiddenFormRef.current) {
          hiddenFormRef.current.innerHTML = "";
          hiddenFormRef.current.appendChild(portalForm.cloneNode(true));
        }

        setCourses(parsed.courses);
        if (parsed.courses.length > 0) setSelectedCourseId(parsed.courses[0].id);
        await checkAndRecordAttendanceSnapshot(parsed.courses, { suppressNotifications: true });
        await clearPendingUpdateType("attendance");

        root.style.display = "none";
        setLoading(false);
      } catch (e) {
        console.error("Attendance Parsing Error", e);
        setLoading(false);
      }
    };
    void parseData();
    return () => {};
  }, []);

  useAiSync({
    data: courses,
    dataKey: "attendance",
    syncKey: "attendance",
    isEnabled: courses && courses.length > 0,
  });

  const selectedCourseData = courses.find((c) => c.id === selectedCourseId);
  const getTeacherForCourse = (course) => {
    if (!course) return null;
    const courseCode = `${course.id} ${course.title}`
      .match(/[A-Z]{2,5}\s?-?\d{3,4}/i)?.[0]
      ?.replace(/\s|-/g, "")
      .toLowerCase();
    const direct = teacherAssignments[course.id];
    if (direct) return direct;
    return (
      Object.entries(teacherAssignments).find(([id]) => {
        const savedCode = id
          .match(/[A-Z]{2,5}\s?-?\d{3,4}/i)?.[0]
          ?.replace(/\s|-/g, "")
          .toLowerCase();
        return courseCode && savedCode === courseCode;
      })?.[1] || null
    );
  };
  const filteredRecords =
    selectedCourseData?.records.filter((record) => {
      if (recordFilter === "all") return true;
      if (recordFilter === "absent") return /^a$|absent/i.test(String(record.status || "").trim());
      const date = parseAcademicDate(record.date);
      if (!date) return false;
      const today = new Date(now);
      today.setHours(23, 59, 59, 999);
      if (recordFilter === "week") {
        const weekStart = new Date(today);
        weekStart.setHours(0, 0, 0, 0);
        weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
        return date >= weekStart && date <= today;
      }
      if (recordFilter === "month") {
        const monthStart = new Date(today);
        monthStart.setDate(monthStart.getDate() - 29);
        monthStart.setHours(0, 0, 0, 0);
        return date >= monthStart && date <= today;
      }
      return true;
    }) || [];

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1600px] flex-col gap-3 sm:gap-4">
        <header className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end sm:gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-white/90 sm:text-[10px] sm:font-bold sm:tracking-[0.16em] sm:text-white/80">
              Academics
            </p>
            <h1 className="text-[30px] font-extrabold leading-[1.08] tracking-[-0.035em] text-white sm:text-3xl sm:font-bold sm:tracking-tight">
              Attendance
            </h1>
            <p className="text-xs text-white/85 sm:text-sm">
              80% or RIP? Dekh le bhai, aur kitni classes bunk kar sakta hai.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {semesters.length > 1 && (
              <SuperTabs
                tabs={semesters}
                activeTab={semesters.find((semester) => semester.selected)?.value}
                size="sm"
                className="!border-0 !bg-white/55 !backdrop-blur-xl dark:!bg-black/25 dark:!backdrop-blur-xl"
                onTabChange={(value) => {
                  const select = hiddenFormRef.current?.querySelector<HTMLSelectElement>("select");
                  if (!select) return;
                  select.value = value;
                  hiddenFormRef.current?.querySelector<HTMLFormElement>("form")?.submit();
                }}
              />
            )}
            <BookmarksMenu
              markedRecords={markedRecords}
              courses={courses}
              onNavigate={setSelectedCourseId}
            />
            <div ref={hiddenFormRef} className="hidden" />
          </div>
        </header>

        {loading ? (
          <PageSkeleton label="Loading attendance" cards={5} rows={6} showHeader={false} />
        ) : courses.length > 0 ? (
          <>
            <AttendanceCourseTabs
              courses={courses}
              selectedId={selectedCourseId}
              onSelect={setSelectedCourseId}
            />
            {selectedCourseData &&
              (() => {
                const creditHours =
                  selectedCourseData.creditHours ||
                  (/\blab\b/i.test(`${selectedCourseData.title} ${selectedCourseData.id}`)
                    ? 1
                    : /\b(?:pak(?:istan)?\s*studies|islamic\s*(?:studies|ethics)|islamiat|ethics|quranic|ideology|constitution)\b/i.test(
                          `${selectedCourseData.title} ${selectedCourseData.id}`,
                        )
                      ? 2
                      : 3);
                const allowedAbsents =
                  selectedCourseData.allowedAbsents ||
                  (creditHours === 3 ? 6 : creditHours <= 2 ? 3 : 6);
                const absentsTaken = selectedCourseData.absent || 0;
                const absentsRemaining = allowedAbsents - absentsTaken;

                return (
                  <div key={selectedCourseId} className="flex min-h-0 flex-1 flex-col gap-3 sm:gap-4">
                    <div className="sf-mobile-cards-scroll pb-1 scrollbar-hide sm:grid sm:grid-cols-3 sm:gap-3 sm:pb-0 xl:grid-cols-6">
                      <AttendanceMetric
                        icon={Percent}
                        label="Attendance"
                        value={`${selectedCourseData.percentage}%`}
                        subValue="Overall attendance"
                      />
                      <AttendanceMetric
                        icon={CheckCircle2}
                        label="Present"
                        value={selectedCourseData.present}
                        subValue="Classes attended"
                        tone="text-emerald-700 dark:text-emerald-300"
                      />
                      <AttendanceMetric
                        icon={Clock}
                        label="Late"
                        value={selectedCourseData.late}
                        subValue="Late arrivals"
                        tone="text-amber-700 dark:text-amber-300"
                      />
                      <AttendanceMetric
                        icon={XCircle}
                        label="Absent"
                        value={`${absentsTaken} / ${allowedAbsents}`}
                        subValue={
                          absentsRemaining > 0
                            ? `${absentsRemaining} allowed left (${creditHours} Cr)`
                            : absentsRemaining === 0
                              ? `Limit reached! (${creditHours} Cr)`
                              : `${Math.abs(absentsRemaining)} over limit! (${creditHours} Cr)`
                        }
                        tone={
                          absentsRemaining < 0
                            ? "text-rose-600 font-extrabold dark:text-rose-400"
                            : absentsRemaining === 0
                              ? "text-amber-600 font-bold dark:text-amber-400"
                              : "text-rose-700 dark:text-rose-300"
                        }
                      />
                      <AttendanceMetric
                        icon={absentsRemaining <= 1 ? AlertTriangle : ShieldCheck}
                        label="Allowed Left"
                        value={Math.max(0, absentsRemaining)}
                        subValue={`${creditHours} Cr course (${allowedAbsents} allowed)`}
                        tone={
                          absentsRemaining <= 0
                            ? "text-rose-600 font-extrabold dark:text-rose-400"
                            : absentsRemaining <= 1
                              ? "text-amber-600 font-bold dark:text-amber-400"
                              : "text-emerald-700 dark:text-emerald-300"
                        }
                      />
                      <AttendanceMetric
                        icon={Calendar}
                        label="Sessions"
                        value={selectedCourseData.records.length}
                        subValue="Total sessions"
                      />
                    </div>

                    {}
                    {absentsRemaining <= 1 && (
                      <div
                        className={`flex items-center gap-3.5 rounded-[20px] border p-3.5 sm:p-4 text-xs font-semibold shadow-sm transition-all bg-white dark:bg-black ${
                          absentsRemaining < 0
                            ? "border-rose-500/30 text-rose-700 dark:border-rose-500/40 dark:text-rose-300"
                            : absentsRemaining === 0
                              ? "border-amber-500/30 text-amber-800 dark:border-amber-500/40 dark:text-amber-300"
                              : "border-amber-500/25 text-amber-800 dark:border-amber-500/30 dark:text-amber-300"
                        }`}
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            absentsRemaining < 0
                              ? "bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300"
                              : "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300"
                          }`}
                        >
                          <AlertTriangle size={18} />
                        </div>
                        <div className="min-w-0 flex-1 leading-relaxed">
                          {absentsRemaining < 0 ? (
                            <span>
                              <strong className="font-bold">Debarment Risk:</strong> You have missed{" "}
                              {absentsTaken} sessions out of {allowedAbsents} allowed ({creditHours}{" "}
                              Cr). You are {Math.abs(absentsRemaining)} absence
                              {Math.abs(absentsRemaining) === 1 ? "" : "s"} over the limit and risk
                              an F grade for short attendance!
                            </span>
                          ) : absentsRemaining === 0 ? (
                            <span>
                              <strong className="font-bold">Attendance Warning:</strong> You have
                              reached your absent limit ({allowedAbsents} of {allowedAbsents} for{" "}
                              {creditHours} Cr). Any further absence will lead to debarment!
                            </span>
                          ) : (
                            <span>
                              <strong className="font-bold">Caution:</strong> Only 1 allowed absence
                              remaining for this {creditHours} Cr course ({absentsTaken} of{" "}
                              {allowedAbsents} taken).
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="-mb-1 flex w-full min-w-0 items-center justify-between gap-2">
                      <div className="flex w-full min-w-0 items-center gap-2">
                        <h2
                          className="min-w-0 flex-1 truncate text-base font-bold tracking-tight text-white sm:text-lg"
                          title={selectedCourseData.title}
                        >
                          {selectedCourseData.title}
                        </h2>
                        <span className="shrink-0 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md dark:bg-white/15">
                          {creditHours} Cr Hr
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-md ${
                            absentsRemaining < 0
                              ? "bg-rose-500/25 text-rose-100 dark:bg-rose-500/30 dark:text-rose-200"
                              : absentsRemaining === 0
                                ? "bg-amber-500/25 text-amber-100 dark:bg-amber-500/30 dark:text-amber-200"
                                : "bg-emerald-500/25 text-emerald-100 dark:bg-emerald-500/30 dark:text-emerald-200"
                          }`}
                        >
                          {absentsRemaining > 0
                            ? `${absentsRemaining} of ${allowedAbsents} absents left`
                            : absentsRemaining === 0
                              ? `0 of ${allowedAbsents} left`
                              : `Exceeded by ${Math.abs(absentsRemaining)}!`}
                        </span>
                      </div>
                    </div>
                    <section className="flex min-h-[240px] flex-1 flex-col overflow-hidden rounded-[22px] border border-black/[0.05] bg-white p-4 text-[#101027] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:rounded-[24px] sm:p-5">
                      <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <p className="text-[11px] text-[#626262] dark:text-[#9ca3b3]">
                          Showing {filteredRecords.length} of {selectedCourseData.records.length}{" "}
                          sessions
                        </p>
                        <div className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-white/55 p-1 scrollbar-hide dark:bg-black/25">
                          {[
                            ["all", "All"],
                            ["week", "This week"],
                            ["month", "30 days"],
                            ["absent", "Absences"],
                          ].map(([filter, label]) => (
                            <button
                              key={filter}
                              type="button"
                              onClick={() => setRecordFilter(filter)}
                              aria-pressed={recordFilter === filter}
                              className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold transition-colors ${recordFilter === filter ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]" : "text-foreground/55 hover:bg-white/70 dark:hover:bg-white/10"}`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="max-h-[calc(100dvh-390px)] min-h-[180px] flex-1 overflow-y-auto rounded-2xl bg-transparent px-2">
                        {filteredRecords.map((record) => {
                          const originalIndex = selectedCourseData.records.indexOf(record);
                          const recordId = `${selectedCourseId}-${originalIndex}`;
                          return (
                            <AttendanceCard
                              key={recordId}
                              record={record}
                              index={originalIndex + 1}
                              isMarked={markedRecords.has(recordId)}
                              onRequestReview={() =>
                                setReviewRequest({
                                  course: selectedCourseData,
                                  record,
                                  teacher: getTeacherForCourse(selectedCourseData),
                                })
                              }
                              onToggleMark={() =>
                                setMarkedRecords((previous) => {
                                  const next = new Set(previous);
                                  if (next.has(recordId)) next.delete(recordId);
                                  else next.add(recordId);
                                  return next;
                                })
                              }
                            />
                          );
                        })}
                        {filteredRecords.length === 0 && (
                          <div className="flex h-full min-h-[180px] flex-col items-center justify-center text-center text-sm text-foreground/50">
                            <BookOpen size={24} className="mb-2 text-foreground/35" />
                            <p>
                              {selectedCourseData.records.length
                                ? "No sessions match this filter."
                                : "No attendance sessions are available for this course."}
                            </p>
                            {selectedCourseData.records.length > 0 && recordFilter !== "all" && (
                              <button
                                type="button"
                                onClick={() => setRecordFilter("all")}
                                className="mt-2 font-semibold text-[#230052] hover:underline dark:text-white"
                              >
                                Show all sessions
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                );
              })()}
          </>
        ) : (
          <section className="flex min-h-[300px] flex-1 flex-col items-center justify-center rounded-[24px] border border-black/[0.06] bg-white px-6 py-10 text-center dark:border-white/[0.14] dark:bg-black">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]">
              <BookOpen size={24} />
            </span>
            <h2 className="text-xl font-bold text-[#101010] dark:text-[#f5f6fb]">
              No Attendance Records Found
            </h2>
            <p className="mt-2 max-w-lg text-sm text-[#626262] dark:text-[#c4cad6]">
              {alerts[0]?.message || "Sir hasn't uploaded anything yet. Suspense continues."}
            </p>
            {semesters.length > 1 && (
              <div className="mt-5">
                <SuperTabs
                  tabs={semesters}
                  activeTab={semesters.find((semester) => semester.selected)?.value}
                  size="sm"
                  className="!border-0 !bg-white/55 !backdrop-blur-xl dark:!bg-black/25 dark:!backdrop-blur-xl"
                  onTabChange={(value) => {
                    const select =
                      hiddenFormRef.current?.querySelector<HTMLSelectElement>("select");
                    if (!select) return;
                    select.value = value;
                    hiddenFormRef.current?.querySelector<HTMLFormElement>("form")?.submit();
                  }}
                />
              </div>
            )}
            <div ref={hiddenFormRef} className="hidden" />
            {alerts.length > 1 && (
              <div className="mt-4 w-full max-w-2xl">
                <NotificationBanner alerts={alerts.slice(1)} />
              </div>
            )}
          </section>
        )}
      </div>
      <AttendanceReviewModal
        open={Boolean(reviewRequest)}
        course={reviewRequest?.course}
        record={reviewRequest?.record}
        teacher={reviewRequest?.teacher}
        onClose={() => setReviewRequest(null)}
      />
    </PageLayout>
  );
}

export default AttendancePage;
