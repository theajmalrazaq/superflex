import React from "react";

const Skeleton = ({ className }) => {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-black/[0.08] dark:bg-white/[0.12] ${className || ""}`}
    />
  );
};

export const PageSkeleton = ({
  label = "Loading page",
  cards = 4,
  rows = 5,
  showTabs = true,
  showHeader = true,
}) => (
  <div
    className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1600px] flex-col gap-7 pb-24"
    role="status"
    aria-label={label}
    aria-busy="true"
  >
    <span className="sr-only">{label}</span>
    {showHeader && (
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div className="space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-64 max-w-[75vw]" />
          <Skeleton className="h-4 w-80 max-w-[85vw]" />
        </div>
        {showTabs && <Skeleton className="h-10 w-72 max-w-full rounded-full" />}
      </header>
    )}

    {cards > 0 && (
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: cards }, (_, item) => (
          <div
            key={item}
            className="flex min-h-[150px] flex-col rounded-[24px] border border-black/[0.04] bg-white/80 p-5 dark:border-white/[0.08] dark:bg-black/70 sm:p-6"
          >
            <Skeleton className="h-11 w-11 rounded-[36%]" />
            <Skeleton className="mt-auto h-7 w-24" />
            <Skeleton className="mt-2 h-3 w-32 max-w-full" />
          </div>
        ))}
      </div>
    )}

    <section className="overflow-hidden rounded-[24px] border border-black/[0.04] bg-white/80 p-5 dark:border-white/[0.08] dark:bg-black/70 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-64 max-w-[55vw]" />
        </div>
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, item) => (
          <div
            key={item}
            className="flex items-center gap-4 border-t border-black/[0.05] py-4 first:border-0 dark:border-white/[0.08]"
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-[36%]" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-64 max-w-full" />
              <Skeleton className="h-3 w-40 max-w-[70%]" />
            </div>
            <Skeleton className="h-7 w-20 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </section>
  </div>
);

export const LoginSkeleton = () => (
  <div
    className="fixed inset-0 z-[10000] flex min-h-[100dvh] items-center justify-center bg-[linear-gradient(180deg,#62abe0_0%,#73b3e1_24%,#9ac7e8_38%,#dcebf5_49%,#fff_57%)] px-4 dark:bg-[linear-gradient(180deg,#1f689d_0%,#1e5e8c_24%,#174465_38%,#0a1923_49%,#000_57%)]"
    role="status"
    aria-label="Loading sign in"
    aria-busy="true"
  >
    <span className="sr-only">Loading sign in</span>
    <div className="w-full max-w-[480px] space-y-5 rounded-[32px] bg-white p-7 dark:bg-black sm:p-8">
      <div className="flex flex-col items-center">
        <Skeleton className="h-[52px] w-[52px] rounded-2xl" />
        <Skeleton className="mt-4 h-7 w-32" />
        <Skeleton className="mt-3 h-3 w-64 max-w-full" />
      </div>
      {[0, 1].map((item) => (
        <div key={item} className="space-y-2">
          <Skeleton className="ml-4 h-3 w-20" />
          <Skeleton className="h-[52px] w-full rounded-full" />
        </div>
      ))}
      <Skeleton className="h-[52px] w-full rounded-full" />
      <Skeleton className="mx-auto h-3 w-28" />
    </div>
  </div>
);

export const MarksSkeleton = () => {
  return (
    <div
      className="flex flex-1 flex-col gap-7"
      aria-label="Loading course performance"
      role="status"
    >
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
    <div
      className="flex-1 space-y-4 overflow-hidden py-1"
      aria-label="Loading attendance heatmap"
      role="status"
    >
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-3 w-48" />
        <div className="flex gap-3">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
        </div>
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
