import { useEffect, useState, useMemo } from "react";
import PageLayout from "../components/layouts/PageLayout";
import {
  Award,
  Target,
  Info,
  RefreshCw,
  Zap,
  AlertTriangle,
  Scale,
  TrendingUp,
} from "lucide-react";
import { MCA_DATA } from "../constants/mcaData";
import NotificationBanner from "../components/ui/NotificationBanner";
import { parseTranscriptPage } from "../parsers/transcript";
import { findFlexPageRoot } from "../parsers/dom";
import StatsCard from "../components/ui/StatsCard";
import SuperTabs from "../components/ui/SuperTabs";
import { PageSkeleton } from "../components/ui/Skeleton";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import SelectMenu from "../components/ui/SelectMenu";
import { useAiSync } from "../hooks/useAiSync";
import { usePreferencesStore } from "../stores/preferencesStore";
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

const GradeSelector = ({ value, grades, onChange }) => {
  return (
    <SelectMenu
      value={value}
      options={grades.map((grade) => ({ value: grade, label: grade }))}
      onChange={onChange}
      ariaLabel="Simulation grade"
      triggerClassName="min-w-16 rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-xs font-bold text-slate-900 transition-colors hover:bg-slate-50 dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]"
      contentClassName="w-36"
      itemClassName="px-3 py-2 text-xs font-semibold"
      iconSize={14}
    />
  );
};

const TranscriptBottomSheet = ({ isOpen, onClose, title, subtitle, icon, children }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      eyebrow="Transcript tools"
      icon={icon}
      maxWidth="max-w-2xl"
    >
      {children}
    </Modal>
  );
};

const CGPAPlannerModal = ({ isOpen, onClose, currentCGPA, currentCreditHours }) => {
  const [targetCGPA, setTargetCGPA] = useState("");
  const [nextCH, setNextCH] = useState("");
  const [result, setResult] = useState(null);

  const calculate = (e) => {
    if (e) e.preventDefault();
    const target = parseFloat(targetCGPA);
    const nextHours = parseFloat(nextCH);

    if (isNaN(target) || isNaN(nextHours) || nextHours <= 0) return;

    const requiredGPA =
      (target * (currentCreditHours + nextHours) - currentCGPA * currentCreditHours) / nextHours;
    setResult(requiredGPA);
  };

  return (
    <TranscriptBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="The Comeback Calculator 🫡"
      subtitle="Dream big. Let's see if the math agrees."
      icon={<Target size={24} />}
    >
      <div className="space-y-8 pt-4">
        <form onSubmit={calculate} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target CGPA"
              type="number"
              step="0.01"
              min="0"
              max="4"
              value={targetCGPA}
              onChange={(e) => setTargetCGPA(e.target.value)}
              placeholder="e.g. 3.70"
            />
            <Input
              label="Next Cr.Hrs"
              type="number"
              value={nextCH}
              onChange={(e) => setNextCH(e.target.value)}
              placeholder="e.g. 18"
            />
          </div>

          <Button type="submit" className="w-full">
            Generate Strategy
          </Button>
        </form>

        {result !== null && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 rounded-3xl bg-foreground/[0.03] border border-foreground/10 backdrop-blur-sm flex items-center justify-between relative overflow-hidden group">
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-bold text-foreground/50  tracking-[0px]">
                  Required SGPA
                </p>
                {result > 4.0 ? (
                  <p className="text-4xl font-bold text-rose-500 ">{result.toFixed(2)}</p>
                ) : result < 0 ? (
                  <p className="text-4xl font-bold text-emerald-500 ">0.00</p>
                ) : (
                  <p className="text-5xl font-bold text-foreground ">{result.toFixed(2)}</p>
                )}
              </div>

              <div className="text-right relative z-10 flex flex-col items-end gap-3">
                {result > 4.0 ? (
                  <span className="px-3 py-1 bg-rose-500/10 text-rose-400 rounded-lg text-[10px] font-bold  border border-rose-500/20">
                    Unreachable
                  </span>
                ) : result < 0 ? (
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold  border border-emerald-500/20">
                    Achieved
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-lg text-[10px] font-bold  border border-accent/20">
                    Target Goal
                  </span>
                )}
                <p className="text-[10px] font-bold text-foreground/50  tracking-[0px]">
                  In {nextCH} Cr.Hrs
                </p>
              </div>
            </div>

            {result > 4.0 && (
              <div className="mt-4 flex items-start gap-3 text-[11px] font-medium text-rose-400 bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10 italic">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>Bhai, even a 4.0 can't save this target. 💀</span>
              </div>
            )}
          </div>
        )}
      </div>
    </TranscriptBottomSheet>
  );
};

const MCALookupModal = (props: React.ComponentProps<typeof MCALookupForm>) => (
  <MCALookupForm key={props.initialMCA || ""} {...props} />
);

const MCALookupForm = ({ isOpen, onClose, initialMCA = "" }) => {
  const [mca, setMca] = useState(initialMCA);
  const [marks, setMarks] = useState("");
  const [result, setResult] = useState(null);

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
    const sortedGrades = ["D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];

    for (const g of sortedGrades) {
      if (thresholds[g] !== null && marksVal >= thresholds[g]) {
        detectedGrade = g;
      }
    }

    setResult({ grade: detectedGrade, thresholds: thresholds });
  };

  return (
    <TranscriptBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Let the Curve Decide."
      subtitle="Enter your marks and MCA. Time to trust the grading gods."
      icon={<Scale size={24} />}
    >
      <div className="space-y-8 pt-4">
        <form onSubmit={calculateGrade} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Rounded MCA"
              type="number"
              value={mca}
              onChange={(e) => setMca(e.target.value)}
              placeholder="30-91"
            />
            <Input
              label="Total Marks"
              type="number"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              placeholder="e.g. 65"
            />
          </div>

          <Button type="submit" className="w-full">
            Lookup Grade
          </Button>
        </form>

        {result && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {result.error ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-3">
                <AlertTriangle size={16} className="shrink-0" />
                {result.error}
              </div>
            ) : (
              <>
                <div className="p-6 rounded-3xl bg-foreground/[0.03] border border-foreground/10 backdrop-blur-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-medium text-foreground/50  tracking-[0px]">
                      Predicted Grade
                    </p>
                    <p className="text-4xl font-bold text-foreground ">{result.grade}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-foreground/50  tracking-[0px] mb-2">
                      At MCA {Math.round(Number(mca))}
                    </p>
                    <div className="flex flex-wrap justify-end gap-1.5 max-w-[200px]">
                      {Object.entries(result.thresholds as Record<string, number | null>)
                        .filter(([_, val]) => val !== null)
                        .reverse()
                        .slice(0, 4)
                        .map(([g, val]) => (
                          <span
                            key={g}
                            className={`text-[9px] font-bold px-2 py-1 rounded-md border transition-all ${
                              g === result.grade
                                ? "bg-accent border-accent text-foreground"
                                : "bg-foreground/5 border-foreground/10 text-foreground/50"
                            }`}
                          >
                            {g}: {val}+
                          </span>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2.5">
                  {Object.entries(result.thresholds as Record<string, number | null>)
                    .filter(([_, val]) => val !== null)
                    .map(([g, val]) => (
                      <div
                        key={g}
                        className={`p-3 rounded-2xl border transition-all duration-300 ${
                          g === result.grade
                            ? "bg-accent/10 border-accent/30"
                            : "bg-foreground/[0.02] border-foreground/10 hover:bg-foreground/[0.04]"
                        }`}
                      >
                        <p
                          className={`text-[10px] font-medium   mb-1 ${g === result.grade ? "text-accent" : "text-foreground/40"}`}
                        >
                          {g}
                        </p>
                        <p
                          className={`text-xs font-medium ${g === result.grade ? "text-foreground" : "text-foreground/60"}`}
                        >
                          {val}
                          {g === "F" ? "" : "+"}
                        </p>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </TranscriptBottomSheet>
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
  const [simulationMode, setSimulationMode] = useState(false);
  const [overriddenGrades, setOverriddenGrades] = useState({});
  const [hoveredHistoryIndex, setHoveredHistoryIndex] = useState(null);

  useEffect(() => {
    const parse = () => {
      try {
        const root = findFlexPageRoot(document);
        if (!root) {
          setTimeout(parse, 500);
          return;
        }

        const parsed = parseTranscriptPage(root, document);
        setAlerts(parsed.alerts);
        if (parsed.semesters.length > 0) {
          setSemesters(parsed.semesters);
          setActiveSemIdx(parsed.semesters.length - 1);
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
          section: c.section,
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
    if (semesters.length === 0) return { calculatedStats: null, originalCGPA: 0 };

    let cumulativeGradePoints = 0;
    let cumulativeCreditsForGPA = 0;
    const attemptedUniqueCredits = new Map();

    const passedUniqueCredits = new Map();
    const recordedPassedUniqueCredits = new Map();
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

        const recordedGrade = course.grade;
        const isRecordedCreditCourse =
          !course.type.toLowerCase().includes("non credit") &&
          recordedGrade !== "S" &&
          recordedGrade !== "U" &&
          GRADE_POINTS[recordedGrade] !== undefined;
        if (isRecordedCreditCourse && recordedGrade !== "F") {
          const courseCode = String(course.code || "")
            .trim()
            .toUpperCase();
          if (courseCode) {
            recordedPassedUniqueCredits.set(
              courseCode,
              Math.max(recordedPassedUniqueCredits.get(courseCode) || 0, course.crHrs),
            );
          }
        }

        const grade = overriddenGrades[key] || course.grade;
        const gp = GRADE_POINTS[grade];
        const isGraded = gp !== undefined;

        const isNonCredit =
          course.type.toLowerCase().includes("non credit") || grade === "S" || grade === "U";

        if (isNonCredit) return;

        semCreditsAttempted += course.crHrs;

        const courseCode = String(course.code || "")
          .trim()
          .toUpperCase();
        if (courseCode) attemptedUniqueCredits.set(courseCode, course.crHrs);

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
        tempPassedCredits.forEach((ch, code) => {
          passedUniqueCredits.set(code, Math.max(passedUniqueCredits.get(code) || 0, ch));
        });
      }

      const cgpa =
        cumulativeCreditsForGPA > 0 ? cumulativeGradePoints / cumulativeCreditsForGPA : 0;

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
    const totalRecordedCreditsEarned = Array.from(recordedPassedUniqueCredits.values()).reduce(
      (sum, ch) => sum + ch,
      0,
    );
    const totalCreditsAttempted = Array.from(attemptedUniqueCredits.values()).reduce(
      (sum, ch) => sum + ch,
      0,
    );
    const latestSemester = semesters[semesters.length - 1];
    const hasGradeOverrides = Object.keys(overriddenGrades).length > 0;

    const reportedCreditsEarned = Number(latestSemester?.summary.crEarned);
    const reportedCreditsAttempted = Number(latestSemester?.summary.crRegistered);
    const creditsEarned = Number.isFinite(reportedCreditsEarned)
      ? reportedCreditsEarned +
        (hasGradeOverrides ? totalCreditsEarned - totalRecordedCreditsEarned : 0)
      : totalCreditsEarned;
    const creditsAttempted = Number.isFinite(reportedCreditsAttempted)
      ? reportedCreditsAttempted
      : totalCreditsAttempted;

    return {
      calculatedStats: {
        history: semesterStats.filter((s) => !s.isEmptySemester),
        currentCGPA: lastNonEmptyCGPA,
        totalCreditsEarned: creditsEarned,
        totalCreditsAttempted: creditsAttempted,
        totalCreditsForGPA: cumulativeCreditsForGPA,
        actualSemestersCount: semesterStats.filter((s) => !s.isEmptySemester).length,
        actualCoursesCount: Array.from(courseStatsMap.keys()).length,
      },
      originalCGPA: semesters[semesters.length - 1].summary.cgpa,
    };
  }, [semesters, overriddenGrades]);

  const themeMode = usePreferencesStore((state) => state.themeMode);

  const chartData = useMemo(() => {
    if (!calculatedStats) return null;
    const lineColor = themeMode === "dark" ? "#ffffff" : "#230052";
    const createDataset = (label, data) => ({
      labels: calculatedStats.history.map((h) => h.title.split(" ")[0]),
      datasets: [
        {
          label,
          data,
          borderColor: lineColor,
          backgroundColor: "transparent",
          tension: 0,
          fill: false,
          pointBackgroundColor: lineColor,
          pointBorderWidth: 0,
          pointRadius: 1.5,
          pointHoverRadius: 5,
          borderWidth: 3,
        },
      ],
    });
    return {
      sgpa: createDataset(
        "SGPA",
        calculatedStats.history.map((h) => h.sgpa),
      ),
      cgpa: createDataset(
        "CGPA",
        calculatedStats.history.map((h) => h.cgpa),
      ),
    };
  }, [calculatedStats, themeMode]);

  const shownHistory =
    hoveredHistoryIndex == null
      ? calculatedStats?.history.at(-1)
      : calculatedStats?.history[hoveredHistoryIndex];
  const previousHistory =
    hoveredHistoryIndex == null
      ? calculatedStats?.history.at(-2)
      : calculatedStats?.history[hoveredHistoryIndex - 1];
  const sgpaDelta =
    shownHistory && previousHistory ? shownHistory.sgpa - previousHistory.sgpa : null;
  const cgpaDelta =
    shownHistory && previousHistory ? shownHistory.cgpa - previousHistory.cgpa : null;
  const valueRange = (values = []) => ({
    min: values.length ? Math.max(0, Math.min(...values) - 0.18) : 0,
    max: values.length ? Math.min(4, Math.max(...values) + 0.18) : 4,
  });
  const sgpaRange = valueRange(calculatedStats?.history.map((semester) => semester.sgpa));
  const cgpaRange = valueRange(calculatedStats?.history.map((semester) => semester.cgpa));

  const createChartOptions = ({
    min,
    max,
  }: {
    min: number;
    max: number;
  }): import("chart.js").ChartOptions<"line"> => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "nearest", intersect: false },
    onHover: (_event, activeElements) => {
      const nextIndex = activeElements.length ? activeElements[0].index : null;
      setHoveredHistoryIndex((current) => (current === nextIndex ? current : nextIndex));
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor:
          themeMode === "dark" ? "rgba(18, 18, 18, 0.9)" : "rgba(255, 255, 255, 0.9)",
        titleColor: themeMode === "dark" ? "#fff" : "#000",
        bodyColor: themeMode === "dark" ? "#fff" : "#000",
        titleFont: { size: 13, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 16,
        cornerRadius: 16,
        borderColor: themeMode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        min,
        max: max > min ? max : min + 0.7,
        ticks: { display: false },
        grid: { display: false },
        border: { display: false },
      },
      x: { ticks: { display: false }, grid: { display: false }, border: { display: false } },
    },
  });
  const sgpaChartOptions = createChartOptions(sgpaRange);
  const cgpaChartOptions = createChartOptions(cgpaRange);

  const handleGradeChange = (semTitle, courseCode, newGrade) => {
    setOverriddenGrades((prev) => ({
      ...prev,
      [`${semTitle}-${courseCode}`]: newGrade,
    }));
  };

  if (loading)
    return (
      <PageLayout currentPage={window.location.pathname} fullWidth>
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <PageSkeleton label="Loading transcript" cards={4} rows={6} />
        </div>
      </PageLayout>
    );

  return (
    <PageLayout currentPage={window.location.pathname} fullWidth>
      <div className="relative z-10 mx-auto w-full max-w-[1680px] space-y-3.5 px-4 pb-6 pt-2 sm:space-y-7 sm:px-6 sm:py-6 sm:pb-24 lg:px-8 lg:py-8">
        <header className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end sm:gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/85 sm:text-[10px] sm:tracking-[0.16em] sm:text-white/80">
              Academics
            </p>
            <h1 className="text-[28px] font-extrabold leading-[1.1] tracking-[-0.035em] text-white sm:text-4xl sm:font-bold sm:tracking-tight">
              Official Transcript
            </h1>
            <p className="text-xs font-medium leading-relaxed text-white/85 sm:text-sm">
              Four years of questionable decisions, beautifully documented.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlannerOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[#101027] transition-colors hover:bg-white/90 dark:bg-white/10 dark:text-white sm:gap-2 sm:bg-white/55 sm:px-4 sm:py-2.5 sm:text-[#230052]"
            >
              <Target size={14} />
              Strategic planner
            </button>
            <button
              type="button"
              onClick={() => setIsMCALookupOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[#101027] transition-colors hover:bg-white/90 dark:bg-white/10 dark:text-white sm:gap-2 sm:bg-white/55 sm:px-4 sm:py-2.5 sm:text-[#230052]"
            >
              <Scale size={14} />
              MCA lookup
            </button>
            <button
              type="button"
              onClick={() =>
                simulationMode
                  ? (setOverriddenGrades({}), setSimulationMode(false))
                  : setSimulationMode(true)
              }
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-colors sm:gap-2 sm:px-4 sm:py-2.5 ${simulationMode ? "bg-amber-500 text-white" : "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f] sm:bg-white/55 sm:text-[#230052]"}`}
              title={
                simulationMode ? "Exit simulation and restore grades" : "Enable grade simulation"
              }
            >
              <Zap size={14} fill={simulationMode ? "currentColor" : "none"} />
              {simulationMode ? "Simulating" : "Simulate"}
            </button>
          </div>
        </header>

        <NotificationBanner alerts={alerts} />

        <section aria-labelledby="transcript-overview-heading" className="space-y-2.5 sm:space-y-4">
          <div className="hidden flex-col gap-0.5 sm:flex sm:flex-row sm:items-end sm:justify-between sm:gap-1">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/80 sm:text-[10px]">
                Overview
              </p>
              <h2
                id="transcript-overview-heading"
                className="text-base font-bold tracking-tight text-white sm:text-xl"
              >
                Academic snapshot
              </h2>
            </div>
            <p className="text-[11px] text-white/75 sm:text-xs">
              Current GPA, cleared credits, and semester trends.
            </p>
          </div>
          <div className="sf-mobile-cards-scroll pb-1 scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-4 sm:pb-0 xl:grid-cols-4 xl:gap-5">
            <StatsCard
              icon={TrendingUp}
              label="Cumulative GPA"
              value={calculatedStats?.currentCGPA.toFixed(2) || "0.00"}
              subValue={simulationMode ? `(Was ${originalCGPA.toFixed(2)})` : "Current"}
              variant="dashboard"
            />
            <StatsCard
              icon={Award}
              label="Credits Cleared"
              value={calculatedStats?.totalCreditsEarned || "0"}
              subValue={`of ${calculatedStats?.totalCreditsAttempted || 0} attempted`}
              variant="dashboard"
            />
            <div
              className="sf-mobile-card-wide flex min-h-[132px] min-w-0 flex-col rounded-[22px] border border-black/[0.05] bg-white p-4 text-[#101027] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:min-h-[156px] sm:rounded-[32px] sm:p-6"
              onMouseLeave={() => setHoveredHistoryIndex(null)}
            >
              <p className="text-xs font-semibold text-[#667085] dark:text-[#c4cad6] sm:text-sm sm:font-semibold sm:text-[#40404a]">
                Semester GPA
              </p>
              <div className="mt-auto flex items-end justify-between gap-2 pt-2 sm:pt-0">
                <span className="text-[22px] font-bold leading-none tracking-[-0.035em] text-foreground sm:text-[28px]">
                  {shownHistory?.sgpa.toFixed(2) || "0.00"}
                </span>
                <span className="truncate text-right text-[11px] font-medium text-[#667085]">
                  {shownHistory?.title || ""}
                  {sgpaDelta != null && (
                    <>
                      {" "}
                      · {sgpaDelta >= 0 ? "+" : ""}
                      {sgpaDelta.toFixed(2)}
                    </>
                  )}
                </span>
              </div>
              <div className="mt-2 h-9 w-full sm:h-11">
                {chartData && <Line data={chartData.sgpa} options={sgpaChartOptions} />}
              </div>
            </div>
            <div
              className="sf-mobile-card-wide flex min-h-[132px] min-w-0 flex-col rounded-[22px] border border-black/[0.05] bg-white p-4 text-[#101027] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:min-h-[156px] sm:rounded-[32px] sm:p-6"
              onMouseLeave={() => setHoveredHistoryIndex(null)}
            >
              <p className="text-xs font-semibold text-[#667085] dark:text-[#c4cad6] sm:text-sm sm:font-semibold sm:text-[#40404a]">
                Cumulative GPA
              </p>
              <div className="mt-auto flex items-end justify-between gap-2 pt-2 sm:pt-0">
                <span className="text-[22px] font-bold leading-none tracking-[-0.035em] text-foreground sm:text-[28px]">
                  {shownHistory?.cgpa.toFixed(2) || "0.00"}
                </span>
                <span className="truncate text-right text-[11px] font-medium text-[#667085]">
                  {shownHistory?.title || ""}
                  {cgpaDelta != null && (
                    <>
                      {" "}
                      · {cgpaDelta >= 0 ? "+" : ""}
                      {cgpaDelta.toFixed(2)}
                    </>
                  )}
                </span>
              </div>
              <div className="mt-2 h-9 w-full sm:h-11">
                {chartData && <Line data={chartData.cgpa} options={cgpaChartOptions} />}
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="semester-report-heading" className="space-y-2.5 sm:space-y-4">
          <div className="hidden flex-col gap-0.5 sm:flex sm:flex-row sm:items-end sm:justify-between sm:gap-1">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/80 sm:text-[10px]">
                Academic record
              </p>
              <h2
                id="semester-report-heading"
                className="text-base font-bold tracking-tight text-white sm:text-xl"
              >
                Semester History
              </h2>
            </div>
            <p className="text-[11px] text-white/75 sm:text-xs">
              Every semester has a story. Some are horror stories.
            </p>
          </div>
          <div>
            <div className="flex flex-col gap-3.5 overflow-hidden rounded-[22px] border border-black/[0.05] bg-white p-4 text-[#101027] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:gap-5 sm:rounded-[24px] sm:p-6">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center sm:gap-4">
                <SuperTabs<number>
                  tabs={semesters.map((s, idx) => ({
                    value: idx,
                    label: s.title,
                  }))}
                  activeTab={activeSemIdx}
                  onTabChange={setActiveSemIdx}
                  size="sm"
                  className="!border-0 !bg-slate-100 dark:!bg-white/[.06]"
                />
              </div>

              {activeSemData && (
                <div className="space-y-3.5 sm:space-y-5">
                  <div className="flex flex-col justify-between gap-3.5 border-b border-slate-100 pb-3.5 dark:border-white/10 sm:gap-5 sm:pb-5 md:flex-row md:items-end">
                    <div className="space-y-0.5 sm:space-y-1">
                      <h2 className="text-base font-bold tracking-[-0.02em] text-foreground sm:text-3xl">
                        {activeSemData.title}
                      </h2>
                      <p className="text-[11px] font-medium text-foreground/55 sm:text-xs">
                        Semester Detail Report
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-x-12 sm:gap-y-6 lg:gap-x-16">
                      <div className="flex flex-col items-start sm:min-w-[70px] sm:items-end sm:text-right">
                        <span className="mb-1 rounded bg-tertiary px-1.5 py-0.5 text-[9px] font-bold tracking-[0px] text-foreground/40 sm:mb-2 sm:px-2 sm:text-[10px]">
                          Attemp.
                        </span>
                        <span className="font-sans text-lg font-bold text-foreground sm:text-3xl">
                          {activeSemData.courses.reduce((acc, c) => {
                            const grade =
                              overriddenGrades[`${activeSemData.title}-${c.code}`] || c.grade;
                            const isNonCredit =
                              c.type.toLowerCase().includes("non credit") ||
                              grade === "S" ||
                              grade === "U";
                            return isNonCredit ? acc : acc + c.crHrs;
                          }, 0)}
                        </span>
                      </div>
                      <div className="flex flex-col items-start sm:min-w-[70px] sm:items-end sm:text-right">
                        <span className="mb-1 rounded bg-tertiary px-1.5 py-0.5 text-[9px] font-bold tracking-[0px] text-foreground/40 sm:mb-2 sm:px-2 sm:text-[10px]">
                          Earned
                        </span>
                        <span className="font-sans text-lg font-bold text-accent sm:text-3xl">
                          {activeSemIdx === semesters.length - 1 &&
                          !overriddenGrades[
                            Object.keys(overriddenGrades).find((k) =>
                              k.startsWith(activeSemData.title),
                            )
                          ]
                            ? "0"
                            : calculatedStats?.history.find((h) => h.title === activeSemData.title)
                                ?.earned || 0}
                        </span>
                      </div>
                      <div className="flex flex-col items-start sm:min-w-[70px] sm:items-end sm:text-right">
                        <span className="mb-1 rounded bg-tertiary px-1.5 py-0.5 text-[9px] font-bold tracking-[0px] text-foreground/40 sm:mb-2 sm:px-2 sm:text-[10px]">
                          SGPA
                        </span>
                        <span className="font-sans text-lg font-bold text-accent sm:text-3xl">
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
                      <div className="flex flex-col items-start sm:min-w-[70px] sm:items-end sm:text-right">
                        <span className="mb-1 rounded bg-tertiary px-1.5 py-0.5 text-[9px] font-bold tracking-[0px] text-foreground/40 sm:mb-2 sm:px-2 sm:text-[10px]">
                          CGPA
                        </span>
                        <span className="font-sans text-lg font-bold text-foreground sm:text-3xl">
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

                  {/* Mobile Native App Course List */}
                  <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08] sm:hidden">
                    {activeSemData.courses.map((course, idx) => {
                      const currentGrade =
                        overriddenGrades[`${activeSemData.title}-${course.code}`] || course.grade;
                      const isSimulated =
                        !!overriddenGrades[`${activeSemData.title}-${course.code}`];
                      const pts = isSimulated
                        ? ((GRADE_POINTS[currentGrade] || 0) * course.crHrs).toFixed(1)
                        : course.points.toFixed(2);

                      return (
                        <div key={idx} className="flex items-center justify-between gap-3 py-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-white sm:text-sm">
                              {course.description}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-[#667085] dark:text-slate-400">
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-white/10 dark:text-white">
                                {course.code}
                              </span>
                              <span>·</span>
                              <span>{course.crHrs} Cr.H</span>
                              {course.section && (
                                <>
                                  <span>·</span>
                                  <span>Sec {course.section}</span>
                                </>
                              )}
                              {course.mca && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedMCA(course.mca);
                                    setIsMCALookupOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 rounded bg-[#230052]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#230052] dark:bg-white/15 dark:text-white"
                                >
                                  MCA {course.mca}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2.5 text-right">
                            {simulationMode ? (
                              <GradeSelector
                                value={currentGrade}
                                grades={Object.keys(GRADE_POINTS).concat(["I", "S", "U", "W"])}
                                onChange={(grade) =>
                                  handleGradeChange(activeSemData.title, course.code, grade)
                                }
                              />
                            ) : (
                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                                  currentGrade.startsWith("A")
                                    ? "border-accent/20 bg-accent/10 text-accent"
                                    : currentGrade.startsWith("B")
                                      ? "border-blue-500/20 bg-blue-500/10 text-blue-500"
                                      : currentGrade.startsWith("C")
                                        ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                                        : currentGrade === "F"
                                          ? "border-rose-500/20 bg-rose-500/10 text-rose-500"
                                          : "border-transparent bg-tertiary text-foreground/60"
                                }`}
                              >
                                {currentGrade}
                              </span>
                            )}
                            <span
                              className={`min-w-[38px] text-xs font-bold ${
                                isSimulated ? "text-accent" : "text-[#667085] dark:text-slate-400"
                              }`}
                            >
                              {pts}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table */}
                  <div className="-mx-2 hidden overflow-x-auto scrollbar-hide sm:block">
                    <table className="sf-data-table w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-foreground/[0.02]">
                          <th className="px-6 py-4 text-[11px] font-bold text-foreground/50   border-b border-foreground/10">
                            Code
                          </th>
                          <th className="px-6 py-4 text-[11px] font-bold text-foreground/50   border-b border-foreground/10">
                            Course Name
                          </th>
                          <th className="px-6 py-4 text-[11px] font-bold text-foreground/50   border-b border-foreground/10 text-center">
                            Section
                          </th>
                          <th className="px-6 py-4 text-[11px] font-bold text-foreground/50   border-b border-foreground/10 text-center">
                            Cr.H
                          </th>
                          <th className="px-6 py-4 text-[11px] font-bold text-foreground/50   border-b border-foreground/10 text-center">
                            Grade
                          </th>
                          <th className="px-6 py-4 text-[11px] font-bold text-foreground/50   border-b border-foreground/10 text-center">
                            Type
                          </th>
                          <th className="px-8 py-4 text-[11px] font-bold text-foreground/50   border-b border-foreground/10 text-right">
                            Points
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeSemData.courses.map((course, idx) => {
                          const currentGrade =
                            overriddenGrades[`${activeSemData.title}-${course.code}`] ||
                            course.grade;
                          const isSimulated =
                            !!overriddenGrades[`${activeSemData.title}-${course.code}`];

                          return (
                            <tr
                              key={idx}
                              className={`group transition-all duration-300 border-b border-foreground/10 last:border-0 hover:bg-foreground/[0.03]`}
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
                                              "X-Requested-With": "XMLHttpRequest",
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
                                        console.error("Grade Scheme Fetch Error:", e);
                                      }

                                      if (typeof window.fn_StdGradeSchemeDetail === "function") {
                                        window.fn_StdGradeSchemeDetail(course.schemeDetailId);
                                      }

                                      const modal =
                                        document.querySelector<HTMLElement>("#GradePolicyDetail");
                                      if (modal) {
                                        modal.style.zIndex = "9999";
                                        const $ = window.jQuery || window.$;
                                        if ($ && typeof $.fn.modal === "function") {
                                          $(modal).modal("show");
                                        } else {
                                          modal.style.display = "block";
                                          modal.classList.add("show");
                                          modal.style.backgroundColor = "#00000080";
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
                                  className={`text-xs font-bold px-2.5 py-1 bg-foreground/5 rounded-lg transition-all ${
                                    course.schemeDetailId
                                      ? "text-accent hover:bg-accent/20 cursor-pointer"
                                      : "text-foreground group-hover:bg-foreground/10"
                                  }`}
                                >
                                  {course.code}
                                </button>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-0.5">
                                  <p className="text-sm font-bold text-foreground leading-tight">
                                    {course.description}
                                  </p>
                                  {course.mca && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <button
                                        onClick={() => {
                                          setSelectedMCA(course.mca);
                                          setIsMCALookupOpen(true);
                                        }}
                                        className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded flex items-center gap-1 hover:bg-accent/20 transition-colors"
                                      >
                                        <TrendingUp size={10} />
                                        MCA: {course.mca}
                                      </button>
                                      {course.gradingScheme && (
                                        <span className="text-[10px] font-bold text-foreground/50">
                                          {course.gradingScheme}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="text-xs font-bold text-foreground/50">
                                  {course.section}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="text-sm font-medium text-foreground/60 group-hover:text-foreground transition-colors">
                                  {course.crHrs}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {simulationMode ? (
                                  <GradeSelector
                                    value={currentGrade}
                                    grades={Object.keys(GRADE_POINTS).concat(["I", "S", "U", "W"])}
                                    onChange={(grade) =>
                                      handleGradeChange(activeSemData.title, course.code, grade)
                                    }
                                  />
                                ) : (
                                  <div className="flex justify-center">
                                    <span
                                      className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                                        currentGrade.startsWith("A")
                                          ? "bg-accent/10 text-accent border-accent/20"
                                          : currentGrade.startsWith("B")
                                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                            : currentGrade.startsWith("C")
                                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                              : currentGrade === "F"
                                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                                : "bg-tertiary text-foreground/50 border-transparent"
                                      }`}
                                    >
                                      {currentGrade}
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="text-[10px] font-bold text-foreground/50 tracking-[0px] bg-foreground/5 px-2 py-0.5 rounded">
                                  {course.type}
                                </span>
                              </td>
                              <td className="px-8 py-4 text-right">
                                <span
                                  className={`text-sm font-bold font-sans ${isSimulated ? "text-accent" : "text-foreground/70"}`}
                                >
                                  {isSimulated
                                    ? ((GRADE_POINTS[currentGrade] || 0) * course.crHrs).toFixed(1)
                                    : course.points.toFixed(2)}
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
        </section>
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
