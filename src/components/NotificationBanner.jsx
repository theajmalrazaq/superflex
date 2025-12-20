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
            className="group/btn flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-full text-[9px] font-black uppercase border border-white/5"
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
              ? "bg-rose-500/5 border-rose-500/10 text-rose-200"
              : "bg-[#0ea5e9]/5 border-[#0ea5e9]/10 text-blue-200"
          }`}
        >
          <div
            className={`p-3 rounded-xl shrink-0 ${
              alert.type === "error"
                ? "bg-rose-500/10 text-rose-500"
                : "bg-[#0ea5e9]/10 text-[#0ea5e9]"
            }`}
          >
            <AlertTriangle size={20} />
          </div>

          <div className="space-y-0.5 flex-1 min-w-0">
            <p className="text-sm font-medium leading-relaxed truncate group-hover:whitespace-normal transition-all">
              {alert.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationBanner;
