import React, { useEffect, useState, useRef } from "react";
import PageLayout from "../layouts/PageLayout";
import NotificationBanner from "../NotificationBanner";
import PageHeader from "../PageHeader";
import StatsCard from "../StatsCard";
import { LoadingSpinner } from "../LoadingOverlay";
import SuperTabs from "../SuperTabs";
import { 
  ClipboardEdit, 
  History, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Search,
  BookOpen,
  Calendar,
  Layout
} from "lucide-react";

function GradeChangePage() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, processed: 0 });
  
  const hiddenContentRef = useRef(null);

  useEffect(() => {
    // Aggressively hide any legacy containers that might interfere
    const hiderStyle = document.createElement("style");
    hiderStyle.id = "superflex-grade-change-hide";
    hiderStyle.innerHTML = `
      .m-grid.m-grid--hor.m-grid--root.m-page:not(#legacy-root-hidden),
      .m-content:not(#legacy-root-hidden .m-content),
      #FormGradeChange:not(#legacy-root-hidden #FormGradeChange) {
        display: none !important;
      }
      #legacy-root-hidden {
        position: absolute !important;
        top: -9999px !important;
        left: -9999px !important;
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
        visibility: hidden !important;
      }
      /* Ensure modals and their backdrops stay functional */
      .modal, .modal-backdrop {
        visibility: visible !important;
      }
      #RemarksDetail .modal-content {
        background: #09090b !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        border-radius: 2rem !important;
        color: white !important;
       ;
      }
      #RemarksDetail .modal-header { border-bottom: 1px solid rgba(255,255,255,0.1) !important; padding: 1.5rem !important; }
      #RemarksDetail .modal-footer { border-top: 1px solid rgba(255,255,255,0.1) !important; padding: 1.5rem !important; }
      #RemarksDetail .modal-title { font-weight: 900 !important; color: white !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; font-size: 1.125rem !important; }
      #RemarksDetail label { color: #71717a !important; font-size: 10px !important; font-weight: 900 !important; text-transform: uppercase !important; letter-spacing: 0.1em !important; margin-bottom: 0.5rem !important; }
      #RemarksDetail input, #RemarksDetail select, #RemarksDetail textarea {
        background: rgba(255,255,255,0.03) !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        color: white !important;
        border-radius: 1rem !important;
        padding: 0.75rem 1rem !important;
        font-size: 13px !important;
        transition: all 0.2s !important;
      }
      #RemarksDetail input:focus, #RemarksDetail select:focus, #RemarksDetail textarea:focus {
        border-color: rgba(160, 152, 255, 0.5) !important;
        background: rgba(255,255,255,0.05) !important;
        outline: none !important;
      }
    `;
    document.head.appendChild(hiderStyle);

    window.dispatchEvent(
      new CustomEvent("superflex-update-loading", { detail: true }),
    );

    const parseData = () => {
      try {
        const root = document.querySelector(".m-grid.m-grid--hor.m-grid--root.m-page:not(#legacy-root-hidden)");
        if (!root) {
          if (document.getElementById("legacy-root-hidden")) {
              // already parsed
          } else {
             setTimeout(parseData, 500);
          }
          return;
        }

        // 1. Parse Alerts
        const alertList = [];
        root.querySelectorAll(".m-alert, .alert").forEach(alert => {
          if (alert.style.display === "none" || alert.id === "DataErrormsgdiv" || alert.closest(".modal")) return;

          const textContainer = alert.querySelector(".m-alert__text") || alert;
          const clone = textContainer.cloneNode(true);
          clone.querySelectorAll(".m-alert__close, button, a, strong, .m-alert__icon").forEach(el => el.remove());
          
          let message = clone.textContent
            .replace(/Alert!/gi, "")
            .replace(/Note!/gi, "")
            .replace(/Close/gi, "")
            .replace(/&nbsp;/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          if (message && message.length > 3) {
              const type = alert.classList.contains("alert-danger") || alert.classList.contains("m-alert--outline-danger") ? "error" : "info";
              alertList.push({ type, message });
          }
        });
        setAlerts(alertList);

        // 2. Parse Semesters
        const semesterSelect = root.querySelector("select#SemId");
        if (semesterSelect) {
            const opts = Array.from(semesterSelect.options).map(o => ({
                label: o.text.trim(),
                value: o.value,
                selected: o.selected
            }));
            setSemesters(opts);
        }

        // 3. Parse Requests Table
        const requestList = [];
        const table = root.querySelector("table.table");
        if (table) {
            const rows = table.querySelectorAll("tbody tr");
            rows.forEach((row, idx) => {
                const cells = row.querySelectorAll("td");
                // Legacy Structure: S.No, Code, Name, Section, Credits, Grade, Checkbox, Status
                if (cells.length >= 7) {
                    requestList.push({
                        id: idx,
                        code: cells[1]?.textContent.trim(),
                        course: cells[2]?.textContent.trim(),
                        section: cells[3]?.textContent.trim(),
                        credits: cells[4]?.textContent.trim(),
                        grade: cells[5]?.textContent.trim(),
                        status: cells[7]?.textContent.trim() || cells[6]?.textContent.trim() || "N/A",
                        checkboxId: cells[6]?.querySelector('input[type="checkbox"]')?.id,
                        fullRowHtml: row.innerHTML
                    });
                }
            });
        }
        setRequests(requestList);

        // 4. Calculate Stats
        const pendingValue = requestList.filter(r => r.status.toLowerCase().includes('pending')).length;
        const processedValue = requestList.filter(r => 
            r.status.toLowerCase().includes('approved') || 
            r.status.toLowerCase().includes('rejected') || 
            r.status.toLowerCase().includes('processed')
        ).length;
        
        setStats({
            total: requestList.length,
            pending: pendingValue,
            processed: processedValue
        });

        // 5. MOVE original DOM instead of cloning to preserve event listeners
        if (hiddenContentRef.current) {
            hiddenContentRef.current.innerHTML = "";
            root.id = "legacy-root-hidden";
            hiddenContentRef.current.appendChild(root);
        }

        setLoading(false);
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
      } catch (err) {
        console.error("Grade Change Parser Error:", err);
        setLoading(false);
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
      }
    };

    parseData();

    return () => {
        const hider = document.getElementById("superflex-grade-change-hide");
        if (hider) hider.remove();
    };
  }, []);

  const handleSemesterChange = (val) => {
      const legacySelect = document.querySelector("#legacy-root-hidden select#SemId");
      if (legacySelect) {
          legacySelect.value = val;
          legacySelect.dispatchEvent(new Event('change', { bubbles: true }));
          const form = legacySelect.closest("form");
          if (form) form.submit();
      }
  };

  const handleCheckboxToggle = (checkboxId) => {
      const legacyCb = document.querySelector(`#legacy-root-hidden #${checkboxId}`);
      if (legacyCb && !legacyCb.disabled) {
          legacyCb.checked = !legacyCb.checked;
          legacyCb.dispatchEvent(new Event('change', { bubbles: true }));
          
          if (legacyCb.checked) {
              setSelectedIds(prev => [...prev, checkboxId]);
          } else {
              setSelectedIds(prev => prev.filter(id => id !== checkboxId));
          }
      }
  };

  const handleSelectAll = (checked) => {
      const legacyCheckboxes = document.querySelectorAll('#legacy-root-hidden input[name="OfferIdCheckBox"]:not(:disabled)');
      const ids = [];
      legacyCheckboxes.forEach(cb => {
          cb.checked = checked;
          cb.dispatchEvent(new Event('change', { bubbles: true }));
          if (checked) ids.push(cb.id);
      });
      setSelectedIds(checked ? ids : []);
      
      const legacySelectAll = document.querySelector('#legacy-root-hidden #checkall');
      if (legacySelectAll) {
          legacySelectAll.checked = checked;
          legacySelectAll.dispatchEvent(new Event('change', { bubbles: true }));
      }
  };

  const handleOpenRequestModal = () => {
      const legacyBtn = document.querySelector("#legacy-root-hidden #btnModalGradeChange") || 
                        document.querySelector("#legacy-root-hidden [data-target='#RemarksDetail']");
      
      if (selectedIds.length === 0) {
          alert("Kindly select at least one course to proceed.");
          return;
      }

      if (legacyBtn) {
          legacyBtn.click();
      } else if (window.$) {
          // If the button is injected later or hidden, try direct modal show
          window.$("#RemarksDetail").modal('show');
      }
  };

  const hasAvailableRequests = requests.some(r => r.checkboxId);

  if (loading) return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="w-full min-h-screen p-6 md:p-8 space-y-8">
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    </PageLayout>
  );

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="w-full min-h-screen p-6 md:p-8 space-y-8 relative z-10">
        
        {/* Glow Effects */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#a098ff]/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none z-0"></div>
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none z-0"></div>

        <PageHeader 
          title="Grade Change"
          subtitle="Apply for rectification of marks or missing assessment data"
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
            {semesters.length > 0 && (
                <SuperTabs
                    tabs={semesters}
                    activeTab={semesters.find((s) => s.selected)?.value}
                    onTabChange={handleSemesterChange}
                />
            )}
            
            {hasAvailableRequests && (
                <button 
                    onClick={handleOpenRequestModal}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest transition-all  ${
                        selectedIds.length > 0 
                        ? "bg-[#a098ff] hover:bg-[#a098ff]/90 text-zinc-950 animate-pulse" 
                        : "bg-zinc-800 text-zinc-500 border border-white/5 opacity-50 cursor-not-allowed"
                    }`}
                >
                    <ClipboardEdit size={14} />
                    {selectedIds.length > 0 ? `Submit ${selectedIds.length} Request${selectedIds.length > 1 ? 's' : ''}` : 'New Application'}
                </button>
            )}
          </div>
        </PageHeader>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            icon={History}
            label="Applications" 
            value={stats.total} 
            delay={100}
          />
          <StatsCard 
            icon={Clock}
            label="In Review" 
            value={stats.pending} 
            delay={200}
            className={stats.pending > 0 ? "!bg-amber-500/10 !border-amber-500/20" : ""}
          />
          <StatsCard 
            icon={CheckCircle2}
            label="Processed" 
            value={stats.processed} 
            delay={300}
            className={stats.processed > 0 ? "!bg-emerald-500/10 !border-emerald-500/20" : ""}
          />
          <StatsCard 
            icon={AlertTriangle}
            label="Status" 
            value="ACTIVE" 
            delay={400}
          />
        </div>

        <NotificationBanner alerts={alerts} />

        <div className="grid grid-cols-1 gap-8">
            <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 overflow-hidden">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#a098ff]/10 rounded-xl text-[#a098ff]">
                            <Layout size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Application Log</h3>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="py-4 px-4 text-center">
                                    {hasAvailableRequests && (
                                        <input 
                                            type="checkbox" 
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-[#a098ff] transition-all cursor-pointer"
                                        />
                                    )}
                                </th>
                                <th className="text-left py-4 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Index</th>
                                <th className="text-left py-4 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Course Detail</th>
                                <th className="text-center py-4 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Code</th>
                                <th className="text-center py-4 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Grade</th>
                                <th className="text-center py-4 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Section</th>
                                <th className="text-right py-4 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Process Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {requests.map((req, idx) => (
                                <tr key={idx} className={`group hover:bg-white/[0.02] transition-colors ${selectedIds.includes(req.checkboxId) ? 'bg-[#a098ff]/5' : ''}`}>
                                    <td className="py-4 px-4 text-center">
                                        {req.checkboxId && (
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(req.checkboxId)}
                                                onChange={() => handleCheckboxToggle(req.checkboxId)}
                                                className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-[#a098ff] transition-all cursor-pointer"
                                            />
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-xs font-bold text-zinc-500">{idx + 1}</td>
                                    <td className="py-4 px-4">
                                        <div className="flex flex-col">
                                            <span className="text-white font-bold text-sm tracking-tight">{req.course}</span>
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{req.credits} Credits</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <span className="px-2.5 py-1 rounded-md bg-zinc-800/50 text-zinc-400 font-bold text-[10px] uppercase tracking-wider">
                                            {req.code}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <span className="px-3 py-1.5 rounded-lg bg-[#a098ff]/10 text-[#a098ff] font-black text-xs">
                                            {req.grade}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-center text-xs text-zinc-400 font-bold tracking-widest">{req.section}</td>
                                    <td className="py-4 px-4 text-right">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                            req.status.toLowerCase().includes('pending') 
                                            ? "bg-amber-500/5 text-amber-500 border-amber-500/10"
                                            : req.status.toLowerCase().includes('rejected')
                                            ? "bg-rose-500/5 text-rose-400 border-rose-500/10"
                                            : "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
                                        }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-6 bg-zinc-800/50 rounded-full text-zinc-600 border border-white/5">
                                                <Search size={40} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">No records available</p>
                                                <p className="text-zinc-600 text-[10px] font-medium">There are currently no subjects available for grade change in this semester.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Hidden Legacy Container */}
        <div ref={hiddenContentRef} />
      </div>
    </PageLayout>
  );
}

export default GradeChangePage;
