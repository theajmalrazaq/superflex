import React, { useEffect, useState, useRef } from "react";
import PageLayout from "../components/layouts/PageLayout";
import NotificationBanner from "../components/ui/NotificationBanner";
import StatsCard from "../components/ui/StatsCard";
import SuperTabs from "../components/ui/SuperTabs";
import Skeleton from "../components/ui/Skeleton";
import {
  History,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Layout,
  ClipboardEdit,
  FileText,
  Send,
  ChevronDown,
  ChevronRight,
  Check,
} from "lucide-react";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import { TextArea } from "../components/ui/Input";

const GradeChangeSkeleton = () => (
  <main className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col gap-7 px-4 py-6 font-sans sm:px-6 lg:px-8 lg:py-8" role="status" aria-label="Loading grade change details">
    <header className="space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-9 w-64" /><Skeleton className="h-4 w-80 max-w-full" /></header>
    <Skeleton className="h-10 w-72 max-w-full rounded-full" />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="flex min-h-[156px] flex-col rounded-[24px] bg-white p-5 dark:bg-black sm:p-6"><Skeleton className="h-12 w-12 rounded-[36%]" /><Skeleton className="mt-auto h-7 w-28" /><Skeleton className="mt-2 h-3 w-20" /></div>)}</div>
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,.8fr)]"><section className="space-y-3 rounded-[24px] bg-white p-5 dark:bg-black sm:p-6"><Skeleton className="h-5 w-44" />{[0, 1, 2, 3].map((item) => <div key={item} className="flex items-center gap-4 border-t border-black/[0.05] py-4 dark:border-white/[0.08]"><Skeleton className="h-10 w-10 rounded-[36%]" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-56 max-w-full" /><Skeleton className="h-3 w-32" /></div><Skeleton className="h-6 w-6 rounded-full" /></div>)}</section><section className="space-y-4 rounded-[24px] bg-white p-5 dark:bg-black sm:p-6"><Skeleton className="h-5 w-36" /><Skeleton className="h-24 w-full rounded-2xl" /><Skeleton className="h-11 w-full rounded-full" /></section></div>
  </main>
);

const ReasonSelector = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const selectorRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const closeOutside = (event) => { if (!selectorRef.current?.contains(event.target)) setOpen(false); };
    const closeEscape = (event) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("touchstart", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("touchstart", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, [open]);
  const label = options.find((option) => option.value === value)?.label || "Select a reason";
  return <div className="relative" ref={selectorRef}>
    <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#230052]/30 dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1] dark:focus-visible:ring-white/30"><span>{label}</span><ChevronDown size={16} className={`text-slate-500 transition-transform dark:text-slate-400 ${open ? "rotate-180" : ""}`} /></button>
    {open && <div role="listbox" aria-label="Reason for grade change" className="absolute inset-x-0 top-full z-40 mt-2 rounded-2xl border border-black/[0.08] bg-white p-1.5 text-slate-900 shadow-[0_12px_32px_rgba(15,23,42,.16)] dark:border-white/[0.12] dark:bg-[#111] dark:text-white dark:shadow-black/40">{options.map((option) => <button key={option.value} type="button" role="option" aria-selected={value === option.value} onClick={() => { onChange(option.value); setOpen(false); }} className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors ${value === option.value ? "bg-[#230052] font-semibold text-white dark:bg-white dark:text-[#0a192f]" : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.08]"}`}>{option.label}{value === option.value && <Check size={15} />}</button>)}</div>}
  </div>;
};

const GradeChangeModal = ({ isOpen, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");

  const REASONS = [
    { value: "1", label: "Error in assessment marks" },
    { value: "2", label: "Missing assessment marks" },
    { value: "3", label: "Not satisfied (recheck exam)" },
  ];

  const handleSubmit = () => {
    if (!reason) {
      alert("Please select a reason.");
      return;
    }
    if (!remarks.trim()) {
      alert("Please provide remarks.");
      return;
    }
    onSubmit({ reason, remarks });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application Details"
      subtitle="Grade Change Request"
      icon={<FileText size={24} />}
    >
      <div className="space-y-6 pt-4">
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Reason for Rectification
          </label>
          <ReasonSelector value={reason} options={REASONS} onChange={setReason} />
        </div>

        <TextArea
          label="Detailed Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Explain the discrepancy in detail..."
          rows={5}
        />

        <div className="pt-2">
          <Button onClick={handleSubmit} className="w-full" icon={<Send size={18} />}>
            Submit Request
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const GradeChangeCard = ({ req, isSelected, onToggle, index }) => {
  const status = req.status || "N/A";
  const canSelect = Boolean(req.checkboxId);
  return (
    <button type="button" onClick={() => canSelect && onToggle(req.checkboxId)} disabled={!canSelect} aria-pressed={isSelected} className={`group flex w-full cursor-pointer flex-col gap-3 px-1 py-4 text-left transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5 ${canSelect ? "hover:bg-slate-50 dark:hover:bg-white/[0.025]" : "cursor-not-allowed opacity-60"}`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="hidden w-7 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-400 sm:block">{index}</span>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[36%] ${isSelected ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]" : "bg-slate-100 text-slate-600 dark:bg-white/[0.08] dark:text-slate-300"}`}><FileText size={18} /></span>
        <span className="min-w-0 flex-1"><span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-white/[0.08] dark:text-slate-300">{req.code}</span><span className="truncate text-sm font-bold text-slate-900 dark:text-white">{req.course}</span></span><span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400"><span>{req.credits} credits</span><span>Section {req.section}</span></span></span>
      </div>

      <span className="flex w-full items-center justify-between gap-3 border-t border-black/[0.05] pt-3 dark:border-white/[0.08] sm:w-auto sm:justify-end sm:border-0 sm:pt-0"><span className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-700 dark:bg-white/[0.08] dark:text-slate-200">Grade {req.grade}</span><span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${status.toLowerCase().includes("pending") ? "bg-amber-50 text-amber-700 dark:bg-amber-300/10 dark:text-amber-200" : status.toLowerCase().includes("rejected") ? "bg-rose-50 text-rose-700 dark:bg-rose-300/10 dark:text-rose-200" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200"}`}>{status}</span></span><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${isSelected ? "border-[#230052] bg-[#230052] text-white dark:border-white dark:bg-white dark:text-[#0a192f]" : "border-slate-300 text-transparent dark:border-white/25"}`}>{isSelected && <Check size={15} strokeWidth={3} />}{!isSelected && !canSelect && <Search size={13} className="text-slate-400 dark:text-slate-500" />}</span></span>
    </button>
  );
};

function GradeChangePage() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, processed: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestFilter, setRequestFilter] = useState("all");

  const hiddenContentRef = useRef(null);

  useEffect(() => {
    const hiderStyle = document.createElement("style");
    hiderStyle.id = "superflex-grade-change-hide";
    hiderStyle.innerHTML = `
      .m-grid.m-grid--hor.m-grid--root.m-page:not(#legacy-root-hidden) {
        visibility: hidden !important;
        position: absolute !important;
        pointer-events: none !important;
        z-index: -1 !important;
      }
      #legacy-root-hidden {
        display: none !important;
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
      }
      #RemarksDetail .modal-header { border-bottom: 1px solid rgba(255,255,255,0.1) !important; padding: 1.5rem !important; }
      #RemarksDetail .modal-footer { border-top: 1px solid rgba(255,255,255,0.1) !important; padding: 1.5rem !important; }
      #RemarksDetail .modal-title { font-weight: 500 !important; color: white !important; text-transform: uppercase !important; font-size: 1.125rem !important; }
      #RemarksDetail label { color: #71717a !important; font-size: 10px !important; font-weight: 800 !important; text-transform: uppercase !important; margin-bottom: 0.5rem !important; }
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

    window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: true }));

    const parseData = () => {
      try {
        const root = document.querySelector(
          ".m-grid.m-grid--hor.m-grid--root.m-page:not(#legacy-root-hidden)",
        );
        if (!root) {
          if (document.getElementById("legacy-root-hidden")) {
          } else {
            setTimeout(parseData, 500);
          }
          return;
        }

        root.id = "superflex-grade-change-original";

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
            .querySelectorAll(".m-alert__close, button, a, strong, .m-alert__icon")
            .forEach((el) => el.remove());

          let message = clone.textContent
            .replace(/Alert!/gi, "")
            .replace(/Note!/gi, "")
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

        const semesterSelect = root.querySelector("select#SemId");
        if (semesterSelect) {
          const opts = Array.from(semesterSelect.options).map((o) => ({
            label: o.text.trim(),
            value: o.value,
            selected: o.selected,
          }));
          setSemesters(opts);
        }

        const requestList = [];
        const table = root.querySelector("table.table");
        if (table) {
          const rows = table.querySelectorAll("tbody tr");
          rows.forEach((row, idx) => {
            const cells = row.querySelectorAll("td");

            if (cells.length >= 7) {
              const code = cells[1]?.textContent.trim();
              const course = cells[2]?.textContent.trim();

              if (!code || !course || code.toLowerCase().includes("course code") || code.length < 2)
                return;

              let grade = cells[5]?.textContent.trim();
              if (grade.toLowerCase().includes("initiate")) {
                grade = "N/A";
              }

              let status = cells[7]?.textContent.trim() || cells[6]?.textContent.trim() || "N/A";
              if (status.toLowerCase().includes("initiate")) status = "Eligible";

              requestList.push({
                id: idx,
                code: code,
                course: course,
                section: cells[3]?.textContent.trim(),
                credits: cells[4]?.textContent.trim(),
                grade: grade,
                status: status,
                checkboxId: cells[6]?.querySelector('input[type="checkbox"]')?.id,
                fullRowHtml: row.innerHTML,
              });
            }
          });
        }
        setRequests(requestList);

        const pendingValue = requestList.filter((r) =>
          r.status.toLowerCase().includes("pending"),
        ).length;
        const processedValue = requestList.filter(
          (r) =>
            r.status.toLowerCase().includes("approved") ||
            r.status.toLowerCase().includes("rejected") ||
            r.status.toLowerCase().includes("processed"),
        ).length;

        setStats({
          total: requestList.length,
          pending: pendingValue,
          processed: processedValue,
        });

        if (hiddenContentRef.current) {
          hiddenContentRef.current.innerHTML = "";
          const clone = root.cloneNode(true);
          clone.id = "legacy-root-hidden";
          hiddenContentRef.current.appendChild(clone);
        }

        root.style.opacity = "0";
        root.style.pointerEvents = "none";
        root.style.position = "absolute";
        root.style.zIndex = "-1";

        setLoading(false);
        window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: false }));
      } catch (err) {
        console.error("Grade Change Parser Error:", err);
        setLoading(false);
        window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: false }));
      }
    };

    parseData();

    return () => {
      const hider = document.getElementById("superflex-grade-change-hide");
      if (hider) hider.remove();
    };
  }, []);

  const handleSemesterChange = (val) => {
    const root = document.getElementById("superflex-grade-change-original");
    const select = root?.querySelector("select#SemId");
    if (select) {
      select.value = val;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      const form = select.closest("form");
      if (form) form.submit();
    }
  };

  const handleCheckboxToggle = (checkboxId) => {
    const root = document.getElementById("superflex-grade-change-original");
    const legacyCb = root?.querySelector(`#${checkboxId}`);
    if (legacyCb && !legacyCb.disabled) {
      legacyCb.checked = !legacyCb.checked;
      legacyCb.dispatchEvent(new Event("change", { bubbles: true }));

      if (legacyCb.checked) {
        setSelectedIds((prev) => [...prev, checkboxId]);
      } else {
        setSelectedIds((prev) => prev.filter((id) => id !== checkboxId));
      }
    }
  };

  const handleSelectAll = (checked) => {
    const root = document.getElementById("superflex-grade-change-original");
    const legacyCheckboxes = root?.querySelectorAll('input[name="OfferIdCheckBox"]:not(:disabled)');
    const ids = [];
    legacyCheckboxes?.forEach((cb) => {
      cb.checked = checked;
      cb.dispatchEvent(new Event("change", { bubbles: true }));
      if (checked) ids.push(cb.id);
    });
    setSelectedIds(checked ? ids : []);

    const legacySelectAll = root?.querySelector("#checkall");
    if (legacySelectAll) {
      legacySelectAll.checked = checked;
      legacySelectAll.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  const handleOpenRequestModal = () => {
    if (selectedIds.length === 0) {
      alert("Kindly select at least one course to proceed.");
      return;
    }
    setIsModalOpen(true);
  };

  const submitGradeChange = ({ reason, remarks }) => {
    const root = document.getElementById("superflex-grade-change-original");

    const legacyReason = root?.querySelector("#GradeChangeReason");
    const legacyRemarks = root?.querySelector("#StdRmktxtarea");

    if (legacyReason) {
      legacyReason.value = reason;
      legacyReason.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (legacyRemarks) {
      legacyRemarks.value = remarks;
      legacyRemarks.dispatchEvent(new Event("input", { bubbles: true }));
    }

    if (typeof window.fn_SubmitStdRemarks === "function") {
      window.fn_SubmitStdRemarks();
    } else {
      const legacyBtn = root?.querySelector('#remrksbtn input[type="button"]');
      if (legacyBtn) {
        legacyBtn.click();
      } else {
        alert("Submit function not found. Legacy system may have changed.");
      }
    }

    setIsModalOpen(false);
  };

  const hasAvailableRequests = requests.some((r) => r.checkboxId);
  const filteredRequests = requests.filter((request) => {
    if (requestFilter === "eligible") return Boolean(request.checkboxId);
    if (requestFilter === "selected") return selectedIds.includes(request.checkboxId);
    if (requestFilter === "pending") return request.status.toLowerCase().includes("pending");
    return true;
  });

  if (loading)
    return (
      <PageLayout currentPage={window.location.pathname} fullWidth>
        <GradeChangeSkeleton />
      </PageLayout>
    );

  return (
    <PageLayout currentPage={window.location.pathname} fullWidth>
      <GradeChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={submitGradeChange}
      />
      <main className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col gap-7 px-4 py-6 font-sans sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-wrap items-end justify-between gap-4"><div className="space-y-1"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">Academics</p><h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Grade change</h1><p className="text-sm text-white/80">Request a review for incorrect or missing grades.</p></div><p className="max-w-sm text-xs text-white/75">Requests are reviewed by the respective course instructor.</p></header>

        {semesters.length > 0 && <section aria-label="Select semester" className="flex flex-col gap-2 sm:flex-row sm:items-center"><span className="w-20 shrink-0 text-xs font-semibold text-white/85">Semester</span><SuperTabs tabs={semesters} activeTab={semesters.find((semester) => semester.selected)?.value} onTabChange={handleSemesterChange} size="sm" className="!border-0 !bg-white/55 !backdrop-blur-xl dark:!bg-black/25 dark:!backdrop-blur-xl" /></section>}

        <section aria-labelledby="grade-change-overview" className="space-y-4"><div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">Overview</p><h2 id="grade-change-overview" className="text-xl font-bold tracking-tight text-white">Application summary</h2></div><p className="text-xs text-white/75">Select eligible courses to start one request.</p></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5"><StatsCard variant="dashboard" icon={History} label="Applications" value={stats.total} /><StatsCard variant="dashboard" icon={Clock} label="In review" value={stats.pending} subValue="Awaiting decision" /><StatsCard variant="dashboard" icon={CheckCircle2} label="Processed" value={stats.processed} subValue="Reviewed requests" /><StatsCard variant="dashboard" icon={AlertTriangle} label="Eligible courses" value={requests.filter((request) => request.checkboxId).length} subValue="Available to request" /></div></section>

        {alerts.length > 0 && <NotificationBanner alerts={alerts} />}

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,.8fr)]">
          <section aria-labelledby="grade-change-courses" className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb]">
            <header className="flex flex-col gap-3 border-b border-black/[0.06] px-4 py-4 dark:border-white/[0.1] sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 id="grade-change-courses" className="text-base font-bold">Courses and requests</h2><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Showing {filteredRequests.length} of {requests.length} records</p></div><div className="flex flex-wrap items-center gap-2"><div className="flex items-center gap-1 rounded-full bg-slate-100 p-1 dark:bg-white/[0.06]" role="group" aria-label="Filter grade change courses">{[{ value: "all", label: "All" }, { value: "eligible", label: "Eligible" }, { value: "selected", label: "Selected" }, { value: "pending", label: "Pending" }].map((filter) => <button key={filter.value} type="button" onClick={() => setRequestFilter(filter.value)} aria-pressed={requestFilter === filter.value} className={`cursor-pointer rounded-full px-3 py-2 text-xs font-bold transition-colors ${requestFilter === filter.value ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}>{filter.label}</button>)}</div>{hasAvailableRequests && <button type="button" onClick={() => handleSelectAll(selectedIds.length !== requests.filter((request) => request.checkboxId).length)} className="cursor-pointer rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-white/[0.08] dark:text-slate-200 dark:hover:bg-white/[0.12]">{selectedIds.length === requests.filter((request) => request.checkboxId).length ? "Deselect all" : "Select all"}</button>}</div></header>
            {filteredRequests.length ? <div className="divide-y divide-black/[0.05] px-4 dark:divide-white/[0.08] sm:px-6">{filteredRequests.map((request, index) => <GradeChangeCard key={request.id} req={request} index={index + 1} isSelected={selectedIds.includes(request.checkboxId)} onToggle={handleCheckboxToggle} />)}</div> : <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center"><span className="mb-3 flex h-12 w-12 items-center justify-center rounded-[36%] bg-slate-100 text-slate-500 dark:bg-white/[0.08] dark:text-slate-300"><Search size={22} /></span><h3 className="text-base font-bold">{requestFilter === "selected" ? "No courses selected" : "No matching records"}</h3><p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{requestFilter === "selected" ? "Select an eligible course to start a grade change request." : "There are no grade change records for this filter and semester."}</p></div>}
          </section>

          <aside className="rounded-[24px] border border-black/[0.06] bg-white text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] xl:sticky xl:top-6"><header className="border-b border-black/[0.06] px-5 py-4 dark:border-white/[0.1] sm:px-6"><h2 className="text-base font-bold">Request details</h2><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Review your selection before continuing.</p></header><div className="space-y-5 p-5 sm:p-6"><div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.05]"><div className="mb-4 flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]"><ClipboardEdit size={17} /></span><h3 className="text-sm font-bold">Selection summary</h3></div><div className="space-y-3 text-xs"><div className="flex justify-between gap-3"><span className="text-slate-500 dark:text-slate-400">Selected courses</span><span className="font-semibold">{selectedIds.length}</span></div><div className="flex justify-between gap-3"><span className="text-slate-500 dark:text-slate-400">Pending requests</span><span className="font-semibold">{stats.pending}</span></div><div className="flex justify-between gap-3 border-t border-black/[0.06] pt-3 text-sm dark:border-white/[0.1]"><span className="font-bold">Request status</span><span className="font-bold">{hasAvailableRequests ? "Available" : "Closed"}</span></div></div></div><Button disabled={selectedIds.length === 0} onClick={handleOpenRequestModal} className="w-full rounded-full" variant="primary" icon={<ChevronRight size={16} />}>Continue request</Button><p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400"><AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-300" />Include the assessment details and reason so the instructor can review your request.</p></div></aside>
        </div>

        <div ref={hiddenContentRef} />
      </main>
    </PageLayout>
  );
}

export default GradeChangePage;
