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
  AlertCircle,
  BookOpen,
  Layout,
  FileText,
  Download,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Upload,
  X,
  CheckCircle2,
  Check,
  Shield,
} from "lucide-react";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Input, { TextArea } from "../components/ui/Input";

const RetakeModal = ({ isOpen, onClose, onSubmit, selectedReason, fee }) => {
  const [file, setFile] = useState(null);
  const [remarks, setRemarks] = useState("");
  const fileInputRef = useRef(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Details"
      subtitle="Retake Exam Submission"
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
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
              Evidence Documentation
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative border-2 border-dashed border-white/5 hover:border-x/30 rounded-2xl p-6 transition-all cursor-pointer bg-white/[0.02] hover:bg-white/[0.04]"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="p-4 bg-x/10 rounded-2xl text-x group-hover:scale-110 transition-transform duration-300">
                  <Upload size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white truncate max-w-[250px]">
                    {file ? file.name : "Upload Form (PDF)"}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
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
            <div className="w-1.5 h-5 bg-x rounded-full"></div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">
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
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 hover:bg-white/[0.04] transition-colors"
              >
                <h4 className="text-[11px] font-black text-x uppercase tracking-wider">
                  {item.title}
                </h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-bold">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-5 bg-x rounded-full"></div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">
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
                className="flex gap-4 p-3 rounded-2xl hover:bg-white/[0.02] transition-colors group border border-transparent hover:border-white/5"
              >
                <div className="w-6 h-6 rounded-full bg-x/10 border border-x/20 flex items-center justify-center text-x text-[10px] font-black shrink-0 group-hover:scale-110 transition-transform">
                  {i + 1}
                </div>
                <p className="text-xs text-zinc-400 font-bold leading-relaxed">
                  {step}
                </p>
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
    <div
      onClick={onToggle}
      className={`group cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-300 gap-4 ${
        isSelected
          ? "bg-x/10 border-x/50"
          : "bg-zinc-900/30 border-transparent hover:bg-zinc-900/50 hover:border-white/5"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span
          className={`font-bold text-xs min-w-[1.2rem] ${isSelected ? "text-x" : "text-zinc-600"}`}
        >
          {index}.
        </span>

        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-all duration-300 ${
            isSelected
              ? "bg-x/20 border-x/30 text-x scale-105"
              : "bg-zinc-800/50 border-white/5 text-zinc-500"
          }`}
        >
          <BookOpen size={18} />
        </div>

        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-black text-x uppercase tracking-tighter opacity-80 shrink-0">
              {course.code}
            </span>
            <h4 className="text-white font-bold text-sm leading-tight truncate">
              {course.courseName}
            </h4>
          </div>

          <div className="flex items-center gap-2.5 text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">
            <span className="shrink-0">{course.credits} Credits</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0"></span>
            <span className="truncate">Section {course.section}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
        {course.status && (
          <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
            {course.status}
          </div>
        )}
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            isSelected
              ? "bg-x border-x text-zinc-950 scale-110"
              : "border-zinc-700 bg-transparent"
          }`}
        >
          {isSelected && <CheckCircle2 size={14} strokeWidth={3} />}
        </div>
      </div>
    </div>
  );
};

const ExamTypeSelector = ({ types, selectedValue, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedType = types.find((t) => t.value === selectedValue) || types[0];

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
        className="w-full md:w-[280px] flex items-center justify-between px-3 py-2 rounded-[2rem] bg-zinc-900/50 border border-white/5 text-white hover:bg-white/5 transition-all group"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 rounded-xl bg-x/10 text-x">
            <Layout size={16} />
          </div>
          <span className="text-sm font-bold truncate">
            {selectedType?.label || "Select Exam Type"}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-black/50 backdrop-blur-2xl border border-white/10 max-h-[60vh] overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col gap-3">
            {types.map((type, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelect(type.value);
                  setIsOpen(false);
                }}
                className={`w-full flex bg-zinc-900 items-center justify-between p-3 rounded-xl transition-all ${
                  selectedValue === type.value
                    ? "bg-x/10 border border-x/20"
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <span
                  className={`text-sm font-medium truncate ${selectedValue === type.value ? "text-white" : "text-zinc-400"}`}
                >
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
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
  const [stats, setStats] = useState({
    total: 0,
    sessional1: 0,
    sessional2: 0,
    final: 0,
  });

  const hiddenFormRef = useRef(null);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("superflex-update-loading", { detail: true }),
    );

    const parseRetakeData = () => {
      const root = document.querySelector(
        ".m-grid.m-grid--hor.m-grid--root.m-page",
      );
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
              const checkbox = cells[5]?.querySelector(
                'input[type="checkbox"]',
              );
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

        root.style.opacity = "0";
        root.style.pointerEvents = "none";
        root.style.position = "absolute";
        root.style.zIndex = "-1";

        setLoading(false);
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
      } catch (err) {
        console.error("Retake Parser Error:", err);
        setLoading(false);
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
      }
    };

    parseRetakeData();
  }, []);

  const handleSemesterChange = (val) => {
    const root = document.querySelector(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
    );
    const select = root?.querySelector("#SemId");
    if (select) {
      select.value = val;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      const form = select.closest("form");
      if (form) form.submit();
    }
  };

  const handleExamTypeChange = (val) => {
    const root = document.querySelector(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
    );
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
    const root = document.querySelector(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
    );
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

      const legacyCheckbox = document.getElementById(course.checkboxId);
      if (legacyCheckbox) {
        if (legacyCheckbox.checked !== isChecking) {
          legacyCheckbox.click();
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
    const legacyFileInput = document.getElementById("RetakeMidFile");
    if (legacyFileInput) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      legacyFileInput.files = dataTransfer.files;
      legacyFileInput.dispatchEvent(new Event("change", { bubbles: true }));
    }

    const legacyRemarks = document.getElementById("StdRmktxtarea");
    if (legacyRemarks) {
      legacyRemarks.value = remarks;
      legacyRemarks.dispatchEvent(new Event("input", { bubbles: true }));
    }

    if (typeof window.fn_SubmitStdRemarks === "function") {
      window.fn_SubmitStdRemarks();
    } else {
      const legacyBtn = document.querySelector(
        '#remrksbtn input[type="button"]',
      );
      if (legacyBtn) legacyBtn.click();
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

    const legacyReasonSelect = document.getElementById("DrpDwnRetakeReason");
    if (legacyReasonSelect) {
      legacyReasonSelect.value = selectedReason;
      legacyReasonSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }

    if (typeof window.ftn_PrintExamRetakeRequestForm === "function") {
      window.ftn_PrintExamRetakeRequestForm();
    } else {
      const legacyBtn = document.getElementById("btnDownloadExamRetakForm");
      if (legacyBtn) legacyBtn.click();
    }
  };

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
      <div className="w-full min-h-screen p-4 md:p-8 space-y-8 relative z-10">
        <RetakeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          selectedReason={selectedReason}
          fee={selectedCourses.size * 2000}
        />

        <InstructionsModal
          isOpen={isInstructionsOpen}
          onClose={() => setIsInstructionsOpen(false)}
        />

        {}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-x/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none z-0"></div>

        <PageHeader
          title="Retake Exam"
          subtitle="Manage your examination retake applications"
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
            {}
            <SuperTabs
              tabs={semesters}
              activeTab={semesters.find((s) => s.selected)?.value}
              onTabChange={handleSemesterChange}
            />

            {}
            <ExamTypeSelector
              types={examTypes}
              selectedValue={examTypes.find((e) => e.selected)?.value || ""}
              onSelect={handleExamTypeChange}
            />
          </div>
        </PageHeader>

        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={Layout}
            label="Total Courses"
            value={courses.length}
            delay={100}
          />
          <StatsCard
            icon={CheckCircle2}
            label="Selected"
            value={selectedCourses.size}
            delay={200}
          />
          <StatsCard
            icon={ShieldCheck}
            label="Processed"
            value={
              courses.filter(
                (c) =>
                  c.status &&
                  c.status.trim().length > 0 &&
                  c.status.trim().toLowerCase() === "processed",
              ).length
            }
            delay={300}
          />
          <StatsCard
            icon={AlertCircle}
            label="Total Fee"
            value={`Rs. ${selectedCourses.size * 2000}`}
            delay={400}
          />
        </div>

        {}
        <NotificationBanner
          alerts={alerts}
          onActionClick={() => setIsInstructionsOpen(true)}
        />

        {}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-bold text-white">
                  Eligible Courses
                </h3>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">
                  {courses.length} Total
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {courses.map((course, idx) => (
                  <RetakeCourseCard
                    key={course.id}
                    course={course}
                    index={idx + 1}
                    isSelected={selectedCourses.has(course.id)}
                    onToggle={() => toggleCourse(course.id)}
                  />
                ))}
              </div>

              {courses.length === 0 && (
                <div className="text-center py-20 bg-zinc-900/30 rounded-[2rem] border border-dashed border-white/5">
                  <div className="flex flex-col items-center gap-4 opacity-50">
                    <FileText size={48} className="text-zinc-600" />
                    <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs">
                      No courses eligible for retake
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {}
          <div className="space-y-6">
            <div className="bg-zinc-900/50 border border-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 space-y-8 sticky top-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">
                    Retake Situation
                  </label>
                  <div className="relative group">
                    <select
                      value={selectedReason}
                      onChange={(e) => handleReasonChange(e.target.value)}
                      className="w-full appearance-none bg-zinc-800/50 border border-white/5 text-white px-5 py-4 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-x/50 transition-all cursor-pointer pr-12"
                    >
                      {reasons.map((reason, idx) => (
                        <option key={idx} value={reason.value}>
                          {reason.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-hover:text-white transition-colors"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-x/5 border border-x/10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-x/10 rounded-lg text-x">
                      <ShieldCheck size={18} />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      Order Summary
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-zinc-500">Selected Papers</span>
                      <span className="text-white">{selectedCourses.size}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-zinc-500">Processing Fee</span>
                      <span className="text-white">Rs. 2,000 / paper</span>
                    </div>
                    <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-400">
                        Total Charged
                      </span>
                      <span className="text-lg font-black text-white">
                        Rs. {selectedCourses.size * 2000}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  variant="secondary"
                  disabled={selectedCourses.size === 0}
                  onClick={handleDownloadForm}
                  className="w-full"
                  icon={<Download size={16} />}
                >
                  Download Form
                </Button>
                <Button
                  disabled={selectedCourses.size === 0}
                  onClick={handleInitiateRequest}
                  className="w-full"
                  variant="primary"
                  icon={<ChevronRight size={16} />}
                >
                  Initiate Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </PageLayout>
  );
}

export default RetakeExamPage;
