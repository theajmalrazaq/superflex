import React, { useEffect, useMemo, useState } from "react";
import { parsePortalAlerts } from "../parsers/dom";
import PageLayout from "../components/layouts/PageLayout";
import {
  CheckCircle2,
  BookOpen,
  Clock,
  Layout,
  MessageSquare,
  Send,
  Zap,
  CircleCheck,
} from "lucide-react";
import NotificationBanner from "../components/ui/NotificationBanner";
import StatsCard from "../components/ui/StatsCard";
import Skeleton from "../components/ui/Skeleton";
import { hideFlexPageRoot } from "../parsers/dom";

const CourseFeedbackSkeleton = () => (
  <main
    className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col gap-7 px-4 py-6 font-sans sm:px-6 lg:px-8 lg:py-8"
    role="status"
    aria-label="Loading course feedback"
  >
    <header className="space-y-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </header>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex min-h-[156px] flex-col rounded-[32px] bg-white p-5 dark:bg-black sm:p-6"
        >
          <Skeleton className="h-12 w-12 rounded-[28%]" />
          <Skeleton className="mt-auto h-7 w-28" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
    <div className="space-y-3 rounded-[24px] bg-white p-5 dark:bg-black sm:p-6">
      <div className="flex justify-between gap-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-64 max-w-[55%] rounded-full" />
      </div>
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex items-center gap-4 border-t border-black/[0.05] py-4 dark:border-white/[0.08]"
        >
          <Skeleton className="h-10 w-10 rounded-[28%]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-56 max-w-full" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      ))}
    </div>
  </main>
);

const FeedbackCard = ({ course, onAction, onQuickAction, index }) => {
  const isPending = course.hasAction;
  const [isQuicking, setIsQuicking] = useState(false);

  return (
    <div className="flex flex-col gap-4 px-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <span className="hidden w-7 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-400 sm:block">
          {index}
        </span>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[28%] ${isPending ? "bg-amber-50 text-amber-700 dark:bg-amber-300/10 dark:text-amber-200" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200"}`}
        >
          {isPending ? <Clock size={19} /> : <CircleCheck size={19} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-white/[0.08] dark:text-slate-300">
              {course.code || "Course"}
            </span>
            <span className="truncate text-[13px] font-semibold text-slate-900 dark:text-white sm:text-sm">
              {course.courseName}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen size={13} />
              {course.credits} credits
            </span>
            <span>Faculty feedback</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 pl-14 sm:pl-0">
        {isPending ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={async () => {
                if (isQuicking) return;
                setIsQuicking(true);
                try {
                  await onQuickAction(course);
                } finally {
                  setIsQuicking(false);
                }
              }}
              disabled={isQuicking}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
                isQuicking
                  ? "cursor-wait bg-amber-100 text-amber-800 dark:bg-amber-300/10 dark:text-amber-200"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/[0.08] dark:text-slate-200 dark:hover:bg-white/[0.12]"
              }`}
            >
              <Zap size={14} className={isQuicking ? "animate-pulse" : ""} />
              {isQuicking ? "Submitting…" : "Quick submit"}
            </button>
            <button
              type="button"
              onClick={() => onAction(course)}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-[#230052] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#370c72] dark:bg-white dark:text-[#0a192f] dark:hover:bg-white/85"
            >
              Review
              <Send size={14} />
            </button>
          </div>
        ) : (
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-300/10 dark:text-emerald-200">
            {course.status || "Completed"}
          </span>
        )}
      </div>
    </div>
  );
};

function CourseFeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, submitted: 0 });
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => {
        if (statusFilter === "pending") return course.hasAction;
        if (statusFilter === "completed") return !course.hasAction;
        return true;
      }),
    [courses, statusFilter],
  );

  useEffect(() => {
    const parseFeedbackData = () => {
      const root = document.querySelector<HTMLElement>(".m-grid.m-grid--hor.m-grid--root.m-page");
      if (!root) {
        setTimeout(parseFeedbackData, 500);
        return;
      }

      try {
        setAlerts(parsePortalAlerts(root));

        const courseList = [];
        const table = root.querySelector<HTMLElement>(".table");
        if (table) {
          const rows = table.querySelectorAll<HTMLElement>("tbody tr");
          rows.forEach((row, idx) => {
            const cells = row.querySelectorAll<HTMLElement>("td");

            if (cells.length >= 5) {
              const actionBtn =
                cells[5]?.querySelector<HTMLAnchorElement>("a, button") ||
                cells[4]?.querySelector<HTMLAnchorElement>("a, button");
              const actionOnClick = actionBtn?.getAttribute("onclick");
              const actionHref = actionBtn?.getAttribute("href");

              courseList.push({
                id: idx,
                serial: cells[0]?.textContent.trim(),
                code: cells[1]?.textContent.trim(),
                courseName: cells[2]?.textContent.trim(),
                credits: cells[3]?.textContent.trim(),
                status: cells[4]?.textContent.trim() || cells[3]?.textContent.trim(),
                teacherName: "",
                hasAction: !!actionBtn,
                actionOnClick,
                actionHref,
              });
            }
          });
        }

        setCourses(courseList);

        const pending = courseList.filter((c) => c.hasAction).length;
        setStats({
          total: courseList.length,
          pending: pending,
          submitted: courseList.length - pending,
        });

        hideFlexPageRoot(root);

        setLoading(false);
      } catch (err) {
        console.error("Feedback Parser Error:", err);
        setLoading(false);
      }
    };

    parseFeedbackData();
  }, []);

  const handleFeedbackAction = (course) => {
    const root = document.querySelector<HTMLElement>(".m-grid.m-grid--hor.m-grid--root.m-page");
    if (!root) return;
    const table = root.querySelector<HTMLElement>(".table");
    if (!table) return;

    const rows = table.querySelectorAll<HTMLElement>("tbody tr");
    const originalRow = rows[course.id];
    if (originalRow) {
      const btn = originalRow.querySelector<HTMLAnchorElement>("a, button");
      if (btn) {
        btn.click();
      }
    }
  };

  const handleQuickFeedback = async (course) => {
    const root = document.querySelector<HTMLElement>(".m-grid.m-grid--hor.m-grid--root.m-page");
    if (!root) return;
    const table = root.querySelector<HTMLElement>(".table");
    const rows = table.querySelectorAll<HTMLElement>("tbody tr");
    const originalRow = rows[course.id];

    const originalRowForm = originalRow?.querySelector<HTMLFormElement>("form");
    const btn = originalRow?.querySelector<HTMLButtonElement>("button[name='GiveFeedback']");
    const fbValue = btn?.value;

    if (!fbValue && !originalRowForm) {
      alert("Could not locate feedback action. Please try manual review.");
      return;
    }

    try {
      const actionUrl = originalRowForm?.getAttribute("action") || "/Student/FeedBackQuestions";
      const initialBody = originalRowForm
        ? new URLSearchParams(
            Array.from(new FormData(originalRowForm), ([key, value]) => [key, String(value)]),
          )
        : `GiveFeedback=${encodeURIComponent(fbValue)}`;

      const qPageResp = await fetch(actionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: initialBody,
      });

      if (!qPageResp.ok) throw new Error(`Failed to fetch questions: ${qPageResp.status}`);

      const qHtml = await qPageResp.text();
      const parser = new DOMParser();
      const qDoc = parser.parseFromString(qHtml, "text/html");

      const originalForm = qDoc.querySelector<HTMLFormElement>("form");
      if (!originalForm) {
        throw new Error("Could not find the feedback form on the questions page.");
      }

      const submissionData = new URLSearchParams();
      const inputs = originalForm.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >("input, textarea, select");

      const handledRadios = new Set();

      inputs.forEach((input) => {
        if (input.type === "radio") {
          if (!handledRadios.has(input.name)) {
            const options = originalForm.querySelectorAll<HTMLInputElement>(
              `input[name='${input.name}']`,
            );
            if (options.length > 0) {
              const randomIdx = Math.floor(Math.random() * options.length);
              submissionData.append(input.name, options[randomIdx].value);
            }
            handledRadios.add(input.name);
          }
        } else if (input.type === "submit" || input.type === "button") {
        } else if (input.tagName.toLowerCase() === "textarea") {
          submissionData.append(input.name, "");
        } else {
          submissionData.append(input.name, input.value);
        }
      });

      const submitAction = originalForm.getAttribute("action") || "/Student/SubmitFeedback";
      const submitResp = await fetch(submitAction, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: submissionData,
      });

      if (submitResp.ok) {
        window.location.reload();
      } else {
        throw new Error(`Submission failed: ${submitResp.status}`);
      }
    } catch {
      alert(
        "Quick review failed. This usually happens if the session expired or the portal structure changed. Please try manual review.",
      );
    }
  };

  if (loading)
    return (
      <PageLayout currentPage={window.location.pathname}>
        <CourseFeedbackSkeleton />
      </PageLayout>
    );

  return (
    <PageLayout currentPage={window.location.pathname} fullWidth>
      <main className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col gap-3.5 px-4 pb-6 pt-2 font-sans sm:gap-7 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <header className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/85 sm:text-[10px] sm:tracking-[0.16em] sm:text-white/80">
            Services
          </p>
          <h1 className="text-[28px] font-extrabold leading-[1.1] tracking-[-0.035em] text-white sm:text-4xl sm:font-bold sm:tracking-tight">
            Course Feedback
          </h1>
          <p className="text-xs font-medium leading-relaxed text-white/85 sm:text-sm">
            Now it's your turn. Poora semester tum evaluate huay, ab teachers ki baari.
          </p>
        </header>

        <NotificationBanner alerts={alerts} />

        <section aria-labelledby="feedback-overview-heading" className="space-y-2.5 sm:space-y-4">
          <div className="hidden flex-col gap-0.5 sm:flex sm:flex-row sm:items-end sm:justify-between sm:gap-1">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/80 sm:text-[10px]">
                Overview
              </p>
              <h2
                id="feedback-overview-heading"
                className="text-base font-bold tracking-tight text-white sm:text-xl"
              >
                Your Feedback Progress
              </h2>
            </div>
            <p className="text-[11px] text-white/75 sm:text-xs">
              How many evaluations are done, and how many remain?
            </p>
          </div>
          <div className="sf-mobile-cards-scroll pb-1 scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-4 sm:pb-0 xl:grid-cols-4 xl:gap-5">
            <StatsCard
              variant="dashboard"
              icon={Layout}
              label="Total surveys"
              value={stats.total}
              subValue="All course evaluations"
            />
            <StatsCard
              variant="dashboard"
              icon={Clock}
              label="Pending"
              value={stats.pending}
              subValue="Waiting for your review"
            />
            <StatsCard
              variant="dashboard"
              icon={CheckCircle2}
              label="Completed"
              value={stats.submitted}
              subValue="Feedback submitted"
            />
            <StatsCard
              variant="dashboard"
              icon={MessageSquare}
              label="Progress"
              value={stats.total ? `${Math.round((stats.submitted / stats.total) * 100)}%` : "0%"}
              subValue="Surveys completed"
            />
          </div>
        </section>

        <section aria-labelledby="feedback-courses-heading" className="space-y-2.5 sm:space-y-4">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-end sm:justify-between sm:gap-1">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/80 sm:text-[10px]">
                Course list
              </p>
              <h2
                id="feedback-courses-heading"
                className="text-base font-bold tracking-tight text-white sm:text-xl"
              >
                Course Feedback Forms
              </h2>
            </div>
            <p className="text-[11px] text-white/75 sm:text-xs">
              The semester review session. Select a course and share your honest feedback.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:rounded-[24px]">
            <div className="flex flex-col gap-3 border-b border-black/[0.06] px-4 py-4 dark:border-white/[0.1] sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Showing {filteredCourses.length} of {courses.length} surveys
              </p>
              <div
                className="flex items-center gap-1 rounded-full bg-slate-100 p-1 dark:bg-white/[0.06]"
                role="group"
                aria-label="Filter course feedback"
              >
                {[
                  { id: "all", label: "All" },
                  { id: "pending", label: "Pending" },
                  { id: "completed", label: "Completed" },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setStatusFilter(filter.id)}
                    aria-pressed={statusFilter === filter.id}
                    className={`cursor-pointer rounded-full px-3 py-2 text-xs font-bold transition-colors ${statusFilter === filter.id ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredCourses.length ? (
              <div className="divide-y divide-black/[0.05] px-4 dark:divide-white/[0.08] sm:px-6">
                {filteredCourses.map((course, index) => (
                  <FeedbackCard
                    key={course.id}
                    course={course}
                    index={index + 1}
                    onAction={handleFeedbackAction}
                    onQuickAction={handleQuickFeedback}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-[28%] bg-emerald-50 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200">
                  <CheckCircle2 size={22} />
                </span>
                <h3 className="text-base font-bold">
                  {statusFilter === "all"
                    ? "No Evaluations Available"
                    : statusFilter === "pending"
                      ? "All Caught Up"
                      : "No Submitted Feedback"}
                </h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  {statusFilter === "all"
                    ? "Course evaluations will appear here when the university makes them available."
                    : statusFilter === "pending"
                      ? "All available course evaluations are complete."
                      : "Your submitted course evaluations will appear here."}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </PageLayout>
  );
}

export default CourseFeedbackPage;
