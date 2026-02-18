import React, { useEffect, useState } from "react";
import PageLayout from "../components/layouts/PageLayout";
import { MessageSquare, Send, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import NotificationBanner from "../components/ui/NotificationBanner";
import PageHeader from "../components/ui/PageHeader";
import { LoadingSpinner } from "../components/ui/LoadingOverlay";

const QuestionCard = ({ question, index, total, onSelect }) => {
  return (
    <div className="bg-secondary/30 rounded-3xl p-6 border border-foreground/5 space-y-4 hover:border-foreground/10 transition-all duration-300">
      <div className="flex items-start gap-4">
        <span className="shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-medium text-sm">
          {index + 1}
        </span>
        <h4 className="text-foreground font-medium text-lg leading-relaxed flex-1">
          {question.text}
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
        {question.options.map((option, optIdx) => (
          <label
            key={optIdx}
            className={`
              relative flex flex-col items-center justify-center p-4 rounded-2xl border cursor-pointer transition-all duration-300 group outline-none focus:outline-none focus-within:outline-none
              ${
                question.selectedValue === option.value
                  ? "bg-accent/20 border-accent text-foreground shadow-none ring-0"
                  : "bg-tertiary/10 border-transparent hover:bg-tertiary/20 text-foreground/60 shadow-none ring-0"
              }
            `}
          >
            <input
              type="radio"
              name={question.name}
              value={option.value}
              required={question.required}
              className="sr-only focus:outline-none shadow-none ring-0 outline-none"
              onChange={() => onSelect(index, option.value)}
              checked={question.selectedValue === option.value}
            />
            <span className="text-[10px] font-medium text-center group-hover:scale-105 transition-transform shadow-none ring-0 outline-none">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

function SubmitFeedbackPage() {
  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [comments, setComments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("superflex-update-loading", { detail: true }),
    );

    const parseFeedbackQuestions = () => {
      const root = document.querySelector(
        ".m-grid.m-grid--hor.m-grid--root.m-page",
      );
      if (!root) {
        setTimeout(parseFeedbackQuestions, 500);
        return;
      }

      try {
        // Parse Alerts
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

          let message = clone.textContent.trim();
          if (message.length > 3) {
            alertList.push({
              type: alert.classList.contains("alert-danger") ? "error" : "info",
              message,
            });
          }
        });
        setAlerts(alertList);

        // Parse Course Title
        const titleText = root.querySelector(".m-portlet__head-text");
        if (titleText) {
          setCourseTitle(titleText.textContent.trim());
        }

        // Parse Questions
        const qList = [];
        const items = root.querySelectorAll(".m-list-timeline__item");
        items.forEach((item) => {
          const textSpan = item.querySelector(".m-list-timeline__text");
          if (!textSpan) return;

          const questionText = textSpan.textContent.trim();
          const options = [];
          const inputs = item.querySelectorAll('input[type="radio"]');
          let name = "";
          let required = false;

          inputs.forEach((input) => {
            name = input.name;
            required = input.required;
            const label = input.parentElement.textContent.trim();
            options.push({
              label,
              value: input.value,
            });
          });

          if (options.length > 0) {
            qList.push({
              text: questionText,
              name,
              required,
              options,
              selectedValue: "",
            });
          }
        });
        setQuestions(qList);

        // Parse Textareas (Comments)
        const textareaList = [];
        root.querySelectorAll("textarea").forEach((txt) => {
          const item = txt.closest(".m-list-timeline__item");
          const headingSpan = item?.querySelector(".m-list-timeline__text.m--font-boldest2");
          
          textareaList.push({
            name: txt.name,
            placeholder: txt.placeholder || "Enter your comments here...",
            value: txt.value || "",
            required: txt.required,
            label: headingSpan ? headingSpan.textContent.trim() : 
                   txt.closest(".form-group")?.querySelector("label")?.textContent?.trim() || 
                   "Comments",
          });
        });
        setComments(textareaList);

        // Hide original
        root.style.display = "none";

        setLoading(false);
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
      } catch (err) {
        console.error("Feedback Quesion Parser Error:", err);
        setLoading(false);
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
      }
    };

    parseFeedbackQuestions();
  }, []);

  const handleSelect = (qIdx, value) => {
    const updated = [...questions];
    updated[qIdx].selectedValue = value;
    setQuestions(updated);
    syncRadioToDOM(updated[qIdx].name, value);
  };

  const syncRadioToDOM = (name, value) => {
    const root = document.querySelector(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
    );
    if (root) {
      const originalInput = root.querySelector(
        `input[name="${name}"][value="${value}"]`,
      );
      if (originalInput) {
        originalInput.checked = true;
        originalInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  };

  const handleBulkSelect = (type) => {
    const updated = [...questions];
    updated.forEach((q) => {
      let value = "";
      if (type === "random") {
        value = q.options[Math.floor(Math.random() * q.options.length)].value;
      } else if (type === "agree") {
        value =
          q.options.find((o) => o.label.toLowerCase().includes("strongly agree"))
            ?.value ||
          q.options.find((o) => o.label.toLowerCase().includes("agree"))?.value ||
          q.options[0].value;
      } else if (type === "disagree") {
        value =
          q.options.find((o) =>
            o.label.toLowerCase().includes("strongly disagree"),
          )?.value ||
          q.options.find((o) => o.label.toLowerCase().includes("disagree"))
            ?.value ||
          q.options[q.options.length - 1].value;
      } else if (type === "uncertain") {
        value =
          q.options.find((o) => o.label.toLowerCase().includes("uncertain"))
            ?.value || q.options[Math.floor(q.options.length / 2)].value;
      }

      if (value) {
        q.selectedValue = value;
        syncRadioToDOM(q.name, value);
      }
    });
    setQuestions(updated);
  };

  const handleCommentChange = (idx, value) => {
    const updated = [...comments];
    updated[idx].value = value;
    setComments(updated);

    // Sync with original DOM by index (since multiple textareas may have the same name)
    const root = document.querySelector(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
    );
    if (root) {
      const allTextareas = root.querySelectorAll("textarea");
      if (allTextareas[idx]) {
        allTextareas[idx].value = value;
        allTextareas[idx].dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const root = document.querySelector(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
    );
    const originalForm = root?.querySelector("form");
    
    if (originalForm) {
      // The portal expects a standard form post to /Student/SubmitFeedback
      // We've already synced the inputs, so we can just trigger the form submission.
      // However, to be absolutely sure it matches the structure:
      const formData = new FormData(originalForm);
      
      // Create a temporary form to ensure a clean POST request
      const tempForm = document.createElement("form");
      tempForm.method = "POST";
      tempForm.action = "/Student/SubmitFeedback";
      tempForm.style.display = "none";

      for (const [key, value] of formData.entries()) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        tempForm.appendChild(input);
      }

      document.body.appendChild(tempForm);
      tempForm.submit();
    } else {
      setSubmitting(false);
      alert("Evaluation form connection lost. Please refresh the page.");
    }
  };

  if (loading) {
    return (
      <PageLayout currentPage={window.location.pathname}>
        <div className="w-full min-h-screen p-4 md:p-8 space-y-8 flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  const allAnswered =
    questions.every((q) => !q.required || q.selectedValue) &&
    comments.every((c) => !c.required || c.value);

  const progress =
    ((questions.filter((q) => q.selectedValue).length +
      comments.filter((c) => c.value).length) /
      (questions.length + comments.length)) *
    100;

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="w-full min-h-screen p-4 md:p-8 space-y-8 relative z-10 animate-in fade-in duration-500">
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none z-0"></div>
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none z-0"></div>

        <PageHeader
          title="Course Feedback"
          subtitle={courseTitle || "Faculty Evaluation Survey"}
        />

        <NotificationBanner alerts={alerts} />

        {/* Progress Tracker */}
        <div className="bg-secondary/30 rounded-3xl p-6 border border-foreground/5 sticky top-4 z-20 backdrop-blur-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground/60">
                  COMPLETION PROGRESS
                </span>
                <span className="text-xs font-medium text-accent">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-2 bg-foreground/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
              <button
                type="button"
                onClick={() => handleBulkSelect("agree")}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium hover:bg-emerald-500/20 transition-all flex items-center gap-2"
              >
                <CheckCircle2 size={14} />
                Agree All
              </button>
              <button
                type="button"
                onClick={() => handleBulkSelect("uncertain")}
                className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-medium hover:bg-amber-500/20 transition-all flex items-center gap-2"
              >
                <AlertCircle size={14} />
                Uncertain All
              </button>
              <button
                type="button"
                onClick={() => handleBulkSelect("disagree")}
                className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-medium hover:bg-rose-500/20 transition-all flex items-center gap-2"
              >
                <AlertCircle size={14} className="rotate-180" />
                Disagree All
              </button>
              <button
                type="button"
                onClick={() => handleBulkSelect("random")}
                className="px-4 py-2 rounded-xl bg-accent/10 text-accent border border-accent/20 text-[10px] font-medium hover:bg-accent/20 transition-all flex items-center gap-2"
              >
                <Zap size={14} />
                Randomize
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            {questions.map((q, idx) => (
              <QuestionCard
                key={idx}
                index={idx}
                question={q}
                onSelect={handleSelect}
              />
            ))}
          </div>

          <div className="space-y-6">
            {comments.map((c, idx) => (
              <div
                key={idx}
                className="bg-secondary/30 rounded-3xl p-6 border border-foreground/5 space-y-4"
              >
                <h4 className="text-foreground font-medium text-lg leading-relaxed">
                  {c.label}
                </h4>
                <textarea
                  value={c.value}
                  onChange={(e) => handleCommentChange(idx, e.target.value)}
                  placeholder={c.placeholder}
                  required={c.required}
                  className="w-full bg-background/50 border border-foreground/10 rounded-2xl p-4 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-accent/50 transition-all min-h-[150px]"
                />
              </div>
            ))}
          </div>

          <div className="pt-8 flex justify-center">
            <button
              type="submit"
              disabled={!allAnswered || submitting}
              className={`
                group relative flex items-center gap-3 px-8 py-3 rounded-2xl font-bold text-sm transition-all duration-300
                ${
                  allAnswered && !submitting
                    ? "bg-accent text-foreground hover:scale-105 active:scale-95 shadow-none"
                    : "bg-secondary/50 text-foreground/20 cursor-not-allowed shadow-none"
                }
              `}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground animate-spin rounded-full" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send
                    size={20}
                    className={allAnswered ? "animate-bounce-x" : ""}
                  />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>

        {!allAnswered && (
          <div className="flex items-center justify-center gap-2 text-amber-500/60 text-xs font-medium">
            <AlertCircle size={14} />
            Please answer all required questions to submit
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1s infinite;
        }
        .Cap { text-transform: uppercase; }
        
        /* Eliminate legacy portal focus styles */
        input[type="radio"]:focus + span,
        input[type="radio"]:active + span {
            border-color: transparent !important;
            outline: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
        }
      `}</style>
    </PageLayout>
  );
}

export default SubmitFeedbackPage;
