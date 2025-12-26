import React, { useEffect, useState, useMemo, useRef } from "react";
import PageLayout from "../components/layouts/PageLayout";
import { useAiSync } from "../hooks/useAiSync";
import LoadingOverlay, {
  LoadingSpinner,
} from "../components/ui/LoadingOverlay";
import {
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  Calculator,
  Target,
  Plus,
  Minus,
  Info,
  ArrowRight,
  Save,
  RefreshCw,
  Zap,
  AlertTriangle,
  Search,
  Scale,
} from "lucide-react";
import { MCA_DATA } from "../constants/mcaData";
import NotificationBanner from "../components/ui/NotificationBanner";
import PageHeader from "../components/ui/PageHeader";
import StatsCard from "../components/ui/StatsCard";
import SuperTabs from "../components/ui/SuperTabs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const GRADE_POINTS = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.67,
  "B+": 3.33,
  B: 3.0,
  "B-": 2.67,
  "C+": 2.33,
  C: 2.0,
  "C-": 1.67,
  "D+": 1.33,
  D: 1.0,
  F: 0.0,
};

const CGPAPlannerModal = ({
  isOpen,
  onClose,
  currentCGPA,
  currentCreditHours,
}) => {
  const [targetCGPA, setTargetCGPA] = useState("");
  const [nextCH, setNextCH] = useState("");
  const [result, setResult] = useState(null);

  const calculate = (e) => {
    e.preventDefault();
    const target = parseFloat(targetCGPA);
    const nextHours = parseFloat(nextCH);

    if (isNaN(target) || isNaN(nextHours) || nextHours <= 0) return;

    const requiredGPA =
      (target * (currentCreditHours + nextHours) -
        currentCGPA * currentCreditHours) /
      nextHours;
    setResult(requiredGPA);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-black/20 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 w-full max-w-[420px] animate-in zoom-in-95 fade-in duration-300 relative overflow-hidden "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-x/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>

        <div className="relative">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-4 bg-x/10 rounded-2xl text-x mb-4">
              <Target size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              CGPA Planner
            </h2>
            <p className="text-zinc-400 font-medium text-sm mt-1">
              Calculate your future strategy
            </p>
          </div>

          <form onSubmit={calculate} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">
                  Target CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={targetCGPA}
                  onChange={(e) => setTargetCGPA(e.target.value)}
                  placeholder="e.g. 3.70"
                  className="w-full h-[45px] bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-x/50 focus:ring-4 focus:ring-x/5 transition-all font-medium placeholder:text-white/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">
                  Next Cr.Hrs
                </label>
                <input
                  type="number"
                  value={nextCH}
                  onChange={(e) => setNextCH(e.target.value)}
                  placeholder="e.g. 18"
                  className="w-full h-[45px] bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-x/50 focus:ring-4 focus:ring-x/5 transition-all font-medium placeholder:text-white/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-[48px] bg-x hover:bg-[#8f86ff] text-white rounded-xl font-bold text-sm"
            >
              Generate Strategy
            </button>
          </form>

          {result !== null && (
            <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                Required GPA Strategy
              </p>
              {result > 4.0 ? (
                <div className="text-rose-400">
                  <p className="text-3xl font-bold tracking-tight mb-2">
                    {result.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-medium bg-rose-500/10 p-2 rounded-lg">
                    <Info size={14} />
                    Target unreachable in one semester.
                  </div>
                </div>
              ) : result < 0 ? (
                <div className="text-x">
                  <p className="text-3xl font-bold tracking-tight mb-2">0.00</p>
                  <div className="flex items-center gap-2 text-xs font-medium bg-x/10 p-2 rounded-lg">
                    <Zap size={14} />
                    Target already achieved!
                  </div>
                </div>
              ) : (
                <div className="text-x">
                  <p className="text-4xl font-bold tracking-tight mb-3">
                    {result.toFixed(2)}
                  </p>
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                    Maintain an average of{" "}
                    <span className="text-white">{result.toFixed(2)}</span> in
                    your next <span className="text-white">{nextCH}</span>{" "}
                    credit hours.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MCALookupModal = ({ isOpen, onClose, initialMCA = "" }) => {
  const [mca, setMca] = useState(initialMCA);
  const [marks, setMarks] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (initialMCA) setMca(initialMCA);
  }, [initialMCA]);

  const calculateGrade = (e) => {
    if (e) e.preventDefault();
    const mcaVal = Math.round(parseFloat(mca));
    const marksVal = parseFloat(marks);

    if (isNaN(mcaVal) || isNaN(marksVal)) return;

    const data = MCA_DATA[mcaVal];
    if (!data) {
      setResult({
        error: "MCA data not available for this value (30-91 only)",
      });
      return;
    }

    let detectedGrade = "F";
    const thresholds = data.thresholds;
    const sortedGrades = [
      "D",
      "D+",
      "C-",
      "C",
      "C+",
      "B-",
      "B",
      "B+",
      "A-",
      "A",
      "A+",
    ];

    for (const g of sortedGrades) {
      if (thresholds[g] !== null && marksVal >= thresholds[g]) {
        detectedGrade = g;
      }
    }

    setResult({ grade: detectedGrade, thresholds: thresholds });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 w-full max-w-[500px] animate-in zoom-in-95 fade-in duration-300 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-x/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>

        <div className="relative">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-4 bg-x/10 rounded-2xl text-x mb-4">
              <Scale size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Relative Grade Lookup
            </h2>
            <p className="text-zinc-400 font-medium text-sm mt-1">
              Determine grade based on MCA thresholds
            </p>
          </div>

          <form onSubmit={calculateGrade} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">
                  Rounded MCA
                </label>
                <input
                  type="number"
                  value={mca}
                  onChange={(e) => setMca(e.target.value)}
                  placeholder="30-91"
                  className="w-full h-[45px] bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-x/50 focus:ring-4 focus:ring-x/5 transition-all font-medium placeholder:text-white/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">
                  Total Marks
                </label>
                <input
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  placeholder="e.g. 65"
                  className="w-full h-[45px] bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-x/50 focus:ring-4 focus:ring-x/5 transition-all font-medium placeholder:text-white/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-[48px] bg-x hover:bg-[#8f86ff] text-white rounded-xl font-bold text-sm transition-all"
            >
              Lookup Grade
            </button>
          </form>

          {result && (
            <div className="mt-8 space-y-4">
              {result.error ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle size={14} />
                  {result.error}
                </div>
              ) : (
                <>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Predicted Grade
                      </p>
                      <p className="text-4xl font-black text-white tracking-tighter">
                        {result.grade}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                        At MCA {Math.round(mca)}
                      </p>
                      <div className="flex flex-wrap justify-end gap-1 max-w-[200px]">
                        {Object.entries(result.thresholds)
                          .filter(([_, val]) => val !== null)
                          .reverse()
                          .slice(0, 4)
                          .map(([g, val]) => (
                            <span
                              key={g}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                g === result.grade
                                  ? "bg-x text-white"
                                  : "bg-white/5 text-zinc-500"
                              }`}
                            >
                              {g}: {val}+
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(result.thresholds)
                      .filter(([_, val]) => val !== null)
                      .map(([g, val]) => (
                        <div
                          key={g}
                          className={`p-2 rounded-lg border text-center transition-all ${
                            g === result.grade
                              ? "bg-x/10 border-x/50"
                              : "bg-white/5 border-white/5"
                          }`}
                        >
                          <p className="text-[9px] font-bold text-zinc-500 uppercase">
                            {g}
                          </p>
                          <p
                            className={`text-xs font-bold ${
                              g === result.grade
                                ? "text-white"
                                : "text-zinc-400"
                            }`}
                          >
                            {val}
                            {g === "F" ? " (max)" : "+"}
                          </p>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function TranscriptPage() {
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState([]);
  const [activeSemIdx, setActiveSemIdx] = useState(0);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [isMCALookupOpen, setIsMCALookupOpen] = useState(false);
  const [selectedMCA, setSelectedMCA] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [whatIfMode, setWhatIfMode] = useState(false);
  const [overriddenGrades, setOverriddenGrades] = useState({});

  useEffect(() => {
    const parse = () => {
      try {
        const root = document.querySelector(
          ".m-grid.m-grid--hor.m-grid--root.m-page",
        );
        if (!root) {
          setTimeout(parse, 500);
          return;
        }

        const alertList = [];
        root.querySelectorAll(".m-alert, .alert").forEach((alert) => {
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

        const semesterData = [];
        const semesterCols = root.querySelectorAll(
          ".m-section__content .row .col-md-6",
        );

        semesterCols.forEach((col) => {
          const title =
            col.querySelector("h5")?.textContent.trim() || "Untitled Semester";

          const summarySpans = col.querySelectorAll(".pull-right span");
          const summaryArr = Array.from(summarySpans).map(
            (s) => s.textContent.split(":")[1]?.trim() || "0",
          );

          const summary = {
            crRegistered: parseInt(summaryArr[0]),
            crEarned: parseInt(summaryArr[1]),
            cgpa: parseFloat(summaryArr[2]),
            sgpa: parseFloat(summaryArr[3]),
          };

          const courses = [];
          const rows = col.querySelectorAll("tbody tr");
          rows.forEach((row) => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 6) {
              const ch = parseFloat(cells[3].textContent.trim()) || 0;
              const pts = parseFloat(cells[5].textContent.trim()) || 0;
              const codeCell = cells[0];
              const codeText = codeCell.textContent.trim();

              let mca = null;
              let gradingScheme = null;
              let schemeDetailId = null;

              const link = codeCell.querySelector("a");
              if (link) {
                const title =
                  link.getAttribute("title") ||
                  link.getAttribute("data-original-title");
                if (title && title.includes("MCA")) {
                  const mMatch = title.match(/MCA[:\s]+(\d+)/i);
                  if (mMatch) mca = mMatch[1];
                }

                const onclick = link.getAttribute("onclick");
                if (onclick) {
                  const match = onclick.match(
                    /fn_StdGradeSchemeDetail\((\d+)\)/,
                  );
                  if (match) schemeDetailId = match[1];
                }

                const target = link.getAttribute("data-target");
                if (target) {
                  const modal = document.querySelector(target);
                  if (modal) {
                    const table = modal.querySelector("#tblGradeDetailmodal");
                    if (table) {
                      const rows = table.querySelectorAll("tr");
                      if (rows.length > 1) {
                        const dataRow = rows[1];
                        const dataCells = dataRow.querySelectorAll("td");
                        if (dataCells.length >= 2) {
                          gradingScheme = dataCells[0].textContent.trim();
                          mca = dataCells[1].textContent.trim();
                        }
                      }
                    }
                  }
                }
              }

              courses.push({
                code: codeText,
                description: cells[1].textContent.trim(),
                type: cells[2].textContent.trim(),
                crHrs: ch,
                grade: cells[4].textContent.trim(),
                points: pts,
                mca: mca,
                gradingScheme: gradingScheme,
                schemeDetailId: schemeDetailId,
              });
            }
          });

          semesterData.push({
            title,
            summary,
            courses,
          });
        });

        if (semesterData.length > 0) {
          setSemesters(semesterData);
          setActiveSemIdx(semesterData.length - 1);
        }

        const gModal = document.querySelector("#GradePolicyDetail");
        if (gModal && root.contains(gModal)) {
          document.body.appendChild(gModal);
        }

        root.style.display = "none";
        setLoading(false);
      } catch (e) {
        console.error("Transcript Parsing Error", e);
        setLoading(false);
      }
    };

    setTimeout(parse, 300);
  }, []);

  const transcriptData = useMemo(() => {
    if (semesters.length === 0) return null;
    return {
      transcript: semesters.map((sem) => ({
        title: sem.title,
        summary: sem.summary,
        courses: sem.courses.map((c) => ({
          code: c.code,
          name: c.description,
          type: c.type,
          crHrs: c.crHrs,
          grade: c.grade,
          points: c.points,
          mca: c.mca,
          gradingScheme: c.gradingScheme,
          schemeDetailId: c.schemeDetailId,
        })),
      })),
      mcaData: MCA_DATA,
    };
  }, [semesters]);

  useAiSync({
    data: transcriptData,
    syncKey: "transcript",
    isEnabled: !!transcriptData,
    eventExtras: { isTranscriptSync: true },
  });

  const activeSemData = semesters[activeSemIdx];

  const { calculatedStats, originalCGPA } = useMemo(() => {
    if (semesters.length === 0)
      return { calculatedStats: null, originalCGPA: 0 };

    let cumulativeGradePoints = 0;
    let cumulativeCreditsForGPA = 0;
    let totalCreditsAttempted = 0;

    const passedUniqueCredits = new Map();
    const courseStatsMap = new Map();

    let lastNonEmptyCGPA = 0;

    const semesterStats = semesters.map((sem, sIdx) => {
      let semGradePoints = 0;
      let semCreditsForGPA = 0;
      let semCreditsAttempted = 0;
      let semCreditsEarned = 0;
      let hasOverriddenGrade = false;

      const tempPassedCredits = new Map();

      sem.courses.forEach((course) => {
        const key = `${sem.title}-${course.code}`;
        if (overriddenGrades[key]) hasOverriddenGrade = true;

        const grade = overriddenGrades[key] || course.grade;
        const gp = GRADE_POINTS[grade];
        const isGraded = gp !== undefined;

        const isNonCredit =
          course.type.toLowerCase().includes("non credit") ||
          grade === "S" ||
          grade === "U";

        if (isNonCredit) return;

        semCreditsAttempted += course.crHrs;

        if (isGraded) {
          semGradePoints += gp * course.crHrs;
          semCreditsForGPA += course.crHrs;

          if (courseStatsMap.has(course.code)) {
            const prev = courseStatsMap.get(course.code);
            cumulativeGradePoints -= prev.gp * prev.crHrs;
            cumulativeCreditsForGPA -= prev.crHrs;
          }

          cumulativeGradePoints += gp * course.crHrs;
          cumulativeCreditsForGPA += course.crHrs;
          courseStatsMap.set(course.code, { gp, crHrs: course.crHrs });

          if (grade !== "F") {
            semCreditsEarned += course.crHrs;
            tempPassedCredits.set(course.code, course.crHrs);
          }
        }
      });

      const sgpa = semCreditsForGPA > 0 ? semGradePoints / semCreditsForGPA : 0;
      const isEmptySemester = semCreditsForGPA === 0 && !hasOverriddenGrade;

      if (!isEmptySemester) {
        totalCreditsAttempted += semCreditsAttempted;
        tempPassedCredits.forEach((ch, code) => {
          passedUniqueCredits.set(
            code,
            Math.max(passedUniqueCredits.get(code) || 0, ch),
          );
        });
      }

      const cgpa =
        cumulativeCreditsForGPA > 0
          ? cumulativeGradePoints / cumulativeCreditsForGPA
          : 0;

      if (!isEmptySemester || sIdx === 0) {
        lastNonEmptyCGPA = cgpa;
      }

      return {
        title: sem.title,
        sgpa: sgpa,
        cgpa: cgpa,
        attempted: semCreditsAttempted,
        earned: semCreditsEarned,
        isEmptySemester,
      };
    });

    const totalCreditsEarned = Array.from(passedUniqueCredits.values()).reduce(
      (sum, ch) => sum + ch,
      0,
    );

    return {
      calculatedStats: {
        history: semesterStats.filter((s, idx) => !s.isEmptySemester),
        currentCGPA: lastNonEmptyCGPA,
        totalCreditsEarned: totalCreditsEarned,
        totalCreditsAttempted: totalCreditsAttempted,
        totalCreditsForGPA: cumulativeCreditsForGPA,
        actualSemestersCount: semesterStats.filter((s) => !s.isEmptySemester)
          .length,
        actualCoursesCount: Array.from(courseStatsMap.keys()).length,
      },
      originalCGPA: semesters[semesters.length - 1].summary.cgpa,
    };
  }, [semesters, overriddenGrades]);

  const chartData = useMemo(() => {
    if (!calculatedStats) return null;
    return {
      labels: calculatedStats.history.map((h) => h.title.split(" ")[0]),
      datasets: [
        {
          label: "SGPA",
          data: calculatedStats.history.map((h) => h.sgpa),
          borderColor: "#a098ff",
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "rgba(160, 152, 255, 0.15)");
            gradient.addColorStop(1, "rgba(160, 152, 255, 0)");
            return gradient;
          },
          tension: 0.45,
          fill: true,
          pointBackgroundColor: "#a098ff",
          pointBorderWidth: 4,
          pointBorderColor: "#111",
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
        },
        {
          label: "CGPA",
          data: calculatedStats.history.map((h) => h.cgpa),
          borderColor: "#a098ff",
          tension: 0.45,
          fill: false,
          pointBackgroundColor: "#a098ff",
          pointBorderWidth: 4,
          pointBorderColor: "#111",
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
          borderDash: [5, 5],
        },
      ],
    };
  }, [calculatedStats]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#18181b",
        titleFont: { size: 13, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 16,
        borderRadius: 16,
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 4,
        ticks: { color: "#3f3f46", stepSize: 1, font: { weight: "bold" } },
        grid: { color: "rgba(255,255,255,0.03)" },
      },
      x: {
        ticks: { color: "#3f3f46", font: { weight: "bold" } },
        grid: { display: false },
      },
    },
  };

  const handleGradeChange = (semTitle, courseCode, newGrade) => {
    setOverriddenGrades((prev) => ({
      ...prev,
      [`${semTitle}-${courseCode}`]: newGrade,
    }));
  };

  if (loading) return <LoadingOverlay />;

  return (
    <PageLayout currentPage={window.location.pathname}>
      {}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-x/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none z-0"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none z-0"></div>

      <div className="w-full p-4 md:p-8 space-y-10 relative z-10">
        {}
        <PageHeader
          title="Transcript Report"
          subtitle="Academic performance and degree analytics"
        >
          <button
            onClick={() => setIsPlannerOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/5 bg-zinc-900/50 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-300 group"
          >
            <Target
              size={16}
              className="group-hover:scale-110 transition-transform"
            />
            Strategic Planner
          </button>
          <button
            onClick={() => setIsMCALookupOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/5 bg-zinc-900/50 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-300 group"
          >
            <Scale
              size={16}
              className="group-hover:scale-110 transition-transform"
            />
            MCA Lookup
          </button>
          <button
            onClick={() =>
              whatIfMode
                ? (setOverriddenGrades({}), setWhatIfMode(false))
                : setWhatIfMode(true)
            }
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-300 text-xs font-bold ${
              whatIfMode
                ? "bg-x/10 text-x border-x/20"
                : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Calculator size={16} />
            {whatIfMode ? "Abort Simulation" : "Simulation Lab"}
          </button>
        </PageHeader>

        <NotificationBanner alerts={alerts} />

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={TrendingUp}
            label="Cumulative GPA"
            value={calculatedStats?.currentCGPA.toFixed(2) || "0.00"}
            subValue={
              whatIfMode ? `(Was ${originalCGPA.toFixed(2)})` : "Current"
            }
            delay={0}
          />
          <StatsCard
            icon={Award}
            label="Credits Cleared"
            value={calculatedStats?.totalCreditsEarned || "0"}
            subValue={`of ${calculatedStats?.totalCreditsAttempted || 0} attempted`}
            delay={100}
          />
          <StatsCard
            icon={Calendar}
            label="Semesters"
            value={calculatedStats?.actualSemestersCount || 0}
            subValue="Completed"
            delay={200}
          />
          <StatsCard
            icon={BookOpen}
            label="Degree Progress"
            value={calculatedStats?.actualCoursesCount || 0}
            subValue="Graded Courses"
            delay={300}
          />
        </div>

        {}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 flex flex-col gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-x/5 blur-[100px] rounded-full -mr-48 -mt-48 pointer-events-none"></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <SuperTabs
                  tabs={semesters.map((s, idx) => ({
                    value: idx,
                    label: s.title,
                  }))}
                  activeTab={activeSemIdx}
                  onTabChange={setActiveSemIdx}
                />
              </div>

              {activeSemData && (
                <div className="space-y-10 relative z-10">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-10">
                    <div className="space-y-1">
                      <h2 className="text-3xl font-black text-white tracking-tighter">
                        {activeSemData.title}
                      </h2>
                      <p className="text-xs text-zinc-500 font-black uppercase tracking-widest">
                        Semester Detail Report
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-12 lg:gap-x-16 gap-y-6">
                      <div className="text-right flex flex-col items-end min-w-[70px]">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 bg-zinc-800 px-2 py-0.5 rounded">
                          Attemp.
                        </span>
                        <span className="text-3xl font-bold font-sans text-white tracking-tighter">
                          {activeSemData.courses.reduce((acc, c) => {
                            const grade =
                              overriddenGrades[
                                `${activeSemData.title}-${c.code}`
                              ] || c.grade;
                            const isNonCredit =
                              c.type.toLowerCase().includes("non credit") ||
                              grade === "S" ||
                              grade === "U";
                            return isNonCredit ? acc : acc + c.crHrs;
                          }, 0)}
                        </span>
                      </div>
                      <div className="text-right flex flex-col items-end min-w-[70px]">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 bg-zinc-800 px-2 py-0.5 rounded">
                          Earned
                        </span>
                        <span className="text-3xl font-bold font-sans text-x tracking-tighter">
                          {activeSemIdx === semesters.length - 1 &&
                          !overriddenGrades[
                            Object.keys(overriddenGrades).find((k) =>
                              k.startsWith(activeSemData.title),
                            )
                          ]
                            ? "0"
                            : calculatedStats?.history.find(
                                (h) => h.title === activeSemData.title,
                              )?.earned || 0}
                        </span>
                      </div>
                      <div className="text-right flex flex-col items-end min-w-[70px]">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 bg-zinc-800 px-2 py-0.5 rounded">
                          SGPA
                        </span>
                        <span className="text-3xl font-bold font-sans text-x tracking-tighter">
                          {activeSemIdx === semesters.length - 1 &&
                          !overriddenGrades[
                            Object.keys(overriddenGrades).find((k) =>
                              k.startsWith(activeSemData.title),
                            )
                          ]
                            ? "0.00"
                            : calculatedStats?.history
                                .find((h) => h.title === activeSemData.title)
                                ?.sgpa.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="text-right flex flex-col items-end min-w-[70px]">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2 bg-zinc-800 px-2 py-0.5 rounded">
                          CGPA
                        </span>
                        <span className="text-3xl font-bold font-sans text-white tracking-tighter">
                          {activeSemIdx === semesters.length - 1 &&
                          !overriddenGrades[
                            Object.keys(overriddenGrades).find((k) =>
                              k.startsWith(activeSemData.title),
                            )
                          ]
                            ? calculatedStats?.currentCGPA.toFixed(2)
                            : calculatedStats?.history
                                .find((h) => h.title === activeSemData.title)
                                ?.cgpa.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto scrollbar-hide -mx-2">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/[0.02]">
                          <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-white/5">
                            Code
                          </th>
                          <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-white/5">
                            Course Name
                          </th>
                          <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-white/5 text-center">
                            Cr.H
                          </th>
                          <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-white/5 text-center">
                            Grade
                          </th>
                          <th className="px-8 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider border-b border-white/5 text-right">
                            Points
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeSemData.courses.map((course, idx) => {
                          const currentGrade =
                            overriddenGrades[
                              `${activeSemData.title}-${course.code}`
                            ] || course.grade;
                          const isSimulated =
                            !!overriddenGrades[
                              `${activeSemData.title}-${course.code}`
                            ];

                          return (
                            <tr
                              key={idx}
                              className={`group transition-all duration-300 border-b border-white/5 last:border-0 hover:bg-white/[0.03]`}
                            >
                              <td className="px-6 py-4">
                                <button
                                  onClick={async () => {
                                    if (course.schemeDetailId) {
                                      try {
                                        const response = await fetch(
                                          "/Student/Populate_GradeSchemeDetails",
                                          {
                                            method: "POST",
                                            headers: {
                                              "Content-Type":
                                                "application/x-www-form-urlencoded; charset=UTF-8",
                                              "X-Requested-With":
                                                "XMLHttpRequest",
                                            },
                                            body: `OfferId=${course.schemeDetailId}`,
                                          },
                                        );
                                        const data = await response.json();
                                        if (data && data.length > 0) {
                                          const factor = data[0].GRADING_FACTOR;
                                          if (factor) {
                                            setSelectedMCA(factor.toString());
                                            setIsMCALookupOpen(true);
                                            return;
                                          }
                                        }
                                      } catch (e) {
                                        console.error(
                                          "Grade Scheme Fetch Error:",
                                          e,
                                        );
                                      }

                                      if (
                                        typeof window.fn_StdGradeSchemeDetail ===
                                        "function"
                                      ) {
                                        window.fn_StdGradeSchemeDetail(
                                          course.schemeDetailId,
                                        );
                                      }

                                      const modal =
                                        document.querySelector(
                                          "#GradePolicyDetail",
                                        );
                                      if (modal) {
                                        modal.style.zIndex = "9999";
                                        const $ = window.jQuery || window.$;
                                        if (
                                          $ &&
                                          typeof $.fn.modal === "function"
                                        ) {
                                          $(modal).modal("show");
                                        } else {
                                          modal.style.display = "block";
                                          modal.classList.add("show");
                                          modal.style.backgroundColor =
                                            "rgba(0,0,0,0.5)";
                                          modal.onclick = (e) => {
                                            if (e.target === modal) {
                                              modal.style.display = "none";
                                              modal.classList.remove("show");
                                            }
                                          };
                                        }
                                      }
                                    }
                                  }}
                                  className={`text-xs font-bold px-2.5 py-1 bg-white/5 rounded-lg transition-all ${
                                    course.schemeDetailId
                                      ? "text-x hover:bg-x/20 cursor-pointer"
                                      : "text-white group-hover:bg-white/10"
                                  }`}
                                >
                                  {course.code}
                                </button>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-0.5">
                                  <p className="text-sm font-bold text-white leading-tight">
                                    {course.description}
                                  </p>
                                  <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wide">
                                    {course.type}
                                  </p>
                                  {course.mca && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <button
                                        onClick={() => {
                                          setSelectedMCA(course.mca);
                                          setIsMCALookupOpen(true);
                                        }}
                                        className="text-[10px] font-bold text-x bg-x/10 px-1.5 py-0.5 rounded flex items-center gap-1 hover:bg-x/20 transition-colors"
                                      >
                                        <TrendingUp size={10} />
                                        MCA: {course.mca}
                                      </button>
                                      {course.gradingScheme && (
                                        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">
                                          {course.gradingScheme}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
                                  {course.crHrs}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {whatIfMode ? (
                                  <select
                                    value={currentGrade}
                                    onChange={(e) =>
                                      handleGradeChange(
                                        activeSemData.title,
                                        course.code,
                                        e.target.value,
                                      )
                                    }
                                    className={`text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-center cursor-pointer hover:border-x/50 transition-all outline-none appearance-none ${
                                      currentGrade.startsWith("A")
                                        ? "text-x"
                                        : currentGrade.startsWith("B")
                                          ? "text-blue-400"
                                          : currentGrade.startsWith("C")
                                            ? "text-amber-400"
                                            : currentGrade === "F"
                                              ? "text-rose-400"
                                              : "text-zinc-500"
                                    }`}
                                  >
                                    {Object.keys(GRADE_POINTS)
                                      .concat(["I", "S", "U", "W"])
                                      .map((g) => (
                                        <option key={g} value={g}>
                                          {g}
                                        </option>
                                      ))}
                                  </select>
                                ) : (
                                  <div className="flex justify-center">
                                    <span
                                      className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                                        currentGrade.startsWith("A")
                                          ? "bg-x/10 text-x border-x/20"
                                          : currentGrade.startsWith("B")
                                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            : currentGrade.startsWith("C")
                                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                              : currentGrade === "F"
                                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                : "bg-zinc-800 text-zinc-500 border-transparent"
                                      }`}
                                    >
                                      {currentGrade}
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="px-8 py-4 text-right">
                                <span
                                  className={`text-sm font-bold font-sans ${isSimulated ? "text-x" : "text-zinc-300"}`}
                                >
                                  {(
                                    (GRADE_POINTS[currentGrade] || 0) *
                                    course.crHrs
                                  ).toFixed(1)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {}
          <div className="space-y-10">
            {}
            <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Performance Flow
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    Historical GPA Trend
                  </p>
                </div>
                <div className="p-3 bg-x/10 rounded-2xl text-x">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="h-[280px] w-full transition-all duration-700">
                {chartData && <Line data={chartData} options={chartOptions} />}
              </div>
            </div>

            {}
            <div className="bg-[#111] border border-x/20 rounded-[2.5rem] p-7 relative overflow-hidden ">
              <div className="absolute top-0 right-0 w-64 h-64 bg-x/5 blur-[80px] rounded-full -mr-32 -mt-32"></div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-x/10 rounded-xl text-x">
                    <Zap size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Simulation Desk
                  </h3>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="p-5 rounded-[1.5rem] bg-zinc-900/40 border border-white/5  transition-colors">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">
                      Projected CGPA
                    </p>
                    <div className="flex items-end justify-between">
                      <span className="text-4xl font-bold font-sans text-white tracking-tighter">
                        {calculatedStats?.currentCGPA.toFixed(2)}
                      </span>
                      {whatIfMode && (
                        <div
                          className={`flex items-center gap-1 text-xs font-medium font-sans ${calculatedStats.currentCGPA >= originalCGPA ? "text-x" : "text-rose-400"}`}
                        >
                          {calculatedStats.currentCGPA >= originalCGPA
                            ? "+"
                            : ""}
                          {(calculatedStats.currentCGPA - originalCGPA).toFixed(
                            3,
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 rounded-[1.5rem] bg-zinc-900/40 border border-white/5  transition-colors">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">
                      Simulation Impact
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-medium font-sans text-zinc-400">
                        {Object.keys(overriddenGrades).length}{" "}
                        <span className="text-[10px] uppercase ml-1 opacity-60">
                          Changes
                        </span>
                      </span>
                      {whatIfMode && (
                        <button
                          onClick={() => setOverriddenGrades({})}
                          className="p-1.5 text-zinc-600 hover:text-white transition-colors"
                        >
                          <RefreshCw size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CGPAPlannerModal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
        currentCGPA={calculatedStats?.currentCGPA || 0}
        currentCreditHours={calculatedStats?.totalCreditsForGPA || 0}
      />
      <MCALookupModal
        isOpen={isMCALookupOpen}
        onClose={() => {
          setIsMCALookupOpen(false);
          setSelectedMCA("");
        }}
        initialMCA={selectedMCA}
      />
    </PageLayout>
  );
}

export default TranscriptPage;
