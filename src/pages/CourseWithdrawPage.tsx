import React, { useEffect, useState, useRef } from "react";
import { parsePortalAlerts, parseSelectOptions } from "../parsers/dom";
import PageLayout from "../components/layouts/PageLayout";
import {
  FileText,
  Clock,
  CheckCircle2,
  Trash2,
  Info,
  Layers,
  Zap,
  Send,
  X,
  CreditCard,
  BookOpen,
  ShieldCheck,
  Download,
  ChevronRight,
  Check,
} from "lucide-react";
import NotificationBanner from "../components/ui/NotificationBanner";
import StatsCard from "../components/ui/StatsCard";
import LabeledTabsRow from "../components/ui/LabeledTabsRow";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import { TextArea } from "../components/ui/Input";
import Skeleton from "../components/ui/Skeleton";
import { hideFlexPageRoot } from "../parsers/dom";

const CourseWithdrawSkeleton = () => (
  <main
    className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col gap-7 px-4 py-6 font-sans sm:px-6 lg:px-8 lg:py-8"
    role="status"
    aria-label="Loading course withdrawal details"
  >
    <header className="space-y-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </header>
    <Skeleton className="h-10 w-72 max-w-full rounded-full" />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex min-h-[156px] flex-col rounded-[24px] bg-white p-5 dark:bg-black sm:p-6"
        >
          <Skeleton className="h-12 w-12 rounded-[36%]" />
          <Skeleton className="mt-auto h-7 w-28" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,.8fr)]">
      <section className="space-y-3 rounded-[24px] bg-white p-5 dark:bg-black sm:p-6">
        <Skeleton className="h-5 w-44" />
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex items-center gap-4 border-t border-black/[0.05] py-4 dark:border-white/[0.08]"
          >
            <Skeleton className="h-10 w-10 rounded-[36%]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-56 max-w-full" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        ))}
      </section>
      <section className="space-y-4 rounded-[24px] bg-white p-5 dark:bg-black sm:p-6">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-11 w-full rounded-full" />
        <Skeleton className="h-11 w-full rounded-full" />
      </section>
    </div>
  </main>
);

const RemarksModal = ({ isOpen, onClose, onSubmit }) => {
  const [remarks, setRemarks] = useState("");
  const [files, setFiles] = useState({
    withdrawForm: null,
    cnicFront: null,
    cnicBack: null,
  });
  const MAX_SIZE = 0.63 * 1024 * 1024;

  const handleFileChange = (key, file) => {
    if (file && file.size > MAX_SIZE) {
      alert(
        `${key === "withdrawForm" ? "Withdraw Form" : key === "cnicFront" ? "CNIC Front" : "CNIC Back"} image must be less than 0.63 MB (650 KB).`,
      );
      return;
    }
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const isFormValid = remarks.trim() && files.withdrawForm && files.cnicFront && files.cnicBack;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="It's Not You, It's the Course."
      subtitle="Tell us why you're leaving and attach the required documents."
      icon={<FileText size={24} />}
    >
      <div className="space-y-6 pt-4">
        <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10 flex items-center gap-4">
          <div className="p-2 bg-accent/20 rounded-xl text-accent">
            <Info size={18} />
          </div>
          <p className="text-xs font-bold text-accent/90 leading-tight">
            Important: Uploaded images must be under 650KB each.
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {[
              { key: "withdrawForm", label: "Withdraw Form", icon: FileText },
              { key: "cnicFront", label: "CNIC Front", icon: CreditCard },
              { key: "cnicBack", label: "CNIC Back", icon: CreditCard },
            ].map((input) => (
              <div key={input.key} className="space-y-2">
                <label className="text-[10px] font-black text-foreground/50 Cap tracking-[0px] px-1">
                  {input.label}
                </label>
                <div
                  className="group relative border-2 border-dashed border-foreground/10 hover:border-accent/30 rounded-2xl p-5 transition-all cursor-pointer bg-foreground/[0.02] hover:bg-foreground/[0.04] overflow-hidden"
                  onClick={() => document.getElementById(`file-${input.key}`).click()}
                >
                  <input
                    id={`file-${input.key}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(input.key, e.target.files[0])}
                  />
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-foreground/5 rounded-2xl text-foreground/60 group-hover:text-accent group-hover:bg-accent/10 transition-all">
                      <input.icon size={20} />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate px-1">
                        {files[input.key] ? files[input.key].name : `Select ${input.label}`}
                      </p>
                      <p className="text-[10px] text-foreground/50 font-bold Cap tracking-[0px] px-1">
                        {files[input.key]
                          ? `${(files[input.key].size / 1024).toFixed(0)} KB`
                          : "Image Store (Max 650KB)"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <TextArea
            label="Reason for Withdrawal"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Provide a detailed reason for your withdrawal request..."
          />
        </div>

        <Button
          onClick={() => onSubmit({ remarks, files })}
          disabled={!isFormValid}
          className="w-full"
          icon={<Send size={18} />}
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
      subtitle="Withdrawal Framework"
      icon={<ShieldCheck size={24} />}
    >
      <div className="space-y-8 pt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-5 bg-accent rounded-full"></div>
            <h3 className="text-sm font-black text-foreground Cap tracking-[0px]">
              Mandatory Documents
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: "Withdraw Form", desc: "Signed by you and parents" },
              { title: "CNIC Front", desc: "Clear scan of Parent/Guardian" },
              { title: "CNIC Back", desc: "Clear scan of Parent/Guardian" },
              { title: "Valid Images", desc: "Format: JPG, PNG, WEBP" },
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
              "Ensure the withdrawal window is active for the course.",
              "All files must be strictly under 650KB (0.63 MB).",
              "A 'W' grade will be permanent on the transcript.",
              "Withdrawal does not refund any tuition fees.",
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

const WithdrawalCourseCard = ({ course, isSelected, onToggle, index }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!course.canSelect}
      aria-pressed={isSelected}
      className={`group flex w-full cursor-pointer flex-col gap-3 px-1 py-4 text-left transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5 ${course.canSelect ? "hover:bg-slate-50 dark:hover:bg-white/[0.025]" : "cursor-not-allowed opacity-60"}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="hidden w-7 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-400 sm:block">
          {index}
        </span>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[36%] ${isSelected ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]" : "bg-slate-100 text-slate-600 dark:bg-white/[0.08] dark:text-slate-300"}`}
        >
          <BookOpen size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-white/[0.08] dark:text-slate-300">
              {course.code}
            </span>
            <span className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {course.name}
            </span>
          </span>
          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span>{course.credits} credits</span>
            <span>{course.type}</span>
          </span>
        </span>
      </div>

      <span className="flex w-full items-center justify-between gap-3 border-t border-black/[0.05] pt-3 dark:border-white/[0.08] sm:w-auto sm:justify-end sm:border-0 sm:pt-0">
        {course.status && (
          <span
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${course.status.toLowerCase().includes("withdraw") ? "bg-rose-50 text-rose-700 dark:bg-rose-300/10 dark:text-rose-200" : course.status.toLowerCase().includes("not applied") ? "bg-slate-100 text-slate-600 dark:bg-white/[0.08] dark:text-slate-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200"}`}
          >
            {course.status}
          </span>
        )}
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${isSelected ? "border-[#230052] bg-[#230052] text-white dark:border-white dark:bg-white dark:text-[#0a192f]" : "border-slate-300 text-transparent dark:border-white/25"}`}
        >
          {isSelected && <Check size={15} strokeWidth={3} />}
          {!isSelected && !course.canSelect && (
            <X size={13} className="text-slate-400 dark:text-slate-500" />
          )}
        </span>
      </span>
    </button>
  );
};

function CourseWithdrawPage() {
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseFilter, setCourseFilter] = useState("all");
  const hiddenContentRef = useRef(null);

  useEffect(() => {
    const parseWithdrawData = () => {
      try {
        const root = document.querySelector<HTMLElement>(".m-grid.m-grid--hor.m-grid--root.m-page");
        if (!root) {
          setTimeout(parseWithdrawData, 500);
          return;
        }

        const select = root.querySelector<HTMLSelectElement>("select#SemId");
        if (select) {
          setSemesters(parseSelectOptions(select));
        }

        setAlerts(parsePortalAlerts(root));

        const courseData = [];
        const table = root.querySelector<HTMLElement>(".table");
        if (table) {
          const rows = table.querySelectorAll<HTMLElement>("tbody tr");
          rows.forEach((row, idx) => {
            const cells = Array.from(row.querySelectorAll<HTMLElement>("td"));
            if (cells.length < 4) return;

            const checkbox = row.querySelector<HTMLInputElement>('input[name="OfferIdCheckBox"]');
            let code, name, credits, status, offerId;

            if (checkbox) {
              offerId = checkbox.id.split("_")[1];
              code = cells[2]?.textContent.trim();
              name = cells[3]?.textContent.trim();
              credits = cells[4]?.textContent.trim();
              status = cells[5]?.textContent.trim();
            } else {
              code = cells[1]?.textContent.trim();
              name = cells[2]?.textContent.trim();
              credits = cells[3]?.textContent.trim();
              status = cells[4]?.textContent.trim();
            }

            if (code) {
              courseData.push({
                id: idx,
                offerId: offerId,
                isSelected: false,
                canSelect: !!checkbox,
                code,
                name,
                credits,
                type: "Course",
                status: status || "Not Applied",
                rawCheckbox: checkbox,
              });
            }
          });
        }
        setCourses(courseData);

        if (hiddenContentRef.current) {
          hiddenContentRef.current.innerHTML = "";
          hiddenContentRef.current.appendChild(root.cloneNode(true));
        }

        hideFlexPageRoot(root);

        setLoading(false);
      } catch (err) {
        console.error("Course Withdraw Parser Error", err);
        setLoading(false);
      }
    };

    parseWithdrawData();
  }, []);

  const handleSemesterChange = (val) => {
    const root = document.querySelector<HTMLElement>(".m-grid.m-grid--hor.m-grid--root.m-page");
    const select = root?.querySelector<HTMLSelectElement>("select#SemId");
    if (select) {
      select.value = val;
      select.dispatchEvent(new Event("change"));
      const form = select.closest("form");
      if (form) form.submit();
    }
  };

  const toggleCourseSelection = (id) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return { ...c, isSelected: !c.isSelected };
        }
        return c;
      }),
    );
  };

  const handleWithdrawAction = () => {
    const selected = courses.filter((c) => c.isSelected);
    if (selected.length === 0) {
      alert("Please select at least one course to withdraw.");
      return;
    }
    setIsModalOpen(true);
  };

  const submitWithdrawal = async ({ remarks, files }) => {
    const selected = courses.filter((c) => c.isSelected);
    if (selected.length === 0) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      selected.forEach((course) => {
        formData.append("offerId", course.offerId);
      });

      formData.append("Remarks", remarks);
      formData.append("WFImage", files.withdrawForm);
      formData.append("CNICFimage", files.cnicFront);
      formData.append("CNICBimage", files.cnicBack);

      const currentSem = semesters.find((s) => s.selected)?.value || "";
      formData.append("Sem_ID", currentSem);

      const response = await fetch("../Student/InitiateCourseWithdrawRequest", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.msg === "done") {
        alert("Withdrawal request submitted successfully!");
        window.location.reload();
      } else {
        alert("Error: " + (data.msg || "Submission failed. Please check file sizes."));
      }
    } catch (err) {
      console.error("Submission error", err);
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  const handlePrintForm = () => {
    const selected = courses.filter((c) => c.isSelected);
    if (selected.length === 0) {
      alert("Please select at least one course to generate the form.");
      return;
    }

    const offerIdsStr = selected.map((c) => c.offerId).join("_");
    const url = `../Student/PrintStdCourseWithdrawForm?OfferIds=${offerIdsStr}`;
    window.open(url, "_blank");
  };

  if (loading)
    return (
      <PageLayout currentPage={window.location.pathname} fullWidth>
        <CourseWithdrawSkeleton />
      </PageLayout>
    );

  const isWithdrawActive = courses.some((c) => c.canSelect);
  const selectedCount = courses.filter((c) => c.isSelected).length;
  const filteredCourses = courses.filter((course) => {
    if (courseFilter === "eligible") return course.canSelect;
    if (courseFilter === "selected") return course.isSelected;
    if (courseFilter === "processed") return !course.canSelect;
    return true;
  });

  return (
    <PageLayout currentPage={window.location.pathname} fullWidth>
      <main className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col gap-7 px-4 py-6 font-sans sm:px-6 lg:px-8 lg:py-8">
        <RemarksModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={submitWithdrawal}
        />

        <InstructionsModal
          isOpen={isInstructionsOpen}
          onClose={() => setIsInstructionsOpen(false)}
        />

        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
              Academics
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Course Withdrawal
            </h1>
            <p className="text-sm text-white/80">
              Sometimes giving up is strategy. Bhai har battle jeetna zaroori nahi.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsInstructionsOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-white/55 px-4 py-2.5 text-xs font-bold text-[#230052] transition-colors hover:bg-white/75 dark:bg-black/25 dark:text-white dark:hover:bg-black/40"
          >
            <ShieldCheck size={15} /> Rules &amp; procedures
          </button>
        </header>

        {semesters.length > 0 && (
          <LabeledTabsRow
            label="Semester"
            tabs={semesters}
            onTabChange={handleSemesterChange}
            ariaLabel="Select semester"
          />
        )}

        <section aria-labelledby="withdraw-overview-heading" className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">
                Overview
              </p>
              <h2
                id="withdraw-overview-heading"
                className="text-xl font-bold tracking-tight text-white"
              >
                Withdrawal summary
              </h2>
            </div>
            <p className="text-xs text-white/75">
              {isWithdrawActive
                ? "Choose eligible courses to prepare a request."
                : "No withdrawal window is currently open."}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            <StatsCard
              variant="dashboard"
              icon={BookOpen}
              label="Total courses"
              value={courses.length}
              subValue="Enrolled this term"
            />
            <StatsCard
              variant="dashboard"
              icon={Trash2}
              label="Selected"
              value={selectedCount}
              subValue="For this request"
            />
            <StatsCard
              variant="dashboard"
              icon={ShieldCheck}
              label="Withdrawal status"
              value={isWithdrawActive ? "Open" : "Closed"}
              subValue={isWithdrawActive ? "Submission window open" : "Window closed"}
            />
            <StatsCard
              variant="dashboard"
              icon={Clock}
              label="Pending requests"
              value={
                courses.filter((course) => course.status.toLowerCase().includes("pending")).length
              }
              subValue="Awaiting review"
            />
          </div>
        </section>

        {alerts.length > 0 && (
          <NotificationBanner alerts={alerts} onActionClick={() => setIsInstructionsOpen(true)} />
        )}

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,.8fr)]">
          <section
            aria-labelledby="withdraw-courses-heading"
            className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb]"
          >
            <header className="flex flex-col gap-3 border-b border-black/[0.06] px-4 py-4 dark:border-white/[0.1] sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 id="withdraw-courses-heading" className="text-base font-bold">
                  Courses
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Showing {filteredCourses.length} of {courses.length} courses
                </p>
              </div>
              <div
                className="flex items-center gap-1 rounded-full bg-slate-100 p-1 dark:bg-white/[0.06]"
                role="group"
                aria-label="Filter courses"
              >
                {[
                  { value: "all", label: "All" },
                  { value: "eligible", label: "Eligible" },
                  { value: "selected", label: "Selected" },
                  { value: "processed", label: "Unavailable" },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setCourseFilter(filter.value)}
                    aria-pressed={courseFilter === filter.value}
                    className={`cursor-pointer rounded-full px-3 py-2 text-xs font-bold transition-colors ${courseFilter === filter.value ? "bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </header>
            {filteredCourses.length ? (
              <div className="divide-y divide-black/[0.05] px-4 dark:divide-white/[0.08] sm:px-6">
                {filteredCourses.map((course, index) => (
                  <WithdrawalCourseCard
                    key={course.id}
                    course={course}
                    index={index + 1}
                    isSelected={course.isSelected}
                    onToggle={() => toggleCourseSelection(course.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-[36%] bg-slate-100 text-slate-500 dark:bg-white/[0.08] dark:text-slate-300">
                  <Layers size={22} />
                </span>
                <h3 className="text-base font-bold">No Courses Found</h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  Nothing to escape from. No courses match your current filter.
                </p>
              </div>
            )}
          </section>

          <aside className="rounded-[24px] border border-black/[0.06] bg-white text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] xl:sticky xl:top-6">
            <header className="border-b border-black/[0.06] px-5 py-4 dark:border-white/[0.1] sm:px-6">
              <h2 className="text-base font-bold">Withdrawal Confirmation</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Double-check before you officially break up with this course.
              </p>
            </header>
            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.05]">
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]">
                    <ShieldCheck size={17} />
                  </span>
                  <h3 className="text-sm font-bold">Action summary</h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500 dark:text-slate-400">Selected courses</span>
                    <span className="font-semibold">{selectedCount}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500 dark:text-slate-400">Request status</span>
                    <span className="font-semibold">
                      {isWithdrawActive ? "Available" : "Closed"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-black/[0.06] pt-3 text-sm dark:border-white/[0.1]">
                    <span className="font-bold">Transcript impact</span>
                    <span className="font-bold">W grade</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <Button
                  variant="secondary"
                  onClick={handlePrintForm}
                  disabled={selectedCount === 0}
                  className="w-full rounded-full"
                  icon={<Download size={16} />}
                >
                  Download form
                </Button>
                <Button
                  variant="primary"
                  onClick={handleWithdrawAction}
                  disabled={selectedCount === 0 || isSubmitting}
                  isLoading={isSubmitting}
                  className="w-full rounded-full"
                  icon={<ChevronRight size={16} />}
                >
                  Continue request
                </Button>
              </div>
              <p className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                <Info size={15} className="mt-0.5 shrink-0 text-[#230052] dark:text-white" />A ‘W’
                grade will appear on the transcript. Withdrawal does not refund tuition fees.
              </p>
              <div className="border-t border-black/[0.06] pt-4 dark:border-white/[0.1]">
                <div className="mb-2 flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Zap size={14} />
                  <span className="text-xs font-bold">File size help</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Each uploaded image must be under 650 KB. Use an{" "}
                  <a
                    href="https://imageresizer.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#230052] underline-offset-2 hover:underline dark:text-white"
                  >
                    image resizer
                  </a>{" "}
                  if needed.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <div ref={hiddenContentRef} className="hidden" />
    </PageLayout>
  );
}

export default CourseWithdrawPage;
