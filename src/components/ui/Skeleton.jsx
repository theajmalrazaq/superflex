import React from "react";

const Skeleton = ({ className }) => {
  return <div className={`animate-pulse bg-tertiary/50 rounded-lg ${className}`}></div>;
};

export const MarksSkeleton = () => {
  return (
    <div className="flex flex-1 flex-col gap-7" aria-label="Loading course performance" role="status">
      <div className="flex gap-2 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9 w-20 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-3 w-28" />
        <div className="space-y-3 pt-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const AttendanceSkeleton = () => {
  return (
    <div className="flex flex-1 flex-col justify-around gap-6 py-2" aria-label="Loading attendance" role="status">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="h-5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className="h-full w-1/3 origin-left rounded-full bg-[#230052] animate-dashboard-bar-fill dark:bg-[#a098ff]"
              style={{ animationDelay: `${i * 180}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
