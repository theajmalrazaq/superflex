import { optionalEmailSchema } from "../schemas/common";
import React, { useMemo, useState } from "react";
import { Check, ChevronRight, GraduationCap, Search, UserRound, X } from "lucide-react";
import BottomSheet, {
  BottomSheetClose,
  BottomSheetDescription,
  BottomSheetTitle,
} from "./ui/BottomSheet";
import TeacherAvatar from "./TeacherAvatar";
import { createManualTeacher, filterTeachers } from "../utils/teacherSelection";

function TeacherSelectionForm({
  open,
  courses,
  campus,
  teachers,
  loading,
  error,
  selections,
  onSelect,
  onSave,
  onSkip,
  onRetry,
}) {
  const [courseIndex, setCourseIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const manualEmailValid = optionalEmailSchema.safeParse(manualEmail.trim()).success;
  const activeCourse = courses[courseIndex];
  const filteredTeachers = useMemo(() => filterTeachers(teachers, query), [teachers, query]);

  const addManualTeacher = () => {
    const teacher = createManualTeacher(manualName, manualEmail);
    if (!teacher || !activeCourse) return;
    onSelect(activeCourse.id, teacher);
    setManualName("");
    setManualEmail("");
  };

  return (
    <BottomSheet open={open} onClose={onSkip}>
      <div className="flex shrink-0 justify-center pt-3.5 pb-1">
        <span className="h-1.5 w-14 rounded-full bg-[#ded9e5] dark:bg-white" />
      </div>
      <BottomSheetClose asChild>
        <button
          type="button"
          aria-label="Close teacher setup"
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 sm:right-5 sm:top-5"
        >
          <X size={20} />
        </button>
      </BottomSheetClose>
      <header className="flex shrink-0 flex-col items-center px-6 pb-3.5 pt-1.5 text-center sm:px-8 sm:pb-4 sm:pt-2">
        <span className="mb-2.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[28%] bg-[#230052] text-white dark:bg-white dark:text-[#101027] sm:h-11 sm:w-11">
          <GraduationCap size={23} />
        </span>
        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#230052]/65 dark:text-white">
          Personalize your dashboard
        </p>
        <BottomSheetTitle className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
          Meet Your Final Bosses. 🎮
        </BottomSheetTitle>
        <BottomSheetDescription className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
          Select the instructors responsible for your academic character development.
        </BottomSheetDescription>
      </header>

      <div className="shrink-0 px-6 pb-2.5 sm:px-8">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-2.5 text-xs dark:bg-white/[.06]">
          <span className="font-semibold">{campus?.name || "Campus"} faculty</span>
          <span className="text-slate-500 dark:text-slate-400">
            {Object.keys(selections).length} of {courses.length} selected
          </span>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {courses.map((course, index) => {
            const chosen = selections[course.id];
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => {
                  setCourseIndex(index);
                  setQuery("");
                }}
                className={`flex min-w-0 max-w-[190px] shrink-0 items-center gap-1.5 rounded-full px-2.5 py-2 text-[11px] font-bold transition-colors ${index === courseIndex ? "bg-[#230052] text-white dark:bg-white dark:text-[#101027]" : "bg-slate-100 text-slate-600 dark:bg-white/[.08] dark:text-slate-300"}`}
              >
                {chosen && <Check size={13} />}
                <span className="truncate">{course.id}</span>
              </button>
            );
          })}
        </div>
        {activeCourse && (
          <p className="mt-2 truncate text-sm font-semibold">{activeCourse.title}</p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-3 sm:px-8 sm:py-4">
        <label className="flex items-center gap-2.5 rounded-2xl border border-slate-200 px-3.5 py-2.5 focus-within:border-[#230052] dark:border-white/15 dark:focus-within:border-white">
          <Search size={17} className="text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search teachers by name or email"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </label>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#230052]/20 border-t-[#230052] dark:border-white dark:border-t-white" />
            Summoning the Faculty...
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {filteredTeachers.map((teacher) => {
              const selected = selections[activeCourse?.id]?.id === teacher.id;
              return (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => onSelect(activeCourse.id, teacher)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-colors ${selected ? "border-[#230052]/30 bg-[#230052]/[.06] dark:border-white/40 dark:bg-white/[.1]" : "border-slate-200/80 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/[.05]"}`}
                >
                  <span className="scale-90">
                    <TeacherAvatar teacher={teacher} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{teacher.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                      {teacher.email || teacher.designation}
                    </span>
                  </span>
                  {selected && (
                    <Check size={18} className="shrink-0 text-[#230052] dark:text-white" />
                  )}
                </button>
              );
            })}
            {!filteredTeachers.length && !error && !loading && (
              <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:bg-white/[.04]">
                <p className="font-bold text-slate-900 dark:text-white">
                  This Teacher Is a Mystery.
                </p>
                <p className="mt-1 text-xs">
                  No faculty matched your search. Try another spelling or add them manually.
                </p>
              </div>
            )}
            {error && (
              <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
                <p className="font-bold">Even the Faculty Directory Gave Up. 💀</p>
                <p className="mt-1 text-xs">
                  Could not load official faculty listings. Try again or add your instructor
                  manually.
                </p>
                <button type="button" onClick={onRetry} className="mt-2 font-bold underline">
                  Retry
                </button>
              </div>
            )}
            {!loading && !teachers.length && !error && (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-white/[.04] dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-white">
                  No Teachers Found in This Universe.
                </p>
                <p className="mt-1 text-xs">The directory for this campus returned 0 teachers.</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-3.5 rounded-2xl border border-dashed border-slate-300 p-3.5 dark:border-white sm:p-4">
          <p className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <UserRound size={14} /> Add Your Final Boss.
          </p>
          <p className="mb-2.5 text-[11px] text-slate-500 dark:text-slate-400">
            Can't find them in the directory? Enter their details manually.
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <input
              value={manualName}
              onChange={(event) => setManualName(event.target.value)}
              placeholder="Teacher name"
              className="min-w-0 flex-1 rounded-xl bg-slate-100 px-3 py-2.5 text-sm outline-none dark:bg-white/[.08]"
            />
            <input
              type="email"
              value={manualEmail}
              aria-invalid={!manualEmailValid}
              title={manualEmailValid ? undefined : "Enter a valid email address or leave it blank"}
              onChange={(event) => setManualEmail(event.target.value)}
              placeholder="Email (optional)"
              className="min-w-0 flex-1 rounded-xl bg-slate-100 px-3 py-2.5 text-sm outline-none dark:bg-white/[.08]"
            />
            <button
              type="button"
              onClick={addManualTeacher}
              disabled={!manualName.trim() || !manualEmailValid}
              className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-bold disabled:opacity-40 dark:bg-white/10"
            >
              Add
            </button>
          </div>
          {!manualEmailValid && (
            <p role="status" className="mt-2 text-xs text-rose-500">
              Enter a valid email address or leave it blank.
            </p>
          )}
        </div>
      </div>

      <footer className="flex shrink-0 flex-col gap-2 border-t border-slate-100 bg-white/95 px-6 py-3.5 dark:border-white/10 dark:bg-[#090909]/95 sm:px-8 sm:py-4">
        {courseIndex < courses.length - 1 ? (
          <button
            type="button"
            onClick={() => setCourseIndex((index) => Math.min(courses.length - 1, index + 1))}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#230052] px-5 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-[#101027]"
          >
            Next course <ChevronRight size={17} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSave}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#230052] px-5 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-[#101027]"
          >
            Save choices <Check size={17} />
          </button>
        )}
        <button
          type="button"
          onClick={onSkip}
          className="self-center px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          Skip for now
        </button>
      </footer>
    </BottomSheet>
  );
}

export default function TeacherSelectionModal(
  props: React.ComponentProps<typeof TeacherSelectionForm>,
) {
  return props.open ? <TeacherSelectionForm {...props} /> : null;
}
