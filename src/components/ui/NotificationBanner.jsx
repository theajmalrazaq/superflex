import React from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
const NotificationBanner = ({
  alerts,
  onActionClick,
  actionLabel = "More Instruction",
}) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        {onActionClick && (
          <button
            onClick={onActionClick}
            className="group/btn flex items-center gap-2 px-4 py-1.5 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-full text-[9px] font-black Cap border border-foreground/10"
          >
            {actionLabel}
            <ChevronRight
              size={10}
              className="group-hover/btn:translate-x-1 transition-transform"
            />
          </button>
        )}
      </div>

      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-[2rem] border backdrop-blur-2xl flex items-center gap-5 relative overflow-hidden group ${
            alert.type === "error"
              ? "bg-error/5 border-error/10 text-error"
              : "bg-info/5 border-info/10 text-info"
          }`}
        >
          <div
            className={`p-3 rounded-xl shrink-0 ${
              alert.type === "error"
                ? "bg-error/10 text-error"
                : "bg-info/10 text-info"
            }`}
          >
            <AlertTriangle size={20} />
          </div>

          <div className="space-y-0.5 flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium leading-relaxed">
              {alert.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationBanner;
