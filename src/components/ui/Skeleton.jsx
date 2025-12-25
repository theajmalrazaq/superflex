import React from "react";

const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-zinc-800/50 rounded-lg ${className}`}></div>
  );
};

export const MarksSkeleton = () => {
  return (
    <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 overflow-hidden flex flex-col gap-8 h-full w-full">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-10 w-20 rounded-full" />
        <Skeleton className="h-10 w-20 rounded-full" />
        <Skeleton className="h-10 w-20 rounded-full" />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

export const AttendanceSkeleton = () => {
  return (
    <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 h-full flex flex-col w-full">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="flex-1 space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-4 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton;
