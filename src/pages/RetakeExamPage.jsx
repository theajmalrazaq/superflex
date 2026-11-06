import React, { useEffect, useState, useRef } from "react";
import PageLayout from "../components/layouts/PageLayout";
import NotificationBanner from "../components/ui/NotificationBanner";
import StatsCard from "../components/ui/StatsCard";
import SuperTabs from "../components/ui/SuperTabs";
import Skeleton from "../components/ui/Skeleton";
import {
  AlertCircle,
  BookOpen,
  Layout,
  FileText,
  Download,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Upload,
  CheckCircle2,
  Check,
  Shield,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import { TextArea } from "../components/ui/Input";
import SelectMenu from "../components/ui/SelectMenu";
import { hideFlexPageRoot } from "../parsers/dom";

const RetakeExamSkeleton = () => (
  <main className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col gap-7 px-4 py-6 font-sans sm:px-6 lg:px-8 lg:py-8" role="status" aria-label="Loading retake exam details">
    <header className="space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-9 w-56" /><Skeleton className="h-4 w-72 max-w-full" /></header>
    <div className="flex flex-wrap gap-3"><Skeleton className="h-10 w-72 rounded-full" /><Skeleton className="h-10 w-64 rounded-full" /></div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="flex min-h-[156px] flex-col rounded-[32px] bg-white p-5 dark:bg-black sm:p-6"><Skeleton className="h-12 w-12 rounded-[36%]" /><Skeleton className="mt-auto h-7 w-28" /><Skeleton className="mt-2 h-3 w-20" /></div>)}</div>
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]"><div className="space-y-3 rounded-[24px] bg-white p-5 dark:bg-black sm:p-6"><Skeleton className="h-4 w-44" />{[0, 1, 2, 3].map((item) => <div key={item} className="flex items-center gap-4 border-t border-black/[0.05] py-4 dark:border-white/[0.08]"><Skeleton className="h-10 w-10 rounded-[36%]" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-56 max-w-full" /><Skeleton className="h-3 w-32" /></div><Skeleton className="h-6 w-6 rounded-full" /></div>)}</div><div className="space-y-5 rounded-[24px] bg-white p-5 dark:bg-black sm:p-6"><Skeleton className="h-5 w-36" /><Skeleton className="h-12 w-full rounded-xl" /><Skeleton className="h-32 w-full rounded-2xl" /><Skeleton className="h-11 w-full rounded-full" /><Skeleton className="h-11 w-full rounded-full" /></div></div>
  </main>
);

const ReasonSelector = ({ reasons, selectedReason, onChange }) => {
  return (
    <SelectMenu
      value={selectedReason}
      options={reasons}
      onChange={onChange}
      placeholder="Choose a reason"
      ariaLabel="Retake situation"
      triggerClassName="w-full rounded-xl border border-black/[0.08] bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 dark:border-white/[0.12] dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]"
      contentClassName="w-[var(--radix-select-trigger-width)]"
    />
  );
};

const RetakeModal = ({ isOpen, onClose, onSubmit, fee }) => {
  const [file, setFile] = useState(null);
  const [remarks, setRemarks] = useState("");
  const fileInputRef = useRef(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="The Comeback Application"
      subtitle="Provide your reason and required documents for the retake."
      icon={<FileText size={24} />}
    >
      <div className="space-y-6 pt-4">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-4">
          <div className="p-2 bg-amber-500/20 rounded-xl text-amber-500">
            <AlertTriangle size={18} />
          </div>
          <p className="text-xs font-bold text-amber-500/90 leading-tight">
            Important: Fee of Rs. {fee} will be charged upon submission.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-foreground/50 Cap tracking-[0px] px-1">
              Evidence Documentation
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative border-2 border-dashed border-foreground/10 hover:border-accent/30 rounded-2xl p-6 transition-all cursor-pointer bg-foreground/[0.02] hover:bg-foreground/[0.04]"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="p-4 bg-accent/10 rounded-2xl text-accent group-hover:scale-110 transition-transform duration-300">
                  <Upload size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground truncate max-w-[250px]">
                    {file ? file.name : "Upload Form (PDF)"}
                  </p>
                  <p className="text-[10px] text-foreground/50 font-bold Cap tracking-[0px]">
                    {file
                      ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                      : "Max 3MB • Combined ONE File"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <TextArea
            label="Applicant Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Provide necessary context or details for your request..."
          />
        </div>

        <Button
          onClick={() => onSubmit(file, remarks)}
          disabled={!file || !remarks}
          className="w-full"
          icon={<Check size={18} />}
        >
          Confirm & Submit Request
        </Button>
      </div>
    </Modal>
  );
};

const InstructionsModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rules & Procedures"
      subtitle="Exam Framework"
      icon={<Shield size={24} />}
    >
      <div className="space-y-8 pt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-5 bg-accent rounded-full"></div>
            <h3 className="text-sm font-black text-foreground Cap tracking-[0px]">
              Eligible Situations
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                title: "Hospitalization",
                desc: "Severe illness with records",
              },
              { title: "Bereavement", desc: "First relative death docs" },
              { title: "Marriage", desc: "Self/Siblings with receipts" },
              { title: "Special Cases", desc: "Director's advance approval" },
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/10 space-y-2 hover:bg-foreground/[0.04] transition-colors"
              >
                <h4 className="text-[11px] font-bold text-accent Cap">{item.title}</h4>
                <p className="text-[10px] text-foreground/50 leading-relaxed font-bold">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-5 bg-accent rounded-full"></div>
            <h3 className="text-sm font-black text-foreground Cap tracking-[0px]">
              Submission Protocol
            </h3>
          </div>
          <div className="space-y-3">
            {[
              "Submit within specified dates only.",
              "Combine Form + Evidence into SINGLE PDF (< 3MB).",
              "Rs. 2,000 per paper processing fee.",
              "Select all papers in one application.",
            ].map((step, i) => (
              <div
                key={i}
                className="flex gap-4 p-3 rounded-2xl hover:bg-foreground/[0.02] transition-colors group border border-transparent hover:border-foreground/10"
              >
                <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-[10px] font-black shrink-0 group-hover:scale-110 transition-transform">
                  {i + 1}
                </div>
                <p className="text-xs text-foreground/60 font-bold leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <Button variant="secondary" onClick={onClose} className="w-full">
          Understood, Close
        </Button>
      </div>
    </Modal>
  );
};

const RetakeCourseCard = ({ course, isSelected, onToggle, index }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={course.isDisabled}
      aria-pressed={isSelected}
      className={`group flex w-full cursor-pointer flex-col gap-4 px-1 py-4 text-left transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5 ${course.isDisabled ? "cursor-not-allowed opacity-55" : "hover:bg-slate-50 dark:hover:bg-white/[0.025]"}`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <span className="hidden w-7 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-400 sm:block">{index}</span>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[36%] ${isSelected ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]" : "bg-slate-100 text-slate-600 dark:bg-white/[0.08] dark:text-slate-300"}`}><BookOpen size={19} /></span>
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-white/[0.08] dark:text-slate-300">{course.code}</span><span className="truncate text-sm font-bold text-slate-900 dark:text-white">{course.courseName}</span></span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400"><span>{course.credits} credits</span><span>Section {course.section}</span>{course.status && <span>{course.status}</span>}</span>
        </span>
      </div>

      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${isSelected ? "border-[#230052] bg-[#230052] text-white dark:border-white dark:bg-white dark:text-[#0a192f]" : "border-slate-300 text-transparent dark:border-white/25"}`}>{isSelected && <Check size={15} strokeWidth={3} />}</span>
    </button>
  );
};

function RetakeExamPage() {
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState(new Set());
  const [selectedReason, setSelectedReason] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [areAlertsExpanded, setAreAlertsExpanded] = useState(false);
  const [courseFilter, setCourseFilter] = useState("all");
  const filteredCourses = courses.filter((course) => {
    if (courseFilter === "selected") return selectedCourses.has(course.id);
    if (courseFilter === "available") return !course.isDisabled;
    return true;
  });
  const visibleAlerts = areAlertsExpanded ? alerts : alerts.slice(0, 1);

  useEffect(() => {

    const parseRetakeData = () => {
      const root = document.querySelector(".m-grid.m-grid--hor.m-grid--root.m-page");
      if (!root) {
        setTimeout(parseRetakeData, 500);
        return;
      }

      try {
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

        const semSelect = root.querySelector("#SemId");
        if (semSelect) {
          const sems = Array.from(semSelect.options).map((opt) => ({
            value: opt.value,
            label: opt.textContent.trim(),
            selected: opt.selected,
          }));
          setSemesters(sems);
        }

        const evalSelect = root.querySelector("#EvalTypeId");
        if (evalSelect) {
          const evals = Array.from(evalSelect.options).map((opt) => ({
            value: opt.value,
            label: opt.textContent.trim(),
            selected: opt.selected,
          }));
          setExamTypes(evals);
        }

        const reasonSelect = root.querySelector("#DrpDwnRetakeReason");
        if (reasonSelect) {
          const res = Array.from(reasonSelect.options).map((opt) => ({
            value: opt.value,
            label: opt.textContent.trim(),
            selected: opt.selected,
          }));
          setReasons(res);
          const selected = res.find((r) => r.selected);
          if (selected) setSelectedReason(selected.value);
        }

        const courseList = [];
        const table = root.querySelector(".table");
        if (table) {
          const rows = table.querySelectorAll("tbody tr");
          rows.forEach((row, idx) => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 6) {
              const checkbox = cells[5]?.querySelector('input[type="checkbox"]');
              const isDisabled = checkbox?.disabled;
              const isChecked = checkbox?.checked;

              courseList.push({
                id: idx,
                serial: cells[0]?.textContent.trim(),
                code: cells[1]?.textContent.trim(),
                courseName: cells[2]?.textContent.trim(),
                credits: cells[3]?.textContent.trim(),
                section: cells[4]?.textContent.trim(),
                status: cells[6]?.textContent.trim(),
                offerId: checkbox?.id.split("_")[1],
                checkboxId: checkbox?.id,
                isDisabled,
                isChecked,
              });
            }
          });
        }
        setCourses(courseList);

        hideFlexPageRoot(root);

        setLoading(false);
      } catch (err) {
        console.error("Retake Parser Error:", err);
        setLoading(false);
      }
    };

    parseRetakeData();
  }, []);

  const handleSemesterChange = (val) => {
    const root = document.querySelector(".m-grid.m-grid--hor.m-grid--root.m-page");
    const select = root?.querySelector("#SemId");
    if (select) {
      select.value = val;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      const form = select.closest("form");
      if (form) form.submit();
    }
  };

  const handleExamTypeChange = (val) => {
    const root = document.querySelector(".m-grid.m-grid--hor.m-grid--root.m-page");
    const select = root?.querySelector("#EvalTypeId");
    if (select) {
      select.value = val;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      const form = select.closest("form");
      if (form) form.submit();
    }
  };

  const handleReasonChange = (val) => {
    setSelectedReason(val);
    const root = document.querySelector(".m-grid.m-grid--hor.m-grid--root.m-page");
    const select = root?.querySelector("#DrpDwnRetakeReason");
    if (select) {
      select.value = val;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  const toggleCourse = (id) => {
    const course = courses.find((c) => c.id === id);
    if (course && !course.isDisabled) {
      const newSelected = new Set(selectedCourses);
      const isChecking = !newSelected.has(id);

      if (isChecking) newSelected.add(id);
      else newSelected.delete(id);

      setSelectedCourses(newSelected);

      const portalCheckbox = document.getElementById(course.checkboxId);
      if (portalCheckbox) {
        if (portalCheckbox.checked !== isChecking) {
          portalCheckbox.click();
        }
      }
    }
  };

  const handleInitiateRequest = () => {
    if (selectedCourses.size === 0) {
      alert("Please select at least one course.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleModalSubmit = (file, remarks) => {
    const portalFileInput = document.getElementById("RetakeMidFile");
    if (portalFileInput) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      portalFileInput.files = dataTransfer.files;
      portalFileInput.dispatchEvent(new Event("change", { bubbles: true }));
    }

    const portalRemarks = document.getElementById("StdRmktxtarea");
    if (portalRemarks) {
      portalRemarks.value = remarks;
      portalRemarks.dispatchEvent(new Event("input", { bubbles: true }));
    }

    if (typeof window.fn_SubmitStdRemarks === "function") {
      window.fn_SubmitStdRemarks();
    } else {
      const portalButton = document.querySelector('#remrksbtn input[type="button"]');
      if (portalButton) portalButton.click();
    }

    setIsModalOpen(false);
  };

  const handleDownloadForm = () => {
    if (selectedCourses.size === 0) {
      alert("Please select at least one course.");
      return;
    }

    courses.forEach((c) => {
      const checkbox = document.getElementById(c.checkboxId);
      if (checkbox) {
        checkbox.checked = selectedCourses.has(c.id);

        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    const portalReasonSelect = document.getElementById("DrpDwnRetakeReason");
    if (portalReasonSelect) {
      portalReasonSelect.value = selectedReason;
      portalReasonSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }

    if (typeof window.ftn_PrintExamRetakeRequestForm === "function") {
      window.ftn_PrintExamRetakeRequestForm();
    } else {
      const portalButton = document.getElementById("btnDownloadExamRetakForm");
      if (portalButton) portalButton.click();
    }
  };

  if (loading)
    return (
      <PageLayout currentPage={window.location.pathname}>
        <RetakeExamSkeleton />
      </PageLayout>
    );

  return (
    <PageLayout currentPage={window.location.pathname} fullWidth>
      <main className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col gap-7 px-4 py-6 font-sans sm:px-6 lg:px-8 lg:py-8">
        <RetakeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          fee={selectedCourses.size * 2000}
        />

        <InstructionsModal
          isOpen={isInstructionsOpen}
          onClose={() => setIsInstructionsOpen(false)}
        />

        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">Academics</p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Retake Exam Request</h1>
            <p className="text-sm text-white/80">Round two, fight! Paper ne pehli baar hara diya? Time for a comeback.</p>
          </div>
          <button type="button" onClick={() => setIsInstructionsOpen(true)} className="flex cursor-pointer items-center gap-2 rounded-full bg-white/55 px-4 py-2.5 text-xs font-bold text-[#230052] transition-colors hover:bg-white/75 dark:bg-black/25 dark:text-white dark:hover:bg-black/40"><Shield size={15} /> Rules &amp; procedures</button>
        </header>

        {alerts.length > 0 && (
          <section aria-label="Retake exam notifications" className="space-y-2">
            <NotificationBanner alerts={visibleAlerts} />
            {alerts.length > 1 && (
              <button
                type="button"
                onClick={() => setAreAlertsExpanded((expanded) => !expanded)}
                aria-expanded={areAlertsExpanded}
                className="flex cursor-pointer items-center gap-1.5 rounded-full bg-white/45 px-3 py-1.5 text-xs font-bold text-[#230052] transition-colors hover:bg-white/65 dark:bg-black/20 dark:text-white dark:hover:bg-black/35"
              >
                {areAlertsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {areAlertsExpanded ? "Show fewer notifications" : `Show ${alerts.length - 1} more notification${alerts.length > 2 ? "s" : ""}`}
              </button>
            )}
          </section>
        )}

        <section aria-label="Request period" className="space-y-3">
          {semesters.length > 0 && <div className="flex flex-col gap-2 sm:flex-row sm:items-center"><span className="w-20 shrink-0 text-xs font-semibold text-white/85">Semester</span><SuperTabs tabs={semesters} activeTab={semesters.find((semester) => semester.selected)?.value} onTabChange={handleSemesterChange} size="sm" className="!border-0 !bg-white/55 !backdrop-blur-xl dark:!bg-black/25 dark:!backdrop-blur-xl" /></div>}
          {examTypes.length > 0 && <div className="flex flex-col gap-2 sm:flex-row sm:items-center"><span className="w-20 shrink-0 text-xs font-semibold text-white/85">Exam type</span><SuperTabs tabs={examTypes} activeTab={examTypes.find((type) => type.selected)?.value} onTabChange={handleExamTypeChange} size="sm" className="!border-0 !bg-white/55 !backdrop-blur-xl dark:!bg-black/25 dark:!backdrop-blur-xl" /></div>}
        </section>

        <section aria-labelledby="retake-overview-heading" className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">Overview</p><h2 id="retake-overview-heading" className="text-xl font-bold tracking-tight text-white">Retake Summary</h2></div><p className="text-xs text-white/75">The redemption arc. Select your papers and calculate the comeback cost.</p></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            <StatsCard variant="dashboard" icon={Layout} label="Total courses" value={courses.length} />
            <StatsCard variant="dashboard" icon={CheckCircle2} label="Selected papers" value={selectedCourses.size} subValue="For this application" />
            <StatsCard variant="dashboard" icon={ShieldCheck} label="Processed" value={courses.filter((course) => course.status?.trim().toLowerCase() === "processed").length} subValue="Already processed" />
            <StatsCard variant="dashboard" icon={AlertCircle} label="Application fee" value={`Rs. ${(selectedCourses.size * 2000).toLocaleString()}`} subValue="Rs. 2,000 per paper" />
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
          <section aria-labelledby="retake-courses-heading" className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb]">
            <header className="flex flex-col gap-3 border-b border-black/[0.06] px-4 py-4 dark:border-white/[0.1] sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div><h2 id="retake-courses-heading" className="text-base font-bold">Available papers</h2><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Showing {filteredCourses.length} of {courses.length} courses</p></div>
              <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1 dark:bg-white/[0.06]" role="group" aria-label="Filter retake courses">
                {[{ value: "all", label: "All" }, { value: "available", label: "Selectable" }, { value: "selected", label: "Selected" }].map((filter) => <button key={filter.value} type="button" onClick={() => setCourseFilter(filter.value)} aria-pressed={courseFilter === filter.value} className={`cursor-pointer rounded-full px-3 py-2 text-xs font-bold transition-colors ${courseFilter === filter.value ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}>{filter.label}</button>)}
              </div>
            </header>
            {filteredCourses.length ? <div className="divide-y divide-black/[0.05] px-4 dark:divide-white/[0.08] sm:px-6">{filteredCourses.map((course, index) => <RetakeCourseCard key={course.id} course={course} index={index + 1} isSelected={selectedCourses.has(course.id)} onToggle={() => toggleCourse(course.id)} />)}</div> : <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center"><span className="mb-3 flex h-12 w-12 items-center justify-center rounded-[36%] bg-slate-100 text-slate-500 dark:bg-white/[0.08] dark:text-slate-300"><FileText size={22} /></span><h3 className="text-base font-bold">No Papers Available</h3><p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">No rematches available. No eligible papers found for this selection.</p></div>}
          </section>

          <aside className="relative rounded-[24px] border border-black/[0.06] bg-white text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] xl:sticky xl:top-6">
            <div className="border-b border-black/[0.06] px-5 py-4 dark:border-white/[0.1] sm:px-6"><h2 className="text-base font-bold">Request details</h2><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Review the reason and fee before continuing.</p></div>
            <div className="space-y-5 p-5 sm:p-6">
              <div className="space-y-2"><p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Retake situation</p><ReasonSelector reasons={reasons} selectedReason={selectedReason} onChange={handleReasonChange} /></div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.05]"><div className="mb-4 flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]"><ShieldCheck size={17} /></span><h3 className="text-sm font-bold">Fee Breakdown</h3></div><div className="space-y-3 text-xs"><div className="flex justify-between gap-3"><span className="text-slate-500 dark:text-slate-400">Selected papers</span><span className="font-semibold">{selectedCourses.size}</span></div><div className="flex justify-between gap-3"><span className="text-slate-500 dark:text-slate-400">Fee per paper</span><span className="font-semibold">Rs. 2,000</span></div><div className="flex justify-between gap-3 border-t border-black/[0.06] pt-3 text-sm dark:border-white/[0.1]"><span className="font-bold">Total fee</span><span className="font-bold">Rs. {(selectedCourses.size * 2000).toLocaleString()}</span></div></div></div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1"><Button variant="secondary" disabled={selectedCourses.size === 0} onClick={handleDownloadForm} className="w-full rounded-full" icon={<Download size={16} />}>Download form</Button><Button disabled={selectedCourses.size === 0} onClick={handleInitiateRequest} className="w-full rounded-full" variant="primary" icon={<ChevronRight size={16} />}>Continue request</Button></div>
              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400"><AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-300" />A processing fee of Rs. 2,000 applies to each selected paper.</p>
            </div>
          </aside>
        </div>
      </main>
    </PageLayout>
  );
}

export default RetakeExamPage;
