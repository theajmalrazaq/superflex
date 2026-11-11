import React from "react";

const StatsCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  className = "",
  variant = "default",
  iconTone = "lavender",
  valueClassName = "",
}) => {
  const dashboardStyle = variant === "dashboard";
  const dashboardIconTones = {
    plum: "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]",
    lavender: "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]",
    neutral: "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]",
  };

  if (dashboardStyle) {
    return (
      <div
        className={`flex h-full min-h-[132px] min-w-0 flex-col rounded-[22px] border border-black/[0.05] bg-white p-4 text-[#101027] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:min-h-[156px] sm:rounded-[32px] sm:p-6 ${className}`}
      >
        <div className="flex min-w-0 flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] sm:h-14 sm:w-14 sm:rounded-2xl ${dashboardIconTones[iconTone] || dashboardIconTones.lavender}`}
          >
            <Icon size={19} strokeWidth={2} className="sm:h-[25px] sm:w-[25px]" />
          </div>
          <p className="w-full truncate text-xs font-semibold leading-snug text-[#667085] dark:text-[#c4cad6] sm:text-sm sm:font-semibold sm:text-[#40404a]">
            {label}
          </p>
        </div>
        <h3
          className={`mt-auto truncate pt-2 font-sans text-[22px] font-bold leading-none tracking-[-0.035em] text-[#101027] dark:text-[#f5f6fb] sm:pt-5 sm:text-[32px] sm:tracking-[-0.04em] ${valueClassName}`}
        >
          {value}
        </h3>
        {subValue && (
          <div className="mt-1 min-h-3.5 truncate text-[11px] font-medium text-[#667085] dark:text-[#9ca3b3] sm:mt-2 sm:min-h-4">
            {subValue}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`min-w-[152px] flex-1 rounded-[22px] border border-black/[0.05] bg-white p-4 text-[#101027] shadow-none transition-colors hover:bg-white dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] dark:hover:bg-black sm:min-w-[200px] sm:rounded-[32px] sm:p-6 ${className}`}
    >
      <div className="mb-3 flex items-start justify-between sm:mb-6">
        <div className="rounded-[11px] bg-[#230052] p-2.5 text-white dark:bg-white dark:text-[#0a192f] sm:rounded-2xl sm:p-3.5">
          <Icon size={19} strokeWidth={2.25} className="sm:h-6 sm:w-6" />
        </div>
      </div>
      <p className="mb-1 truncate text-xs font-semibold text-[#667085] dark:text-[#c4cad6] sm:text-[11px] sm:font-bold sm:uppercase sm:tracking-wide">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5 overflow-hidden sm:gap-2">
        <h3 className="truncate font-sans text-[22px] font-bold tracking-[-0.035em] text-[#101027] dark:text-[#f5f6fb] sm:text-2xl md:text-3xl">
          {value}
        </h3>
        {subValue && (
          <span className="min-w-0 truncate text-[11px] font-medium text-[#667085] dark:text-[#c4cad6]">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
