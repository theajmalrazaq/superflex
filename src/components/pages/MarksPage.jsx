import { useEffect, useState, useRef } from "react";
import LoadingOverlay, { LoadingSpinner } from "../LoadingOverlay";
import PageLayout from "../layouts/PageLayout";
import {
  ChevronDown,
  AlertCircle,
  BookOpen,
  Bookmark,
  Layers,
  AlertTriangle,
  Award,
  Activity,
  BarChart2,
  Settings,
  X,
  RotateCcw,
} from "lucide-react";
import NotificationBanner from "../NotificationBanner";
import PageHeader from "../PageHeader";
import StatsCard from "../StatsCard";
import SuperTabs from "../SuperTabs";

const parseFloatOrZero = (value) => {
  if (!value || value === "-" || value.trim() === "") return 0;

  const cleaned = value.toString().replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

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

  if (!selectedCourse) return null;

  return (
    <div className="relative w-full md:w-auto z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:w-[350px] flex items-center justify-between px-3 py-2 rounded-[2rem] bg-zinc-900/50 border border-white/5 text-white hover:bg-white/5 transition-all group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 rounded-xl bg-[#a098ff]/10 text-[#a098ff]">
            <BookOpen size={16} />
          </div>
          <div className="flex flex-col items-start truncate">
            <span className="text-sm font-bold truncate w-full text-left leading-none">
              {selectedCourse.title}
            </span>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-black/50 backdrop-blur-2xl border border-white/10  max-h-[60vh] overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-200 z-[60]">
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
                    ? "bg-[#a098ff]/10 border border-[#a098ff]/20"
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
                {course.grandTotalStats && (
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      (course.grandTotalStats.percentage || 0) >= 80
                        ? "bg-emerald-500/20 text-emerald-400"
                        : (course.grandTotalStats.percentage || 0) >= 60
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {(course.grandTotalStats.percentage || 0).toFixed(0)}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SectionSelector = ({ sections, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedSection =
    sections.find((s) => s.id === selectedId) || sections[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!selectedSection) return null;

  return (
    <div className="relative w-full md:w-auto z-40" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:w-[280px] flex items-center justify-between px-3 py-2 rounded-[2rem] bg-zinc-900/50 border border-white/5 text-white hover:bg-white/5 transition-all group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 rounded-xl bg-[#a098ff]/10 text-[#a098ff]">
            <Layers size={16} />
          </div>
          <div className="flex flex-col items-start truncate">
            <span className="text-sm font-bold truncate w-full text-left leading-none">
              {selectedSection.title}
            </span>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-black/50 backdrop-blur-2xl border border-white/10  max-h-[60vh] overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-200 z-[60]">
          <div className="flex flex-col gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  onSelect(section.id);
                  setIsOpen(false);
                }}
                className={`w-full flex bg-zinc-900 items-center justify-between p-3 rounded-xl transition-all ${
                  selectedId === section.id
                    ? "bg-[#a098ff]/10 text-white border border-[#a098ff]/20"
                    : "text-zinc-400 hover:bg-white/5 border border-transparent hover:text-white"
                }`}
              >
                <span className="text-sm font-medium truncate">
                  {section.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const BookmarksMenu = ({ markedItems, courses, onNavigate }) => {
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
  if (markedItems.size > 0 && courses.length > 0) {
    courses.forEach((course) => {
      course.sections.forEach((section) => {
        section.rows.forEach((row) => {
          const uniqueId = `${course.id}-${section.id}-${row.title}`;
          if (markedItems.has(uniqueId)) {
            bookmarkedDetails.push({
              uniqueId,
              courseTitle: course.title,
              sectionTitle: section.title,
              rowTitle: row.title,
              obtained: row.obtained,
              total: row.total,
              courseId: course.id,
              sectionId: section.id,
            });
          }
        });
      });
    });
  }

  return (
    <div className="relative z-[900]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full border transition-all ${
          isOpen
            ? "bg-[#a098ff]/20 text-[#a098ff] border-[#a098ff]/20"
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
        <div className="absolute top-full right-0 mt-2 w-96 md:w-[500px] bg-[#111] backdrop-blur-xl border border-white/10 rounded-2xl  overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                  Click the bookmark icon on any assessment item to save it
                  here.
                </p>
              </div>
            ) : (
              bookmarkedDetails.map((item) => (
                <button
                  key={item.uniqueId}
                  onClick={() => {
                    onNavigate(item.courseId, item.sectionId);
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-bold text-sm text-white group-hover:text-[#a098ff] transition-colors truncate w-full pr-2">
                      {item.rowTitle}
                    </div>
                    <span
                      className={`text-xs font-bold whitespace-nowrap ${
                        (item.obtained / item.total) * 100 >= 80
                          ? "text-emerald-400"
                          : (item.obtained / item.total) * 100 >= 60
                            ? "text-amber-400"
                            : "text-rose-400"
                      }`}
                    >
                      {item.obtained} / {item.total}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                    <span className="truncate max-w-[120px]">
                      {item.courseTitle}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                    <span className="truncate">{item.sectionTitle}</span>
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

const BestOfModal = ({ isOpen, onClose, onApply, itemCount }) => {
  const [count, setCount] = useState(4);
  const [totalWeight, setTotalWeight] = useState(20);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#161616] border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#a098ff]/10 text-[#a098ff]">
              <Settings size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">Best Of Calculator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
              Number of Best Items
            </label>
            <div className="relative">
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                max={itemCount}
                min={1}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#a098ff] transition-all text-xl font-bold"
                placeholder="e.g. 4"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">
                out of {itemCount}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
              Total Weightage (%)
            </label>
            <input
              type="number"
              value={totalWeight}
              onChange={(e) => setTotalWeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#a098ff] transition-all text-xl font-bold"
              placeholder="e.g. 20"
            />
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
            <AlertCircle className="text-amber-400 shrink-0" size={18} />
            <p className="text-xs text-amber-200/70 leading-relaxed">
              This will automatically pick the highest scoring {count} items and
              assign them an equal portion of the {totalWeight}% total
              weightage.
            </p>
          </div>

          <button
            onClick={() => onApply(count, totalWeight)}
            className="w-full bg-[#a098ff] hover:bg-[#a098ff]/90 text-white font-bold py-4 rounded-2xl transition-all"
          >
            Apply Calculation
          </button>
        </div>
      </div>
    </div>
  );
};

const AssessmentView = ({
  section,
  onUpdate,
  markedItems,
  onToggleMark,
  courseId,
  onBestOf,
  onReset,
}) => {
  const [isBestOfOpen, setIsBestOfOpen] = useState(false);
  const isGrandTotal = section.title.includes("Grand Total");
  const isBestOfEligible =
    section.title.toLowerCase().includes("quiz") ||
    section.title.toLowerCase().includes("assignment") ||
    section.title.toLowerCase().includes("lab");
  const obtained = section.obtained || 0;
  const weight = section.weight || 0;
  const percentage = weight > 0 ? (obtained / weight) * 100 : 0;

  const statusColor =
    percentage >= 80
      ? "text-emerald-400"
      : percentage >= 60
        ? "text-amber-400"
        : "text-rose-400";

  const statusBg =
    percentage >= 80
      ? "bg-emerald-500/10"
      : percentage >= 60
        ? "bg-amber-500/10"
        : "bg-rose-500/10";

  const borderColor =
    percentage >= 80
      ? "border-emerald-500/20"
      : percentage >= 60
        ? "border-amber-500/20"
        : "border-rose-500/20";

  return (
    <div
      className={`group rounded-[2rem] border transition-all duration-300 overflow-hidden ${
        isGrandTotal
          ? "bg-[#111] border-[#a098ff]/30 "
          : "bg-[#161616] border-white/5"
      }`}
    >
      <div className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-white/5">
          {}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h3 className={`text-xl font-bold text-white`}>
                {section.title}
              </h3>
              {isGrandTotal && (
                <span className="px-2 py-0.5 rounded-md bg-[#a098ff]/20 text-[#a098ff] text-[10px] font-bold uppercase tracking-wider">
                  Final
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-zinc-500">
              {section.rows?.length || 0} items &bull; Breakdown & Statistics
            </p>
          </div>

          {isBestOfEligible && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBestOfOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#a098ff]/10 text-[#a098ff] border border-[#a098ff]/20 hover:bg-[#a098ff]/20 transition-all font-bold text-sm"
              >
                <Settings size={16} />
                Best Of
              </button>
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 border border-white/5 hover:bg-zinc-700 hover:text-white transition-all font-bold text-sm"
                title="Reset to original scores"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
          )}

          <BestOfModal
            isOpen={isBestOfOpen}
            onClose={() => setIsBestOfOpen(false)}
            itemCount={section.rows.filter((r) => r.title !== "Total").length}
            onApply={(count, weight) => {
              onBestOf(count, weight);
              setIsBestOfOpen(false);
            }}
          />
        </div>

        {}
        <div className="flex flex-wrap items-center gap-4 p-6 border-b border-white/5">
          <StatsCard
            icon={Layers}
            label="Weight"
            value={weight.toFixed(2)}
            delay={100}
            className="!p-4 !rounded-2xl !min-w-[150px] !gap-2"
          />
          <StatsCard
            icon={Award}
            label="Obtained"
            value={obtained.toFixed(2)}
            delay={200}
            className={`!p-4 !rounded-2xl !min-w-[150px] !gap-2 ${statusBg} ${borderColor}`}
          />
        </div>
        <div className="p-6">
          <div className="w-full overflow-x-auto rounded-xl border border-white/5 scrollbar-hide bg-black/20">
            <table className="w-full text-sm text-left border-collapse scrollbar-hide">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 backdrop-blur-md">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider sticky top-0 bg-[#161616]/90 z-20">
                    Item Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-center sticky top-0 bg-[#161616]/90 z-20">
                    Weightage
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-center sticky top-0 bg-[#161616]/90 z-20">
                    Total Marks
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-center sticky top-0 bg-[#161616]/90 z-20">
                    Obtained
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-center sticky top-0 bg-[#161616]/90 z-20">
                    Avg
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-center sticky top-0 bg-[#161616]/90 z-20">
                    Std Dev
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-center sticky top-0 bg-[#161616]/90 z-20">
                    Min
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-wider text-center sticky top-0 bg-[#161616]/90 z-20">
                    Max
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {section.rows
                  .filter((r) => r.title !== "Total")
                  .map((row, idx) => {
                    const uniqueId = `${courseId}-${section.id}-${row.title}`;
                    const isMarked = markedItems?.has(uniqueId);

                    return (
                      <tr
                        key={idx}
                        className={`group transition-all duration-300 border-b border-white/5 ${
                          !row.included ? "opacity-40 grayscale-[0.8]" : ""
                        } ${
                          isMarked
                            ? "bg-[#a098ff]/10"
                            : "hover:bg-white/5 border-white/5"
                        }`}
                      >
                        <td className="px-6 py-4 font-medium text-white/90">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => onToggleMark?.(uniqueId)}
                              className={`p-1.5 rounded-full shrink-0 transition-all border ${
                                isMarked
                                  ? "bg-[#a098ff]/20 text-[#a098ff] border-[#a098ff]/30"
                                  : "bg-zinc-900/50 text-zinc-600 border-white/5 hover:text-zinc-400 hover:bg-white/10"
                              }`}
                            >
                              <Bookmark
                                size={16}
                                fill={isMarked ? "currentColor" : "none"}
                              />
                            </button>
                            <div className="flex items-center gap-2">
                              {row.included ? (
                                <div className="w-1.5 h-1.5 rounded-full bg-[#a098ff]"></div>
                              ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                              )}
                              {row.title}
                              {!row.included && (
                                <span className="ml-2 text-[9px] font-bold bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase">
                                  Dropped
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-zinc-400">
                          <input
                            type="text"
                            value={row.weight}
                            onChange={(e) =>
                              onUpdate(idx, "weight", e.target.value)
                            }
                            className="bg-transparent text-center w-16 focus:outline-none focus:border focus:border-[#a098ff] hover:bg-white/5 rounded transition-colors"
                          />
                        </td>
                        <td className="px-6 py-4 text-center text-zinc-400">
                          {row.total.toFixed(1)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="text"
                            value={row.obtained !== null ? row.obtained : ""}
                            onChange={(e) =>
                              onUpdate(idx, "obtained", e.target.value)
                            }
                            className={`font-bold text-base text-center w-16 bg-transparent focus:outline-none focus:border focus:border-[#a098ff] hover:bg-white/5 rounded transition-colors ${
                              (row.obtained / row.total) * 100 >= 80
                                ? "text-emerald-400"
                                : (row.obtained / row.total) * 100 >= 60
                                  ? "text-amber-400"
                                  : "text-rose-400"
                            }`}
                          />
                        </td>
                        <td className="px-6 py-4 text-center text-zinc-500">
                          ~{row.avg.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center text-zinc-500">
                          ~{row.stdDev.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center text-zinc-500">
                          {row.min.toFixed(1)}
                        </td>
                        <td className="px-6 py-4 text-center text-zinc-500">
                          {row.max.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
              <tfoot className="bg-[#1c1c1c]/50 border-t-2 border-white/10 font-bold backdrop-blur-sm">
                <tr>
                  <td className="px-6 py-5 text-white">Total Summary</td>
                  <td className="px-6 py-5 text-center text-white">
                    {weight.toFixed(2)}
                  </td>
                  <td className="px-6 py-5 text-center">-</td>
                  <td className="px-6 py-5 text-center text-[#a098ff] text-lg">
                    {obtained.toFixed(2)}
                  </td>
                  <td className="px-6 py-5 text-center text-zinc-400">
                    ~{section.stats.weightedAvg.toFixed(2)}
                  </td>
                  <td className="px-6 py-5 text-center text-zinc-400">
                    ~{section.stats.weightedStdDev.toFixed(2)}
                  </td>
                  <td className="px-6 py-5 text-center text-zinc-400 text-xs">
                    ~{section.stats.weightedMin.toFixed(2)}
                  </td>
                  <td className="px-6 py-5 text-center text-zinc-400 text-xs">
                    ~{section.stats.weightedMax.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const recalculateCourse = (course) => {
  let globalWeightage = 0;
  let globalObtained = 0;

  let globalAverage = 0;
  let globalMinimum = 0;
  let globalMaximum = 0;
  let globalStdDev = 0;

  const sectionsExceptTotal = course.sections.filter(
    (s) => s.title !== "Grand Total Marks",
  );

  const newSections = sectionsExceptTotal.map((section) => {
    let rows = [...section.rows];

    const secWeight = rows.reduce((sum, r) => {
      const val = parseFloat(r.weight);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    rows = rows.map((r) => {
      const rawObt = parseFloat(r.obtained);
      const obt = isNaN(rawObt) ? 0 : rawObt;

      const rawTot = parseFloat(r.total);
      const tot = isNaN(rawTot) ? 0 : rawTot;

      const rawW = parseFloat(r.weight);
      const w = isNaN(rawW) ? 0 : rawW;

      const weightedScore = tot > 0 ? (obt / tot) * w : 0;
      return { ...r, _weightedScore: weightedScore };
    });

    const sorted = rows.map((r, i) => ({ ...r, originalIdx: i }));
    sorted.sort((a, b) => b._weightedScore - a._weightedScore);

    let currentAccWeight = 0;
    const includedIndices = new Set();

    for (let item of sorted) {
      const rawW = parseFloat(item.weight);
      const w = isNaN(rawW) ? 0 : rawW;

      if (currentAccWeight < secWeight - 0.001) {
        currentAccWeight += w;
        includedIndices.add(item.originalIdx);
      }
    }

    rows = rows.map((r, i) => {
      const { _weightedScore, ...rest } = r;
      return { ...rest, included: includedIndices.has(i) };
    });

    let calculatedSecObtained = 0;

    rows.forEach((r) => {
      if (r.included) {
        const rawObt = parseFloat(r.obtained);
        const obt = isNaN(rawObt) ? 0 : rawObt;

        const rawTot = parseFloat(r.total);
        const tot = isNaN(rawTot) ? 0 : rawTot;

        const rawW = parseFloat(r.weight);
        const w = isNaN(rawW) ? 0 : rawW;

        if (tot > 0) {
          calculatedSecObtained += (obt / tot) * w;
        }
      }
    });

    if (secWeight > 0) {
      globalWeightage += secWeight;
      globalObtained += calculatedSecObtained;
    }

    let secWeightedAvg = 0,
      secWeightedMin = 0,
      secWeightedMax = 0,
      secWeightedStd = 0;

    rows.forEach((r) => {
      const rawW = parseFloat(r.weight);
      const w = isNaN(rawW) ? 0 : rawW;

      const rawTot = parseFloat(r.total);
      const tot = isNaN(rawTot) ? 0 : rawTot;

      if (r.included && tot > 0 && secWeight > 0) {
        const ratio = w / tot;
        secWeightedAvg += (r.avg || 0) * ratio;
        secWeightedMin += (r.min || 0) * ratio;
        secWeightedMax += (r.max || 0) * ratio;
        secWeightedStd += (r.stdDev || 0) * ratio;

        globalAverage += (r.avg || 0) * ratio;
        globalMinimum += (r.min || 0) * ratio;
        globalMaximum += (r.max || 0) * ratio;
        globalStdDev += (r.stdDev || 0) * ratio;
      }
    });

    return {
      ...section,
      weight: secWeight,
      obtained: calculatedSecObtained,
      rows,
      stats: {
        weightedAvg: secWeightedAvg,
        weightedStdDev: secWeightedStd,
        weightedMin: secWeightedMin,
        weightedMax: secWeightedMax,
      },
    };
  });

  const grandTotalSection = {
    id: `${course.id}-Grand_Total_Marks`,
    title: "Grand Total Marks",
    weight: globalWeightage,
    obtained: globalObtained,
    rows: [],
    stats: {
      weightedAvg: globalAverage,
      weightedStdDev: globalStdDev,
      weightedMin: globalMinimum,
      weightedMax: globalMaximum,
    },
  };

  newSections.push(grandTotalSection);

  return {
    ...course,
    sections: newSections,
    grandTotalStats: {
      weight: globalWeightage,
      obtained: globalObtained,
      percentage:
        globalWeightage > 0 ? (globalObtained / globalWeightage) * 100 : 0,
    },
  };
};

function MarksPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const hiddenFormRef = useRef(null);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const initialCoursesRef = useRef([]);

  const [markedItems, setMarkedItems] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("superflex_marked_marks");
      try {
        return new Set(saved ? JSON.parse(saved) : []);
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem(
      "superflex_marked_marks",
      JSON.stringify([...markedItems]),
    );
  }, [markedItems]);

  const handleToggleMark = (id) => {
    const newSet = new Set(markedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setMarkedItems(newSet);
  };

  useEffect(() => {
    const parseData = () => {
      try {
        const root = document.querySelector(
          ".m-grid.m-grid--hor.m-grid--root.m-page",
        );
        if (!root) return;

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

        const legacyForm = document.querySelector(
          'form[action="/Student/StudentMarks"]',
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
              hiddenFormRef.current.appendChild(legacyForm.cloneNode(true));
            }
          }
        }

        const parsedCourses = [];
        const tabPanes = root.querySelectorAll(".tab-pane");

        tabPanes.forEach((pane) => {
          let courseTitle =
            pane.querySelector("h5")?.textContent.trim() || pane.id;
          courseTitle = courseTitle.replace(/\(.*\)/, "").trim();

          const sections = [];

          let globalWeightage = 0;
          let globalObtained = 0;
          let globalAverage = 0;
          let globalMinimum = 0;
          let globalMaximum = 0;
          let globalStdDev = 0;

          const allCourseDivs = Array.from(
            pane.querySelectorAll(`div[id^="${pane.id}"]`),
          );

          allCourseDivs.forEach((secDiv) => {
            const secId = secDiv.id;
            const isGrandTotal = secId.endsWith("Grand_Total_Marks");

            if (isGrandTotal) return;

            const secTitleBtn =
              secDiv.previousElementSibling?.querySelector(".btn-link") ||
              secDiv.querySelector(".card-header button");
            let secTitle = secTitleBtn?.textContent.trim();
            if (!secTitle)
              secTitle = secId.replace(pane.id + "-", "").replace(/_/g, " ");

            const rowsData = [];
            const calcRows = secDiv.querySelectorAll(".calculationrow");

            calcRows.forEach((row) => {
              const weight = parseFloatOrZero(
                row.querySelector(".weightage")?.textContent,
              );
              const grandTotal = parseFloatOrZero(
                row.querySelector(".GrandTotal")?.textContent,
              );
              const obtMarks = parseFloatOrZero(
                row.querySelector(".ObtMarks")?.textContent,
              );
              const avg = parseFloatOrZero(
                row.querySelector(".AverageMarks")?.textContent,
              );
              const min = parseFloatOrZero(
                row.querySelector(".MinMarks")?.textContent,
              );
              const max = parseFloatOrZero(
                row.querySelector(".MaxMarks")?.textContent,
              );
              let stdDev = parseFloatOrZero(
                row.querySelector(".StdDev")?.textContent,
              );

              if (stdDev === 0 && (max > 0 || min > 0)) {
                stdDev = (max - min) / 4;
              }

              rowsData.push({
                title: row.querySelector("td:first-child")?.textContent.trim(),
                weight,
                obtained: obtMarks,
                total: grandTotal,
                avg,
                stdDev,
                min,
                max,
                included: true,
              });
            });

            let secWeight = 0,
              secObtained = 0;

            const totalRows = secDiv.querySelectorAll(
              "[class*='totalColumn_']",
            );
            let footerRow = null;
            if (totalRows.length > 0) {
              footerRow = totalRows[totalRows.length - 1];
            } else {
              footerRow = secDiv.querySelector("tfoot tr");
            }

            if (footerRow) {
              secWeight = parseFloatOrZero(
                footerRow.querySelector(".totalColweightage")?.textContent,
              );
              secObtained = parseFloatOrZero(
                footerRow.querySelector(".totalColObtMarks")?.textContent,
              );
            } else {
              secWeight = rowsData.reduce((acc, r) => acc + r.weight, 0);
              secObtained = rowsData.reduce((acc, r) => acc + r.obtained, 0);
            }

            const includeInStats = secWeight > 0;

            if (includeInStats) {
              let currentAccWeight = 0;

              const sorted = [...rowsData].map((r, i) => ({
                ...r,
                originalIdx: i,
              }));
              sorted.sort((a, b) => b.obtained - a.obtained);

              const includedIndices = new Set();
              for (let item of sorted) {
                if (currentAccWeight < secWeight) {
                  currentAccWeight += item.weight;
                  includedIndices.add(item.originalIdx);
                }
              }

              rowsData.forEach((r, i) => {
                r.included = includedIndices.has(i);
              });

              globalWeightage += secWeight;
              globalObtained += secObtained;
            }

            let secWeightedAvg = 0,
              secWeightedMin = 0,
              secWeightedMax = 0,
              secWeightedStd = 0;

            rowsData.forEach((r) => {
              if (r.included && r.total > 0 && includeInStats) {
                const ratio = r.weight / r.total;
                secWeightedAvg += r.avg * ratio;
                secWeightedMin += r.min * ratio;
                secWeightedMax += r.max * ratio;
                secWeightedStd += r.stdDev * ratio;

                globalAverage += r.avg * ratio;
                globalMinimum += r.min * ratio;
                globalMaximum += r.max * ratio;
                globalStdDev += r.stdDev * ratio;
              }
            });

            sections.push({
              id: secId,
              title: secTitle,
              weight: secWeight,
              obtained: secObtained,
              rows: rowsData,
              stats: {
                weightedAvg: secWeightedAvg,
                weightedStdDev: secWeightedStd,
                weightedMin: secWeightedMin,
                weightedMax: secWeightedMax,
              },
            });
          });

          const courseGrandTotalStats = {
            weight: globalWeightage,
            obtained: globalObtained,
            percentage:
              globalWeightage > 0
                ? (globalObtained / globalWeightage) * 100
                : 0,
          };

          sections.push({
            id: `${pane.id}-Grand_Total_Marks`,
            title: "Grand Total Marks",
            weight: globalWeightage,
            obtained: globalObtained,
            rows: [],

            stats: {
              weightedAvg: globalAverage,
              weightedStdDev: globalStdDev,
              weightedMin: globalMinimum,
              weightedMax: globalMaximum,
            },
          });

          parsedCourses.push({
            id: pane.id,
            title: courseTitle,
            sections,
            grandTotalStats: courseGrandTotalStats,
          });
        });

        setCourses(parsedCourses);
        initialCoursesRef.current = JSON.parse(JSON.stringify(parsedCourses));
        if (parsedCourses.length > 0) {
          const firstId = parsedCourses[0].id;
          setSelectedCourseId(firstId);

          if (parsedCourses[0].sections.length > 0) {
            setActiveSectionId(parsedCourses[0].sections[0].id);
          }
        }

        root.style.display = "none";
        setLoading(false);
      } catch (e) {
        console.error("Marks Parse Error", e);
        setLoading(false);
      }
    };

    setTimeout(parseData, 200);
  }, []);

  const handleRowUpdate = (sectionId, rowIndex, field, value) => {
    if (!selectedCourseId) return;

    setCourses((prevCourses) => {
      const courseIdx = prevCourses.findIndex((c) => c.id === selectedCourseId);
      if (courseIdx === -1) return prevCourses;

      const course = prevCourses[courseIdx];
      const sectionIdx = course.sections.findIndex((s) => s.id === sectionId);
      if (sectionIdx === -1) return prevCourses;

      const section = course.sections[sectionIdx];
      const newRows = [...section.rows];

      newRows[rowIndex] = {
        ...newRows[rowIndex],
        [field]: value,
      };

      const updatedSections = [...course.sections];
      updatedSections[sectionIdx] = {
        ...section,
        rows: newRows,
      };

      const tempCourse = { ...course, sections: updatedSections };

      const recalculatedCourse = recalculateCourse(tempCourse);

      const newCourses = [...prevCourses];
      newCourses[courseIdx] = recalculatedCourse;
      return newCourses;
    });
  };

  const handleBestOfUpdate = (sectionId, count, totalWeight) => {
    if (!selectedCourseId) return;

    setCourses((prevCourses) => {
      const courseIdx = prevCourses.findIndex((c) => c.id === selectedCourseId);
      if (courseIdx === -1) return prevCourses;

      const course = prevCourses[courseIdx];
      const sectionIdx = course.sections.findIndex((s) => s.id === sectionId);
      if (sectionIdx === -1) return prevCourses;

      const section = course.sections[sectionIdx];
      const items = section.rows.filter((r) => r.title !== "Total");

      const sorted = items
        .map((r, i) => ({
          ...r,
          originalIdx: i,
          ratio: r.total > 0 ? r.obtained / r.total : 0,
        }))
        .sort((a, b) => b.ratio - a.ratio);

      const topIndices = new Set(
        sorted.slice(0, count).map((item) => item.originalIdx),
      );

      const weightPerItem = count > 0 ? totalWeight / count : 0;

      const newRows = section.rows.map((row, idx) => {
        if (row.title === "Total") return row;
        const isTop = topIndices.has(idx);
        return {
          ...row,
          weight: isTop ? weightPerItem : 0,
          included: isTop,
        };
      });

      const updatedSections = [...course.sections];
      updatedSections[sectionIdx] = {
        ...section,
        rows: newRows,
        weight: totalWeight,
      };

      const tempCourse = { ...course, sections: updatedSections };
      const recalculatedCourse = recalculateCourse(tempCourse);

      const newCourses = [...prevCourses];
      newCourses[courseIdx] = recalculatedCourse;
      return newCourses;
    });
  };

  const handleResetSection = (sectionId) => {
    if (!selectedCourseId || !initialCoursesRef.current.length) return;

    const initialCourse = initialCoursesRef.current.find(
      (c) => c.id === selectedCourseId,
    );
    if (!initialCourse) return;

    const initialSection = initialCourse.sections.find(
      (s) => s.id === sectionId,
    );
    if (!initialSection) return;

    setCourses((prevCourses) => {
      const courseIdx = prevCourses.findIndex((c) => c.id === selectedCourseId);
      if (courseIdx === -1) return prevCourses;

      const course = prevCourses[courseIdx];
      const sectionIdx = course.sections.findIndex((s) => s.id === sectionId);
      if (sectionIdx === -1) return prevCourses;

      const updatedSections = [...course.sections];
      updatedSections[sectionIdx] = JSON.parse(JSON.stringify(initialSection));

      const tempCourse = { ...course, sections: updatedSections };
      const recalculatedCourse = recalculateCourse(tempCourse);

      const newCourses = [...prevCourses];
      newCourses[courseIdx] = recalculatedCourse;
      return newCourses;
    });
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="w-full min-h-screen p-4 md:p-8 space-y-8 pb-24">
        {}
        <PageHeader
          title="Marks & Grades"
          subtitle="Academic performance details"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full xl:w-auto">
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

            <CourseSelector
              courses={courses}
              selectedId={selectedCourseId}
              onSelect={(id) => {
                setSelectedCourseId(id);

                const crs = courses.find((c) => c.id === id);

                if (crs && crs.sections.length > 0) {
                  setActiveSectionId(crs.sections[0].id);
                }
              }}
            />

            {selectedCourse && (
              <SectionSelector
                sections={selectedCourse.sections}
                selectedId={activeSectionId}
                onSelect={setActiveSectionId}
              />
            )}

            <BookmarksMenu
              markedItems={markedItems}
              courses={courses}
              onNavigate={(courseId, sectionId) => {
                setSelectedCourseId(courseId);
                setActiveSectionId(sectionId);
              }}
            />
            <div ref={hiddenFormRef} className="hidden" />
          </div>
        </PageHeader>

        {}
        {}
        <NotificationBanner alerts={alerts} />

        {loading ? (
          <LoadingSpinner />
        ) : selectedCourse ? (
          <div className="space-y-8">
            {}
            <div className="flex flex-col gap-6">
              {}
              {activeSectionId &&
              selectedCourse.sections.find((s) => s.id === activeSectionId) ? (
                <AssessmentView
                  section={selectedCourse.sections.find(
                    (s) => s.id === activeSectionId,
                  )}
                  onUpdate={(rowIndex, field, value) =>
                    handleRowUpdate(activeSectionId, rowIndex, field, value)
                  }
                  markedItems={markedItems}
                  onToggleMark={handleToggleMark}
                  courseId={selectedCourse.id}
                  onBestOf={(count, weight) =>
                    handleBestOfUpdate(activeSectionId, count, weight)
                  }
                  onReset={() => handleResetSection(activeSectionId)}
                />
              ) : selectedCourse.sections.length > 0 ? (
                <AssessmentView
                  section={selectedCourse.sections[0]}
                  onUpdate={(rowIndex, field, value) =>
                    handleRowUpdate(
                      selectedCourse.sections[0].id,
                      rowIndex,
                      field,
                      value,
                    )
                  }
                  markedItems={markedItems}
                  onToggleMark={handleToggleMark}
                  courseId={selectedCourse.id}
                  onBestOf={(count, weight) =>
                    handleBestOfUpdate(
                      selectedCourse.sections[0].id,
                      count,
                      weight,
                    )
                  }
                  onReset={() =>
                    handleResetSection(selectedCourse.sections[0].id)
                  }
                />
              ) : (
                <div className="text-center py-24 bg-[#161616] rounded-[30px] border border-white/5 opacity-50">
                  <div className="text-xl font-bold text-zinc-500">
                    No assessments found
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </PageLayout>
  );
}

export default MarksPage;
