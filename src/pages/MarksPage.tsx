import React, { useEffect, useState, useRef } from "react";
import { AlertCircle, Bookmark, Layers, Settings, X, RotateCcw, Zap, Check } from "lucide-react";
import NotificationBanner from "../components/ui/NotificationBanner";
import StatsCard from "../components/ui/StatsCard";
import SuperTabs from "../components/ui/SuperTabs";
import PageLayout from "../components/layouts/PageLayout";
import { PageSkeleton } from "../components/ui/Skeleton";
import BookmarksModal from "../components/ui/BookmarksModal";
import BottomSheet, {
  BottomSheetClose,
  BottomSheetDescription,
  BottomSheetTitle,
} from "../components/ui/BottomSheet";

import { processCourseMarks } from "../utils/marksProcessor";
import { findMarksForm, parseMarksPage } from "../parsers/marks";
import { findFlexPageRoot } from "../parsers/dom";
import { useAiSync } from "../hooks/useAiSync";
import {
  checkAndRecordMarksSnapshot,
  clearPendingUpdateType,
  getPendingUpdates,
  isCourseMarksUpdated,
  isSectionMarksUpdated,
  isAssessmentMarksUpdated,
} from "../utils/academicSnapshot";
import { getMarkedMarks, setMarkedMarks } from "../utils/userDataStorage";

const MarksCourseTabs = ({ courses, selectedId, onSelect, pendingUpdates }) => (
  <div
    className="flex w-full max-w-full gap-2 overflow-x-auto pb-0.5 scrollbar-hide sm:inline-flex sm:w-fit sm:gap-1.5 sm:rounded-full sm:bg-white/55 sm:p-1.5 sm:shadow-sm sm:shadow-black/[0.03] sm:dark:bg-black/25 sm:dark:shadow-none"
    aria-label="Select course"
  >
    {courses.map((course) => {
      const active = course.id === selectedId;
      const code = course.title.match(/[A-Z]{2,5}\s?-?\d{3,4}/i)?.[0] || course.id;
      const hasUpdate = isCourseMarksUpdated(pendingUpdates, course);
      return (
        <button
          key={course.id}
          type="button"
          onClick={() => onSelect(course.id)}
          aria-pressed={active}
          title={course.title}
          className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-colors sm:py-2.5 ${
            active
              ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]"
              : "bg-white text-[#101027] hover:bg-white/90 dark:bg-white/10 dark:text-slate-200 sm:bg-transparent sm:text-slate-600 sm:hover:bg-white/80 sm:hover:text-[#230052]"
          }`}
        >
          {hasUpdate && (
            <span className="flex shrink-0 items-center justify-center p-0.5">
              <span
                className={`h-2 w-2 rounded-full animate-pulse ring-2 ${
                  active
                    ? "bg-white ring-white/40 dark:bg-[#0a192f] dark:ring-[#0a192f]/40"
                    : "bg-[#230052] ring-[#230052]/30 dark:bg-white dark:ring-white/40"
                }`}
                title="New marks in this course"
              />
            </span>
          )}
          <span>{code}</span>
          {course.grandTotalStats && (
            <span className="text-[10px] opacity-75">
              {course.grandTotalStats.percentage.toFixed(0)}%
            </span>
          )}
        </button>
      );
    })}
  </div>
);

const BookmarksMenu = ({ markedItems, courses, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const bookmarkedDetails = [];
  if (markedItems.size > 0 && courses.length > 0) {
    courses.forEach((course) => {
      course.sections.forEach((section) => {
        section.rows.forEach((row) => {
          const uniqueId = `${course.id}-${section.id}-${row.title}`;
          if (markedItems.has(uniqueId)) {
            const ratio = row.total > 0 ? (row.obtained / row.total) * 100 : 0;
            bookmarkedDetails.push({
              id: uniqueId,
              title: row.title,
              subtitle: `${course.title} · ${section.title}`,
              badge: `${row.obtained} / ${row.total}`,
              badgeClass:
                ratio >= 80
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : ratio >= 60
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                    : "bg-rose-500/10 text-rose-700 dark:text-rose-300",
              courseId: course.id,
              sectionId: section.id,
            });
          }
        });
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
        emptyHint="Bookmark an assessment to find it here."
        onSelect={(item) => onNavigate(item.courseId, item.sectionId)}
      />
    </>
  );
};

const BestOfModal = (props: React.ComponentProps<typeof BestOfForm>) =>
  props.isOpen ? <BestOfForm key={props.itemCount} {...props} /> : null;

const BestOfForm = ({ isOpen, onClose, onApply, itemCount, sectionTitle }) => {
  const [count, setCount] = useState<number | "">(() => Math.min(4, itemCount));
  const [totalWeight, setTotalWeight] = useState<number | "">(20);

  const getItemType = () => {
    const title = sectionTitle?.toLowerCase() || "";
    if (title.includes("quiz")) return "Quiz";
    if (title.includes("assignment")) return "Assignment";
    if (title.includes("lab")) return "Lab";
    return "Item";
  };

  const itemType = getItemType();

  const validCount =
    Number.isInteger(Number(count)) && Number(count) >= 1 && Number(count) <= itemCount;
  const validWeight = Number.isFinite(Number(totalWeight)) && Number(totalWeight) >= 0;
  const plural = Number(count) > 1 ? (itemType === "Quiz" ? "zes" : "s") : "";

  return (
    <BottomSheet open={isOpen} onClose={onClose}>
      <div className="flex shrink-0 justify-center pt-3">
        <span className="h-1.5 w-14 rounded-full bg-[#ded9e5] dark:bg-white" />
      </div>
      <BottomSheetClose asChild>
        <button
          type="button"
          aria-label="Close calculator"
          className="absolute right-4 top-6 z-10 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
        >
          <X size={20} />
        </button>
      </BottomSheetClose>
      <header className="flex shrink-0 flex-col items-center px-6 pb-4 pt-3 text-center sm:px-8">
        <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#230052] text-white dark:bg-white dark:text-[#101027]">
          <Settings size={21} />
        </span>
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#230052]/65 dark:text-white">
          Marks simulator
        </p>
        <BottomSheetTitle className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
          Let's do some damage control.
        </BottomSheetTitle>
        <BottomSheetDescription className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Pick your best scores and see if there's still hope.
        </BottomSheetDescription>
      </header>

      <div className="min-h-0 space-y-4 overflow-y-auto px-5 pb-4 sm:px-8">
        <label className="block text-sm font-semibold">
          Number of best {itemType.toLowerCase()}
          {plural}
          <input
            type="number"
            value={count}
            min={1}
            max={itemCount}
            onChange={(event) =>
              setCount(event.target.value === "" ? "" : Number.parseInt(event.target.value, 10))
            }
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal outline-none focus:border-[#230052] dark:border-white/15 dark:bg-white/[.04] dark:focus:border-white"
          />
          <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">
            Choose between 1 and {itemCount} assessments.
          </span>
        </label>
        <label className="block text-sm font-semibold">
          Total weight (%)
          <input
            type="number"
            value={totalWeight}
            min={0}
            step="0.01"
            onChange={(event) =>
              setTotalWeight(event.target.value === "" ? "" : Number.parseFloat(event.target.value))
            }
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal outline-none focus:border-[#230052] dark:border-white/15 dark:bg-white/[.04] dark:focus:border-white"
          />
        </label>
        <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-slate-700 dark:bg-white/[.06] dark:text-slate-300">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#230052]/10 text-[#230052] dark:bg-white/15 dark:text-white">
            <AlertCircle size={17} />
          </span>
          <p className="text-sm leading-relaxed">
            The {count || 0} highest-scoring {itemType.toLowerCase()}
            {plural} will share the {totalWeight || 0}% weight equally. Your course totals update
            immediately.
          </p>
        </div>
      </div>

      <footer className="shrink-0 border-t border-slate-100 bg-white/95 px-5 pb-3 pt-3 dark:border-white/10 dark:bg-[#090909]/95 sm:px-8">
        <button
          type="button"
          disabled={!validCount || !validWeight}
          onClick={() => onApply(Number(count), Number(totalWeight))}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#230052] px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-[#101027]"
        >
          <Check size={17} />
          Apply calculation
        </button>
      </footer>
    </BottomSheet>
  );
};

const recalculateCourse = processCourseMarks;
export const AssessmentView = ({
  section,
  onUpdate,
  markedItems,
  onToggleMark,
  courseId,
  course,
  onBestOf,
  onReset,
  isSimulationMode,
  pendingUpdates,
}) => {
  const [isBestOfOpen, setIsBestOfOpen] = useState(false);
  const isGrandTotal = section.title.includes("Grand Total");
  const isBestOfEligible = !isGrandTotal && /quiz|assignment|lab/i.test(section.title);
  const rows = section.rows?.filter((row) => row.title !== "Total") || [];
  const performance = section.weight > 0 ? (section.obtained / section.weight) * 100 : 0;
  const performanceColor =
    performance >= 80
      ? "text-emerald-700 dark:text-emerald-300"
      : performance >= 60
        ? "text-amber-700 dark:text-amber-300"
        : "text-rose-700 dark:text-rose-300";
  const hasSectionUpdate = isSectionMarksUpdated(pendingUpdates, course, section.title);

  return (
    <section
      id={`marks-section-${section.id}`}
      className={`overflow-hidden rounded-[22px] border bg-white text-[#101027] dark:bg-black dark:text-[#f5f6fb] sm:rounded-[24px] ${isGrandTotal ? "border-[#230052]/15 dark:border-white" : "border-black/[0.05] dark:border-white/[0.14]"}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-2.5 border-b border-black/[0.06] px-4 py-3.5 dark:border-white/[0.1] sm:gap-3 sm:px-5 sm:py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[17px] font-bold tracking-[-0.02em] sm:text-base">
              {section.title}
            </h3>
            {hasSectionUpdate && (
              <span className="flex shrink-0 items-center justify-center p-0.5">
                <span
                  className="h-2 w-2 rounded-full bg-[#230052] animate-pulse ring-2 ring-[#230052]/30 dark:bg-white dark:ring-white/40"
                  title="New marks uploaded in this section"
                />
              </span>
            )}
            {isGrandTotal && (
              <span className="rounded-full bg-[#230052]/10 px-2 py-0.5 text-[10px] font-bold text-[#230052] dark:bg-white/15 dark:text-white">
                Final
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-[#667085] dark:text-slate-400">
            {rows.length} {rows.length === 1 ? "assessment" : "assessments"} ·{" "}
            {section.weight.toFixed(2)}% weight
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/[.08] dark:text-slate-300 sm:py-1.5">
            Obtained{" "}
            <b className="ml-1 text-slate-900 dark:text-white">{section.obtained.toFixed(2)}</b>
          </span>
          <span
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/[.08] dark:text-slate-300 sm:py-1.5"
            title="Class average converted to this section's course weight"
          >
            <span className="sm:hidden">Avg</span>
            <span className="hidden sm:inline">Weighted avg</span>{" "}
            <b className="ml-1 text-slate-900 dark:text-white">
              ~{(section.stats?.weightedAvg ?? 0).toFixed(2)}
            </b>
          </span>
          <span
            className={`rounded-full bg-slate-100 px-3 py-1 text-xs font-bold dark:bg-white/[.08] sm:py-1.5 ${performanceColor}`}
          >
            {performance.toFixed(1)}%
          </span>
          {isBestOfEligible && isSimulationMode && rows.length > 0 && (
            <button
              type="button"
              onClick={() => setIsBestOfOpen(true)}
              className="rounded-full bg-[#230052]/[.06] px-3 py-1 text-xs font-bold text-[#230052] dark:bg-white/10 dark:text-white sm:py-1.5"
            >
              Best Of
            </button>
          )}
          {!isGrandTotal && isSimulationMode && rows.length > 0 && (
            <button
              type="button"
              onClick={onReset}
              title="Reset scores"
              className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 dark:bg-white/[.08] dark:text-slate-300 dark:hover:bg-white/[.12]"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>

        <BestOfModal
          isOpen={isBestOfOpen}
          onClose={() => setIsBestOfOpen(false)}
          itemCount={rows.length}
          sectionTitle={section.title}
          onApply={(count, weight) => {
            onBestOf(count, weight);
            setIsBestOfOpen(false);
          }}
        />
      </header>

      {rows.length > 0 ? (
        <>
          {/* Mobile Native List View (no horizontal table scroll) */}
          <div className="divide-y divide-black/[0.06] px-4 dark:divide-white/[0.08] sm:hidden">
            {rows.map((row) => {
              const rowIndex = section.rows.indexOf(row);
              const uniqueId = `${courseId}-${section.id}-${row.title}`;
              const isMarked = markedItems?.has(uniqueId);
              const isRowUpdated = isAssessmentMarksUpdated(pendingUpdates, course, row.title);
              const scoreRatio = row.total > 0 ? row.obtained / row.total : 0;
              const scoreColor =
                scoreRatio >= 0.8
                  ? "text-emerald-700 dark:text-emerald-300"
                  : scoreRatio >= 0.6
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-rose-700 dark:text-rose-300";
              const weightedVal = row.total > 0 ? (row.obtained / row.total) * row.weight : 0;

              return (
                <div
                  key={`${row.title}-${rowIndex}-mobile`}
                  className={`flex items-center justify-between gap-3 py-3 ${!row.included ? "opacity-45" : ""}`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onToggleMark?.(uniqueId)}
                      aria-label={
                        isMarked ? `Remove bookmark for ${row.title}` : `Bookmark ${row.title}`
                      }
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${isMarked ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]" : "text-slate-400 hover:bg-slate-200 hover:text-[#230052] dark:hover:bg-white/10 dark:hover:text-white"}`}
                    >
                      <Bookmark size={14} fill={isMarked ? "currentColor" : "none"} />
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-semibold text-[#101027] dark:text-white sm:text-sm">
                          {row.title}
                        </p>
                        {isRowUpdated && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[#230052] animate-pulse dark:bg-white" />
                        )}
                        {!row.included && (
                          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
                            Dropped
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-[#667085] dark:text-slate-400">
                        Wt {row.weight}% · Avg {row.avg.toFixed(1)} · {row.min.toFixed(0)}–
                        {row.max.toFixed(0)}
                      </p>
                    </div>
                  </div>

                  {isSimulationMode ? (
                    <div className="flex shrink-0 items-center gap-1 text-xs">
                      <input
                        type="number"
                        aria-label={`${row.title} score`}
                        value={row.obtained ?? ""}
                        onChange={(event) => onUpdate(rowIndex, "obtained", event.target.value)}
                        className={`w-12 rounded-lg bg-slate-100 px-1 py-1 text-center text-xs font-bold outline-none dark:bg-white/10 ${scoreColor}`}
                      />
                      <span className="text-slate-400">/</span>
                      <input
                        type="number"
                        aria-label={`${row.title} total marks`}
                        value={row.total}
                        onChange={(event) => onUpdate(rowIndex, "total", event.target.value)}
                        className="w-12 rounded-lg bg-slate-100 px-1 py-1 text-center text-xs text-slate-600 outline-none dark:bg-white/10 dark:text-slate-300"
                      />
                    </div>
                  ) : (
                    <div className="shrink-0 text-right">
                      <p className={`text-xs font-bold ${scoreColor} sm:text-[13px]`}>
                        {row.obtained}{" "}
                        <span className="text-[11px] font-normal text-[#667085]">/ {row.total}</span>
                      </p>
                      <p className="text-[10px] font-medium text-[#230052] dark:text-white/80 sm:text-[11px]">
                        {weightedVal.toFixed(2)} pts
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="flex items-center justify-between py-2.5 text-xs font-semibold sm:py-3">
              <span className="text-[#667085] dark:text-slate-400">
                Section Total ({section.weight.toFixed(2)}% weight)
              </span>
              <span className="text-xs font-bold text-[#230052] dark:text-white sm:text-sm">
                {section.obtained.toFixed(2)} / {section.weight.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden overflow-x-auto scrollbar-hide sm:block">
            <div className="min-w-[540px]">
            <div className="grid grid-cols-[minmax(0,1fr)_64px_148px_76px] items-center gap-3 border-b border-black/[0.05] bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:border-white/[.08] dark:bg-white/[.04] dark:text-slate-400 sm:px-5">
              <span>Assessment</span>
              <span className="text-center">Weight</span>
              <span className="text-center">Score</span>
              <span className="text-right">Weighted</span>
            </div>
            {rows.map((row) => {
              const rowIndex = section.rows.indexOf(row);
              const uniqueId = `${courseId}-${section.id}-${row.title}`;
              const isMarked = markedItems?.has(uniqueId);
              const isRowUpdated = isAssessmentMarksUpdated(pendingUpdates, course, row.title);
              const scoreRatio = row.total > 0 ? row.obtained / row.total : 0;
              const scoreColor =
                scoreRatio >= 0.8
                  ? "text-emerald-700 dark:text-emerald-300"
                  : scoreRatio >= 0.6
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-rose-700 dark:text-rose-300";
              return (
                <div
                  key={`${row.title}-${rowIndex}`}
                  className={`grid grid-cols-[minmax(0,1fr)_64px_148px_76px] items-center gap-3 border-b border-black/[0.05] px-4 py-3.5 last:border-b-0 dark:border-white/[.08] sm:px-5 ${!row.included ? "opacity-45" : ""} ${isMarked ? "bg-[#230052]/[.05] dark:bg-white/[.08]" : isRowUpdated ? "bg-[#230052]/[0.03] dark:bg-white/[0.04]" : "hover:bg-slate-50 dark:hover:bg-white/[.025]"}`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onToggleMark?.(uniqueId)}
                      aria-label={
                        isMarked ? `Remove bookmark for ${row.title}` : `Bookmark ${row.title}`
                      }
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${isMarked ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]" : "text-slate-400 hover:bg-slate-200 hover:text-[#230052] dark:hover:bg-white/10 dark:hover:text-white"}`}
                    >
                      <Bookmark size={14} fill={isMarked ? "currentColor" : "none"} />
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">{row.title}</p>
                        {isRowUpdated && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#230052]/10 px-2 py-0.5 text-[10px] font-bold text-[#230052] dark:bg-white/15 dark:text-white">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#230052] animate-pulse dark:bg-white" />
                            New
                          </span>
                        )}
                        {!row.included && (
                          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
                            Dropped
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[10px] text-slate-500 dark:text-slate-400">
                        Avg {row.avg.toFixed(1)} · Range {row.min.toFixed(1)}–{row.max.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <input
                    type="number"
                    aria-label={`${row.title} weight`}
                    value={row.weight}
                    onChange={(event) => onUpdate(rowIndex, "weight", event.target.value)}
                    className="w-full rounded-lg bg-slate-50 px-1.5 py-1.5 text-center text-xs font-medium outline-none focus:ring-1 focus:ring-[#230052] dark:bg-white/[.06] dark:focus:ring-white"
                  />
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <input
                      type="number"
                      aria-label={`${row.title} score`}
                      value={row.obtained ?? ""}
                      onChange={(event) => onUpdate(rowIndex, "obtained", event.target.value)}
                      className={`w-14 shrink-0 rounded-lg bg-slate-50 px-1 py-1.5 text-center text-xs font-bold outline-none focus:ring-1 focus:ring-[#230052] dark:bg-white/[.06] dark:focus:ring-white ${scoreColor}`}
                    />
                    <span className="text-slate-400">/</span>
                    <input
                      type="number"
                      aria-label={`${row.title} total marks`}
                      value={row.total}
                      onChange={(event) => onUpdate(rowIndex, "total", event.target.value)}
                      className="w-14 shrink-0 rounded-lg bg-slate-50 px-1 py-1.5 text-center text-xs text-slate-600 outline-none focus:ring-1 focus:ring-[#230052] dark:bg-white/[.06] dark:text-slate-300 dark:focus:ring-white"
                    />
                  </div>
                  <span className="text-right text-xs font-bold text-[#230052] dark:text-white">
                    {(row.total > 0 ? (row.obtained / row.total) * row.weight : 0).toFixed(2)}
                  </span>
                </div>
              );
            })}
            <div className="grid grid-cols-[minmax(0,1fr)_64px_148px_76px] items-center gap-3 bg-slate-50 px-4 py-4 text-xs font-bold dark:bg-white/[.04] sm:px-5">
              <span>Total</span>
              <span className="text-center">{section.weight.toFixed(2)}</span>
              <span className="text-center">—</span>
              <span className="text-right text-[#230052] dark:text-white">
                {section.obtained.toFixed(2)}
              </span>
            </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Final weighted class statistics
          </span>
          <span className="font-bold text-[#230052] dark:text-white">
            {section.obtained.toFixed(2)} / {section.weight.toFixed(2)}
          </span>
        </div>
      )}
    </section>
  );
};

function MarksPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [pendingUpdates, setPendingUpdates] = useState(null);
  const hiddenFormRef = useRef<HTMLDivElement | null>(null);
  const initialCoursesRef = useRef([]);

  useEffect(() => {
    let active = true;
    const handleUpdates = async () => {
      const updates = await getPendingUpdates();
      if (!active) return;
      if (updates?.newMarks?.length) {
        setPendingUpdates(updates);
        await clearPendingUpdateType("marks");
      } else {
        setPendingUpdates(null);
      }
    };
    void handleUpdates();
    window.addEventListener("superflex-student-identity-changed", handleUpdates);
    return () => {
      active = false;
      window.removeEventListener("superflex-student-identity-changed", handleUpdates);
    };
  }, []);

  const [markedItems, setMarkedItems] = useState(new Set<string>());
  const [markedItemsLoaded, setMarkedItemsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const loadMarkedItems = async () => {
      setMarkedItemsLoaded(false);
      const items = await getMarkedMarks();
      if (active) {
        setMarkedItems(new Set(items));
        setMarkedItemsLoaded(true);
      }
    };
    void loadMarkedItems();
    window.addEventListener("superflex-student-identity-changed", loadMarkedItems);
    return () => {
      active = false;
      window.removeEventListener("superflex-student-identity-changed", loadMarkedItems);
    };
  }, []);

  useEffect(() => {
    if (markedItemsLoaded) setMarkedMarks([...markedItems]);
  }, [markedItems, markedItemsLoaded]);

  const handleToggleMark = (id) => {
    const newSet = new Set(markedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setMarkedItems(newSet);
  };

  useEffect(() => {
    const parseData = async () => {
      try {
        const root = findFlexPageRoot(document);
        if (!root) return;

        const portalForm = findMarksForm(document);
        const parsed = parseMarksPage(root, portalForm);
        setAlerts(parsed.alerts);
        setSemesters(parsed.semesters);
        if (portalForm && parsed.semesters.length && hiddenFormRef.current) {
          hiddenFormRef.current.innerHTML = "";
          hiddenFormRef.current.appendChild(portalForm.cloneNode(true));
        }

        setCourses(parsed.courses);
        initialCoursesRef.current = structuredClone(parsed.courses);
        if (parsed.courses.length > 0) setSelectedCourseId(parsed.courses[0].id);
        await checkAndRecordMarksSnapshot(parsed.courses, { suppressNotifications: true });
        await clearPendingUpdateType("marks");

        root.style.display = "none";
        setLoading(false);
      } catch (e) {
        console.error("Marks Parse Error", e);
        setLoading(false);
      }
    };

    setTimeout(() => void parseData(), 200);
  }, []);

  useAiSync({
    data: courses,
    dataKey: "marks",
    syncKey: "marks",
    isEnabled: courses && courses.length > 0,
  });

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

      const numericValue =
        field === "weight" || field === "obtained" || field === "total"
          ? parseFloat(value) || 0
          : value;

      newRows[rowIndex] = {
        ...newRows[rowIndex],
        [field]: numericValue,
      };

      const updatedSections = [...course.sections];
      let newSimulationMode = course.simulationMode;

      if (field === "weight" || field === "total") {
        newSimulationMode = true;
      }

      updatedSections[sectionIdx] = {
        ...section,
        rows: newRows,
      };

      const tempCourse = {
        ...course,
        sections: updatedSections,
        simulationMode: newSimulationMode,
      };
      const recalculatedCourse = recalculateCourse(tempCourse);

      const newCourses = [...prevCourses];
      newCourses[courseIdx] = recalculatedCourse;
      return newCourses;
    });
  };

  const handleBestOfUpdate = (sectionId, count, totalWeight) => {
    if (!selectedCourseId) return;

    const numCount = parseInt(count) || 0;
    const numWeight = parseFloat(totalWeight) || 0;

    setCourses((prevCourses) => {
      const courseIdx = prevCourses.findIndex((c) => c.id === selectedCourseId);
      if (courseIdx === -1) return prevCourses;

      const course = prevCourses[courseIdx];
      const sectionIdx = course.sections.findIndex((s) => s.id === sectionId);
      if (sectionIdx === -1) return prevCourses;

      const section = course.sections[sectionIdx];
      let updatedRows = [...section.rows];
      const isSimMode = course.simulationMode;

      if (isSimMode) {
        const newWeightPerItem = numCount > 0 ? numWeight / numCount : 0;
        updatedRows = section.rows.map((row) => ({
          ...row,
          weight: row.title !== "Total" ? newWeightPerItem : row.weight,
        }));
      }

      const updatedSections = [...course.sections];
      updatedSections[sectionIdx] = {
        ...section,
        rows: updatedRows,
        weight: numWeight,
        itemLimit: numCount,
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

    const initialCourse = initialCoursesRef.current.find((c) => c.id === selectedCourseId);
    if (!initialCourse) return;

    const initialSection = initialCourse.sections.find((s) => s.id === sectionId);
    if (!initialSection) return;

    setCourses((prevCourses) => {
      const courseIdx = prevCourses.findIndex((c) => c.id === selectedCourseId);
      if (courseIdx === -1) return prevCourses;

      const course = prevCourses[courseIdx];
      const sectionIdx = course.sections.findIndex((s) => s.id === sectionId);
      if (sectionIdx === -1) return prevCourses;

      const updatedSections = [...course.sections];
      updatedSections[sectionIdx] = structuredClone(initialSection);

      const tempCourse = { ...course, sections: updatedSections };
      const recalculatedCourse = recalculateCourse(tempCourse);

      const newCourses = [...prevCourses];
      newCourses[courseIdx] = recalculatedCourse;
      return newCourses;
    });
  };

  const handleToggleSimulation = () => {
    if (!selectedCourseId || !initialCoursesRef.current.length) return;
    setCourses((prevCourses) => {
      const courseIdx = prevCourses.findIndex((c) => c.id === selectedCourseId);
      if (courseIdx === -1) return prevCourses;

      const course = prevCourses[courseIdx];
      const nextSimMode = !course.simulationMode;

      let newCourse;
      if (!nextSimMode) {
        const initialCourse = initialCoursesRef.current.find((c) => c.id === selectedCourseId);
        if (initialCourse) {
          newCourse = {
            ...structuredClone(initialCourse),
            simulationMode: false,
          };
        } else {
          newCourse = { ...course, simulationMode: false };
        }
      } else {
        newCourse = { ...course, simulationMode: true };
      }

      const recalculatedCourse = recalculateCourse(newCourse);
      const newCourses = [...prevCourses];
      newCourses[courseIdx] = recalculatedCourse;
      return newCourses;
    });
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1600px] flex-col gap-3.5 pb-6 sm:gap-5 sm:pb-24">
        <header className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end sm:gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-white/90 sm:text-[10px] sm:font-bold sm:tracking-[0.16em] sm:text-white/80">
              Academics
            </p>
            <h1 className="text-[30px] font-extrabold leading-[1.08] tracking-[-0.035em] text-white sm:text-3xl sm:font-bold sm:tracking-tight">
              Marks & Assessments
            </h1>
            <p className="text-xs text-white/85 sm:text-sm">
              Quizzes, assignments, mids, finals. Dil thaam ke marks dekhein.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SuperTabs
              tabs={semesters}
              activeTab={semesters.find((s) => s.selected)?.value}
              onTabChange={(value) => {
                if (hiddenFormRef.current) {
                  const select = hiddenFormRef.current.querySelector<HTMLSelectElement>("select");
                  if (select) {
                    select.value = value;
                    const form = hiddenFormRef.current.querySelector<HTMLFormElement>("form");
                    if (form) form.submit();
                  }
                }
              }}
            />

            <BookmarksMenu
              markedItems={markedItems}
              courses={courses}
              onNavigate={(courseId, sectionId) => {
                setSelectedCourseId(courseId);
                window.setTimeout(
                  () =>
                    document
                      .getElementById(`marks-section-${sectionId}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "start" }),
                  100,
                );
              }}
            />
            <div ref={hiddenFormRef} className="hidden" />
          </div>
        </header>

        <NotificationBanner alerts={alerts} />

        {loading ? (
          <PageSkeleton label="Loading marks" cards={4} rows={6} showHeader={false} />
        ) : selectedCourse ? (
          <div className="space-y-5">
            <MarksCourseTabs
              courses={courses}
              selectedId={selectedCourseId}
              onSelect={setSelectedCourseId}
              pendingUpdates={pendingUpdates}
            />
            <div className="flex flex-wrap items-end justify-between gap-2.5 px-1 sm:gap-3">
              <div>
                <h2 className="text-base font-bold tracking-tight text-white sm:text-xl">
                  {selectedCourse.title}
                </h2>
                <p className="mt-0.5 text-[11px] text-white/75 sm:mt-1 sm:text-xs">
                  {
                    selectedCourse.sections.filter(
                      (section) => !section.title.includes("Grand Total"),
                    ).length
                  }{" "}
                  evaluation categories
                </p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={handleToggleSimulation}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors sm:px-4 sm:py-2 sm:text-sm ${selectedCourse.simulationMode ? "bg-amber-500 text-white" : "bg-white/55 text-[#230052] hover:bg-white/75 dark:bg-black/25 dark:text-white dark:hover:bg-black/40"}`}
                  title={
                    selectedCourse.simulationMode
                      ? "Exit simulation and restore original marks"
                      : "Enable simulation and edit marks"
                  }
                >
                  <Zap size={13} />
                  {selectedCourse.simulationMode ? "Simulating" : "Simulate"}
                </button>
                <div className="rounded-full bg-white/55 px-3 py-1.5 text-xs font-bold text-[#230052] dark:bg-black/25 dark:text-white sm:px-4 sm:py-2 sm:text-sm">
                  Overall {selectedCourse.grandTotalStats.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
            {selectedCourse.sections.length > 0 ? (
              <div className="space-y-5">
                {selectedCourse.sections.map((section) => (
                  <AssessmentView
                    key={section.id}
                    section={section}
                    course={selectedCourse}
                    pendingUpdates={pendingUpdates}
                    onUpdate={(rowIndex, field, value) =>
                      handleRowUpdate(section.id, rowIndex, field, value)
                    }
                    markedItems={markedItems}
                    onToggleMark={handleToggleMark}
                    courseId={selectedCourse.id}
                    onBestOf={(count, weight) => handleBestOfUpdate(section.id, count, weight)}
                    onReset={() => handleResetSection(section.id)}
                    isSimulationMode={selectedCourse.simulationMode}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[24px] border border-black/[0.06] bg-white px-6 py-12 text-center dark:border-white/[0.14] dark:bg-black">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]">
                  <Layers size={24} />
                </div>
                <h4 className="text-xl font-bold text-[#101010] dark:text-[#f5f6fb]">
                  No Marks Uploaded Yet
                </h4>
                <p className="mt-2 max-w-sm text-sm text-[#626262] dark:text-[#c4cad6]">
                  Marks haven't been uploaded. Stay delusional for now.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </PageLayout>
  );
}

export default MarksPage;
