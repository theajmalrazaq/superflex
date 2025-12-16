import React, { useEffect, useState, useRef } from "react";
import PageLayout from "../layouts/PageLayout";
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  BookOpen, 
  BarChart2, 
  AlertCircle,
  Filter,
  ChevronDown
} from "lucide-react";

// --- Components ---

const CourseSelector = ({ courses, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedCourse = courses.find(c => c.id === selectedId) || courses[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full md:w-auto z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:w-[350px] flex items-center justify-between px-3 py-2.5 rounded-[2rem] bg-zinc-900/50 border border-white/5 text-white hover:bg-white/5 transition-all group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
             <div className="p-2 rounded-xl bg-[#a098ff]/10 text-[#a098ff]">
                <BookOpen size={16} />
             </div>
             <div className="flex flex-col items-start truncate">
                 <span className="text-[10px] text-[#a098ff] font-bold uppercase tracking-wider leading-none mb-0.5">Selected Course</span>
                 <span className="text-sm font-bold truncate w-full text-left leading-none">{selectedCourse?.title}</span>
             </div>
        </div>
        <ChevronDown size={16} className={`text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-black/50 backdrop-blur-2xl border border-white/10 shadow-2xl max-h-[60vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
           <div className="flex flex-col gap-3">
              {courses.map(course => (
                 <button
                    key={course.id}
                    onClick={() => {
                       onSelect(course.id);
                       setIsOpen(false);
                    }}
                    className={`w-full flex bg-zinc-900 items-center justify-between p-3 rounded-xl transition-all ${
                       selectedId === course.id 
                       ? "bg-[#a098ff]/10 border border-[#a098ff]/20" 
                       : "hover:bg-white/5 border border-transparent"
                    }`}
                 >
                    <div className="flex items-center gap-3 text-left overflow-hidden">
                       <span className={`text-sm font-medium truncate ${selectedId === course.id ? "text-white" : "text-zinc-400"}`}>
                          {course.title}
                       </span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                        course.percentage >= 75 ? "bg-emerald-500/20 text-emerald-400" :
                        course.percentage >= 60 ? "bg-amber-500/20 text-amber-400" :
                        "bg-rose-500/20 text-rose-400"
                    }`}>
                        {course.percentage.toFixed(0)}%
                    </span>
                 </button>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};
const AttendanceCard = ({ record, index, isMarked, onToggleMark }) => {
  const isPresent = record.status.includes("P");
  return (
    <div 
      onClick={onToggleMark}
      className={`group cursor-pointer flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
        isMarked 
        ? "bg-[#a098ff]/10 border-[#a098ff]/50 shadow-[0_0_15px_rgba(160,152,255,0.15)]" 
        : "bg-zinc-900/30 border-transparent hover:bg-zinc-900/50 hover:border-white/5"
      }`}
    >
      <div className="flex items-center gap-4">
        <span className={`font-bold text-sm min-w-[1.5rem] ${isMarked ? "text-[#a098ff]" : "text-zinc-600"}`}>{index}.</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
          isPresent 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
        }`}>
          {isPresent ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
             <span className="text-white font-medium text-sm">{record.date}</span>
             <span className="text-zinc-500 text-xs px-2 py-0.5 rounded-full bg-white/5">{record.day}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500">
             <span className="flex items-center gap-1">
               <Clock size={12} /> {record.time || "N/A"}
             </span>
             <span className="flex items-center gap-1">
               <BookOpen size={12} /> {record.type || "Lecture"}
             </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
         <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
            isPresent 
            ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10" 
            : "bg-rose-500/5 text-rose-400 border-rose-500/10"
         }`}>
           {isPresent ? "Present" : "Absent"}
         </div>
         {isMarked && <span className="text-[10px] text-[#a098ff] font-bold tracking-wider uppercase animate-pulse">Marked</span>}
      </div>
    </div>
  );
};

const SummaryStat = ({ icon: Icon, label, value, colorClass }) => (
  <div className="flex-1 min-w-[140px] p-6 rounded-[2rem] bg-zinc-900/50 backdrop-blur-xl hover:bg-zinc-900/70 transition-all duration-300 hover:-translate-y-1 group">
    <div className="flex justify-between items-start mb-6">
       <div className="p-3.5 bg-[#a098ff]/10 rounded-2xl text-[#a098ff] group-hover:scale-110 transition-transform duration-300">
         <Icon size={24} />
       </div>
    </div>
    <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-1">{label}</p>
    <h3 className="text-xl font-bold text-white truncate">{value}</h3>
  </div>
);

function AttendancePage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [alertInfo, setAlertInfo] = useState(null);
  const [markedRecords, setMarkedRecords] = useState(() => {
      // Load from local storage on init
      if (typeof window !== "undefined") {
          const saved = localStorage.getItem("superflex_marked_attendance");
          return new Set(saved ? JSON.parse(saved) : []);
      }
      return new Set();
  });
  useEffect(() => {
      localStorage.setItem("superflex_marked_attendance", JSON.stringify([...markedRecords]));
  }, [markedRecords]);
  
  const [semesters, setSemesters] = useState([]);
  const hiddenFormRef = useRef(null);

  useEffect(() => {
    // 1. Parsing Logic
    const parseData = () => {
      try {
        const root = document.querySelector(".m-grid.m-grid--hor.m-grid--root.m-page");
        if (!root) {
             // If root not found, maybe wait or we are already cleaned
             return;
        }

        // Extract Alert if any
        const alertEl = root.querySelector(".alert");
        if(alertEl && alertEl.textContent.trim().length > 0) {
           setAlertInfo({
              type: alertEl.classList.contains("alert-danger") ? "error" : "info",
              message: alertEl.textContent.trim()
           });
        }

        // Extract Form
        // Extract Form & Semesters
        const legacyForm = document.querySelector('form[action="/Student/StudentAttendance"]');
        if(legacyForm) {
           const select = legacyForm.querySelector("select");
           if(select) {
               const opts = Array.from(select.options).map(o => ({
                   label: o.text.trim(),
                   value: o.value,
                   selected: o.selected
               }));
               setSemesters(opts);
               
               // Clone form for hidden submission
               if(hiddenFormRef.current) {
                   hiddenFormRef.current.innerHTML = "";
                   const formClone = legacyForm.cloneNode(true);
                   hiddenFormRef.current.appendChild(formClone);
               }
           }
        }

        // Extract Courses
        const parsedCourses = [];
        const tabPanes = root.querySelectorAll(".tab-pane");
        
        tabPanes.forEach((pane) => {
            let title = pane.querySelector("h5")?.textContent.trim() || pane.id;
             // Clean title (remove semester info often found in parens)
            title = title.replace(/\(.*\)/, "").trim();

            const prog = pane.querySelector(".progress-bar");
            const percentage = prog ? parseFloat(prog.getAttribute("aria-valuenow") || 0) : 0;
            
            const records = [];
            const rows = pane.querySelectorAll("tbody tr");
            
            rows.forEach(row => {
               const cols = row.querySelectorAll("td");
               if(cols.length >= 4) {
                  const dateStr = cols[1]?.textContent.trim();
                  // Parse date for Day info
                  let day = "";
                  try {
                      // Attempt to parse '16-Dec-2024' format
                      const parts = dateStr.split('-');
                      if(parts.length === 3) {
                          const d = new Date(`${parts[1]} ${parts[0]}, ${parts[2]}`);
                          if(!isNaN(d)) day = d.toLocaleDateString('en-US', { weekday: 'short' });
                      }
                  } catch(e) {}

                  records.push({
                      date: dateStr,
                      day: day,
                      time: cols[2]?.textContent.trim(),
                      status: cols[3]?.textContent.trim(),
                      type: cols[4]?.textContent.trim() || "Lecture"
                  });
               }
            });

            parsedCourses.push({
                id: pane.id,
                title,
                percentage,
                records,
                present: records.filter(r => r.status.includes("P")).length,
                absent: records.filter(r => r.status.includes("A")).length
            });
        });

        setCourses(parsedCourses);
        if(parsedCourses.length > 0) setSelectedCourseId(parsedCourses[0].id);

        // Cleanup Legacy
        root.style.display = "none";
        setLoading(false);

      } catch (e) {
        console.error("Attendance Parsing Error", e);
        setLoading(false);
      }
    };
    parseData();
    return () => {
    }
  }, []);

  const selectedCourseData = courses.find(c => c.id === selectedCourseId);

  return (
    <PageLayout currentPage={window.location.pathname}>
       <div className="w-full min-h-screen p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
             <div className="space-y-2">
               <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                  Attendance
               </h1>
               <p className="text-zinc-400 font-medium">
                  Track your presence and schedule
               </p>
             </div>
             
             <div className="flex flex-col md:flex-row items-end gap-4">
                 {/* Semester Selector Pills */}
                 <div className="flex gap-2 bg-zinc-900/50 p-1.5 rounded-full border border-white/5 backdrop-blur-sm self-start md:self-auto overflow-x-auto custom-scrollbar max-w-full">
                    {semesters.map((sem, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                if(hiddenFormRef.current) {
                                    const select = hiddenFormRef.current.querySelector("select");
                                    if(select) {
                                        select.value = sem.value;
                                        // Submit the form
                                        const form = hiddenFormRef.current.querySelector("form");
                                        if(form) form.submit();
                                    }
                                }
                            }}
                            className={`px-5 py-2 border rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                                sem.selected
                                ? "bg-[#a098ff]/10 text-[#a098ff] border-[#a098ff]/20"
                                : "text-zinc-500 border-transparent hover:text-white hover:bg-white/5"
                            }`}
                        >
                            {sem.label}
                        </button>
                    ))}
                </div>
                
                {/* Course Selector Dropdown */}
                <div className="w-full md:w-auto">
                    <CourseSelector 
                      courses={courses}
                      selectedId={selectedCourseId}
                      onSelect={setSelectedCourseId}
                    />
                </div>
                
                {/* Hidden Form for Submission */}
                <div ref={hiddenFormRef} className="hidden"></div>
             </div>
          </div>

          {/* Alert Section */}
          {alertInfo && (
              <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  alertInfo.type === 'error' 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-200' 
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-200'
              }`}>
                  <AlertCircle size={20} />
                  <span className="font-semibold text-sm">{alertInfo.message}</span>
              </div>
          )}

          {loading ? (
             <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
             </div>
          ) : courses.length > 0 ? (
             <>
                {/* Course Pills */}


                {/* Selected Course Detail */}
                {selectedCourseData && (
                   <div key={selectedCourseId} className="space-y-16 animate-in slide-in-from-bottom-4 duration-500">
                      
                      {/* Stats Overview */}
                      <div className="flex flex-wrap gap-4">
                         <SummaryStat 
                            icon={BarChart2}
                            label="Attendance Percentage"
                            value={`${selectedCourseData.percentage}%`}
                             colorClass="bg-[#a098ff] text-[#a098ff]"
                          />
                          <SummaryStat 
                             icon={CheckCircle2}
                             label="Present"
                             value={selectedCourseData.present}
                             colorClass="bg-[#a098ff] text-[#a098ff]"
                          />
                          <SummaryStat 
                             icon={XCircle}
                             label="Absent"
                             value={selectedCourseData.absent}
                             colorClass="bg-[#a098ff] text-[#a098ff]"
                          />
                          <SummaryStat 
                             icon={Calendar}
                             label="Classes"
                             value={selectedCourseData.records.length}
                             colorClass="bg-[#a098ff] text-[#a098ff]"
                          />
                      </div>

                      {/* Records List */}
                      <div className="bg-zinc-900/30 rounded-[2rem] p-6 backdrop-blur-xl">
                         <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">History Log</h3>
                            <div className="px-3 py-1 rounded-lg bg-white/5 text-xs text-zinc-400 font-medium">
                               Session History
                            </div>
                         </div>
                                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             {selectedCourseData.records.map((record, idx) => {
                                const recordId = `${selectedCourseId}-${idx}`; // Unique ID for each record
                                return (
                                   <AttendanceCard 
                                      key={idx} 
                                      record={record} 
                                      index={idx + 1}
                                      isMarked={markedRecords.has(recordId)}
                                      onToggleMark={() => {
                                         const newSet = new Set(markedRecords);
                                         if(newSet.has(recordId)) newSet.delete(recordId);
                                         else newSet.add(recordId);
                                         setMarkedRecords(newSet);
                                      }}
                                   />
                                );
                             })}
                          </div>
                         
                         {selectedCourseData.records.length === 0 && (
                            <div className="text-center py-12 text-zinc-500">
                               No attendance records found.
                            </div>
                         )}
                      </div>
                   </div>
                )}
             </>
          ) : (
             !alertInfo && (
                <div className="text-center py-20 text-zinc-500">
                   No courses found.
                </div>
             )
          )}
       </div>
    </PageLayout>
  );
}

export default AttendancePage;
