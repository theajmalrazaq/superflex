import React, { useEffect, useState, useMemo } from "react";
import PageLayout from "../components/layouts/PageLayout";
import NotificationBanner from "../components/ui/NotificationBanner";
import PageHeader from "../components/ui/PageHeader";
import StatsCard from "../components/ui/StatsCard";
import SuperTabs from "../components/ui/SuperTabs";
import LoadingOverlay, {
  LoadingSpinner,
} from "../components/ui/LoadingOverlay";
import {
  BookOpen,
  Layers,
  CheckCircle2,
  TrendingUp,
  GraduationCap,
} from "lucide-react";

function StudyPlanPage() {
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeSemIdx, setActiveSemIdx] = useState(0);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("superflex-update-loading", { detail: true }),
    );

    const parseData = () => {
      try {
        const root = document.querySelector(
          ".m-grid.m-grid--hor.m-grid--root.m-page",
        );
        if (!root) {
          setLoading(false);
          window.dispatchEvent(
            new CustomEvent("superflex-update-loading", { detail: false }),
          );
          return;
        }

        const alertList = [];
        root.querySelectorAll(".m-alert, .alert").forEach((alert) => {
          if (
            alert.style.display === "none" ||
            alert.id === "DataErrormsgdiv" ||
            alert.closest(".modal")
          )
            return;

          const textContainer = alert.querySelector(".m-alert__text") || alert;
          const clone = textContainer.cloneNode(true);

          clone
            .querySelectorAll(
              ".m-alert__close, button, a, strong, .m-alert__icon",
            )
            .forEach((el) => el.remove());

          let message = clone.textContent
            .replace(/Alert!/gi, "")
            .replace(/Close/gi, "")
            .replace(/&nbsp;/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          if (message && message.length > 3) {
            const type =
              alert.classList.contains("alert-danger") ||
              alert.classList.contains("m-alert--outline-danger")
                ? "error"
                : "info";
            alertList.push({ type, message });
          }
        });
        setAlerts(alertList);

        const parsedSemesters = [];
        const semesterCols = root.querySelectorAll(".col-md-6");

        semesterCols.forEach((col) => {
          const h4 = col.querySelector("h4");
          if (!h4) return;

          const title = h4.textContent
            .replace(h4.querySelector("small")?.textContent || "", "")
            .trim();
          const crHrsText = h4.querySelector("small")?.textContent || "";
          const crHrs = parseInt(crHrsText.match(/\d+/)?.[0] || "0");

          const courses = [];
          const table = col.querySelector("table");
          if (table) {
            table.querySelectorAll("tbody tr").forEach((tr) => {
              const cells = tr.querySelectorAll("td");
              if (cells.length >= 4) {
                courses.push({
                  code: cells[0].textContent.trim(),
                  title: cells[1].textContent.trim(),
                  crHrs: parseInt(cells[2].textContent.trim()),
                  type: cells[3].textContent.trim(),
                });
              }
            });
          }

          parsedSemesters.push({ title, crHrs, courses });
        });

        setSemesters(parsedSemesters);

        root.style.display = "none";

        setLoading(false);
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
      } catch (e) {
        console.error("Study Plan Parsing Error", e);
        setLoading(false);
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
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
          if (course.type === "Core") coreCourses++;
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
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="w-full min-h-screen p-4 md:p-8 space-y-10 relative z-10">
        {}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-x/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none z-0"></div>
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none z-0"></div>

        <PageHeader
          title="Study Plan"
          subtitle="Degree requirements and course roadmaps"
        >
          <div className="flex items-center gap-4 bg-zinc-900/50 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-xl">
            <div className="text-right">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Graduation Path
              </p>
              <h4 className="text-lg font-bold text-white">4 Year Degree</h4>
            </div>
            <div className="w-px h-8 bg-white/10 mx-2"></div>
            <GraduationCap className="text-x" size={24} />
          </div>
        </PageHeader>

        <NotificationBanner alerts={alerts} />

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={BookOpen}
            label="Total Credits"
            value={stats.totalCredits}
            subValue="to Graduate"
            delay={100}
          />
          <StatsCard
            icon={Layers}
            label="Core Courses"
            value={stats.coreCourses}
            subValue=""
            delay={200}
          />
          <StatsCard
            icon={TrendingUp}
            label="Electives"
            value={stats.electives}
            subValue=""
            delay={300}
          />
          <StatsCard
            icon={CheckCircle2}
            label="Semesters"
            value={semesters.length}
            subValue="Planned"
            delay={400}
          />
        </div>

        {}
        <div className="space-y-8">
          {}
          <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <SuperTabs
                tabs={semesters.map((s, idx) => ({
                  value: idx,
                  label: s.title,
                }))}
                activeTab={activeSemIdx}
                onTabChange={setActiveSemIdx}
              />

              {activeSemData && (
                <div className="flex items-center gap-6 pr-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">
                      Year
                    </p>
                    <span className="text-xl font-bold text-x font-sans">
                      {activeSemData.crHrs}{" "}
                      <span className="text-xs text-zinc-500 uppercase ml-1">
                        Courses
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {}
          {activeSemData && (
            <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 overflow-hidden">
              <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-8">
                <div className="p-3 bg-zinc-800 rounded-xl text-zinc-400">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {activeSemData.title} Timeline
                  </h3>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                    Curriculum Roadmap
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left order-collapse border-spacing-0">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                        Course Title
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-center">
                        Cr.H
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-right">
                        Category
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activeSemData.courses.map((course, cIdx) => (
                      <tr
                        key={cIdx}
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-5">
                          <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-[10px] font-bold tracking-tight border border-white/5">
                            {course.code}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-white font-medium group-hover:text-x transition-colors">
                            {course.title}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-zinc-400 font-bold font-sans">
                            {course.crHrs}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              course.type === "Core"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {course.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default StudyPlanPage;
