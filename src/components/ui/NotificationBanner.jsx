import React from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
const NotificationBanner = ({ alerts, onActionClick, actionLabel = "More Instruction" }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-4">
      {onActionClick && (
        <div className="flex justify-end">
          <button
            onClick={onActionClick}
            className="group/btn flex items-center gap-2 rounded-full border border-foreground/10 bg-white/80 px-4 py-1.5 text-[10px] font-bold text-foreground transition-colors hover:bg-white dark:bg-white/[0.08] dark:hover:bg-white/[0.12]"
          >
            {actionLabel}
            <ChevronRight
              size={12}
              className="transition-transform group-hover/btn:translate-x-1"
            />
          </button>
        </div>
      )}

      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className={`relative flex items-center gap-4 overflow-hidden rounded-[24px] border bg-white p-4 text-slate-900 dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] ${
            alert.type === "error" ? "border-rose-500/20" : "border-blue-500/20"
          }`}
        >
          <div
            className={`shrink-0 rounded-xl p-3 ${
              alert.type === "error"
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-300"
                : "bg-blue-500/10 text-blue-600 dark:text-blue-300"
            }`}
          >
            <AlertTriangle size={20} />
          </div>

          <div className="space-y-0.5 flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium leading-relaxed">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationBanner;
