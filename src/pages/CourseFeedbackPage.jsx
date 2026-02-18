import React, { useEffect, useState } from "react";
import PageLayout from "../components/layouts/PageLayout";
import {
  CheckCircle2,
  BookOpen,
  Clock,
  Layout,
  MessageSquare,
  Send,
  Zap,
} from "lucide-react";
import NotificationBanner from "../components/ui/NotificationBanner";
import PageHeader from "../components/ui/PageHeader";
import StatsCard from "../components/ui/StatsCard";
import LoadingOverlay, {
  LoadingSpinner,
} from "../components/ui/LoadingOverlay";

const FeedbackCard = ({ course, onAction, onQuickAction, index }) => {
  const isPending = course.hasAction;
  const [isQuicking, setIsQuicking] = useState(false);

  return (
    <div className="group cursor-default flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-[2rem] border transition-all duration-300 bg-secondary/30 border-foreground/5 hover:bg-secondary/50 hover:border-foreground/10 gap-6">
      <div className="flex items-center gap-6 flex-1 min-w-0">
        <span className="hidden sm:flex font-bold text-sm min-w-[1.5rem] text-foreground/20 group-hover:text-foreground/40 transition-colors">
          {index.toString().padStart(2, "0")}
        </span>

        <div
          className={`w-12 h-12 flex-none rounded-2xl flex items-center justify-center border transition-all duration-300 ${
            isPending
              ? "bg-amber-500/10 border-amber-500/20 text-amber-500 group-hover:scale-105"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:scale-105"
          }`}
        >
          {isPending ? <Clock size={24} /> : <CheckCircle2 size={24} />}
        </div>

        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-md">
              {course.code}
            </span>
            <span className="text-foreground font-medium text-base leading-tight truncate">
              {course.courseName}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-foreground/50 font-medium leading-none">
            <span className="flex items-center gap-1.5 group-hover:text-foreground/70 transition-colors">
              <BookOpen size={12} className="text-foreground/40" />
              {course.credits} Credits
            </span>
            <span className="w-1 h-1 rounded-full bg-foreground/10"></span>
            <span className="flex items-center gap-1.5 group-hover:text-foreground/70 transition-colors">
              Faculty Feedback
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {isPending ? (
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                if (isQuicking) return;
                setIsQuicking(true);
                await onQuickAction(course);
                setIsQuicking(false);
              }}
              disabled={isQuicking}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/20 font-medium text-[10px] transition-all group/zap ${
                isQuicking
                  ? "bg-amber-500/50 text-white cursor-wait"
                  : "bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white"
              }`}
            >
              <Zap
                size={12}
                className={
                  isQuicking ? "animate-pulse" : "group-hover/zap:fill-current"
                }
              />
              {isQuicking ? "Doing..." : "Quick"}
            </button>
            <button
              onClick={() => onAction(course)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-foreground font-medium text-[10px] hover:scale-105 hover:shadow-lg hover:shadow-accent/20 transition-all active:scale-95"
            >
              Review Now
              <Send size={12} />
            </button>
          </div>
        ) : (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-[10px]">
            {course.status}
          </div>
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

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("superflex-update-loading", { detail: true }),
    );

    const parseFeedbackData = () => {
      const root = document.querySelector(
        ".m-grid.m-grid--hor.m-grid--root.m-page",
      );
      if (!root) {
        setTimeout(parseFeedbackData, 500);
        return;
      }

      try {
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

        const courseList = [];
        const table = root.querySelector(".table");
        if (table) {
          const rows = table.querySelectorAll("tbody tr");
          rows.forEach((row, idx) => {
            const cells = row.querySelectorAll("td");

            if (cells.length >= 5) {
              const actionBtn =
                cells[5]?.querySelector("a, button") ||
                cells[4]?.querySelector("a, button");
              const actionOnClick = actionBtn?.getAttribute("onclick");
              const actionHref = actionBtn?.getAttribute("href");

              courseList.push({
                id: idx,
                serial: cells[0]?.textContent.trim(),
                code: cells[1]?.textContent.trim(),
                courseName: cells[2]?.textContent.trim(),
                credits: cells[3]?.textContent.trim(),
                status:
                  cells[4]?.textContent.trim() || cells[3]?.textContent.trim(),
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

        root.style.opacity = "0";
        root.style.pointerEvents = "none";
        root.style.position = "absolute";
        root.style.zIndex = "-1";

        setLoading(false);
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
      } catch (err) {
        console.error("Feedback Parser Error:", err);
        setLoading(false);
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
      }
    };

    parseFeedbackData();
  }, []);

  const handleFeedbackAction = (course) => {
    const root = document.querySelector(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
    );
    if (!root) return;
    const table = root.querySelector(".table");
    if (!table) return;

    const rows = table.querySelectorAll("tbody tr");
    const originalRow = rows[course.id];
    if (originalRow) {
      const btn = originalRow.querySelector("a, button");
      if (btn) {
        btn.click();
      }
    }
  };

  const handleQuickFeedback = async (course) => {
    const root = document.querySelector(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
    );
    if (!root) return;
    const table = root.querySelector(".table");
    const rows = table.querySelectorAll("tbody tr");
    const originalRow = rows[course.id];
    
    // Find the form within the row
    const originalRowForm = originalRow?.querySelector("form");
    const btn = originalRow?.querySelector("button[name='GiveFeedback']");
    const fbValue = btn?.value;

    if (!fbValue && !originalRowForm) {
      alert("Could not locate feedback action. Please try manual review.");
      return;
    }

    try {
      // 1. Fetch Questions Page via POST
      // We use the form action and data if available, otherwise fallback to the GiveFeedback value
      const actionUrl = originalRowForm?.getAttribute("action") || "/Student/FeedBackQuestions";
      const initialBody = originalRowForm 
        ? new URLSearchParams(new FormData(originalRowForm)) 
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

      const originalForm = qDoc.querySelector("form");
      if (!originalForm) {
        throw new Error("Could not find the feedback form on the questions page.");
      }

      // Collect all inputs from the form (including hidden fields like tokens)
      const submissionData = new URLSearchParams();
      const inputs = originalForm.querySelectorAll("input, textarea, select");
      
      // Keep track of radio groups we've handled
      const handledRadios = new Set();

      inputs.forEach((input) => {
        if (input.type === "radio") {
          if (!handledRadios.has(input.name)) {
            const options = originalForm.querySelectorAll(`input[name='${input.name}']`);
            if (options.length > 0) {
              const randomIdx = Math.floor(Math.random() * options.length);
              submissionData.append(input.name, options[randomIdx].value);
            }
            handledRadios.add(input.name);
          }
        } else if (input.type === "submit" || input.type === "button") {
          // Skip submit buttons unless they are needed (usually not)
        } else if (input.tagName.toLowerCase() === "textarea") {
          submissionData.append(input.name, ""); // Leave comments empty for quick feedback
        } else {
          submissionData.append(input.name, input.value);
        }
      });

      // 4. Submit to /Student/SubmitFeedback
      const submitAction = originalForm.getAttribute("action") || "/Student/SubmitFeedback";
      const submitResp = await fetch(submitAction, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: submissionData,
      });

      if (submitResp.ok) {
        // Refresh the underlying state or just reload the page to show completion
        window.location.reload();
      } else {
        throw new Error(`Submission failed: ${submitResp.status}`);
      }
    } catch (err) {
      alert("Quick review failed. This usually happens if the session expired or the portal structure changed. Please try manual review.");
    }
  };

  if (loading)
    return (
      <PageLayout currentPage={window.location.pathname}>
        <div className="w-full min-h-screen p-4 md:p-8 space-y-8">
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        </div>
      </PageLayout>
    );

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none z-0"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none z-0"></div>

      <div className="w-full min-h-screen p-4 md:p-8 space-y-10 relative z-10 animate-in fade-in duration-500">
        <PageHeader
          title="Faculty Evaluation"
          subtitle="Share your feedback for course instructors and faculty"
        />

        <div className="flex flex-wrap gap-4">
          <StatsCard
            icon={Layout}
            label="Total Surveys"
            value={stats.total}
            delay={100}
          />
          <StatsCard
            icon={Clock}
            label="Pending"
            value={stats.pending}
            delay={200}
          />
          <StatsCard
            icon={CheckCircle2}
            label="Completed"
            value={stats.submitted}
            delay={300}
          />
          <StatsCard
            icon={MessageSquare}
            label="Survey Status"
            value={stats.pending === 0 ? "Finished" : "Pending"}
            delay={400}
          />
        </div>

        <NotificationBanner alerts={alerts} />

        <div className="bg-secondary/40 rounded-[2.5rem] p-4 md:p-8 backdrop-blur-2xl border border-foreground/10 space-y-8">
          <div className="flex items-center gap-4 px-2">
            <div className="p-3 bg-accent/10 rounded-2xl text-accent border border-accent/20 flex-none">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground tracking-tight">
                Faculty Surveys
              </h3>
              <p className="text-[10px] text-foreground/40 font-medium">
                Pending faculty evaluations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.length > 0 ? (
              courses.map((course, idx) => (
                <FeedbackCard
                  key={course.id}
                  course={course}
                  index={idx + 1}
                  onAction={handleFeedbackAction}
                  onQuickAction={handleQuickFeedback}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-24 opacity-50 bg-foreground/5 rounded-[2rem] border border-dashed border-foreground/10 text-center">
                <div className="p-6 rounded-full bg-tertiary/50 mb-6">
                  <CheckCircle2 size={40} className="text-foreground/40" />
                </div>
                <h3 className="text-xl font-bold text-foreground/50">
                  No Pending Reviews
                </h3>
                <p className="text-foreground/40 mt-2 text-sm max-w-xs">
                  All your course evaluations are up to date. Excellent work!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .scrollbar-hide::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-hide::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .scrollbar-hide::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </PageLayout>
  );
}

export default CourseFeedbackPage;
