import React, { useEffect, useState, useMemo } from "react";
import PageLayout from "../components/layouts/PageLayout";
import LoadingOverlay, { LoadingSpinner } from "../components/ui/LoadingOverlay";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Bar } from "react-chartjs-2";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
);

const CategoryAccordion = ({ category, isOpen, onToggle }) => {
  return (
    <div className=" rounded-xl overflow-hidden bg-zinc-900/50 backdrop-blur-sm mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span
            className={`p-1.5 rounded-lg ${isOpen ? "bg-[#a098ff]/20 text-[#a098ff]" : "bg-zinc-800 text-zinc-500"}`}
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
          <span className="font-semibold text-white text-sm">
            {category.name}
          </span>
          <span className="text-xs text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded ">
            {category.assessments.length}
          </span>
        </div>
        <div className="text-xs text-zinc-400 font-medium">
          <span className="text-white">
            {category.assessments
              .reduce((acc, curr) => acc + curr.obtained, 0)
              .toFixed(1)}
          </span>
          <span className="text-zinc-600">
            {" "}
            /{" "}
            {category.assessments
              .reduce((acc, curr) => acc + curr.total, 0)
              .toFixed(1)}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="p-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider border-b border-white/5 w-16">
                  No.
                </th>
                <th className="p-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider border-b border-white/5 text-right">
                  Marks
                </th>
                <th className="p-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider border-b border-white/5 text-right w-24">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {category.assessments.map((asm, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="p-3 text-sm text-zinc-300 font-medium">
                    {asm.name}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-white font-bold">
                        {asm.obtained}{" "}
                        <span className="text-zinc-600 font-normal text-xs">
                          / {asm.total}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                        asm.percentage >= 80
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : asm.percentage >= 60
                            ? "bg-[#a098ff]/10 text-[#a098ff] border-[#a098ff]/20"
                            : asm.percentage >= 40
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {asm.percentage.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

function HomePage() {
  const [universityInfo, setUniversityInfo] = useState(null);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [profileSections, setProfileSections] = useState([]);
  const [activeMainTab, setActiveMainTab] = useState("stats");
  const [alerts, setAlerts] = useState([]);

  const [attendanceData, setAttendanceData] = useState(null);
  const [currentAggregate, setCurrentAggregate] = useState({
    obtained: 0,
    total: 0,
    percentage: 0,
  });
  const [coursesData, setCoursesData] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [openCategoryIdx, setOpenCategoryIdx] = useState(null);

  const [links, setLinks] = useState({});
  const [chartPattern, setChartPattern] = useState(null);

  const [loadingMarks, setLoadingMarks] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 10;
    canvas.height = 10;

    ctx.fillStyle = "rgba(255,255,255,0.02)";
    ctx.fillRect(0, 0, 10, 10);

    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(10, 0);
    ctx.stroke();

    setChartPattern(ctx.createPattern(canvas, "repeat"));
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


    const targetElement = document.querySelector(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
    );
    if (targetElement) {
      targetElement
        .querySelectorAll("script")
        .forEach((script) => script.remove());
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
          .querySelectorAll(
            ".m-alert__close, button, a, strong, .m-alert__icon",
          )
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
        const portletTitle = row
          .querySelector(".m-portlet__head-text")
          ?.textContent.trim();

        if (portletTitle) {
          const sectionData = {};
          row.querySelectorAll(".col-md-4 p").forEach((p) => {
            const label = p
              .querySelector(".m--font-boldest")
              ?.textContent.trim()
              .replace(":", "");
            const value = p
              .querySelector("span:not(.m--font-boldest)")
              ?.textContent.trim();
            if (label && value) sectionData[label] = value;
          });

          if (Object.keys(sectionData).length > 0) {
            allSections.push({ title: portletTitle, data: sectionData });

            if (portletTitle === "University Information")
              uniInfo = sectionData;
            if (portletTitle === "Personal Information")
              personalData = sectionData;
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

  const handleLinksFound = (foundLinks) => {
    const linkMap = {};
    foundLinks.forEach((l) => {
      if (l.text.includes("Attendance")) linkMap.attendance = l.href;
      if (l.text.includes("Marks") && !l.text.includes("PLO"))
        linkMap.marks = l.href;
    });
    setLinks(linkMap);
  };

  useEffect(() => {
    if (links.attendance) {
      setLoadingAttendance(true);
      fetchAttendance(links.attendance).finally(() =>
        setLoadingAttendance(false),
      );
    }
    if (links.marks) {
      setLoadingMarks(true);
      fetchMarks(links.marks).finally(() => setLoadingMarks(false));
    }
  }, [links]);

  const fetchAttendance = async (url) => {
    try {
      const res = await fetch(url);
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const summaryData = [];
      const tables = doc.querySelectorAll(
        ".table.table-bordered.table-responsive",
      );

      tables.forEach((table) => {
        const tabPane = table.closest(".tab-pane");
        let title =
          tabPane?.querySelector("h5")?.textContent.trim() || "Course";
        const titleParts = title.split("-");
        if (titleParts.length > 1) {
          const rawTitle = titleParts.slice(1).join("-").trim();
          title = rawTitle.replace(/\(.*\)/, "").trim();
        }
        const rows = table.querySelectorAll("tbody tr");
        let present = 0,
          absent = 0;
        rows.forEach((r) => {
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

      let semesterTotalObtained = 0;
      let semesterTotalWeight = 0;
      const parsedCourses = [];

      const tabPanes = doc.querySelectorAll(".tab-pane");

      tabPanes.forEach((pane) => {
        const courseId = pane.id;
        let courseTitle =
          pane.querySelector("h5")?.textContent.trim() || courseId;
        const titleParts = courseTitle.split("-");
        if (titleParts.length > 1) {
          const rawTitle = titleParts.slice(1).join("-").trim();
          courseTitle = rawTitle.replace(/\(.*\)/, "").trim();
        }

        let courseTotalObtained = 0;
        let courseTotalWeight = 0;
        const categories = [];

        const cards = pane.querySelectorAll(".card");
        cards.forEach((card) => {
          const header = card
            .querySelector(".card-header button")
            ?.textContent.trim();
          if (!header || header.includes("Grand Total")) return;

          const categoryAssessments = [];
          const rows = card.querySelectorAll("tbody tr");
          rows.forEach((tr) => {
            if (tr.classList.contains("totalColumn_1471")) return;

            const tds = tr.querySelectorAll("td");
            if (tds.length < 4) return;

            const name = tds[0]?.textContent.trim();
            const obtainedStr = tds[2]?.textContent.trim();
            const totalStr = tds[3]?.textContent.trim();

            if (name === "Total" || name === "Grand Total") return;

            if (obtainedStr && obtainedStr !== "-" && obtainedStr !== "") {
              const obtained = parseFloat(obtainedStr);
              const total = parseFloat(totalStr);

              if (!isNaN(obtained)) {
                categoryAssessments.push({
                  name: name,
                  obtained,
                  total: isNaN(total) ? 0 : total,
                  percentage:
                    total > 0 && !isNaN(total) ? (obtained / total) * 100 : 0,
                });
              }
            }
          });

          if (categoryAssessments.length > 0) {
            categories.push({
              name: header,
              assessments: categoryAssessments,
            });
          }
        });

        const calcRows = pane.querySelectorAll(".sum_table .calculationrow");
        calcRows.forEach((row) => {
          const weightText = row.querySelector(".weightage")?.textContent;
          const obtMarksText = row.querySelector(".ObtMarks")?.textContent;
          const w = parseFloat(weightText || "0");
          const o = parseFloat(obtMarksText || "0");
          if (!isNaN(w) && !isNaN(o)) {
            courseTotalObtained += o;
            courseTotalWeight += w;
          }
        });

        semesterTotalObtained += courseTotalObtained;
        semesterTotalWeight += courseTotalWeight;

        parsedCourses.push({
          id: courseId,
          title: courseTitle,
          categories: categories,
          obtained: courseTotalObtained,
          total: courseTotalWeight,
          percentage:
            courseTotalWeight > 0
              ? (courseTotalObtained / courseTotalWeight) * 100
              : 0,
        });
      });

      setCoursesData(parsedCourses);
      if (parsedCourses.length > 0) {
        setActiveCourse(parsedCourses[0].id);
      }

      const currentPerc =
        semesterTotalWeight > 0
          ? (semesterTotalObtained / semesterTotalWeight) * 100
          : 0;
      setCurrentAggregate({
        obtained: semesterTotalObtained,
        total: semesterTotalWeight,
        percentage: currentPerc,
      });

    } catch (e) {
      console.error("Marks fetch error", e);
    }
  };


  const activeCourseData = useMemo(() => {
    return coursesData.find((c) => c.id === activeCourse);
  }, [coursesData, activeCourse]);

  const mostAbsentSubject = useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) return null;
    return attendanceData.reduce((prev, current) =>
      prev.absent > current.absent ? prev : current,
    );
  }, [attendanceData]);

  return (
    <PageLayout
      currentPage={window.location.pathname}
      onLinksFound={handleLinksFound}
    >
      <div className="w-full px-4 md:px-6 py-6 md:py-8 space-y-8">
        {}
        {}
        <div className="relative rounded-[2rem] bg-black p-6 overflow-hidden group">
          {}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#a098ff]/5 blur-[80px] rounded-full pointer-events-none -mr-20 -mt-20 opacity-40"></div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            {}
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="flex flex-col gap-5">
                {}
                <div className="relative shrink-0">
                  <img
                    src="/Login/GetImage"
                    alt="Profile"
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover bg-zinc-800"
                    onError={(e) => {
                      e.target.src =
                        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect fill="%2318181b" width="128" height="128"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2352525b" font-weight="bold" font-size="40">Use</text></svg>';
                    }}
                  />
                </div>

                <div className="flex flex-col text-left space-y-0.5">
                  <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-none">
                    {useMemo(() => {
                      const greetings = [
                        "Hey Pookie,",
                        "Academic Comeback,",
                        "Yo Bestie,",
                        "No Cap,",
                        "Main Character,",
                        "Still Mid,",
                        "Wait, you're here?",
                        "Manifesting 4.0,",
                      ];
                      return greetings[Math.floor(Math.random() * greetings.length)];
                    }, [])}{" "}
                    <span className="text-[#a098ff]">
                      {personalInfo?.Name?.split(" ")[0] || "Student"}
                    </span>
                  </h1>
                  <p className="text-zinc-500 text-sm font-medium">
                    {useMemo(() => {
                      const roasts = [
                        "Nice to see you! (not really)",
                        "Your attendance is giving 'dropout'.",
                        "Is it giving 4.0 or 0.4?",
                        "Caught in 4k checking your grades.",
                        "Don't let them catch you lacking.",
                        "Real ones check SuperFlex every hour.",
                        "Go touch some grass after this.",
                        "Imagine having 8am classes in 2025.",
                        "Your aggregate is looking real quiet...",
                        "Academic comeback starts... never?",
                      ];
                      
                      // Contextual roasts
                      if (mostAbsentSubject && mostAbsentSubject.absent > 3) {
                        return `Bestie, ${mostAbsentSubject.absent} absents in ${mostAbsentSubject.title.split(' ')[0]}? You're cooked.`;
                      }
                      if (currentAggregate.percentage > 85) {
                        return "Okay nerd, we get it, you're smart.";
                      }
                      
                      return roasts[Math.floor(Math.random() * roasts.length)];
                    }, [mostAbsentSubject, currentAggregate])}
                  </p>
                </div>
              </div>
            </div>

            {}
            <div className="flex backdrop-blur-md p-1 rounded-full shrink-0 w-full md:w-auto gap-5 md:justify-end">
              <button
                onClick={() => setActiveMainTab("stats")}
                className={`px-5 py-2 border border-white/5  rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-300 ${
                  activeMainTab === "stats"
                    ? "bg-[#a098ff]/10 text-[#a098ff]"
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                }`}
              >
                <Activity size={16} className={""} />
                Stats
              </button>
              <button
                onClick={() => setActiveMainTab("info")}
                className={`px-5 py-2 border border-white/5  rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-300 ${
                  activeMainTab === "info"
                    ? "bg-[#a098ff]/10 text-[#a098ff]"
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                }`}
              >
                <User size={16} />
                Info
              </button>
            </div>
          </div>
        </div>

        <NotificationBanner alerts={alerts} />

        {}
        {activeMainTab === "stats" && (
          <div className="space-y-8">
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                icon={GraduationCap}
                label="Degree Program"
                value={universityInfo?.Degree || "..."}
                delay={0}
              />
              <StatsCard
                icon={Users}
                label="Section"
                value={universityInfo?.Section || "..."}
                delay={100}
              />
              <StatsCard
                icon={Award}
                label="Registered Courses"
                value={coursesData?.length || 0}
                delay={200}
              />
              <StatsCard
                icon={Activity}
                label="Critical Attendance"
                value={
                  loadingAttendance ? (
                    <Skeleton className="h-6 w-24 my-1" />
                  ) : mostAbsentSubject ? (
                    mostAbsentSubject.title
                  ) : (
                    "None"
                  )
                }
                subValue={
                  loadingAttendance ? (
                    <Skeleton className="h-3 w-16" />
                  ) : mostAbsentSubject ? (
                    `${mostAbsentSubject.absent} Absents`
                  ) : (
                    ""
                  )
                }
                delay={300}
              />
            </div>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {}
              {loadingMarks ? (
                <MarksSkeleton />
              ) : coursesData.length > 0 ? (
                <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 overflow-hidden flex flex-col gap-8 h-full">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        Course Performance
                      </h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        Detailed marks and assessments
                      </p>
                    </div>
                    {links.marks && (
                      <a
                        href={links.marks}
                        className="bg-white/5 hover:bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-lg  transition-colors flex items-center gap-1.5"
                      >
                        View Details
                        <ArrowRight size={12} />
                      </a>
                    )}
                  </div>

                  {}
                  <div className="w-full overflow-x-auto scrollbar-hide scrollbar-hide">
                    <div className="flex gap-2 bg-black/40 p-1.5 rounded-full border border-white/5 backdrop-blur-sm w-fit">
                      {coursesData.map((course) => (
                        <button
                          key={course.id}
                          onClick={() => setActiveCourse(course.id)}
                          className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                            activeCourse === course.id
                              ? "bg-[#a098ff] text-white"
                              : "text-zinc-500 hover:text-white"
                          }`}
                        >
                          {course.id}
                        </button>
                      ))}
                    </div>
                  </div>

                  {}
                  {activeCourseData && (
                    <div key={activeCourse} className="">
                      <div className="flex flex-col gap-2 mb-4">
                        <h2 className="text-xl font-bold text-white leading-tight">
                          {activeCourseData.title}
                        </h2>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-zinc-900  text-zinc-400 text-xs font-medium">
                            {activeCourseData.id}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {activeCourseData.categories.reduce(
                              (acc, cat) => acc + cat.assessments.length,
                              0,
                            )}{" "}
                            Assessments
                          </span>
                        </div>
                      </div>

                      {}
                      <div className="space-y-3">
                        {activeCourseData.categories.map((category, idx) => (
                          <CategoryAccordion
                            key={idx}
                            category={category}
                            isOpen={openCategoryIdx === idx}
                            onToggle={() =>
                              setOpenCategoryIdx(
                                openCategoryIdx === idx ? null : idx,
                              )
                            }
                          />
                        ))}
                        {activeCourseData.categories.length === 0 && (
                          <div className="p-8 text-center text-zinc-500 text-sm  rounded-xl bg-black">
                            No assessments uploaded yet.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-black rounded-3xl  p-6 flex items-center justify-center text-zinc-500 min-h-[300px]">
                  No marks data available
                </div>
              )}
              {loadingAttendance ? (
                <AttendanceSkeleton />
              ) : (
                <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        Attendance Overview
                      </h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        Presence and Absence Analytics
                      </p>
                    </div>
                    {links.attendance && (
                      <a
                        href={links.attendance}
                        className="bg-white/5 hover:bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-lg  transition-colors flex items-center gap-1.5"
                      >
                        View Details
                        <ArrowRight size={12} />
                      </a>
                    )}
                  </div>
                  <div className="flex-1 w-full overflow-hidden relative min-h-[400px]">
                    {attendanceData && chartPattern && (
                      <div
                        style={{
                          height: `${Math.max(400, attendanceData.length * 60)}px`,
                          width: "100%",
                        }}
                      >
                        <Bar
                          data={{
                            labels: attendanceData.map((d) => {
                              const t = d.title;
                              const trunc =
                                t.length > 15 ? t.substring(0, 15) + "..." : t;
                              return `${trunc} (P:${d.present} A:${d.absent})`;
                            }),
                            datasets: [
                              {
                                label: "Attended",
                                data: attendanceData.map((d) => d.percentage),
                                backgroundColor: attendanceData.map((d) => {
                                  if (d.percentage >= 75) return "#a098ff";
                                  if (d.percentage >= 60) return "#f59e0b";
                                  return "#f43f5e";
                                }),
                                barPercentage: 0.6,
                                categoryPercentage: 0.8,
                                borderRadius: { topLeft: 100, bottomLeft: 100 },
                                borderSkipped: false,
                              },
                              {
                                label: "Remaining",
                                data: attendanceData.map(
                                  (d) => 100 - d.percentage,
                                ),
                                backgroundColor: chartPattern,
                                barPercentage: 0.6,
                                categoryPercentage: 0.8,
                                borderRadius: {
                                  topRight: 100,
                                  bottomRight: 100,
                                },
                                borderSkipped: false,
                              },
                            ],
                          }}
                          options={{
                            indexAxis: "y",
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                callbacks: {
                                  label: (context) => {
                                    const idx = context.dataIndex;
                                    const item = attendanceData[idx];
                                    if (context.datasetIndex === 0) {
                                      return `Present: ${item.present} (${item.percentage.toFixed(1)}%)`;
                                    }
                                    return `Absent: ${item.absent}`;
                                  },
                                },
                              },
                            },
                            scales: {
                              x: {
                                stacked: true,
                                display: false,
                                max: 100,
                                grid: { display: false },
                              },
                              y: {
                                stacked: true,
                                grid: { display: false },
                                ticks: {
                                  color: "#a1a1aa",
                                  font: {
                                    size: 11,
                                    family: "'Google Sans Flex', sans-serif",
                                  },
                                  autoSkip: false,
                                },
                                border: { display: false },
                              },
                            },
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {}
        {activeMainTab === "info" && (
          <div className="">
            <ProfileInfoTabs profileSections={profileSections} />
          </div>
        )}
      </div>
    </PageLayout>
  );
}

const ProfileInfoTabs = ({ profileSections }) => {
  if (!profileSections || profileSections.length === 0) return null;

  return (
    <div className="space-y-8">
      {profileSections.map((section, idx) => (
        <div
          key={idx}
          className="bg-zinc-900/60 border backdrop-blur-xl rounded-[2rem]  p-8 overflow-hidden"
        >
          {}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-[#a098ff]/10 rounded-2xl text-[#a098ff]">
              {section.title.toLowerCase().includes("personal") ? (
                <User size={24} />
              ) : section.title.toLowerCase().includes("university") ? (
                <Building size={24} />
              ) : section.title.toLowerCase().includes("guardian") ||
                section.title.toLowerCase().includes("family") ? (
                <Users size={24} />
              ) : (
                <Activity size={24} />
              )}
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {section.title}
            </h3>
          </div>

          {}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(section.data).map(([key, val], i) => (
              <div
                key={i}
                className="flex flex-col p-4 rounded-2xl bg-black/20 hover:bg-white/5 transition-colors group"
              >
                <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold mb-1.5 group-hover:text-zinc-400">
                  {key}
                </span>
                <span className="text-zinc-100 text-sm font-medium break-words leading-relaxed">
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
