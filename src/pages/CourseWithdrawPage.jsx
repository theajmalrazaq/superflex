import React, { useEffect, useState, useRef } from "react";
import PageLayout from "../components/layouts/PageLayout";
import LoadingOverlay, {
  LoadingSpinner,
} from "../components/ui/LoadingOverlay";
import {
  FileText,
  Clock,
  CheckCircle2,
  Trash2,
  Printer,
  Info,
  Layers,
  Zap,
  Send,
  X,
  CreditCard,
  BookOpen,
  Layout,
  ShieldCheck,
  Download,
  ChevronRight,
} from "lucide-react";
import NotificationBanner from "../components/ui/NotificationBanner";
import PageHeader from "../components/ui/PageHeader";
import StatsCard from "../components/ui/StatsCard";
import SuperTabs from "../components/ui/SuperTabs";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import { TextArea } from "../components/ui/Input";

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

  const isFormValid =
    remarks.trim() && files.withdrawForm && files.cnicFront && files.cnicBack;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Withdrawal Intake"
      subtitle="Complete Documentation Required"
      icon={<FileText size={24} />}
    >
      <div className="space-y-6 pt-4">
        <div className="p-4 rounded-2xl bg-x/5 border border-x/10 flex items-center gap-4">
          <div className="p-2 bg-x/20 rounded-xl text-x">
            <Info size={18} />
          </div>
          <p className="text-xs font-bold text-x/90 leading-tight">
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
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
                  {input.label}
                </label>
                <div
                  className="group relative border-2 border-dashed border-white/5 hover:border-x/30 rounded-2xl p-5 transition-all cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] overflow-hidden"
                  onClick={() =>
                    document.getElementById(`file-${input.key}`).click()
                  }
                >
                  <input
                    id={`file-${input.key}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(input.key, e.target.files[0])
                    }
                  />
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-white/5 rounded-2xl text-zinc-400 group-hover:text-x group-hover:bg-x/10 transition-all">
                      <input.icon size={20} />
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate px-1">
                        {files[input.key]
                          ? files[input.key].name
                          : `Select ${input.label}`}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest px-1">
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
            <div className="w-1.5 h-5 bg-x rounded-full"></div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">
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
              "Ensure the withdrawal window is active for the course.",
              "All files must be strictly under 650KB (0.63 MB).",
              "A 'W' grade will be permanent on the transcript.",
              "Withdrawal does not refund any tuition fees.",
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

const WithdrawalCourseCard = ({ course, isSelected, onToggle, index }) => {
  return (
    <div
      onClick={() => course.canSelect && onToggle(course.id)}
      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all duration-300 gap-4 ${
        course.canSelect ? "cursor-pointer" : "cursor-not-allowed opacity-60"
      } ${
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
              {course.name}
            </h4>
          </div>

          <div className="flex items-center gap-2.5 text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">
            <span className="shrink-0">{course.credits} Credits</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0"></span>
            <span className="capitalize truncate">{course.type}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-row sm:flex-row items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
        {course.status && (
          <div
            className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
              course.status.toLowerCase().includes("withdraw")
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                : course.status.toLowerCase().includes("not applied")
                  ? "bg-white/5 border-white/5 text-zinc-500"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            }`}
          >
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
          {!isSelected && !course.canSelect && (
            <X size={10} className="text-zinc-800" />
          )}
        </div>
      </div>
    </div>
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
  const hiddenContentRef = useRef(null);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("superflex-update-loading", { detail: true }),
    );

    const parseWithdrawData = () => {
      try {
        const root = document.querySelector(
          ".m-grid.m-grid--hor.m-grid--root.m-page",
        );
        if (!root) {
          setTimeout(parseWithdrawData, 500);
          return;
        }

        const select = root.querySelector("select#SemId");
        if (select) {
          const opts = Array.from(select.options).map((o) => ({
            label: o.text.trim(),
            value: o.value,
            selected: o.selected,
          }));
          setSemesters(opts);
        }

        const alertList = [];
        root.querySelectorAll(".m-alert, .alert").forEach((alert) => {
          if (alert.style.display === "none") return;

          const textEl = alert.querySelector(".m-alert__text") || alert;
          const clone = textEl.cloneNode(true);

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

        const courseData = [];
        const table = root.querySelector(".table");
        if (table) {
          const rows = table.querySelectorAll("tbody tr");
          rows.forEach((row, idx) => {
            const cells = Array.from(row.querySelectorAll("td"));
            if (cells.length < 4) return;

            const checkbox = row.querySelector('input[name="OfferIdCheckBox"]');
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

        root.style.opacity = "0";
        root.style.pointerEvents = "none";
        root.style.position = "absolute";
        root.style.zIndex = "-1";

        setLoading(false);
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
      } catch (err) {
        console.error("Course Withdraw Parser Error", err);
        setLoading(false);
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
      }
    };

    parseWithdrawData();
  }, []);

  const handleSemesterChange = (val) => {
    const root = document.querySelector(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
    );
    const select = root?.querySelector("select#SemId");
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
    window.dispatchEvent(
      new CustomEvent("superflex-update-loading", { detail: true }),
    );

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
        alert(
          "Error: " +
            (data.msg || "Submission failed. Please check file sizes."),
        );
      }
    } catch (err) {
      console.error("Submission error", err);
      alert("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
      window.dispatchEvent(
        new CustomEvent("superflex-update-loading", { detail: false }),
      );
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
      <PageLayout currentPage={window.location.pathname}>
        <div className="w-full min-h-screen p-4 md:p-8 space-y-8">
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        </div>
      </PageLayout>
    );

  const isWithdrawActive = courses.some((c) => c.canSelect);
  const selectedCount = courses.filter((c) => c.isSelected).length;

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="w-full min-h-screen p-4 md:p-8 space-y-8 relative z-10">
        <RemarksModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={submitWithdrawal}
        />

        <InstructionsModal
          isOpen={isInstructionsOpen}
          onClose={() => setIsInstructionsOpen(false)}
        />

        {}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-x/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none z-0"></div>

        <PageHeader
          title="Course Withdraw"
          subtitle="Academic withdrawal management and status tracking"
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
            {}
            <SuperTabs
              tabs={semesters}
              activeTab={semesters.find((s) => s.selected)?.value}
              onTabChange={handleSemesterChange}
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
            icon={Trash2}
            label="Selected"
            value={selectedCount}
            delay={200}
          />
          <StatsCard
            icon={ShieldCheck}
            label="Withdrawal Status"
            value={isWithdrawActive ? "WINDOW OPEN" : "LOCKED"}
            delay={300}
          />
          <StatsCard
            icon={Clock}
            label="Pending Requests"
            value={
              courses.filter((c) => c.status.toLowerCase().includes("pending"))
                .length
            }
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
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Available Courses
                </h3>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">
                  {courses.length} Records
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {courses.map((course, idx) => (
                  <WithdrawalCourseCard
                    key={course.id}
                    course={course}
                    index={idx + 1}
                    isSelected={course.isSelected}
                    onToggle={toggleCourseSelection}
                  />
                ))}
              </div>

              {courses.length === 0 && (
                <div className="text-center py-20 bg-zinc-900/30 rounded-[2rem] border border-dashed border-white/5">
                  <div className="flex flex-col items-center gap-4 opacity-50">
                    <Layers size={48} className="text-zinc-600" />
                    <p className="text-zinc-500 font-medium uppercase tracking-widest text-xs">
                      No courses found for this semester
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
                <div className="p-5 rounded-2xl bg-x/5 border border-x/10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-x/10 rounded-lg text-x">
                      <ShieldCheck size={18} />
                    </div>
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      Action Summary
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                        Selected
                      </span>
                      <span className="text-white font-black">
                        {selectedCount}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                        Processing
                      </span>
                      <span className="text-white font-black">Immediate</span>
                    </div>
                    <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                      <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                        Permanent Impact
                      </span>
                      <span className="text-x font-black text-xs uppercase tracking-widest">
                        Yes
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    variant="secondary"
                    onClick={handlePrintForm}
                    disabled={selectedCount === 0}
                    className="w-full"
                    icon={<Download size={16} />}
                  >
                    Download Form
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleWithdrawAction}
                    disabled={selectedCount === 0 || isSubmitting}
                    isLoading={isSubmitting}
                    className="w-full"
                    icon={<ChevronRight size={16} />}
                  >
                    Initiate Withdraw
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-3 px-1 text-x">
                  <Zap size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Quick Tool
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-medium leading-relaxed px-1">
                  Use{" "}
                  <a
                    href="https://imageresizer.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:underline"
                  >
                    Image Resizer
                  </a>{" "}
                  to meet the strict 650KB limit for all uploads.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref={hiddenContentRef} className="hidden" />
    </PageLayout>
  );
}

export default CourseWithdrawPage;
