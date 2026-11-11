import React, { useEffect, useState, useMemo } from "react";
import PageLayout from "../components/layouts/PageLayout";
import NotificationBanner from "../components/ui/NotificationBanner";
import StatsCard from "../components/ui/StatsCard";
import SuperTabs from "../components/ui/SuperTabs";
import { PageSkeleton } from "../components/ui/Skeleton";
import { BookOpen, Layers, CheckCircle2, TrendingUp, GraduationCap } from "lucide-react";
import { parseStudyPlanPage } from "../parsers/studyPlan";
import { findFlexPageRoot } from "../parsers/dom";

function StudyPlanPage() {
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeSemIdx, setActiveSemIdx] = useState(0);

  useEffect(() => {
    const parseData = () => {
      try {
        const root = findFlexPageRoot(document);
        if (!root) {
          setLoading(false);
          return;
        }

        const parsed = parseStudyPlanPage(root);
        setAlerts(parsed.alerts);
        setSemesters(parsed.semesters);

        root.style.display = "none";

        setLoading(false);
      } catch (e) {
        console.error("Study Plan Parsing Error", e);
        setLoading(false);
      }
    };

    parseData();
  }, []);

  const stats = useMemo(() => {
    let totalCredits = 0;
    let totalCourses = 0;
    let coreCourses = 0;
    let electives = 0;

    semesters.forEach((sem) => {
      sem.courses.forEach((course) => {
        const isNC =
          course.type.toLowerCase().includes("non credit") ||
          course.code.toLowerCase().includes("nc");

        if (!isNC) {
          totalCredits += course.crHrs;
          totalCourses++;
          if (course.type.toLowerCase().includes("core")) coreCourses++;
          else if (course.type.toLowerCase().includes("elective")) electives++;
        }
      });
    });

    return { totalCredits, totalCourses, coreCourses, electives };
  }, [semesters]);

  const activeSemData = semesters[activeSemIdx];

  if (loading) {
    return (
      <PageLayout currentPage={window.location.pathname}>
        <PageSkeleton label="Loading tentative study plan" cards={4} rows={6} />
      </PageLayout>
    );
  }

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1600px] flex-col gap-3.5 pb-6 sm:gap-5 sm:pb-24">
        <header className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end sm:gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/85 sm:text-[10px] sm:tracking-[0.16em] sm:text-white/80">
              Academics
            </p>
            <h1 className="text-[28px] font-extrabold leading-[1.1] tracking-[-0.035em] text-white sm:text-3xl sm:font-bold sm:tracking-tight">
              Tentative Study Plan
            </h1>
            <p className="text-xs font-medium leading-relaxed text-white/85 sm:text-sm">
              Future suffering, planned. Agle semesters mein kya kya zaleel karega? Find out here.
            </p>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full bg-white/25 px-3.5 py-2 text-white backdrop-blur-md dark:bg-white/10 sm:gap-3 sm:bg-white/15 sm:px-4 sm:py-2.5 sm:text-[#101010] sm:dark:text-white">
            <GraduationCap size={16} className="sm:h-[19px] sm:w-[19px]" />
            <span className="text-xs font-semibold sm:text-sm">
              {semesters.length} planned semesters
            </span>
          </div>
        </header>

        <NotificationBanner alerts={alerts} />

        <div className="sf-mobile-cards-scroll pb-1 scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-4 sm:pb-0 xl:grid-cols-4">
          <StatsCard
            icon={BookOpen}
            label="Total Credits"
            value={stats.totalCredits}
            subValue="planned"
            variant="dashboard"
          />
          <StatsCard
            icon={Layers}
            label="Planned Courses"
            value={stats.totalCourses}
            subValue="across semesters"
            variant="dashboard"
          />
          <StatsCard
            icon={CheckCircle2}
            label="Core Courses"
            value={stats.coreCourses}
            subValue="in plan"
            variant="dashboard"
          />
          <StatsCard
            icon={TrendingUp}
            label="Electives"
            value={stats.electives}
            subValue="in plan"
            variant="dashboard"
          />
        </div>

        {semesters.length > 0 ? (
          <section className="overflow-hidden rounded-[22px] border border-black/[0.05] bg-white text-[#101027] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:rounded-[24px]">
            <div className="flex flex-col gap-3.5 border-b border-black/[0.06] p-4 dark:border-white/[0.1] sm:gap-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
              <SuperTabs<number>
                tabs={semesters.map((semester, index) => ({ value: index, label: semester.title }))}
                activeTab={activeSemIdx}
                onTabChange={setActiveSemIdx}
                size="sm"
                className="w-fit max-w-full border-0 bg-slate-100/80 dark:bg-white/[0.08]"
              />
              {activeSemData && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600 dark:bg-white/[0.08] dark:text-slate-300 sm:py-2">
                    {activeSemData.courses.length} courses
                  </span>
                  <span className="rounded-full bg-[#f2ecfc] px-3 py-1.5 text-[#230052] dark:bg-white/[0.12] dark:text-white sm:py-2">
                    {activeSemData.crHrs} credits
                  </span>
                </div>
              )}
            </div>

            {activeSemData && (
              <>
                <div className="flex items-center gap-3 px-4 pb-3 pt-4 sm:px-6 sm:pt-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f] sm:h-11 sm:w-11 sm:rounded-2xl">
                    <BookOpen size={20} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold tracking-[-0.02em] sm:text-lg">
                      {activeSemData.title}
                    </h2>
                    <p className="text-xs font-medium text-[#667085] dark:text-slate-400">
                      The Roadmap to Graduation (Hopefully)
                    </p>
                  </div>
                </div>
                {activeSemData.courses.length ? (
                  <>
                    {/* Mobile Native Course List */}
                    <div className="divide-y divide-black/[0.06] px-4 pb-2 dark:divide-white/[0.08] sm:hidden">
                      {activeSemData.courses.map((course, index) => (
                        <div
                          key={`${course.code}-${index}-mobile`}
                          className="flex items-center justify-between gap-3 py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold text-slate-900 dark:text-white sm:text-sm">
                              {course.title}
                            </p>
                            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-[#667085] dark:text-slate-400">
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                                {course.code}
                              </span>
                              <span>·</span>
                              <span>{course.crHrs} Cr.H</span>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full bg-[#f2ecfc] px-2.5 py-0.5 text-[10px] font-semibold text-[#230052] dark:bg-white/10 dark:text-white">
                            {course.type}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden overflow-x-auto sm:block">
                    <table className="sf-data-table w-full min-w-[620px] text-left">
                      <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
                        <tr>
                          <th className="px-5 py-3 sm:px-6">Course</th>
                          <th className="px-5 py-3">Course title</th>
                          <th className="px-5 py-3 text-center">Credits</th>
                          <th className="px-5 py-3 text-right sm:px-6">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeSemData.courses.map((course, index) => (
                          <tr
                            key={`${course.code}-${index}`}
                            className="border-t border-black/[0.05] dark:border-white/[0.08]"
                          >
                            <td className="px-5 py-4 sm:px-6">
                              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 dark:bg-white/[0.08] dark:text-slate-200">
                                {course.code}
                              </span>
                            </td>
                            <td className="max-w-[520px] truncate px-5 py-4 text-sm font-semibold">
                              {course.title}
                            </td>
                            <td className="px-5 py-4 text-center text-sm font-bold">
                              {course.crHrs}
                            </td>
                            <td className="px-5 py-4 text-right sm:px-6">
                              <span className="rounded-full bg-[#f2ecfc] px-3 py-1.5 text-[11px] font-bold text-[#230052] dark:bg-white/[0.1] dark:text-white">
                                {course.type}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </>
                ) : (
                  <div className="px-6 pb-6 text-center">
                    <p className="text-sm font-bold text-foreground">Future trauma not found.</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      No courses listed for this semester yet.
                    </p>
                  </div>
                )}
              </>
            )}
          </section>
        ) : (
          <section className="rounded-[24px] border border-black/[0.06] bg-white p-8 text-center dark:border-white/[0.14] dark:bg-black">
            <p className="text-sm font-bold text-foreground">Future trauma not found.</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              No tentative study plan is available yet.
            </p>
          </section>
        )}
      </div>
    </PageLayout>
  );
}

export default StudyPlanPage;
