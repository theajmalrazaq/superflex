import React, { useEffect, useState, useRef } from "react";

import LoadingOverlay, {
  LoadingSpinner,
} from "../components/ui/LoadingOverlay";
import PageLayout from "../components/layouts/PageLayout";
import { CheckCircle2, XCircle, Calendar, Clock, BookOpen, BarChart2, ChevronDown, Bookmark } from "lucide-react";
import NotificationBanner from "../components/ui/NotificationBanner";
import PageHeader from "../components/ui/PageHeader";
import StatsCard from "../components/ui/StatsCard";
import SuperTabs from "../components/ui/SuperTabs";

const CourseSelector = ({ courses, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedCourse = courses.find((c) => c.id === selectedId) || courses[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full md:w-auto z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:w-[350px] flex items-center justify-between px-3 py-2 rounded-[2rem] bg-zinc-900/50 border border-white/5 text-white hover:bg-white/5 transition-all group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 rounded-xl bg-x/10 text-x">
            <BookOpen size={16} />
          </div>
          <div className="flex flex-col items-start truncate">
            <span className="text-sm font-bold truncate w-full text-left leading-none">
              {selectedCourse?.title}
            </span>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-black/50 backdrop-blur-2xl border border-white/10  max-h-[60vh] overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col gap-3">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => {
                  onSelect(course.id);
                  setIsOpen(false);
                }}
                className={`w-full flex bg-zinc-900 items-center justify-between p-3 rounded-xl transition-all ${
                  selectedId === course.id
                    ? "bg-x/10 border border-x/20"
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 text-left overflow-hidden">
                  <span
                    className={`text-sm font-medium truncate ${selectedId === course.id ? "text-white" : "text-zinc-400"}`}
                  >
                    {course.title}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    course.percentage >= 75
                      ? "bg-emerald-500/20 text-emerald-400"
                      : course.percentage >= 60
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {course.percentage.toFixed(0)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
const AttendanceCard = ({ record, index, isMarked, onToggleMark }) => {
  const isPresent = record.status.includes("P");
  return (
    <div
      onClick={onToggleMark}
      className={`group cursor-pointer flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
        isMarked
          ? "bg-x/10 border-x/50"
          : "bg-zinc-900/30 border-transparent hover:bg-zinc-900/50 hover:border-white/5"
      }`}
    >
      <div className="flex items-center gap-4">
        <span
          className={`font-bold text-sm min-w-[1.5rem] ${isMarked ? "text-x" : "text-zinc-600"}`}
        >
          {index}.
        </span>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            isPresent
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          {isPresent ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-sm">
              {record.date}
            </span>
            <span className="text-zinc-500 text-xs px-2 py-0.5 rounded-full bg-white/5">
              {record.day}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock size={12} /> {record.time || "N/A"}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={12} /> {record.type || "Lecture"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
            isPresent
              ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
              : "bg-rose-500/5 text-rose-400 border-rose-500/10"
          }`}
        >
          {isPresent ? "Present" : "Absent"}
        </div>
        <div
          className={`p-2 rounded-full shrink-0 transition-all duration-300 border ${
            isMarked
              ? "text-x bg-x/10 border-x/30"
              : "text-zinc-700 bg-zinc-900/50 border-white/5 group-hover:text-zinc-500 hover:bg-white/10"
          }`}
        >
          <Bookmark size={18} fill={isMarked ? "currentColor" : "none"} />
        </div>
      </div>
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
            ? "bg-x/20 text-x border-x/20"
            : "bg-zinc-900/50 text-zinc-400 border-white/5 hover:text-white hover:bg-white/10"
        }`}
        title="View Bookmarks"
      >
        <Bookmark
          size={20}
          fill={bookmarkedDetails.length > 0 ? "currentColor" : "none"}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-[#111] backdrop-blur-xl border border-white/10 rounded-2xl  overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
              Bookmarked Items
            </h3>
          </div>

          <div className="max-h-[60vh] overflow-y-auto scrollbar-hide p-2 space-y-1">
            {bookmarkedDetails.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                <p>No bookmarks yet.</p>
                <p className="text-xs mt-1 opacity-50">
                  Click the bookmark icon on any attendance record to save it
                  here.
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
                  className="w-full text-left p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-bold text-sm text-white group-hover:text-x transition-colors truncate w-full pr-2">
                      {item.date}
                    </div>
                    <span
                      className={`text-xs font-bold whitespace-nowrap ${
                        (item.status || "").includes("P")
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {(item.status || "").includes("P") ? "Present" : "Absent"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                    <span className="truncate max-w-[200px]">
                      {item.courseTitle}
                    </span>
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
  const [alerts, setAlerts] = useState([]);
  const [markedRecords, setMarkedRecords] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("superflex_marked_attendance");
      return new Set(saved ? JSON.parse(saved) : []);
    }
    return new Set();
  });

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("superflex-update-loading", { detail: true }),
    );
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "superflex_marked_attendance",
      JSON.stringify([...markedRecords]),
    );
  }, [markedRecords]);

  const [semesters, setSemesters] = useState([]);
  const hiddenFormRef = useRef(null);

  useEffect(() => {
    const parseData = () => {
      try {
        const root = document.querySelector(
          ".m-grid.m-grid--hor.m-grid--root.m-page",
        );
        if (!root) return;

        const parsedAlerts = [];
        const alertNodes = root.querySelectorAll(".alert");
        alertNodes.forEach((alertEl) => {
          const textEl = alertEl.querySelector(".m-alert__text");
          let message = textEl
            ? textEl.textContent.trim()
            : alertEl.textContent.replace("Close", "").trim();
          message = message.replace(/\s+/g, " ");

          const type = alertEl.classList.contains("alert-danger")
            ? "error"
            : "info";
          parsedAlerts.push({ type, message });
        });
        setAlerts(parsedAlerts);

        const legacyForm = document.querySelector(
          'form[action="/Student/StudentAttendance"]',
        );
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
          const percentage = prog
            ? parseFloat(prog.getAttribute("aria-valuenow") || 0)
            : 0;

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
                  if (!isNaN(d))
                    day = d.toLocaleDateString("en-US", { weekday: "short" });
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
            absent: records.filter((r) => r.status.includes("A")).length,
          });
        });

        setCourses(parsedCourses);
        if (parsedCourses.length > 0) setSelectedCourseId(parsedCourses[0].id);

        root.style.display = "none";
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
        setLoading(false);
      } catch (e) {
        console.error("Attendance Parsing Error", e);
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
        setLoading(false);
      }
    };
    parseData();
    return () => {};
  }, []);

  const selectedCourseData = courses.find((c) => c.id === selectedCourseId);

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="w-full min-h-screen p-4 md:p-8 space-y-8">
        {}
        <PageHeader
          title="Attendance"
          subtitle="Track your presence and schedule"
        >
          <div className="flex flex-col lg:flex-row md:items-center gap-4">
            <SuperTabs
              tabs={semesters}
              activeTab={semesters.find((s) => s.selected)?.value}
              onTabChange={(value) => {
                if (hiddenFormRef.current) {
                  const select = hiddenFormRef.current.querySelector("select");
                  if (select) {
                    select.value = value;
                    const form = hiddenFormRef.current.querySelector("form");
                    if (form) form.submit();
                  }
                }
              }}
            />
            <div className="flex items-center gap-4">
              {courses.length > 0 && (
                <CourseSelector
                  courses={courses}
                  selectedId={selectedCourseId}
                  onSelect={setSelectedCourseId}
                />
              )}
              <BookmarksMenu
                markedRecords={markedRecords}
                courses={courses}
                onNavigate={(courseId) => setSelectedCourseId(courseId)}
              />
              <div ref={hiddenFormRef} className="hidden"></div>
            </div>
          </div>
        </PageHeader>

        {loading ? (
          <LoadingSpinner />
        ) : courses.length > 0 ? (
          <>
            {}
            {selectedCourseData && (
              <div key={selectedCourseId} className="space-y-16">
                {}
                <div className="flex flex-wrap gap-4">
                  <StatsCard
                    icon={BarChart2}
                    label="Percentage"
                    value={`${selectedCourseData.percentage}%`}
                    delay={100}
                  />
                  <StatsCard
                    icon={CheckCircle2}
                    label="Present"
                    value={selectedCourseData.present}
                    delay={200}
                  />
                  <StatsCard
                    icon={XCircle}
                    label="Absent"
                    value={selectedCourseData.absent}
                    delay={300}
                  />
                  <StatsCard
                    icon={Calendar}
                    label="Total Classes"
                    value={selectedCourseData.records.length}
                    delay={400}
                  />
                </div>

                {}
                <div className="bg-zinc-900/30 rounded-[2rem] p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">
                      History Log
                    </h3>
                    <div className="px-3 py-1 rounded-lg bg-white/5 text-xs text-zinc-400 font-medium">
                      Session History
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedCourseData.records.map((record, idx) => {
                      const recordId = `${selectedCourseId}-${idx}`;
                      return (
                        <AttendanceCard
                          key={idx}
                          record={record}
                          index={idx + 1}
                          isMarked={markedRecords.has(recordId)}
                          onToggleMark={() => {
                            const newSet = new Set(markedRecords);
                            if (newSet.has(recordId)) newSet.delete(recordId);
                            else newSet.add(recordId);
                            setMarkedRecords(newSet);
                          }}
                        />
                      );
                    })}
                  </div>

                  {selectedCourseData.records.length === 0 && (
                    <div className="text-center py-12 text-zinc-500">
                      No attendance records found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            className={`flex flex-col gap-4 py-12 justify-center mx-auto ${
              alerts.some((a) => a.message.toLowerCase().includes("no record"))
                ? "w-full"
                : "max-w-2xl"
            }`}
          >
            {alerts.length > 0 ? (
              <NotificationBanner
                alerts={alerts.filter((alert) => {
                  const hasNoRecord = alerts.some((a) =>
                    a.message.toLowerCase().includes("no record"),
                  );
                  if (
                    hasNoRecord &&
                    alert.message.includes("Attendance Update")
                  )
                    return false;
                  return true;
                })}
              />
            ) : (
              <div className="flex flex-col items-center justify-center opacity-50 py-12">
                <div className="p-4 rounded-full bg-zinc-900 mb-4 ring-1 ring-white/10">
                  <BookOpen size={32} className="text-zinc-600" />
                </div>
                <div className="text-xl font-bold text-zinc-500">
                  No attendance data found
                </div>
                <p className="text-sm text-zinc-600 mt-2">
                  Try selecting a different semester
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default AttendancePage;
