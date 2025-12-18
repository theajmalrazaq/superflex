import React, { useEffect, useState, useMemo } from "react";
import PageLayout from "../layouts/PageLayout";
import { LoadingSpinner } from "../LoadingOverlay";
import {
  GraduationCap,
  BookOpen,
  Layers,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

const StatCard = ({ icon: Icon, label, value, subValue }) => (
  <div
    className="p-6 rounded-[2rem] border border-white/5 bg-zinc-900/50 backdrop-blur-xl hover:bg-zinc-900/70 transition-all duration-300 hover:-translate-y-1 group flex flex-col gap-4 h-full"
  >
    <div className="flex justify-between items-start mb-6">
      <div className="p-3.5 bg-[#a098ff]/10 rounded-2xl text-[#a098ff] group-hover:scale-110 transition-transform duration-300">
        <Icon size={24} />
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-xl font-bold text-white tracking-tight uppercase">
          {value}
        </h3>
        {subValue && (
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">{subValue}</span>
        )}
      </div>
    </div>
  </div>
);

function StudyPlanPage() {
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState([]);
  const [activeSemIdx, setActiveSemIdx] = useState(0);

  useEffect(() => {
    // Notify loading start
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

        const parsedSemesters = [];
        const semesterCols = root.querySelectorAll(".col-md-6");

        semesterCols.forEach((col) => {
          const h4 = col.querySelector("h4");
          if (!h4) return;

          const title = h4.textContent.replace(h4.querySelector("small")?.textContent || "", "").trim();
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
        
        // Hide original content
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

    semesters.forEach(sem => {
      sem.courses.forEach(course => {
        const isNC = course.type.toLowerCase().includes("non credit") || 
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
      <div className="w-full min-h-screen p-6 md:p-10 space-y-10 relative z-10">
        {/* Glow Effects */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#a098ff]/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none z-0"></div>
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none z-0"></div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Study <span className="text-[#a098ff]">Plan</span>
            </h1>
            <p className="text-zinc-400 font-medium font-sans">
              Degree requirements and course roadmaps
            </p>
          </div>
          <div className="flex items-center gap-4 bg-zinc-900/50 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-xl">
            <div className="text-right">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Graduation Path</p>
              <h4 className="text-lg font-bold text-white">4 Year Degree</h4>
            </div>
            <div className="w-px h-8 bg-white/10 mx-2"></div>
            <GraduationCap className="text-[#a098ff]" size={24} />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={BookOpen} 
            label="Total Credits" 
            value={stats.totalCredits} 
            subValue="to Graduate"
          />
          <StatCard 
            icon={Layers} 
            label="Core Courses" 
            value={stats.coreCourses} 
            subValue="Required"
          />
          <StatCard 
            icon={TrendingUp} 
            label="Electives" 
            value={stats.electives} 
            subValue="Available"
          />
          <StatCard 
            icon={CheckCircle2} 
            label="Semesters" 
            value={semesters.length} 
            subValue="Planned"
          />
        </div>

        {/* Content Section */}
        <div className="space-y-8">
          {/* Semester Selector */}
          <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex gap-2 bg-black/40 p-1.5 rounded-full border border-white/5 backdrop-blur-sm overflow-x-auto custom-scrollbar no-scrollbar min-w-fit">
                {semesters.map((sem, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSemIdx(idx)}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                      activeSemIdx === idx
                        ? "bg-[#a098ff] text-white shadow-lg shadow-[#a098ff]/20"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    {sem.title}
                  </button>
                ))}
              </div>
              
              {activeSemData && (
                <div className="flex items-center gap-6 pr-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Semester Load</p>
                    <span className="text-xl font-bold text-[#a098ff] font-sans">
                      {activeSemData.crHrs} <span className="text-xs text-zinc-500 uppercase ml-1">Credits</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Semester Courses */}
          {activeSemData && (
            <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 overflow-hidden">
               <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-8">
                  <div className="p-3 bg-zinc-800 rounded-xl text-zinc-400">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{activeSemData.title} Timeline</h3>
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Curriculum Roadmap</p>
                  </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left order-collapse border-spacing-0">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Code</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Course Title</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-center">Cr.H</th>
                        <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-right">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {activeSemData.courses.map((course, cIdx) => (
                        <tr key={cIdx} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-5">
                            <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-[10px] font-bold tracking-tight border border-white/5">
                              {course.code}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-white font-medium group-hover:text-[#a098ff] transition-colors">
                              {course.title}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="text-zinc-400 font-bold font-sans">
                              {course.crHrs}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              course.type === "Core" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
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
