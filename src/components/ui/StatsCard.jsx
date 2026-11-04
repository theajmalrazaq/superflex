import React from "react";

const StatsCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  delay = 0,
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
        className={`flex h-full min-h-[156px] min-w-0 flex-col rounded-[32px] border border-black/[0.06] bg-white p-5 text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:p-6 ${className}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[36%] ${dashboardIconTones[iconTone] || dashboardIconTones.lavender}`}>
            <Icon size={25} strokeWidth={2} />
          </div>
          <p className="truncate text-sm font-semibold text-[#40404a] dark:text-[#c4cad6]">
            {label}
          </p>
        </div>
        <h3 className={`mt-auto truncate pt-5 font-sans text-[28px] font-bold leading-none tracking-[-0.04em] text-[#101010] dark:text-[#f5f6fb] sm:text-[32px] ${valueClassName}`}>
          {value}
        </h3>
        {subValue && (
          <div className="mt-2 min-h-4 truncate text-[11px] font-medium text-[#777780] dark:text-[#9ca3b3]">
            {subValue}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`min-w-[200px] flex-1 rounded-[32px] border border-black/[0.06] bg-white p-6 text-[#101010] shadow-none transition-colors hover:bg-white dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] dark:hover:bg-black ${className}`}
    >
      <div className="mb-6 flex items-start justify-between">
        <div className="rounded-2xl bg-[#f2ecfc] p-3.5 text-[#230052] dark:bg-white/10 dark:text-[#c1baff]">
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
      <p className="mb-1 truncate text-[11px] font-bold uppercase tracking-wide text-[#626262] dark:text-[#c4cad6]">
        {label}
      </p>
      <div className="flex items-baseline gap-2 overflow-hidden">
        <h3 className="truncate font-sans text-2xl font-extrabold tracking-tight text-[#101010] dark:text-[#f5f6fb] md:text-3xl">
          {value}
        </h3>
        {subValue && (
          <span className="min-w-0 truncate text-[10px] font-bold text-[#626262] dark:text-[#c4cad6]">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
