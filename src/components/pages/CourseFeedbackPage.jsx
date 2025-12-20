import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";
import { LoadingSpinner } from "../LoadingOverlay";
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Clock,
  Layout,
  AlertTriangle,
} from "lucide-react";
import NotificationBanner from "../NotificationBanner";
import PageHeader from "../PageHeader";
import StatsCard from "../StatsCard";


const FeedbackCard = ({ course, onAction, index }) => {
  const isPending = course.hasAction;
  return (
    <div
      className="group cursor-default flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 bg-zinc-900/30 border-transparent hover:bg-zinc-900/50 hover:border-white/5"
    >
      <div className="flex items-center gap-4">
        <span className="font-bold text-sm min-w-[1.5rem] text-zinc-600">
          {index}.
        </span>
        
        {/* Visual Icon Box - Matching Attendance Style */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
          isPending 
            ? "bg-amber-500/10 border-amber-500/20 text-amber-500 group-hover:scale-110" 
            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:scale-110"
        }`}>
          {isPending ? <Clock size={20} /> : <CheckCircle2 size={20} />}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-[#a098ff] uppercase tracking-tighter opacity-80">
              {course.code}
            </span>
            <span className="text-white font-medium text-sm leading-tight">
              {course.courseName}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">
            <span className="flex items-center gap-1.5">
               <BookOpen size={11} className="text-zinc-600" />
               {course.credits} Credits
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
            <span className="flex items-center gap-1.5 uppercase">
               Faculty Survey
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
            isPending
              ? "bg-amber-500/5 text-amber-500 border-amber-500/10 group-hover:border-amber-500/30"
              : "bg-emerald-500/5 text-emerald-400 border-emerald-500/10 group-hover:border-emerald-500/30"
          }`}
        >
          {course.status}
        </div>
        {isPending && (
          <button
            onClick={() => onAction(course)}
            className="text-[#a098ff] text-[9px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
          >
            Review Now
          </button>
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
    window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: true }));

    const parseFeedbackData = () => {
      const root = document.querySelector(".m-grid.m-grid--hor.m-grid--root.m-page");
      if (!root) {
        setTimeout(parseFeedbackData, 500);
        return;
      }

      try {
        // Parse Alerts
        const alertList = [];
        root.querySelectorAll(".m-alert, .alert").forEach(alert => {
          if (alert.style.display === "none" || alert.id === "DataErrormsgdiv" || alert.closest(".modal")) return;

          const textContainer = alert.querySelector(".m-alert__text") || alert;
          const clone = textContainer.cloneNode(true);
          // Remove standard UI elements that shouldn't be in the message
          clone.querySelectorAll(".m-alert__close, button, a, strong, .m-alert__icon").forEach(el => el.remove());
          
          let message = clone.textContent
            .replace(/Alert!/gi, "")
            .replace(/Close/gi, "")
            .replace(/&nbsp;/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          if (message && message.length > 3) {
              const type = alert.classList.contains("alert-danger") || alert.classList.contains("m-alert--outline-danger") ? "error" : "info";
              alertList.push({ type, message });
          }
        });
        setAlerts(alertList);

        // Parse Courses Table
        const courseList = [];
        const table = root.querySelector(".table");
        if (table) {
          const rows = table.querySelectorAll("tbody tr");
          rows.forEach((row, idx) => {
            const cells = row.querySelectorAll("td");
            // Match legacy 6-column structure: S.No, Code, Name, Credits, Status, Feedback
            if (cells.length >= 5) {
              const actionBtn = cells[5]?.querySelector("a, button") || cells[4]?.querySelector("a, button");
              const actionOnClick = actionBtn?.getAttribute("onclick");
              const actionHref = actionBtn?.getAttribute("href");

              courseList.push({
                id: idx,
                serial: cells[0]?.textContent.trim(),
                code: cells[1]?.textContent.trim(),
                courseName: cells[2]?.textContent.trim(),
                credits: cells[3]?.textContent.trim(),
                status: cells[4]?.textContent.trim() || cells[3]?.textContent.trim(), // Fallback if structure varies
                teacherName: "", // Screenshot doesn't show teacher
                hasAction: !!(actionOnClick || (actionHref && actionHref !== "#")),
                actionOnClick,
                actionHref
              });
            }
          });
        }

        setCourses(courseList);

        // Calculate Stats
        const pending = courseList.filter(c => c.hasAction).length;
        setStats({
          total: courseList.length,
          pending: pending,
          submitted: courseList.length - pending
        });

        // Hide original
        root.style.opacity = "0";
        root.style.pointerEvents = "none";
        root.style.position = "absolute";
        root.style.zIndex = "-1";

        setLoading(false);
        window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: false }));
      } catch (err) {
        console.error("Feedback Parser Error:", err);
        setLoading(false);
        window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: false }));
      }
    };

    parseFeedbackData();
  }, []);

  const handleFeedbackAction = (course) => {
    if (course.actionOnClick) {
      // Execute legacy onclick script
      try {
        const script = course.actionOnClick.replace('return false;', '');
        new Function(script)();
      } catch (e) {
        console.error("Action execution failed", e);
      }
    } else if (course.actionHref) {
      window.location.href = course.actionHref;
    }
  };

  if (loading) return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="w-full min-h-screen p-6 md:p-8 space-y-8">
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    </PageLayout>
  );

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="w-full min-h-screen p-6 md:p-8 space-y-8">
        
        {/* Glow Effects */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#a098ff]/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none z-0"></div>
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none z-0"></div>

        <PageHeader
          title="Course Review"
          subtitle="Faculty evaluation and academic survey management"
        />

        {/* Stats Grid */}
        <div className="flex flex-wrap gap-4">
          <StatsCard 
            icon={Layout}
            label="Total Assigned" 
            value={stats.total} 
            delay={100}
          />
          <StatsCard 
            icon={Clock}
            label="Pending" 
            value={stats.pending} 
            delay={200}
            className={stats.pending > 0 ? "!bg-amber-500/10 !border-amber-500/20" : ""}
          />
          <StatsCard 
            icon={CheckCircle2}
            label="Completed" 
            value={stats.submitted} 
            delay={300}
            className={stats.pending === 0 && stats.total > 0 ? "!bg-emerald-500/10 !border-emerald-500/20" : ""}
          />
          <StatsCard 
            icon={MessageSquare}
            label="Overall Status" 
            value={stats.pending === 0 ? "DONE" : "IN PROGRESS"} 
            delay={400}
          />
        </div>

        {/* Notifications */}
        <NotificationBanner alerts={alerts} />

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold text-white">
              Evaluation Log
            </h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {courses.map((course, idx) => (
              <FeedbackCard 
                key={course.id} 
                course={course}
                index={idx + 1}
                onAction={handleFeedbackAction}
              />
            ))}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-20 bg-zinc-900/30 rounded-[2rem] border border-dashed border-white/5">
              <p className="text-zinc-500 font-medium">No pending evaluations found.</p>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </PageLayout>
  );
}

export default CourseFeedbackPage;
