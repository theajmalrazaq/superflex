import React, { useEffect, useState, useMemo } from "react";
import PageLayout from "../components/layouts/PageLayout";
import { useAiSync } from "../hooks/useAiSync";
import { processCourseMarks } from "../utils/marksProcessor";
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
import Skeleton, {
  MarksSkeleton,
  AttendanceSkeleton,
} from "../components/ui/Skeleton";

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

const SectionAccordion = ({ section, isOpen, onToggle }) => {
  const rows = section.rows || [];
  return (
    <div className=" rounded-xl overflow-hidden bg-secondary/50 backdrop-blur-sm mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-foreground/5 hover:bg-foreground/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span
            className={`p-1.5 rounded-lg ${isOpen ? "bg-accent/20 text-accent" : "bg-tertiary text-foreground/50"}`}
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
          <span className="font-semibold text-foreground text-sm">
            {section.title}
          </span>
          <span className="text-xs text-foreground/50 bg-secondary px-2 py-0.5 rounded ">
            {rows.length}
          </span>
        </div>
        <div className="text-xs text-foreground/60 font-medium">
          <span className="text-foreground">{section.obtained.toFixed(1)}</span>
          <span className="text-foreground/40">
            {" "}
            / {section.weight.toFixed(1)}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-foreground/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/[0.02]">
                <th className="p-3 text-[11px] font-semibold text-foreground/50 Cap tracking-wider border-b border-foreground/10 w-16">
                  No.
                </th>
                <th className="p-3 text-[11px] font-semibold text-foreground/50 Cap tracking-wider border-b border-foreground/10 text-right">
                  Marks
                </th>
                <th className="p-3 text-[11px] font-semibold text-foreground/50 Cap tracking-wider border-b border-foreground/10 text-right w-24">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/5">
              {rows.map((row, idx) => {
                const perc =
                  row.total > 0 ? (row.obtained / row.total) * 100 : 0;
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-foreground/[0.02] transition-colors group ${!row.included ? "opacity-40" : ""}`}
                  >
                    <td className="p-3 text-sm text-foreground/70 font-medium">
                      {row.title}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-foreground font-bold">
                          {row.obtained}{" "}
                          <span className="text-foreground/40 font-normal text-xs">
                            / {row.total}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                          perc >= 80
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : perc >= 60
                              ? "bg-accent/10 text-accent border-accent/20"
                              : perc >= 40
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {perc.toFixed(0)}%
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
      setProfileImage(
        localStorage.getItem("superflex_user_custom_image") ||
          "/Login/GetImage",
      );
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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
  const [studyPlanData, setStudyPlanData] = useState(null);

  const activeCourseData = useMemo(() => {
    return coursesData.find((c) => c.id === activeCourse);
  }, [coursesData, activeCourse]);

  const mostAbsentSubject = useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) return null;
    return attendanceData.reduce((prev, current) =>
      prev.absent > current.absent ? prev : current,
    );
  }, [attendanceData]);

  const greetingMessage = useMemo(() => {
    const greetings = [
      "No Cap,",
      "Ate and left no crumbs,",
      "Slay,",
      "The aura is immaculate,",
      "Main Character,",
      "Oh you're locked in,",
      "What's the tea,",
      "Manifesting 4.0,",
      "Pookie is back,",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }, []);

  const roastMessage = useMemo(() => {
    const roasts = [
      "The GPA is giving... roommate.",
      "Go touch some grass, pookie.",
      "Is the 4.0 in the room with us right now?",
      "Academic comeback? More like academic setback.",
      "Your attendance is giving 'dropout'.",
      "Caught in 4k checking your grades.",
      "Don't let them catch you lacking.",
      "Sending thoughts and prayers to your transcript.",
      "Imagine having a lower GPA than your phone percentage.",
      "You're cooked if you don't start studying.",
    ];

    if (mostAbsentSubject && mostAbsentSubject.absent > 3) {
      return `Bestie, ${mostAbsentSubject.absent} absents in ${mostAbsentSubject.title.split(" ")[0]}? You're cooked.`;
    }
    if (currentAggregate.percentage > 85) {
      return "Okay nerd, we get it, you're smart.";
    }

    return roasts[Math.floor(Math.random() * roasts.length)];
  }, [mostAbsentSubject, currentAggregate]);

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
      if (l.text.includes("Marks") && !l.text.includes("PLO"))
        linkMap.marks = l.href;
      if (l.text.includes("Study Plan")) linkMap.studyPlan = l.href;
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

        const sections = [];

        const cards = pane.querySelectorAll(".card");
        cards.forEach((card) => {
          const header = card
            .querySelector(".card-header button")
            ?.textContent.trim();
          if (!header || header.includes("Grand Total")) return;

          const rows = [];
          const cardRows = card.querySelectorAll("tbody tr");
          cardRows.forEach((tr) => {
            if (
              tr.classList.contains("totalColumn_1471") ||
              tr.querySelector(".totalColweightage")
            )
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
            card.querySelector("tfoot tr") ||
            card.querySelector("tr[class*='totalColumn']");
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
              weight:
                categoryWeight || rows.reduce((acc, r) => acc + r.weight, 0),
              rows: rows,
            });
          }
        });

        const processedCourse = processCourseMarks({
          id: courseId,
          title: courseTitle,
          sections: sections,
        });

        semesterTotalObtained += processedCourse.grandTotalStats.obtained;
        semesterTotalWeight += processedCourse.grandTotalStats.weight;

        parsedCourses.push(processedCourse);
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

  const [themeColor, setThemeColor] = useState(
    localStorage.getItem("superflex-theme-color") || "#a098ff",
  );

  const [bgUrl, setBgUrl] = useState(
    localStorage.getItem("superflex-bg-url") ||
      "https://motionbgs.com/media/6867/omen-valorant2.960x540.mp4",
  );
  const [bgEnabled, setBgEnabled] = useState(
    localStorage.getItem("superflex-bg-enabled") !== "false",
  );

  useEffect(() => {
    const handleThemeChange = (e) => {
      setThemeColor(e.detail);
    };
    const handleBgChange = (e) => {
      setBgUrl(e.detail);
    };
    const handleBgEnabledChange = (e) => {
      setBgEnabled(e.detail);
    };

    window.addEventListener("superflex-theme-changed", handleThemeChange);
    window.addEventListener("superflex-bg-changed", handleBgChange);
    window.addEventListener(
      "superflex-bg-enabled-changed",
      handleBgEnabledChange,
    );

    return () => {
      window.removeEventListener("superflex-theme-changed", handleThemeChange);
      window.removeEventListener("superflex-bg-changed", handleBgChange);
      window.removeEventListener(
        "superflex-bg-enabled-changed",
        handleBgEnabledChange,
      );
    };
  }, []);

  const isVideo = (url) => {
    return url?.match(/\.(mp4|webm|ogg)$/) || url?.includes("video");
  };

  return (
    <PageLayout
      currentPage={window.location.pathname}
      onLinksFound={handleLinksFound}
      fullWidth={true}
    >
      <div className="relative">
        {}
        {bgUrl && bgEnabled && (
          <div className="absolute top-0 left-0 right-0 h-[850px] overflow-hidden pointer-events-none">
            {isVideo(bgUrl) ? (
              <video
                key={bgUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-70 transition-opacity duration-1000"
              >
                <source src={bgUrl} type="video/mp4" />
              </video>
            ) : (
              <img
                key={bgUrl}
                src={bgUrl}
                alt="Background"
                className="w-full h-full object-cover opacity-70 transition-opacity duration-1000"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/95 to-background"></div>
          </div>
        )}

        <div className="relative z-10 w-full px-4 md:px-12 pt-28 pb-8 space-y-8">
          {}
          <div className="relative p-8 md:p-12 overflow-hidden group">
            <div className="relative flex flex-col items-center justify-center text-center gap-8">
              {}
              <div className="flex flex-col items-center gap-6">
                <div className="relative ">
                  <div className="relative inline-block rounded-full">
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover bg-tertiary relative z-10"
                      onError={(e) => {
                        e.target.src =
                          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect fill="%2318181b" width="128" height="128"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2352525b" font-weight="bold" font-size="40">User</text></svg>';
                      }}
                    />
                    <div className="border-beam-element rounded-full" />
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-3">
                  <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight leading-tight max-w-2xl px-4">
                    {greetingMessage}{" "}
                    <span className="text-accent">
                      {personalInfo?.Name?.split(" ")[0] || "Student"}
                    </span>
                  </h1>
                  <p className="text-foreground/50 text-base md:text-lg font-medium max-w-xl">
                    {roastMessage}
                  </p>
                </div>
              </div>

              {}
              <div className="flex items-center backdrop-blur-md p-1.5 bg-foreground/5 border border-foreground/10 rounded-full gap-2 transition-all hover:bg-foreground/10">
                <button
                  onClick={() => setActiveMainTab("stats")}
                  className={`px-8 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
                    activeMainTab === "stats"
                      ? "bg-accent text-[var(--accent-foreground)]"
                      : "text-foreground/50 hover:text-foreground"
                  }`}
                >
                  <Activity size={18} />
                  Overview
                </button>
                <button
                  onClick={() => setActiveMainTab("info")}
                  className={`px-8 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
                    activeMainTab === "info"
                      ? "bg-accent text-[var(--accent-foreground)]"
                      : "text-foreground/50 hover:text-foreground"
                  }`}
                >
                  <User size={18} />
                  Profile
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
                  <div className="bg-secondary/40 border border-foreground/10 backdrop-blur-2xl rounded-[2.5rem] p-8 overflow-hidden flex flex-col gap-8 h-full">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-foreground tracking-tight">
                          Course Performance
                        </h3>
                        <p className="text-[10px] text-foreground/50 font-bold Cap tracking-[0px]">
                          Detailed marks and assessments
                        </p>
                      </div>
                      {links.marks && (
                        <a
                          href={links.marks}
                          className="bg-foreground/5 hover:bg-foreground/10 text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg  transition-colors flex items-center gap-1.5"
                        >
                          View Details
                          <ArrowRight size={12} />
                        </a>
                      )}
                    </div>

                    {}
                    <div className="w-full overflow-x-auto scrollbar-hide scrollbar-hide">
                      <div className="flex gap-2 bg-background/40 p-1.5 rounded-full border border-foreground/10 backdrop-blur-sm w-fit">
                        {coursesData.map((course) => (
                          <button
                            key={course.id}
                            onClick={() => setActiveCourse(course.id)}
                            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                              activeCourse === course.id
                                ? "bg-accent text-[var(--accent-foreground)]"
                                : "text-foreground/50 hover:text-foreground"
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
                          <h2 className="text-xl font-bold text-foreground leading-tight">
                            {activeCourseData.title}
                          </h2>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-secondary  text-foreground/60 text-xs font-medium">
                              {activeCourseData.id}
                            </span>
                            <span className="text-xs text-foreground/50">
                              {(() => {
                                const examSections =
                                  activeCourseData.sections.filter(
                                    (s) => !s.id.endsWith("Grand_Total_Marks"),
                                  );
                                return examSections.reduce(
                                  (acc, sec) => acc + (sec.rows?.length || 0),
                                  0,
                                );
                              })()}{" "}
                              Assessments
                            </span>
                          </div>
                        </div>

                        {}
                        <div className="space-y-3">
                          {activeCourseData.sections
                            .filter((s) => !s.id.endsWith("Grand_Total_Marks"))
                            .map((section, idx) => (
                              <SectionAccordion
                                key={idx}
                                section={section}
                                isOpen={openCategoryIdx === idx}
                                onToggle={() =>
                                  setOpenCategoryIdx(
                                    openCategoryIdx === idx ? null : idx,
                                  )
                                }
                              />
                            ))}
                          {activeCourseData.sections.length <= 1 && (
                            <div className="p-8 text-center text-foreground/50 text-sm  rounded-xl bg-background">
                              No assessments uploaded yet.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-background rounded-3xl  p-6 flex items-center justify-center text-foreground/50 min-h-[300px]">
                    No marks data available
                  </div>
                )}
                {loadingAttendance ? (
                  <AttendanceSkeleton />
                ) : (
                  <div className="bg-secondary/40 border border-foreground/10 backdrop-blur-2xl rounded-[2.5rem] p-8 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-foreground tracking-tight">
                          Attendance Overview
                        </h3>
                        <p className="text-[10px] text-foreground/50 font-bold Cap tracking-[0px]">
                          Presence and Absence Analytics
                        </p>
                      </div>
                      {links.attendance && (
                        <a
                          href={links.attendance}
                          className="bg-foreground/5 hover:bg-foreground/10 text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg  transition-colors flex items-center gap-1.5"
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
                                  t.length > 15
                                    ? t.substring(0, 15) + "..."
                                    : t;
                                return `${trunc} (P:${d.present} A:${d.absent})`;
                              }),
                              datasets: [
                                {
                                  label: "Attended",
                                  data: attendanceData.map((d) => d.percentage),
                                  backgroundColor: attendanceData.map((d) => {
                                    if (d.percentage >= 75) return themeColor;
                                    if (d.percentage >= 60) return "#f59e0b";
                                    return "#f43f5e";
                                  }),
                                  barPercentage: 0.6,
                                  categoryPercentage: 0.8,
                                  borderRadius: {
                                    topLeft: 100,
                                    bottomLeft: 100,
                                  },
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
            <ProfileInfoTabs profileSections={profileSections} />
          )}
        </div>
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
          className="bg-secondary/60 border backdrop-blur-xl rounded-[2rem]  p-8 overflow-hidden"
        >
          {}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-accent/10 rounded-2xl text-accent">
              {(() => {
                const title = section.title.toLowerCase();
                if (title.includes("personal")) return <User size={24} />;
                if (title.includes("university")) return <Building size={24} />;
                if (title.includes("guardian") || title.includes("family"))
                  return <Users size={24} />;
                return <Activity size={24} />;
              })()}
            </div>
            <h3 className="text-2xl font-bold text-foreground tracking-tight">
              {section.title}
            </h3>
          </div>

          {}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(section.data).map(([key, val], i) => (
              <div
                key={i}
                className="flex flex-col p-4 rounded-2xl bg-background/20 border border-foreground/10 hover:bg-foreground/5 transition-colors group"
              >
                <span className="text-foreground/50 text-[10px] Cap tracking-wider font-bold mb-1.5 group-hover:text-foreground/60">
                  {key}
                </span>
                <span className="text-foreground text-sm font-medium break-words leading-relaxed">
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
