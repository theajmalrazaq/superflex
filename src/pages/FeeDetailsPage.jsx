import React, { useEffect, useState, useMemo } from "react";
import PageLayout from "../components/layouts/PageLayout";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import {
  DollarSign,
  ChevronDown,
  FileText,
  History,
  CreditCard,
  Layers,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import NotificationBanner from "../components/ui/NotificationBanner";
import PageHeader from "../components/ui/PageHeader";
import StatsCard from "../components/ui/StatsCard";

const SemesterAccordion = ({ semester }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasDetails =
    semester.feeItems.length > 0 || semester.courses.length > 0;

  return (
    <div className="group border border-foreground/10 bg-secondary/40 rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:border-foreground/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left"
      >
        <div className="flex items-center gap-5">
          <div
            className={`p-4 rounded-2xl bg-foreground/5 transition-all duration-500 ${isOpen ? "bg-accent/20 text-accent" : "text-foreground/60 group-hover:text-foreground"}`}
          >
            <Layers size={22} />
          </div>
          <div>
            <h4 className="text-xl font-black text-foreground font-sans Cap tracking-tight">
              {semester.name}
            </h4>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-[10px] text-foreground/50 font-bold Cap tracking-[0px]">
                {semester.courses.length || 0} Registered Items
              </p>
              <span className="w-1 h-1 rounded-full bg-tertiary"></span>
              <p className="text-[10px] text-foreground/50 font-bold Cap tracking-[0px]">
                GPA: {semester.academic.sgpa || "0.00"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-foreground/50 font-bold Cap tracking-[0px] leading-none mb-2">
              Collection
            </p>
            <p className="text-xl font-black text-foreground font-sans tracking-tight">
              Rs. {semester.totalPaid}
            </p>
          </div>
          <div
            className={`p-3 rounded-xl bg-foreground/5 transition-all duration-500 ${isOpen ? "rotate-180 bg-foreground/10" : ""}`}
          >
            <ChevronDown size={20} className="text-foreground/50" />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="px-8 pb-8 space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col gap-10">
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <h5 className="flex items-center gap-2 text-[10px] font-black Cap tracking-[0px] text-accent">
                  <DollarSign size={12} /> Fee Breakdown
                </h5>
                <div className="space-y-3">
                  {semester.feeItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-foreground/[0.02] border border-foreground/10 group/item hover:border-foreground/10 transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-foreground/60 font-bold font-sans text-xs Cap tracking-tight">
                          {item.name}
                        </span>
                        <span className="text-foreground font-black font-sans">
                          Rs. {item.val}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-foreground/10">
                    <div className="p-5 rounded-2xl bg-foreground/[0.02] border border-foreground/10">
                      <p className="text-[8px] text-foreground/50 font-black Cap tracking-[0px] mb-1.5">
                        Net Dues
                      </p>
                      <p className="text-lg font-black text-foreground font-sans tracking-tight">
                        Rs. {semester.summary.due}
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-accent/5 border border-accent/10">
                      <p className="text-[8px] text-accent/70 font-black Cap tracking-[0px] mb-1.5">
                        Balance
                      </p>
                      <p
                        className={`text-lg font-black font-sans tracking-tight ${semester.summary.balance === "0" ? "text-emerald-400" : "text-foreground"}`}
                      >
                        Rs. {semester.summary.balance}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-[1.8rem] bg-emerald-500/5 border border-emerald-500/10 flex flex-col gap-1 relative overflow-hidden group/gpa">
                  <span className="text-[9px] text-emerald-500/50 font-black Cap tracking-[0px]">
                    SGPA
                  </span>
                  <span className="text-3xl font-black text-emerald-400 font-sans tracking-tight leading-none">
                    {semester.academic.sgpa}
                  </span>
                </div>
                <div className="p-6 rounded-[1.8rem] bg-foreground/5 border border-foreground/10 flex flex-col gap-1 relative overflow-hidden">
                  <span className="text-[9px] text-foreground/50 font-black Cap tracking-[0px]">
                    CGPA
                  </span>
                  <span className="text-3xl font-black text-foreground font-sans tracking-tight leading-none">
                    {semester.academic.cgpa}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <h5 className="flex items-center gap-2 text-[10px] font-black Cap tracking-[0px] text-foreground/50">
                <BookOpen size={12} /> Registration Log
              </h5>
              <div className="!overflow-x-scroll scrollbar-hide rounded-[2rem] border border-foreground/10 bg-secondary/20 backdrop-blur-md">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-foreground/5">
                      <th className="p-5 text-[9px] font-black Cap tracking-[0px] text-foreground/50 font-sans border-b border-foreground/10">
                        Course
                      </th>
                      <th className="p-5 text-[9px] font-black Cap tracking-[0px] text-foreground/50 font-sans border-b border-foreground/10">
                        Type
                      </th>
                      <th className="p-5 text-[9px] font-black Cap tracking-[0px] text-foreground/50 font-sans border-b border-foreground/10 text-right">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/5">
                    {semester.courses.map((course, idx) => (
                      <tr
                        key={idx}
                        className="group/course hover:bg-foreground/[0.02]"
                      >
                        <td className="p-5">
                          <p className="text-xs font-black text-foreground font-sans tracking-tight">
                            {course.title}
                          </p>
                          {course.date && (
                            <p className="text-[9px] text-foreground/40 font-medium mt-1 Cap">
                              {course.date}
                            </p>
                          )}
                        </td>
                        <td className="p-5">
                          <span className="text-[10px] font-bold text-foreground/60 font-sans Cap tracking-[0px]">
                            {course.type}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <span
                            className={`px-2.5 py-1 rounded-lg border font-black Cap font-sans text-[8px] tracking-[0px] ${
                              course.status.toLowerCase().includes("registered")
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                            }`}
                          >
                            {course.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function FeeDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [totalPaid, setTotalPaid] = useState("0");

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("superflex-update-loading", { detail: true }),
    );

    const bootstrapAndHydrate = () => {
      const root = document.querySelector(
        ".m-grid.m-grid--hor.m-grid--root.m-page",
      );
      if (!root) {
        setTimeout(bootstrapAndHydrate, 500);
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

        const blocks = root.querySelectorAll("[id^='tablerow_']");
        if (blocks.length === 0) {
          setTimeout(bootstrapAndHydrate, 500);
          return;
        }

        blocks.forEach((block, idx) => {
          setTimeout(() => {
            const btn = block.querySelector(
              "button[id^='BtnhideshowInternal']",
            );
            const icon = btn?.querySelector(".fa-angle-right");
            if (icon) btn.click();
          }, idx * 300);
        });

        let checks = 0;
        const checkCycle = setInterval(() => {
          const semesterIds = Array.from(blocks).map((b) => b.id.split("_")[1]);
          const hydrationStatus = semesterIds.map((id) => {
            const label = root.querySelector(`#lbSGPA_${id}`);
            return label && label.textContent.trim() !== "";
          });

          const allHydrated = hydrationStatus.every(
            (status) => status === true,
          );

          if (allHydrated || checks > 25) {
            clearInterval(checkCycle);
            finishMapping(root, semesterIds);
          }
          checks++;
        }, 500);
      } catch (e) {
        console.error("Hydration Failure", e);
        setLoading(false);
      }
    };

    const finishMapping = (root, semesterIds) => {
      const cleanT = (el) => el?.textContent.trim() || "";
      const cleanN = (el) =>
        el?.textContent.replace(/[^\d.()-]/g, "").trim() || "0";

      const mappedSemesters = semesterIds.map((id) => {
        const block = root.querySelector(`#tablerow_${id}`);
        const header = root.querySelector(`#rowStdDetailHeader_${id}`);

        const feeItems = [];
        block.querySelectorAll(`#tblDueInSem_${id} li`).forEach((li) => {
          const parts = li.textContent.split(":");
          if (parts.length >= 2)
            feeItems.push({ name: parts[0].trim(), val: parts[1].trim() });
        });

        const courses = [];
        block
          .querySelectorAll(`#tblRegisteredCoursesDetail_${id} tbody tr`)
          .forEach((tr) => {
            const td = tr.querySelectorAll("td");
            if (td.length >= 4) {
              courses.push({
                title: cleanT(td[1]),
                type: cleanT(td[2]),
                status: cleanT(td[3]),
                date: cleanT(td[4]),
              });
            }
          });

        return {
          id,
          name: cleanT(header.querySelector("label")),
          totalPaid: cleanN(header.querySelectorAll("p")[4]),
          academic: {
            sgpa: cleanT(block.querySelector(`#lbSGPA_${id}`)) || "0.00",
            cgpa: cleanT(block.querySelector(`#lbCGPA_${id}`)) || "0.00",
          },
          summary: {
            due: cleanN(block.querySelector(`#lbDueInSem_${id}`)),
            balance: cleanN(block.querySelector(`#lbBalance_${id}`)),
          },
          feeItems,
          courses,
        };
      });

      const txHistory = [];
      root
        .querySelectorAll("#sample_CollectionDetail tbody tr")
        .forEach((tr, i) => {
          const td = tr.querySelectorAll("td");
          if (td.length >= 10) {
            txHistory.push({
              sNo: cleanT(td[0]),
              semester: cleanT(td[1]),
              challanNo: cleanT(td[2]),
              instrumentType: cleanT(td[3]),
              instrumentNo: cleanT(td[4]),
              amount: cleanN(td[5]),
              dueDate: cleanT(td[6]),
              paymentDate: cleanT(td[7]),
              enteredBy: cleanT(td[8]),
              status: cleanT(td[9]),
            });
          }
        });

      setSemesters(mappedSemesters);
      setTransactions(txHistory);

      let totalAmount = 0;
      txHistory.forEach(
        (t) => (totalAmount += parseFloat(t.amount.replace(/,/g, "")) || 0),
      );
      setTotalPaid(totalAmount.toLocaleString());

      root.style.display = "none";
      setLoading(false);
      window.dispatchEvent(
        new CustomEvent("superflex-update-loading", { detail: false }),
      );
    };

    bootstrapAndHydrate();
  }, []);

  if (loading)
    return (
      <PageLayout currentPage={window.location.pathname}>
        <LoadingOverlay show={loading} isFullScreen={false} />
      </PageLayout>
    );

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="w-full min-h-screen p-4 md:p-8 space-y-12 relative z-10 font-sans">
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none -mr-64 -mt-64 z-0"></div>

        <PageHeader title="Fee Vault" subtitle="Academic Portfolio & Accounts">
          <div className="flex items-center gap-6 bg-secondary/50 p-6 rounded-[2rem] border border-foreground/10 backdrop-blur-xl group hover:bg-secondary/70 transition-all">
            <div className="text-right">
              <p className="text-[10px] font-black text-foreground/50 Cap tracking-[0px] leading-none mb-2">
                Total Paid
              </p>
              <h4 className="text-3xl font-black text-foreground">
                Rs. {totalPaid}
              </h4>
            </div>
            <div className="p-4 rounded-2xl bg-accent/10 text-accent group-hover:scale-110 transition-transform duration-300">
              <CreditCard size={24} />
            </div>
          </div>
        </PageHeader>

        <NotificationBanner alerts={alerts} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={DollarSign}
            label="Lifetime Paid"
            value={`Rs. ${totalPaid}`}
            delay={100}
          />
          <StatsCard
            icon={TrendingUp}
            label="Current CGPA"
            value={semesters[0]?.academic.cgpa || "N/A"}
            delay={200}
          />
          <StatsCard
            icon={Layers}
            label="Semesters"
            value={semesters.length}
            subValue="Logged"
            delay={300}
          />
          <StatsCard
            icon={History}
            label="Last Entry"
            value={
              transactions[0]?.amount ? `Rs. ${transactions[0].amount}` : "N/A"
            }
            subValue={transactions[0]?.paymentDate}
            delay={400}
          />
        </div>

        <div className="grid grid-cols-1 gap-12">
          {}
          <div className="space-y-10">
            <div className="flex items-center gap-4 px-2">
              <div className="p-3 rounded-2xl bg-secondary border border-foreground/10 text-foreground/50">
                <FileText size={20} />
              </div>
              <h3 className="text-xl font-black text-foreground Cap tracking-tight">
                Financial Books
              </h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {semesters.map((sem) => (
                <SemesterAccordion key={sem.id} semester={sem} />
              ))}
            </div>
          </div>

          {}
          <div className="space-y-10">
            <div className="flex items-center gap-4 px-2">
              <div className="p-3 rounded-2xl bg-secondary border border-foreground/10 text-foreground/50">
                <History size={20} />
              </div>
              <h3 className="text-xl font-black text-foreground Cap tracking-tight">
                Transaction Journal
              </h3>
            </div>

            <div className="overflow-hidden rounded-[2.5rem] border border-foreground/10 bg-secondary/20 backdrop-blur-xl">
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-foreground/5 border-b border-foreground/10">
                      <th className="p-5 text-[9px] font-black Cap tracking-[0px] text-foreground/50 font-sans">
                        S#
                      </th>
                      <th className="p-5 text-[9px] font-black Cap tracking-[0px] text-foreground/50 font-sans">
                        Semester
                      </th>
                      <th className="p-5 text-[9px] font-black Cap tracking-[0px] text-foreground/50 font-sans">
                        Challan No
                      </th>
                      <th className="p-5 text-[9px] font-black Cap tracking-[0px] text-foreground/50 font-sans">
                        Instrument
                      </th>
                      <th className="p-5 text-[9px] font-black Cap tracking-[0px] text-foreground/50 font-sans">
                        Instrument No
                      </th>
                      <th className="p-5 text-[9px] font-black Cap tracking-[0px] text-accent font-sans">
                        Amount
                      </th>
                      <th className="p-5 text-[9px] font-black Cap tracking-[0px] text-foreground/50 font-sans">
                        Due Date
                      </th>
                      <th className="p-5 text-[9px] font-black Cap tracking-[0px] text-emerald-400 font-sans">
                        Payment Date
                      </th>
                      <th className="p-5 text-[9px] font-black Cap tracking-[0px] text-foreground/50 font-sans">
                        Source
                      </th>
                      <th className="p-5 text-[9px] font-black Cap tracking-[0px] text-foreground/50 font-sans">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/5">
                    {transactions.map((t, idx) => (
                      <tr
                        key={idx}
                        className="group hover:bg-foreground/[0.02] transition-colors"
                      >
                        <td className="p-5 text-[10px] text-foreground/40 font-black">
                          {t.sNo}
                        </td>
                        <td className="p-5 text-[10px] text-foreground font-black Cap tracking-tight">
                          {t.semester}
                        </td>
                        <td className="p-5 text-[10px] text-foreground/60 font-bold">
                          {t.challanNo}
                        </td>
                        <td className="p-5 text-[10px] text-foreground/50 font-medium Cap">
                          {t.instrumentType}
                        </td>
                        <td className="p-5 text-[10px] text-foreground/60 font-bold">
                          {t.instrumentNo}
                        </td>
                        <td className="p-5 text-[11px] text-foreground font-black">
                          Rs. {t.amount}
                        </td>
                        <td className="p-5 text-[10px] text-foreground/50 font-medium">
                          {t.dueDate}
                        </td>
                        <td className="p-5 text-[10px] text-emerald-400 font-bold">
                          {t.paymentDate}
                        </td>
                        <td className="p-5 text-[10px] text-foreground/50 font-black Cap tracking-[0px]">
                          {t.enteredBy}
                        </td>
                        <td className="p-5">
                          <span
                            className={`px-2 py-0.5 rounded-md border text-[8px] font-black Cap tracking-[0px] leading-none ${
                              t.status.toLowerCase().includes("paid")
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          height: 4px;
          width: 4px;
        }
        .scrollbar-hide::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-hide::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .scrollbar-hide::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </PageLayout>
  );
}

export default FeeDetailsPage;
