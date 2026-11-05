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
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1600px] flex-col gap-5 pb-24">
        <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">Academics</p>
            <h1 className="text-3xl font-bold tracking-tight text-white">Tentative Study Plan</h1>
            <p className="text-sm text-white/80">Explore your planned courses and credit load by semester.</p>
          </div>
          <div className="flex w-fit items-center gap-3 rounded-full bg-white/15 px-4 py-2.5 text-[#101010] dark:bg-white/10 dark:text-white">
            <GraduationCap size={19} />
            <span className="text-sm font-semibold">{semesters.length} planned semesters</span>
          </div>
        </header>

        <NotificationBanner alerts={alerts} />

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
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
          <section className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb]">
            <div className="flex flex-col gap-4 border-b border-black/[0.06] p-4 dark:border-white/[0.1] sm:p-5 xl:flex-row xl:items-center xl:justify-between">
              <SuperTabs
                tabs={semesters.map((semester, index) => ({ value: index, label: semester.title }))}
                activeTab={activeSemIdx}
                onTabChange={setActiveSemIdx}
                size="sm"
                className="w-fit max-w-full border-0 bg-slate-100/80 dark:bg-white/[0.08]"
              />
              {activeSemData && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-600 dark:bg-white/[0.08] dark:text-slate-300">
                    {activeSemData.courses.length} courses
                  </span>
                  <span className="rounded-full bg-[#f2ecfc] px-3 py-2 text-[#230052] dark:bg-white/[0.12] dark:text-white">
                    {activeSemData.crHrs} credits
                  </span>
                </div>
              )}
            </div>

            {activeSemData && (
              <>
                <div className="flex items-center gap-3 px-4 pb-3 pt-5 sm:px-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]">
                    <BookOpen size={21} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold tracking-tight">{activeSemData.title}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Semester course plan</p>
                  </div>
                </div>
                {activeSemData.courses.length ? (
                  <div className="overflow-x-auto">
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
                          <tr key={`${course.code}-${index}`} className="border-t border-black/[0.05] dark:border-white/[0.08]">
                            <td className="px-5 py-4 sm:px-6">
                              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 dark:bg-white/[0.08] dark:text-slate-200">{course.code}</span>
                            </td>
                            <td className="max-w-[520px] truncate px-5 py-4 text-sm font-semibold">{course.title}</td>
                            <td className="px-5 py-4 text-center text-sm font-bold">{course.crHrs}</td>
                            <td className="px-5 py-4 text-right sm:px-6">
                              <span className="rounded-full bg-[#f2ecfc] px-3 py-1.5 text-[11px] font-bold text-[#230052] dark:bg-white/[0.1] dark:text-white">{course.type}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="px-6 pb-6 text-sm text-slate-500 dark:text-slate-400">No courses are listed for this semester.</p>
                )}
              </>
            )}
          </section>
        ) : (
          <section className="rounded-[24px] border border-black/[0.06] bg-white p-8 text-center text-sm text-slate-500 dark:border-white/[0.14] dark:bg-black dark:text-slate-400">
            No tentative study plan is available.
          </section>
        )}
      </div>
    </PageLayout>
  );
}

export default StudyPlanPage;
