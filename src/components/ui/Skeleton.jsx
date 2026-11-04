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
    <div className="flex-1 space-y-4 overflow-hidden py-1" aria-label="Loading attendance heatmap" role="status">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-3 w-48" />
        <div className="flex gap-3"><Skeleton className="h-3 w-12" /><Skeleton className="h-3 w-12" /></div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-3 xl:grid-cols-5">
        {[0, 1, 2, 3, 4].map((subject) => (
          <div key={subject} className="flex min-w-0 flex-col items-start py-1">
            <div className="mb-2 flex h-[154px] max-h-[180px] flex-col flex-wrap content-start gap-1 overflow-hidden py-1">
              {Array.from({ length: 28 }, (_, dot) => (
                <Skeleton key={dot} className="h-3.5 w-3.5 shrink-0 rounded-[3px]" />
              ))}
            </div>
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="mt-1 h-2.5 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton;
