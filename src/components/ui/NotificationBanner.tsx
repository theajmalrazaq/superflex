import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronRight, Info, Sparkles, X } from "lucide-react";

export interface NotificationAlert {
  type: "error" | "info" | "success" | "warning" | "update";
  message?: string;
  text?: string;
  title?: string;
  dismissible?: boolean;
}

export interface NotificationBannerProps {
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
    <div className="flex flex-col gap-3 sm:gap-3.5">
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
        const type = alert.type || "info";

        let borderClass = "border-[#230052]/20 dark:border-white/20";
        let iconBgClass =
          "bg-[#230052]/8 text-[#230052] ring-1 ring-[#230052]/15 dark:bg-white/10 dark:text-white dark:ring-white/20";
        let titleColor = "text-[#230052] dark:text-white";
        let IconComponent = Info;

        if (type === "success") {
          borderClass = "border-emerald-500/30 dark:border-emerald-500/35";
          iconBgClass =
            "bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:ring-emerald-500/30";
          titleColor = "text-emerald-700 dark:text-emerald-400";
          IconComponent = CheckCircle2;
        } else if (type === "error") {
          borderClass = "border-rose-500/30 dark:border-rose-500/35";
          iconBgClass =
            "bg-rose-500/10 text-rose-600 ring-1 ring-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400 dark:ring-rose-500/30";
          titleColor = "text-rose-700 dark:text-rose-400";
          IconComponent = AlertCircle;
        } else if (type === "warning") {
          borderClass = "border-amber-500/30 dark:border-amber-500/35";
          iconBgClass =
            "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:ring-amber-500/30";
          titleColor = "text-amber-700 dark:text-amber-400";
          IconComponent = AlertTriangle;
        } else if (type === "update") {
          borderClass = "border-violet-500/30 dark:border-violet-500/35";
          iconBgClass =
            "bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/20 dark:bg-violet-500/20 dark:text-violet-400 dark:ring-violet-500/30";
          titleColor = "text-violet-700 dark:text-violet-400";
          IconComponent = Sparkles;
        }

        const messageText = alert.message || alert.text;

        return (
          <div
            key={idx}
            role="status"
            className={`relative flex items-center gap-3 overflow-hidden rounded-[20px] border bg-white/95 p-3.5 text-[#101027] backdrop-blur-md dark:bg-[#0c0d12]/95 dark:text-[#f5f6fb] sm:gap-3.5 sm:rounded-[22px] sm:p-4 ${borderClass} shadow-none animate-in fade-in slide-in-from-top-2 duration-300`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[28%] sm:h-10 sm:w-10 ${iconBgClass}`}
            >
              <IconComponent size={18} className="sm:h-5 sm:w-5" />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              {alert.title && (
                <p className={`text-[13px] font-bold tracking-tight sm:text-sm ${titleColor}`}>
                  {alert.title}
                </p>
              )}
              {messageText && (
                <p className="text-xs font-medium leading-relaxed text-foreground/75 dark:text-foreground/80 sm:text-[13px]">
                  {messageText}
                </p>
              )}
            </div>

            {alert.dismissible && onDismissAlert && (
              <button
                type="button"
                onClick={() => onDismissAlert(alert)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-foreground/40 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10 transition-colors"
                title="Dismiss"
                aria-label="Dismiss notification"
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
