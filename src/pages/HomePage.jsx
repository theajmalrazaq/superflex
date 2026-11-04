import React, { useEffect, useState, useMemo } from "react";
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
  ArrowRight,
} from "lucide-react";
import NotificationBanner from "../components/ui/NotificationBanner";
import StatsCard from "../components/ui/StatsCard";
import Skeleton, { MarksSkeleton, AttendanceSkeleton } from "../components/ui/Skeleton";

const TEACHER_SELECTIONS_KEY = "superflex_course_teachers_v1";
const TEACHER_COURSES_KEY = "superflex_cached_courses_v1";
const STUDENT_ROLL_NUMBER_KEY = "superflex_student_roll_number_v1";
const readTeacherSelections = () => {
  try { return JSON.parse(localStorage.getItem(TEACHER_SELECTIONS_KEY) || "{}"); }
  catch { return {}; }
};

const parseAttendanceDate = (value) => {
  const text = String(value || "").trim();
  const dayFirst = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (dayFirst) {
    return new Date(+dayFirst[3], +dayFirst[2] - 1, +dayFirst[1]).getTime();
  }
  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const SectionAccordion = ({ section, isOpen, onToggle }) => {
  const rows = section.rows || [];
  return (
    <div className="mb-3 overflow-hidden rounded-[18px] border border-black/[0.06] bg-[#fafafa] dark:border-white/[0.1] dark:bg-white/[0.04]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 bg-transparent px-4 py-3.5 text-left transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.04]"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${isOpen ? "bg-[#dfc8fc] text-[#230052] dark:bg-[#a098ff] dark:text-[#0a192f]" : "bg-white text-slate-500 dark:bg-white/10 dark:text-slate-300"}`}
          >
            {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </span>
          <span className="truncate text-sm font-semibold text-foreground">{section.title}</span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-foreground/50">
            {rows.length}
          </span>
        </div>
        <div className="shrink-0 text-xs font-medium text-foreground/60">
          <span className="text-foreground">{section.obtained.toFixed(1)}</span>
          <span className="text-foreground/40"> / {section.weight.toFixed(1)}</span>
        </div>
      </button>
      {isOpen && (
        <div className="border-t border-foreground/10">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-foreground/[0.02]">
                <th className="w-16 border-b border-foreground/10 p-3 text-[11px] font-bold text-foreground/50">Assessment</th>
                <th className="border-b border-foreground/10 p-3 text-right text-[11px] font-bold text-foreground/50">Score</th>
                <th className="w-24 border-b border-foreground/10 p-3 text-right text-[11px] font-bold text-foreground/50">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {rows.map((row, index) => {
                const percentage = row.total > 0 ? (row.obtained / row.total) * 100 : 0;
                return (
                  <tr key={index} className={`transition-colors hover:bg-foreground/[0.02] ${row.included ? "" : "opacity-40"}`}>
                    <td className="p-3 text-sm font-medium text-foreground/70">{row.title}</td>
                    <td className="p-3 text-right text-sm font-bold text-foreground">
                      {row.obtained} <span className="text-xs font-normal text-foreground/40">/ {row.total}</span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${percentage >= 80 ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500" : percentage >= 60 ? "border-amber-500/20 bg-amber-500/10 text-amber-500" : "border-rose-500/20 bg-rose-500/10 text-rose-500"}`}>
                        {percentage.toFixed(0)}%
                      </span>
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

const AttendanceHeatmap = ({ subjects }) => (
  <div className="flex-1 space-y-4 overflow-hidden" aria-label="Attendance by subject">
    <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-foreground/50">
      <span>Each square represents one class session</span>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[3px] bg-[#230052] dark:bg-[#a098ff]" /> Present</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-[3px] bg-rose-500" /> Absent</span>
      </div>
    </div>
    <div className="grid max-h-[390px] grid-cols-2 gap-x-4 gap-y-5 overflow-y-auto pr-1 md:grid-cols-3 xl:grid-cols-5">
      {subjects.map((subject, index) => {
        const records = [...(subject.records || [])].sort((a, b) => parseAttendanceDate(a.date) - parseAttendanceDate(b.date));
        return (
          <div key={`${subject.title}-${index}`} className="flex min-w-0 flex-col items-start py-1">
            <div className="mb-2 flex max-h-[180px] min-w-0 flex-col flex-wrap content-start gap-1 overflow-hidden py-1" role="list" aria-label={`${subject.title} class sessions`}>
              {records.map((record, recordIndex) => {
                const status = String(record.status || "").trim();
                const color = /\bp\b|present/i.test(status) ? "bg-[#230052] dark:bg-[#a098ff]" : /\ba\b|absent/i.test(status) ? "bg-rose-500" : "bg-slate-200 dark:bg-white/15";
                return <span key={`${record.date}-${recordIndex}`} role="listitem" title={`${record.date} · ${status || "Unknown"} · ${record.type || "Class"}`} aria-label={`${record.date}: ${status || "Unknown attendance status"}`} className={`h-3.5 w-3.5 shrink-0 rounded-[3px] ${color}`} />;
              })}
            </div>
            <p className="w-full truncate text-xs font-semibold text-foreground" title={subject.title}>{subject.title}</p>
            <p className="mt-0.5 text-[10px] text-foreground/50">{subject.percentage.toFixed(0)}% · {subject.present}P / {subject.absent}A</p>
          </div>
        );
      })}
    </div>
  </div>
);

function HomePage() {
  const [universityInfo, setUniversityInfo] = useState(null);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [profileSections, setProfileSections] = useState([]);
  const [activeMainTab, setActiveMainTab] = useState("stats");
  const [alerts, setAlerts] = useState([]);
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("superflex_user_custom_image") || "/Login/GetImage",
  );

  useEffect(() => {
    const handleStorage = () => {
      setProfileImage(localStorage.getItem("superflex_user_custom_image") || "/Login/GetImage");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const [attendanceData, setAttendanceData] = useState(null);
  const [coursesData, setCoursesData] = useState([]);
  const [teacherSelections, setTeacherSelections] = useState(readTeacherSelections);
  const [activeCourse, setActiveCourse] = useState(null);
  const [openCategoryIdx, setOpenCategoryIdx] = useState(null);

  const [links, setLinks] = useState({});

  const [loadingMarks, setLoadingMarks] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [studyPlanData, setStudyPlanData] = useState(null);

  const activeCourseData = useMemo(
    () => coursesData.find((course) => course.id === activeCourse),
    [coursesData, activeCourse],
  );
  const rollNumber = universityInfo?.["Roll No"] || "";

  useEffect(() => {
    if (!rollNumber) return;
    localStorage.setItem(STUDENT_ROLL_NUMBER_KEY, rollNumber);
    if (!coursesData.length) return;
    localStorage.setItem(TEACHER_COURSES_KEY, JSON.stringify(coursesData.map(({ id, title }) => ({ id, title }))));
    window.setTimeout(() => window.dispatchEvent(new CustomEvent("superflex-teacher-course-data", {
      detail: { nextCourses: coursesData.map(({ id, title }) => ({ id, title })), nextRollNumber: rollNumber },
    })), 0);
  }, [coursesData, rollNumber]);

  useEffect(() => {
    const syncTeacherSelections = (event) => {
      setTeacherSelections(event.detail || readTeacherSelections());
    };
    window.addEventListener("superflex-teachers-updated", syncTeacherSelections);
    return () => window.removeEventListener("superflex-teachers-updated", syncTeacherSelections);
  }, []);

  const mostAbsentSubject = useMemo(() => {
    if (!attendanceData?.length) return null;
    return attendanceData.reduce((previous, current) =>
      previous.absent > current.absent ? previous : current,
    );
  }, [attendanceData]);

  const greetingMessage = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  useEffect(() => {
    setOpenCategoryIdx(null);
  }, [activeCourse]);

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

    const targetElement = document.querySelector(".m-grid.m-grid--hor.m-grid--root.m-page");
    if (targetElement) {
      targetElement.querySelectorAll("script").forEach((script) => script.remove());
      targetElement.querySelector("#NotificationDetail")?.remove();
      document.querySelector(".m-scroll-top")?.remove();

      document.querySelector(".m-scroll-top")?.remove();

      const alertList = [];
      targetElement.querySelectorAll(".m-alert, .alert").forEach((alert) => {
        if (
          alert.style.display === "none" ||
          alert.id === "DataErrormsgdiv" ||
          alert.closest(".modal")
        )
          return;

        const textContainer = alert.querySelector(".m-alert__text") || alert;
        const clone = textContainer.cloneNode(true);

        clone
          .querySelectorAll(".m-alert__close, button, a, strong, .m-alert__icon")
          .forEach((el) => el.remove());

        let message = clone.textContent
          .replace(/Alert!/gi, "")
          .replace(/Close/gi, "")
          .replace(/&nbsp;/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        if (message && message.length > 3) {
          const type =
            alert.classList.contains("alert-danger") ||
            alert.classList.contains("m-alert--outline-danger")
              ? "error"
              : "info";
          alertList.push({ type, message });
        }
      });
      setAlerts(alertList);

      let uniInfo = {};
      let personalData = {};
      const allSections = [];

      const rows = targetElement.querySelectorAll(".row");
      rows.forEach((row) => {
        const portletTitle = row.querySelector(".m-portlet__head-text")?.textContent.trim();

        if (portletTitle) {
          const sectionData = {};
          row.querySelectorAll(".col-md-4 p").forEach((p) => {
            const label = p.querySelector(".m--font-boldest")?.textContent.trim().replace(":", "");
            const value = p.querySelector("span:not(.m--font-boldest)")?.textContent.trim();
            if (label && value) sectionData[label] = value;
          });

          if (Object.keys(sectionData).length > 0) {
            allSections.push({ title: portletTitle, data: sectionData });

            if (portletTitle === "University Information") uniInfo = sectionData;
            if (portletTitle === "Personal Information") personalData = sectionData;
          }
        }
      });

      setProfileSections(allSections);
      setUniversityInfo(uniInfo);
      setPersonalInfo(personalData);

      targetElement.remove();
    }

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const profileData = useMemo(() => {
    if (!personalInfo || !personalInfo["Name"]) return null;
    return {
      studentName: personalInfo["Name"],
      universityInfo: universityInfo,
      profileSections: profileSections,
    };
  }, [personalInfo, universityInfo, profileSections]);

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
    const linkMap = {};
    foundLinks.forEach((l) => {
      if (l.text.includes("Attendance")) linkMap.attendance = l.href;
      if (l.text.includes("Marks") && !l.text.includes("PLO")) linkMap.marks = l.href;
      if (l.text.includes("Study Plan")) linkMap.studyPlan = l.href;
    });
    setLinks(linkMap);
  };

  useEffect(() => {
    if (links.attendance) {
      setLoadingAttendance(true);
      fetchAttendance(links.attendance).finally(() => setLoadingAttendance(false));
    }
    if (links.marks) {
      setLoadingMarks(true);
      fetchMarks(links.marks).finally(() => setLoadingMarks(false));
    }
    if (links.studyPlan) {
      fetchStudyPlan(links.studyPlan);
    }
  }, [links]);

  const fetchAttendance = async (url) => {
    try {
      const res = await fetch(url);
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const summaryData = [];
      const tables = doc.querySelectorAll(".table.table-bordered.table-responsive");

      tables.forEach((table) => {
        const tabPane = table.closest(".tab-pane");
        let title = tabPane?.querySelector("h5")?.textContent.trim() || "Course";
        const titleParts = title.split("-");
        if (titleParts.length > 1) {
          const rawTitle = titleParts.slice(1).join("-").trim();
          title = rawTitle.replace(/\(.*\)/, "").trim();
        }
        const rows = table.querySelectorAll("tbody tr");
        let present = 0,
          absent = 0;
        const records = [];
        rows.forEach((r) => {
          const cols = r.querySelectorAll("td");
          if (cols.length >= 4) {
            records.push({
              date: cols[1]?.textContent.trim(),
              time: cols[2]?.textContent.trim(),
              status: cols[3]?.textContent.trim(),
              type: cols[4]?.textContent.trim() || "Lecture",
            });
          }
          const marker = r.querySelector("td:nth-child(4)")?.textContent.trim();
          if (marker?.includes("P")) present++;
          if (marker?.includes("A")) absent++;
        });

        let percentage = 0;
        const progress = tabPane?.querySelector(".progress-bar");
        if (progress) {
          percentage = parseFloat(progress.getAttribute("aria-valuenow") || 0);
        }

        summaryData.push({
          title,
          present,
          absent,
          total: rows.length,
          percentage,
          records,
        });
      });
      setAttendanceData(summaryData);
    } catch (e) {
      console.error("Attendance fetch error", e);
    }
  };

  const fetchMarks = async (url) => {
    try {
      const res = await fetch(url);
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const parsedCourses = [];

      const tabPanes = doc.querySelectorAll(".tab-pane");

      tabPanes.forEach((pane) => {
        const courseId = pane.id;
        let courseTitle = pane.querySelector("h5")?.textContent.trim() || courseId;
        const titleParts = courseTitle.split("-");
        if (titleParts.length > 1) {
          const rawTitle = titleParts.slice(1).join("-").trim();
          courseTitle = rawTitle.replace(/\(.*\)/, "").trim();
        }

        const sections = [];

        const cards = pane.querySelectorAll(".card");
        cards.forEach((card) => {
          const header = card.querySelector(".card-header button")?.textContent.trim();
          if (!header || header.includes("Grand Total")) return;

          const rows = [];
          const cardRows = card.querySelectorAll("tbody tr");
          cardRows.forEach((tr) => {
            if (tr.classList.contains("totalColumn_1471") || tr.querySelector(".totalColweightage"))
              return;

            const tds = tr.querySelectorAll("td");
            if (tds.length < 4) return;

            const name = tds[0]?.textContent.trim();
            const weight = parseFloat(tds[1]?.textContent.trim() || "0");
            const obtainedStr = tds[2]?.textContent.trim();
            const totalStr = tds[3]?.textContent.trim();
            const avg = parseFloat(tds[4]?.textContent.trim() || "0");
            const stdDev = parseFloat(tds[5]?.textContent.trim() || "0");
            const min = parseFloat(tds[6]?.textContent.trim() || "0");
            const max = parseFloat(tds[7]?.textContent.trim() || "0");

            if (name === "Total" || name === "Grand Total") return;

            if (obtainedStr && obtainedStr !== "-" && obtainedStr !== "") {
              const obtained = parseFloat(obtainedStr);
              const total = parseFloat(totalStr);

              if (!isNaN(obtained)) {
                rows.push({
                  title: name,
                  weight,
                  obtained,
                  total: isNaN(total) ? 0 : total,
                  avg,
                  stdDev,
                  min,
                  max,
                  included: true,
                });
              }
            }
          });

          const footerRow =
            card.querySelector("tfoot tr") || card.querySelector("tr[class*='totalColumn']");
          let categoryWeight = 0;
          if (footerRow) {
            categoryWeight = parseFloat(
              footerRow.querySelector(".totalColweightage")?.textContent || "0",
            );
          }

          if (rows.length > 0) {
            sections.push({
              id: `${courseId}-${header.replace(/\s+/g, "_")}`,
              title: header,
              weight: categoryWeight || rows.reduce((acc, r) => acc + r.weight, 0),
              rows: rows,
            });
          }
        });

        const processedCourse = processCourseMarks({
          id: courseId,
          title: courseTitle,
          sections: sections,
        });

        parsedCourses.push(processedCourse);
      });

      setCoursesData(parsedCourses);
      if (parsedCourses.length) setActiveCourse(parsedCourses[0].id);
    } catch (e) {
      console.error("Marks fetch error", e);
    }
  };

  const fetchStudyPlan = async (url) => {
    try {
      const res = await fetch(url);
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const parsedSemesters = [];
      const semesterCols = doc.querySelectorAll(".col-md-6");

      semesterCols.forEach((col) => {
        const h4 = col.querySelector("h4");
        if (!h4) return;

        const title = h4.textContent
          .replace(h4.querySelector("small")?.textContent || "", "")
          .trim();
        const crHrsText = h4.querySelector("small")?.textContent || "";
        const crHrs = parseInt(crHrsText.match(/\d+/)?.[0] || "0");

        const courses = [];
        const table = col.querySelector("table");
        if (table) {
          table.querySelectorAll("tbody tr").forEach((tr) => {
            const cells = tr.querySelectorAll("td");
            if (cells.length >= 4) {
              courses.push({
                code: cells[0].textContent.trim(),
                title: cells[1].textContent.trim(),
                crHrs: parseInt(cells[2].textContent.trim()),
                type: cells[3].textContent.trim(),
              });
            }
          });
        }
        parsedSemesters.push({ title, crHrs, courses });
      });
      setStudyPlanData(parsedSemesters);
    } catch (e) {
      console.error("Study Plan fetch error", e);
    }
  };

  return (
    <PageLayout
      currentPage={window.location.pathname}
      onLinksFound={handleLinksFound}
      fullWidth={true}
    >
      <div className="relative">
        <div className="relative z-10 mx-auto w-full max-w-[1680px] space-y-7 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-4">
              <img
                src={profileImage}
                alt=""
                className="h-12 w-12 shrink-0 rounded-full border-2 border-white/80 bg-white object-cover sm:h-14 sm:w-14"
                onError={(event) => {
                  event.currentTarget.src = chrome.runtime.getURL("assets/favicon.png");
                }}
              />
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#230052]/75 dark:text-[#c4cad6]">
                  Student dashboard
                </p>
                <h1 className="truncate text-[28px] font-bold leading-tight tracking-[-0.045em] text-[#101010] dark:text-[#f5f6fb] sm:text-4xl">
                  {greetingMessage}, {personalInfo?.Name?.split(" ")[0] || "Student"}
                </h1>
                <p className="mt-1 text-sm text-[#40404a]/75 dark:text-[#c4cad6]">
                  Your academic snapshot at a glance.
                </p>
              </div>
            </div>

            <div className="flex w-fit items-center gap-1 rounded-full border border-white/60 bg-white/45 p-1 backdrop-blur-md dark:border-white/10 dark:bg-black/35">
              <button
                type="button"
                onClick={() => setActiveMainTab("stats")}
                className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-colors sm:px-5 sm:text-sm ${
                  activeMainTab === "stats"
                    ? "bg-[#230052] text-white dark:bg-[#a098ff] dark:text-[#0a192f]"
                    : "text-slate-600 hover:text-[#230052] dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                <Activity size={16} />
                Overview
              </button>
              <button
                type="button"
                onClick={() => setActiveMainTab("info")}
                className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-colors sm:px-5 sm:text-sm ${
                  activeMainTab === "info"
                    ? "bg-[#230052] text-white dark:bg-[#a098ff] dark:text-[#0a192f]"
                    : "text-slate-600 hover:text-[#230052] dark:text-slate-300 dark:hover:text-white"
                }`}
              >
                <User size={16} />
                Profile
              </button>
            </div>
          </header>

          <NotificationBanner alerts={alerts} />

          {}
          {activeMainTab === "stats" && (
            <div className="space-y-7">
              <section aria-labelledby="overview-heading" className="space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#230052]/65 dark:text-[#a098ff]">
                      Overview
                    </p>
                    <h2
                      id="overview-heading"
                      className="text-xl font-bold tracking-tight text-[#101010] dark:text-[#f5f6fb]"
                    >
                      Academic snapshot
                    </h2>
                  </div>
                  <p className="text-xs text-[#626262] dark:text-[#9ca3b3]">
                    Live metrics from your marks and attendance records.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
                  <StatsCard variant="dashboard" icon={GraduationCap} iconTone="plum" label="Degree Program" value={universityInfo?.Degree || "..."} delay={0} />
                  <StatsCard variant="dashboard" icon={Users} iconTone="lavender" label="Section" value={universityInfo?.Section || "..."} delay={100} />
                  <StatsCard variant="dashboard" icon={Award} iconTone="neutral" label="Registered Courses" value={coursesData.length || 0} delay={200} />
                  <StatsCard
                    variant="dashboard"
                    icon={Activity}
                    iconTone="lavender"
                    label="Critical Attendance"
                    value={loadingAttendance ? <Skeleton className="my-1 h-6 w-24" /> : mostAbsentSubject?.title || "None"}
                    subValue={loadingAttendance ? <Skeleton className="h-3 w-16" /> : mostAbsentSubject ? `${mostAbsentSubject.absent} Absents` : ""}
                    delay={300}
                  />
                </div>
              </section>

              <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 xl:gap-8">
                <div className="flex h-full flex-col gap-6 overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-5 text-slate-900 shadow-none dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:p-7 xl:p-8">
                  <div className="flex min-h-[52px] flex-col items-start justify-between gap-4 sm:flex-row">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-[#a098ff] dark:text-[#0a192f]"><Award size={22} /></span>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold tracking-tight text-foreground">Course Performance</h3>
                        <p className="text-xs text-foreground/50">Detailed marks and assessments</p>
                      </div>
                    </div>
                    {links.marks && <a href={links.marks} className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#230052] px-4 text-xs font-bold text-white transition-colors hover:bg-[#370c72] dark:bg-[#a098ff] dark:text-[#0a192f] dark:hover:bg-[#b7b0ff]">View Details <ArrowRight size={12} /></a>}
                  </div>
                  {loadingMarks ? <MarksSkeleton /> : coursesData.length ? (
                    <>
                      <div className="w-full overflow-x-auto scrollbar-hide">
                        <div className="flex w-fit gap-1 rounded-full bg-slate-100 p-1 dark:bg-white/[0.08]">
                          {coursesData.map((course) => <button key={course.id} type="button" onClick={() => setActiveCourse(course.id)} className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold transition-all ${activeCourse === course.id ? "bg-[#230052] text-white dark:bg-[#a098ff] dark:text-[#0a192f]" : "text-slate-600 hover:text-[#230052] dark:text-slate-300 dark:hover:text-white"}`}>{course.id}</button>)}
                        </div>
                      </div>
                      {activeCourseData && (
                        <div key={activeCourse}>
                          <div className="mb-4 flex flex-col gap-2">
                            <h2 className="text-xl font-bold leading-tight text-foreground">{activeCourseData.title}</h2>
                            {teacherSelections[activeCourseData.id] && <div className="flex items-center gap-2 text-xs text-foreground/60">
                              {teacherSelections[activeCourseData.id].image ? <img src={teacherSelections[activeCourseData.id].image} alt="" className="h-6 w-6 rounded-full object-cover" /> : <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#230052]/10 text-[9px] font-bold text-[#230052] dark:bg-[#a098ff]/15 dark:text-[#a098ff]">{teacherSelections[activeCourseData.id].name.slice(0, 1)}</span>}
                              <span>Instructor: <span className="font-semibold text-foreground">{teacherSelections[activeCourseData.id].name}</span></span>
                            </div>}
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-foreground/60">{activeCourseData.id}</span>
                              <span className="text-xs text-foreground/50">{activeCourseData.sections.filter((section) => !section.id.endsWith("Grand_Total_Marks")).reduce((sum, section) => sum + (section.rows?.length || 0), 0)} Assessments</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            {activeCourseData.sections.filter((section) => !section.id.endsWith("Grand_Total_Marks")).map((section, index) => <SectionAccordion key={index} section={section} isOpen={openCategoryIdx === index} onToggle={() => setOpenCategoryIdx(openCategoryIdx === index ? null : index)} />)}
                          </div>
                        </div>
                      )}
                    </>
                  ) : <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-3xl bg-foreground/5 p-6"><Award size={40} className="text-foreground/40" /></div>
                    <h4 className="text-lg font-bold text-foreground/60">No Performance Data</h4>
                    <p className="mt-1 text-xs text-foreground/40">Course marks haven't been uploaded yet.</p>
                  </div>}
                </div>

                <div className="flex h-full flex-col gap-6 rounded-[24px] border border-black/[0.06] bg-white p-5 text-slate-900 shadow-none dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:p-7 xl:p-8">
                  <div className="flex min-h-[52px] items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-[#a098ff] dark:text-[#0a192f]"><Activity size={22} /></span>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold tracking-tight text-foreground">Attendance Overview</h3>
                        <p className="text-xs text-foreground/50">Presence and absence analytics</p>
                      </div>
                    </div>
                    {links.attendance && <a href={links.attendance} className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#230052] px-4 text-xs font-bold text-white transition-colors hover:bg-[#370c72] dark:bg-[#a098ff] dark:text-[#0a192f] dark:hover:bg-[#b7b0ff]">View Details <ArrowRight size={12} /></a>}
                  </div>
                  {loadingAttendance ? <AttendanceSkeleton /> : attendanceData?.length ? <AttendanceHeatmap subjects={attendanceData} /> : <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-3xl bg-foreground/5 p-6"><Activity size={40} className="text-foreground/40" /></div>
                    <h4 className="text-lg font-bold text-foreground/60">No Attendance Data</h4>
                    <p className="mt-1 text-xs text-foreground/40">Attendance records are currently unavailable.</p>
                  </div>}
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
      <div className="rounded-[24px] border border-black/[0.06] bg-white p-8 text-center text-sm text-slate-500 dark:border-white/[0.14] dark:bg-black dark:text-slate-400">
        Profile information is not available yet.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {profileSections.map((section, idx) => (
        <div
          key={idx}
          className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-6 text-slate-900 shadow-none dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:p-8"
        >
          {}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-[#a098ff] dark:text-[#0a192f]">
              {(() => {
                const title = section.title.toLowerCase();
                if (title.includes("personal")) return <User size={24} />;
                if (title.includes("university")) return <Building size={24} />;
                if (title.includes("guardian") || title.includes("family"))
                  return <Users size={24} />;
                return <Activity size={24} />;
              })()}
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">{section.title}</h3>
          </div>

          {}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Object.entries(section.data).map(([key, val], i) => (
              <div
                key={i}
                className="flex min-h-[84px] flex-col justify-center rounded-[20px] bg-[#f6f6f8] p-4 transition-colors hover:bg-[#eeeeF2] dark:bg-black dark:hover:bg-black"
              >
                <span className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-[#230052]/70 dark:text-[#a098ff]">
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
