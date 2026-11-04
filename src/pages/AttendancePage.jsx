import React, { useEffect, useState, useRef } from "react";

import { LoadingSpinner } from "../components/ui/LoadingOverlay";
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
} from "lucide-react";
import NotificationBanner from "../components/ui/NotificationBanner";
import SuperTabs from "../components/ui/SuperTabs";
import AttendanceReviewModal from "../components/AttendanceReviewModal";

const parseSessionDate = (value) => {
  const input = String(value || "").trim();
  const iso = input.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const monthFirst = input.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (monthFirst) return new Date(Number(monthFirst[3]), Number(monthFirst[1]) - 1, Number(monthFirst[2]));
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const AttendanceCourseTabs = ({ courses, selectedId, onSelect }) => (
  <div className="inline-flex w-fit max-w-full gap-2 overflow-x-auto rounded-full border-0 bg-white/55 p-1.5 shadow-sm shadow-black/[0.03] backdrop-blur-xl scrollbar-hide dark:bg-black/25 dark:shadow-none" aria-label="Select course">
    {courses.map((course) => (
      <button
        key={course.id}
        type="button"
        onClick={() => onSelect(course.id)}
        aria-pressed={selectedId === course.id}
        title={course.title}
        className={`flex min-w-[116px] shrink-0 items-center justify-between gap-3 rounded-full px-4 py-2.5 text-xs font-bold transition-colors ${selectedId === course.id ? "bg-[#230052] text-white dark:bg-[#a098ff] dark:text-[#0a192f]" : "text-slate-600 hover:bg-white/80 hover:text-[#230052] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"}`}
      >
        <span className="truncate">{course.title.match(/[A-Z]{2,5}\s?-?\d{3,4}/i)?.[0] || course.id}</span>
        <span className="shrink-0 text-[10px] opacity-70">{course.percentage.toFixed(0)}%</span>
      </button>
    ))}
  </div>
);

const AttendanceMetric = ({ icon: Icon, label, value, tone = "text-[#230052] dark:text-[#a098ff]" }) => (
  <div className="flex min-h-[88px] min-w-0 items-center gap-3 rounded-[22px] border border-black/[0.06] bg-white px-5 py-4 text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb]">
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-[#a098ff] dark:text-[#0a192f]"><Icon size={19} /></span>
    <div className="min-w-0">
      <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-[#626262] dark:text-[#c4cad6]">{label}</p>
      <p className={`mt-0.5 truncate text-xl font-bold leading-none ${tone}`}>{value}</p>
    </div>
  </div>
);

const AttendanceCard = ({ record, index, isMarked, onToggleMark, onRequestReview }) => {
  const status = String(record.status || "").trim();
  const isPresent = /^p$|present/i.test(status);
  const isLate = /^l$|late/i.test(status);
  const isAbsent = !isPresent && !isLate;
  const stateLabel = isPresent ? "Present" : isLate ? "Late" : "Absent";
  const stateColor = isPresent ? "text-emerald-700 bg-emerald-500/10 dark:text-emerald-300" : isLate ? "text-amber-700 bg-amber-500/10 dark:text-amber-300" : "text-rose-700 bg-rose-500/10 dark:text-rose-300";
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-black/[0.05] px-3 py-2.5 last:border-b-0 dark:border-white/[0.08]">
      <span className="w-6 text-center text-[10px] font-semibold text-foreground/35">{index}</span>
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">{record.date}</span>
          <span className="shrink-0 text-[10px] text-foreground/45">{record.day}</span>
        </div>
        <div className="mt-0.5 flex min-w-0 items-center gap-3 text-[10px] text-foreground/50">
          <span className="flex shrink-0 items-center gap-1"><Clock size={11} />{record.time || "N/A"}</span>
          <span className="truncate">{record.type || "Lecture"}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${stateColor}`}>{stateLabel}</span>
        {isAbsent && <button type="button" onClick={onRequestReview} aria-label={`Request attendance review for ${record.date}`} title="Draft an email to request an attendance review" className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/45 hover:bg-[#230052]/10 hover:text-[#230052] dark:hover:bg-[#a098ff]/15 dark:hover:text-[#a098ff]"><Mail size={15} /></button>}
      </div>
      <button
        type="button"
        onClick={onToggleMark}
        aria-label={isMarked ? `Remove bookmark for ${record.date}` : `Bookmark ${record.date}`}
        title={isMarked ? "Remove bookmark" : "Bookmark session"}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isMarked ? "bg-[#230052] text-white dark:bg-[#a098ff] dark:text-[#0a192f]" : "text-foreground/40 hover:bg-black/5 hover:text-[#230052] dark:hover:bg-white/10 dark:hover:text-[#a098ff]"}`}
      >
        <Bookmark size={15} fill={isMarked ? "currentColor" : "none"} />
      </button>
    </div>
  );
};

const BookmarksMenu = ({ markedRecords, courses, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const bookmarkedDetails = [];
  if (markedRecords.size > 0 && courses.length > 0) {
    courses.forEach((course) => {
      course.records.forEach((record, idx) => {
        const uniqueId = `${course.id}-${idx}`;
        if (markedRecords.has(uniqueId)) {
          bookmarkedDetails.push({
            uniqueId,
            courseTitle: course.title,
            date: record.date,
            status: record.status,
            courseId: course.id,
            idx: idx,
          });
        }
      });
    });
  }

  return (
    <div className="relative z-30" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full border transition-all ${
          isOpen
            ? "bg-accent/20 text-accent border-accent/20"
            : "bg-secondary/50 text-foreground/60 border-foreground/10 hover:text-foreground hover:bg-foreground/10"
        }`}
        title="View Bookmarks"
      >
        <Bookmark size={20} fill={bookmarkedDetails.length > 0 ? "currentColor" : "none"} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-background/95 backdrop-blur-xl border border-foreground/10 rounded-2xl  overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-foreground/10 bg-foreground/5 flex justify-between items-center">
            <h3 className="font-bold text-foreground flex items-center gap-2">Bookmarked Items</h3>
          </div>

          <div className="max-h-[60vh] overflow-y-auto scrollbar-hide p-2 space-y-1">
            {bookmarkedDetails.length === 0 ? (
              <div className="p-8 text-center text-foreground/50 text-sm">
                <p>No bookmarks yet.</p>
                <p className="text-xs mt-1 opacity-50">
                  Click the bookmark icon on any attendance record to save it here.
                </p>
              </div>
            ) : (
              bookmarkedDetails.map((item) => (
                <button
                  key={item.uniqueId}
                  onClick={() => {
                    onNavigate(item.courseId);
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-foreground/5 border border-transparent hover:border-foreground/10 transition-all group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-bold text-sm text-foreground group-hover:text-accent transition-colors truncate w-full pr-2">
                      {item.date}
                    </div>
                    <span
                      className={`text-xs font-bold whitespace-nowrap ${
                        (item.status || "").includes("P")
                          ? "text-emerald-600 dark:text-emerald-400"
                          : (item.status || "").includes("L")
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {(item.status || "").includes("P")
                        ? "Present"
                        : (item.status || "").includes("L")
                          ? "Late"
                          : "Absent"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-foreground/50 font-medium Cap">
                    <span className="truncate max-w-[200px]">{item.courseTitle}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [recordFilter, setRecordFilter] = useState("all");
  const [alerts, setAlerts] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState(() => {
    try { return JSON.parse(localStorage.getItem("superflex_course_teachers_v1") || "{}"); }
    catch { return {}; }
  });
  const [reviewRequest, setReviewRequest] = useState(null);
  const [markedRecords, setMarkedRecords] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("superflex_marked_attendance");
      return new Set(saved ? JSON.parse(saved) : []);
    }
    return new Set();
  });

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: true }));
  }, []);

  useEffect(() => {
    localStorage.setItem("superflex_marked_attendance", JSON.stringify([...markedRecords]));
  }, [markedRecords]);

  useEffect(() => {
    const syncTeachers = (event) => setTeacherAssignments(event.detail || {});
    window.addEventListener("superflex-teachers-updated", syncTeachers);
    return () => window.removeEventListener("superflex-teachers-updated", syncTeachers);
  }, []);

  const [semesters, setSemesters] = useState([]);
  const hiddenFormRef = useRef(null);

  useEffect(() => {
    const parseData = () => {
      try {
        const root = document.querySelector(".m-grid.m-grid--hor.m-grid--root.m-page");
        if (!root) {
          setLoading(false);
          window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: false }));
          return;
        }

        const parsedAlerts = [];
        const alertNodes = root.querySelectorAll(".alert");
        alertNodes.forEach((alertEl) => {
          const textEl = alertEl.querySelector(".m-alert__text");
          let message = textEl
            ? textEl.textContent.trim()
            : alertEl.textContent.replace("Close", "").trim();
          message = message.replace(/\s+/g, " ");

          const type = alertEl.classList.contains("alert-danger") ? "error" : "info";
          parsedAlerts.push({ type, message });
        });
        setAlerts(parsedAlerts);

        const legacyForm = document.querySelector('form[action="/Student/StudentAttendance"]');
        if (legacyForm) {
          const select = legacyForm.querySelector("select");
          if (select) {
            const opts = Array.from(select.options).map((o) => ({
              label: o.text.trim(),
              value: o.value,
              selected: o.selected,
            }));
            setSemesters(opts);

            if (hiddenFormRef.current) {
              hiddenFormRef.current.innerHTML = "";
              const formClone = legacyForm.cloneNode(true);
              hiddenFormRef.current.appendChild(formClone);
            }
          }
        }

        const parsedCourses = [];
        const tabPanes = root.querySelectorAll(".tab-pane");

        tabPanes.forEach((pane) => {
          let title = pane.querySelector("h5")?.textContent.trim() || pane.id;

          title = title.replace(/\(.*\)/, "").trim();

          const prog = pane.querySelector(".progress-bar");
          const percentage = prog ? parseFloat(prog.getAttribute("aria-valuenow") || 0) : 0;

          const records = [];
          const rows = pane.querySelectorAll("tbody tr");

          rows.forEach((row) => {
            const cols = row.querySelectorAll("td");
            if (cols.length >= 4) {
              const dateStr = cols[1]?.textContent.trim();

              let day = "";
              try {
                const parts = dateStr.split("-");
                if (parts.length === 3) {
                  const d = new Date(`${parts[1]} ${parts[0]}, ${parts[2]}`);
                  if (!isNaN(d)) day = d.toLocaleDateString("en-US", { weekday: "short" });
                }
              } catch (e) {}

              records.push({
                date: dateStr,
                day: day,
                time: cols[2]?.textContent.trim(),
                status: cols[3]?.textContent.trim(),
                type: cols[4]?.textContent.trim() || "Lecture",
              });
            }
          });

          parsedCourses.push({
            id: pane.id,
            title,
            percentage,
            records,
            present: records.filter((r) => r.status.includes("P")).length,
            late: records.filter((r) => r.status.includes("L")).length,
            absent: records.filter((r) => r.status.includes("A")).length,
          });
        });

        setCourses(parsedCourses);
        if (parsedCourses.length > 0) setSelectedCourseId(parsedCourses[0].id);

        root.style.display = "none";
        window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: false }));
        setLoading(false);
      } catch (e) {
        console.error("Attendance Parsing Error", e);
        window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: false }));
        setLoading(false);
      }
    };
    parseData();
    return () => {};
  }, []);

  const selectedCourseData = courses.find((c) => c.id === selectedCourseId);
  const getTeacherForCourse = (course) => {
    if (!course) return null;
    const courseCode = `${course.id} ${course.title}`.match(/[A-Z]{2,5}\s?-?\d{3,4}/i)?.[0]?.replace(/\s|-/g, "").toLowerCase();
    const direct = teacherAssignments[course.id];
    if (direct) return direct;
    return Object.entries(teacherAssignments).find(([id]) => {
      const savedCode = id.match(/[A-Z]{2,5}\s?-?\d{3,4}/i)?.[0]?.replace(/\s|-/g, "").toLowerCase();
      return courseCode && savedCode === courseCode;
    })?.[1] || null;
  };
  const filteredRecords = selectedCourseData?.records.filter((record) => {
    if (recordFilter === "all") return true;
    if (recordFilter === "absent") return /^a$|absent/i.test(String(record.status || "").trim());
    const date = parseSessionDate(record.date);
    if (!date) return false;
    const today = new Date();
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
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1600px] flex-col gap-4">
        <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#230052]/70 dark:text-[#a098ff]">Academics</p>
            <h1 className="text-3xl font-bold tracking-tight text-[#101010] dark:text-[#f5f6fb]">Attendance</h1>
            <p className="text-sm text-[#626262] dark:text-[#c4cad6]">A quick view of your class presence and session history.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {semesters.length > 1 && (
              <SuperTabs
                tabs={semesters}
                activeTab={semesters.find((semester) => semester.selected)?.value}
                size="sm"
                className="!border-0 !bg-white/55 !backdrop-blur-xl dark:!bg-black/25 dark:!backdrop-blur-xl"
                onTabChange={(value) => {
                  const select = hiddenFormRef.current?.querySelector("select");
                  if (!select) return;
                  select.value = value;
                  hiddenFormRef.current?.querySelector("form")?.submit();
                }}
              />
            )}
            <BookmarksMenu markedRecords={markedRecords} courses={courses} onNavigate={setSelectedCourseId} />
            <div ref={hiddenFormRef} className="hidden" />
          </div>
        </header>

        {loading ? (
          <div className="flex flex-1 items-center justify-center"><LoadingSpinner /></div>
        ) : courses.length > 0 ? (
          <>
            <AttendanceCourseTabs courses={courses} selectedId={selectedCourseId} onSelect={setSelectedCourseId} />
            {selectedCourseData && (
              <div key={selectedCourseId} className="flex min-h-0 flex-1 flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                  <AttendanceMetric icon={Percent} label="Attendance" value={`${selectedCourseData.percentage}%`} />
                  <AttendanceMetric icon={CheckCircle2} label="Present" value={selectedCourseData.present} tone="text-emerald-700 dark:text-emerald-300" />
                  <AttendanceMetric icon={Clock} label="Late" value={selectedCourseData.late} tone="text-amber-700 dark:text-amber-300" />
                  <AttendanceMetric icon={XCircle} label="Absent" value={selectedCourseData.absent} tone="text-rose-700 dark:text-rose-300" />
                  <AttendanceMetric icon={Calendar} label="Sessions" value={selectedCourseData.records.length} />
                </div>

                <div className="-mb-1">
                  <h2 className="text-lg font-bold tracking-tight text-[#101010] dark:text-[#f5f6fb]">{selectedCourseData.title}</h2>
                  <p className="mt-0.5 text-[11px] text-[#626262] dark:text-[#9ca3b3]">Class session history</p>
                </div>
                <section className="flex min-h-[240px] flex-1 flex-col overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-4 text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:p-5">
                  <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <p className="text-[11px] text-[#626262] dark:text-[#9ca3b3]">Showing {filteredRecords.length} of {selectedCourseData.records.length} sessions</p>
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
                          className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold transition-colors ${recordFilter === filter ? "bg-[#230052] text-white dark:bg-[#a098ff] dark:text-[#0a192f]" : "text-foreground/55 hover:bg-white/70 dark:hover:bg-white/10"}`}
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
                          onRequestReview={() => setReviewRequest({
                            course: selectedCourseData,
                            record,
                            teacher: getTeacherForCourse(selectedCourseData),
                          })}
                          onToggleMark={() => setMarkedRecords((previous) => {
                            const next = new Set(previous);
                            if (next.has(recordId)) next.delete(recordId);
                            else next.add(recordId);
                            return next;
                          })}
                        />
                      );
                    })}
                    {filteredRecords.length === 0 && (
                      <div className="flex h-full min-h-[180px] flex-col items-center justify-center text-center text-sm text-foreground/50">
                        <BookOpen size={24} className="mb-2 text-foreground/35" />
                        <p>{selectedCourseData.records.length ? "No sessions match this filter." : "No attendance sessions are available for this course."}</p>
                        {selectedCourseData.records.length > 0 && recordFilter !== "all" && <button type="button" onClick={() => setRecordFilter("all")} className="mt-2 font-semibold text-[#230052] hover:underline dark:text-[#a098ff]">Show all sessions</button>}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}
          </>
        ) : (
          <section className="flex min-h-[300px] flex-1 flex-col items-center justify-center rounded-[24px] border border-black/[0.06] bg-white px-6 py-10 text-center dark:border-white/[0.14] dark:bg-black">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-[#a098ff] dark:text-[#0a192f]"><BookOpen size={24} /></span>
            <h2 className="text-xl font-bold text-[#101010] dark:text-[#f5f6fb]">No attendance data available</h2>
            <p className="mt-2 max-w-lg text-sm text-[#626262] dark:text-[#c4cad6]">{alerts[0]?.message || "Attendance records will appear here when they are available."}</p>
            {semesters.length > 1 && <div className="mt-5"><SuperTabs tabs={semesters} activeTab={semesters.find((semester) => semester.selected)?.value} size="sm" className="!border-0 !bg-white/55 !backdrop-blur-xl dark:!bg-black/25 dark:!backdrop-blur-xl" onTabChange={(value) => {
              const select = hiddenFormRef.current?.querySelector("select");
              if (!select) return;
              select.value = value;
              hiddenFormRef.current?.querySelector("form")?.submit();
            }} /></div>}
            <div ref={hiddenFormRef} className="hidden" />
            {alerts.length > 1 && <div className="mt-4 w-full max-w-2xl"><NotificationBanner alerts={alerts.slice(1)} /></div>}
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
