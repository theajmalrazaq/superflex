import React from "react";
import { AlertTriangle, ChevronRight, Bell, X } from "lucide-react";

interface NotificationAlert {
  type: "error" | "info" | "success" | "update";
  message?: string;
  text?: string;
  title?: string;
  dismissible?: boolean;
}

interface NotificationBannerProps {
  alerts: NotificationAlert[];
  onActionClick?: () => void;
  actionLabel?: string;
  onDismissAlert?: (alert: NotificationAlert) => void;
}

const NotificationBanner = ({
  alerts,
  onActionClick,
  actionLabel = "More Instruction",
  onDismissAlert,
}: NotificationBannerProps) => {
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
            className={`relative flex items-center gap-3.5 overflow-hidden rounded-[22px] border bg-white p-4 text-[#101027] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:gap-4 sm:rounded-[24px] ${borderClass} shadow-xs`}
          >
            <div className={`shrink-0 rounded-[14px] p-2.5 sm:rounded-xl sm:p-3 ${iconBgClass}`}>
              {isSuccess ? (
                <Bell size={18} className="sm:h-5 sm:w-5" />
              ) : (
                <AlertTriangle size={18} className="sm:h-5 sm:w-5" />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              {alert.title && (
                <p className="text-[14px] font-bold tracking-tight text-[#101027] dark:text-white sm:text-xs sm:uppercase sm:tracking-wider sm:text-emerald-600 sm:dark:text-emerald-400">
                  {alert.title}
                </p>
              )}
              <div className="text-[12px] font-medium leading-relaxed text-[#667085] dark:text-slate-300 sm:text-xs sm:text-foreground md:text-sm">
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
