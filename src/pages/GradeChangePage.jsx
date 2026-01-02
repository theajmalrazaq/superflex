import React, { useEffect, useState, useRef } from "react";
import PageLayout from "../components/layouts/PageLayout";
import NotificationBanner from "../components/ui/NotificationBanner";
import PageHeader from "../components/ui/PageHeader";
import StatsCard from "../components/ui/StatsCard";
import SuperTabs from "../components/ui/SuperTabs";
import LoadingOverlay, {
  LoadingSpinner,
} from "../components/ui/LoadingOverlay";
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
} from "lucide-react";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import { TextArea } from "../components/ui/Input";

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
          <label className="text-[10px] font-black text-foreground/50 Cap tracking-[0px] px-1">
            Reason for Rectification
          </label>
          <div className="relative group">
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full appearance-none bg-secondary border border-foreground/10 text-foreground px-5 py-4 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-x/50 transition-all cursor-pointer pr-12"
            >
              <option value="" disabled>
                Select a reason
              </option>
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground/50 pointer-events-none group-hover:text-foreground transition-colors"
            />
          </div>
        </div>

        <TextArea
          label="Detailed Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Explain the discrepancy in detail..."
          rows={5}
        />

        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            className="w-full"
            icon={<Send size={18} />}
          >
            Submit Request
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const GradeChangeCard = ({ req, isSelected, onToggle, index }) => {
  return (
    <div
      onClick={() => req.checkboxId && onToggle(req.checkboxId)}
      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-300 gap-4 ${
        req.checkboxId ? "cursor-pointer" : "cursor-not-allowed opacity-60"
      } ${
        isSelected
          ? "bg-accent/10 border-accent/50"
          : "bg-secondary/30 border-transparent hover:bg-secondary/50 hover:border-foreground/10"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span
          className={`font-bold text-xs min-w-[1.2rem] ${isSelected ? "text-accent" : "text-foreground/40"}`}
        >
          {index}.
        </span>

        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-all duration-300 ${
            isSelected
              ? "bg-accent/20 border-accent/30 text-accent scale-105"
              : "bg-tertiary/50 border-foreground/10 text-foreground/50"
          }`}
        >
          <FileText size={18} />
        </div>

        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-black text-accent Cap tracking-tighter opacity-80 shrink-0">
              {req.code}
            </span>
            <h4 className="text-foreground font-bold text-sm leading-tight truncate">
              {req.course}
            </h4>
          </div>

          <div className="flex items-center gap-2.5 text-[10px] text-foreground/50 font-bold Cap tracking-[0px] leading-none">
            <span className="shrink-0">{req.credits} Credits</span>
            <span className="w-1 h-1 rounded-full bg-tertiary shrink-0"></span>
            <span className="truncate">Section {req.section}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-foreground/10">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1">
            <span className="px-2.5 py-1 rounded-lg bg-accent/10 text-accent font-black text-[10px]">
              Grade: {req.grade}
            </span>
          </div>

          <div
            className={`px-3 py-1 rounded-lg border text-[9px] font-black Cap tracking-[0px] ${
              req.status.toLowerCase().includes("pending")
                ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                : req.status.toLowerCase().includes("rejected")
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            }`}
          >
            {req.status}
          </div>
        </div>

        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${
            isSelected
              ? "bg-accent border-accent text-[var(--accent-foreground)] scale-110"
              : "border-tertiary bg-transparent"
          }`}
        >
          {isSelected && <CheckCircle2 size={14} strokeWidth={3} />}
          {!isSelected && !req.checkboxId && (
            <Search size={10} className="text-foreground/20" />
          )}
        </div>
      </div>
    </div>
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
      #RemarksDetail .modal-title { font-weight: 900 !important; color: white !important; text-transform: Cap !important; letter-spacing: 0.05em !important; font-size: 1.125rem !important; }
      #RemarksDetail label { color: #71717a !important; font-size: 10px !important; font-weight: 900 !important; text-transform: Cap !important; letter-spacing: 0.1em !important; margin-bottom: 0.5rem !important; }
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
            .querySelectorAll(
              ".m-alert__close, button, a, strong, .m-alert__icon",
            )
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

              if (
                !code ||
                !course ||
                code.toLowerCase().includes("course code") ||
                code.length < 2
              )
                return;

              let grade = cells[5]?.textContent.trim();
              if (grade.toLowerCase().includes("initiate")) {
                grade = "N/A";
              }

              let status =
                cells[7]?.textContent.trim() ||
                cells[6]?.textContent.trim() ||
                "N/A";
              if (status.toLowerCase().includes("initiate"))
                status = "Eligible";

              requestList.push({
                id: idx,
                code: code,
                course: course,
                section: cells[3]?.textContent.trim(),
                credits: cells[4]?.textContent.trim(),
                grade: grade,
                status: status,
                checkboxId: cells[6]?.querySelector('input[type="checkbox"]')
                  ?.id,
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
    const legacyCheckboxes = root?.querySelectorAll(
      'input[name="OfferIdCheckBox"]:not(:disabled)',
    );
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

  if (loading)
    return (
      <PageLayout currentPage={window.location.pathname}>
        <div className="w-full min-h-screen p-4 md:p-8 space-y-8">
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        </div>
      </PageLayout>
    );

  return (
    <PageLayout currentPage={window.location.pathname}>
      <GradeChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={submitGradeChange}
      />
      <div className="w-full min-h-screen p-4 md:p-8 space-y-8 relative z-10">
        {}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none z-0"></div>
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
          </div>
        </PageHeader>

        {}
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
          />
          <StatsCard
            icon={CheckCircle2}
            label="Processed"
            value={stats.processed}
            delay={300}
          />
          <StatsCard
            icon={AlertTriangle}
            label="Status"
            value={requests.length > 0 ? "ACTIVE" : "CLOSED"}
            delay={400}
          />
        </div>

        <NotificationBanner alerts={alerts} />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-bold text-foreground tracking-tight">
                  Eligible Courses
                </h3>
                {hasAvailableRequests && (
                  <button
                    onClick={() =>
                      handleSelectAll(
                        selectedIds.length !==
                          requests.filter((r) => r.checkboxId).length,
                      )
                    }
                    className="text-[10px] font-black text-accent Cap tracking-[0px] hover:opacity-80 transition-opacity"
                  >
                    {selectedIds.length ===
                    requests.filter((r) => r.checkboxId).length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                {requests.map((req, idx) => (
                  <GradeChangeCard
                    key={idx}
                    req={req}
                    index={idx + 1}
                    isSelected={selectedIds.includes(req.checkboxId)}
                    onToggle={handleCheckboxToggle}
                  />
                ))}
              </div>

              {requests.length === 0 && (
                <div className="text-center py-20 bg-secondary/30 rounded-[2rem] border border-dashed border-foreground/10">
                  <div className="flex flex-col items-center gap-4 opacity-50">
                    <Search size={48} className="text-foreground/40" />
                    <p className="text-foreground/50 font-medium Cap tracking-[0px] text-xs">
                      No records available for this semester
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-secondary/50 border border-foreground/10 backdrop-blur-xl rounded-[2.5rem] p-8 space-y-8 sticky top-8">
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-accent/5 border border-accent/10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg text-accent">
                      <Layout size={18} />
                    </div>
                    <h4 className="text-sm font-bold text-foreground tracking-tight">
                      Action Summary
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-foreground/50 font-bold Cap tracking-[0px] text-[10px]">
                        Selected
                      </span>
                      <span className="text-foreground font-black">
                        {selectedIds.length} Courses
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-foreground/50 font-bold Cap tracking-[0px] text-[10px]">
                        Pending
                      </span>
                      <span className="text-foreground font-black">
                        {stats.pending}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-foreground/10 flex justify-between items-center">
                      <span className="text-foreground/60 text-[10px] font-black Cap tracking-[0px]">
                        Total Applications
                      </span>
                      <span className="text-accent font-black text-xs">
                        {stats.total}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    disabled={selectedIds.length === 0}
                    onClick={handleOpenRequestModal}
                    className="w-full"
                    variant="primary"
                    icon={<ChevronRight size={16} />}
                  >
                    Initiate Request
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-foreground/10 space-y-4">
                <div className="flex items-center gap-3 px-1 text-accent">
                  <AlertTriangle size={14} />
                  <span className="text-[10px] font-black Cap tracking-[0px]">
                    Important Note
                  </span>
                </div>
                <p className="text-[10px] text-foreground/50 font-medium leading-relaxed px-1 italic">
                  Grade change requests are only reviewed and processed by the
                  respective course teacher.
                </p>
              </div>
            </div>
          </div>
        </div>

        {}
        <div ref={hiddenContentRef} />
      </div>
    </PageLayout>
  );
}

export default GradeChangePage;
