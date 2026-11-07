import React from "react";
import { AlertTriangle, ChevronRight, Bell, X } from "lucide-react";

const NotificationBanner = ({
  alerts,
  onActionClick,
  actionLabel = "More Instruction",
  onDismissAlert,
}) => {
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

      {alerts.map((alert, idx) => {
        const isError = alert.type === "error";
        const isSuccess = alert.type === "success" || alert.type === "update";

        const borderClass = isError
          ? "border-rose-500/20"
          : isSuccess
            ? "border-emerald-500/30"
            : "border-blue-500/20";

        const iconBgClass = isError
          ? "bg-rose-500/10 text-rose-600 dark:text-rose-300"
          : isSuccess
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
            : "bg-blue-500/10 text-blue-600 dark:text-blue-300";

        return (
          <div
            key={idx}
            className={`relative flex items-center gap-4 overflow-hidden rounded-[24px] border bg-white p-4 text-slate-900 dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] ${borderClass} shadow-xs`}
          >
            <div className={`shrink-0 rounded-xl p-3 ${iconBgClass}`}>
              {isSuccess ? <Bell size={20} /> : <AlertTriangle size={20} />}
            </div>

            <div className="space-y-0.5 flex-1 min-w-0">
              {alert.title && (
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {alert.title}
                </p>
              )}
              <div className="text-xs md:text-sm font-medium leading-relaxed">
                {alert.message || alert.text}
              </div>
            </div>

            {alert.dismissible && onDismissAlert && (
              <button
                type="button"
                onClick={() => onDismissAlert(alert)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/40 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10 transition-colors"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NotificationBanner;
