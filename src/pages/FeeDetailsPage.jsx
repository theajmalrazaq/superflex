import React, { useEffect, useState } from "react";
import PageLayout from "../components/layouts/PageLayout";
import Skeleton from "../components/ui/Skeleton";
import {
  DollarSign,
  ChevronDown,
  History,
  CreditCard,
  Layers,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import NotificationBanner from "../components/ui/NotificationBanner";
import StatsCard from "../components/ui/StatsCard";

const FeeDetailsSkeleton = () => (
  <main className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col gap-7 px-4 py-6 font-sans sm:px-6 lg:px-8 lg:py-8" role="status" aria-label="Loading fee details">
    <header className="space-y-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-9 w-52" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </header>
    <section className="space-y-4">
      <div className="space-y-2"><Skeleton className="h-3 w-16" /><Skeleton className="h-6 w-40" /></div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-5">
        {[0, 1, 2, 3].map((item) => <div key={item} className="flex min-h-[156px] flex-col rounded-[32px] bg-white/80 p-5 dark:bg-black/80 sm:p-6"><Skeleton className="h-12 w-12 rounded-[36%]" /><Skeleton className="mt-auto h-7 w-32" /><Skeleton className="mt-2 h-3 w-24" /></div>)}
      </div>
    </section>
    <section className="space-y-4">
      <div className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-6 w-56" /></div>
      <div className="overflow-hidden rounded-[24px] bg-white p-5 dark:bg-black sm:p-6">
        <Skeleton className="h-10 w-full max-w-2xl rounded-full" />
        <div className="mt-5 space-y-3">
          <Skeleton className="h-8 w-48" />
          {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-12 w-full rounded-xl" />)}
        </div>
      </div>
    </section>
    <section className="space-y-4">
      <div className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-6 w-44" /></div>
      <div className="overflow-hidden rounded-[24px] bg-white dark:bg-black">
        <div className="flex gap-8 bg-slate-50 px-5 py-4 dark:bg-white/[0.04]">{[0, 1, 2, 3, 4, 5, 6].map((item) => <Skeleton key={item} className="h-3 min-w-16 flex-1" />)}</div>
        {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="flex items-center gap-8 border-t border-black/[0.05] px-5 py-4 dark:border-white/[0.08]">{[0, 1, 2, 3, 4, 5, 6].map((cell) => <Skeleton key={cell} className={`h-4 ${cell === 0 ? "w-28" : "min-w-12 flex-1"}`} />)}</div>)}
      </div>
    </section>
  </main>
);

const SemesterAccordion = ({ semester }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer flex-col justify-between gap-4 p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03] sm:flex-row sm:items-center sm:p-5"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]">
            <Layers size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold tracking-tight">{semester.name}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span>{semester.courses.length} registered courses</span>
              <span>SGPA {semester.academic.sgpa || "0.00"}</span>
              <span>CGPA {semester.academic.cgpa || "0.00"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pl-14 sm:justify-end sm:pl-0">
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Collected</p>
            <p className="text-lg font-bold tracking-tight">Rs. {semester.totalPaid}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-white/[0.08] dark:text-slate-300">
            <ChevronDown size={18} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="grid gap-5 border-t border-black/[0.06] p-4 dark:border-white/[0.1] sm:p-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="space-y-5">
            <section>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold"><DollarSign size={16} /> Fee Breakdown</h3>
              {semester.feeItems.length ? (
                <div className="divide-y divide-black/[0.05] rounded-[18px] border border-black/[0.06] px-4 dark:divide-white/[0.08] dark:border-white/[0.1]">
                  {semester.feeItems.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex items-center justify-between gap-4 py-3 text-xs">
                      <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                      <span className="whitespace-nowrap font-bold">Rs. {item.val}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-[18px] bg-slate-50 p-4 text-xs text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">No fee breakdown is available.</p>
              )}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-[18px] bg-slate-50 p-4 dark:bg-white/[0.05]">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Net dues</p>
                  <p className="mt-1 text-base font-bold">Rs. {semester.summary.due}</p>
                </div>
                <div className="rounded-[18px] bg-[#f2ecfc] p-4 dark:bg-white/[0.08]">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#230052] dark:text-slate-300">Balance</p>
                  <p className={`mt-1 text-base font-bold ${semester.summary.balance === "0" ? "text-emerald-700 dark:text-emerald-300" : "text-slate-900 dark:text-white"}`}>Rs. {semester.summary.balance}</p>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[18px] border border-black/[0.06] p-4 dark:border-white/[0.1]">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Semester GPA</p>
                <p className="mt-1 text-2xl font-bold text-[#230052] dark:text-white">{semester.academic.sgpa || "0.00"}</p>
              </div>
              <div className="rounded-[18px] border border-black/[0.06] p-4 dark:border-white/[0.1]">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Cumulative GPA</p>
                <p className="mt-1 text-2xl font-bold text-[#230052] dark:text-white">{semester.academic.cgpa || "0.00"}</p>
              </div>
            </div>
          </div>

          <section className="min-w-0">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold"><BookOpen size={16} /> Registered Courses</h3>
            {semester.courses.length ? (
              <div className="overflow-x-auto rounded-[18px] border border-black/[0.06] dark:border-white/[0.1]">
                <table className="sf-data-table w-full min-w-[460px] text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
                    <tr><th className="px-4 py-3">Course</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.08]">
                    {semester.courses.map((course, index) => (
                      <tr key={`${course.title}-${index}`}>
                        <td className="px-4 py-3 text-xs font-semibold">{course.title}</td>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{course.type}</td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{course.date || "—"}</td>
                        <td className="px-4 py-3 text-right"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${course.status.toLowerCase().includes("registered") ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-300/10 dark:text-emerald-200" : "bg-rose-50 text-rose-800 dark:bg-rose-300/10 dark:text-rose-200"}`}>{course.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-[18px] bg-slate-50 p-4 text-xs text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">No course registrations are listed for this semester.</p>
            )}
          </section>
        </div>
      )}
    </section>
  );
};

function FeeDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [totalPaid, setTotalPaid] = useState("0");

  useEffect(() => {

    const bootstrapAndHydrate = () => {
      const root = document.querySelector(".m-grid.m-grid--hor.m-grid--root.m-page");
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

        const blocks = root.querySelectorAll("[id^='tablerow_']");
        if (blocks.length === 0) {
          setTimeout(bootstrapAndHydrate, 500);
          return;
        }

        blocks.forEach((block, idx) => {
          setTimeout(() => {
            const btn = block.querySelector("button[id^='BtnhideshowInternal']");
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

          const allHydrated = hydrationStatus.every((status) => status === true);

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
      const cleanN = (el) => el?.textContent.replace(/[^\d.()-]/g, "").trim() || "0";

      const mappedSemesters = semesterIds.map((id) => {
        const block = root.querySelector(`#tablerow_${id}`);
        const header = root.querySelector(`#rowStdDetailHeader_${id}`);

        const feeItems = [];
        block.querySelectorAll(`#tblDueInSem_${id} li`).forEach((li) => {
          const parts = li.textContent.split(":");
          if (parts.length >= 2) feeItems.push({ name: parts[0].trim(), val: parts[1].trim() });
        });

        const courses = [];
        block.querySelectorAll(`#tblRegisteredCoursesDetail_${id} tbody tr`).forEach((tr) => {
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
      root.querySelectorAll("#sample_CollectionDetail tbody tr").forEach((tr, i) => {
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
      txHistory.forEach((t) => (totalAmount += parseFloat(t.amount.replace(/,/g, "")) || 0));
      setTotalPaid(totalAmount.toLocaleString());

      root.style.display = "none";
      setLoading(false);
    };

    bootstrapAndHydrate();
  }, []);

  if (loading)
    return (
      <PageLayout currentPage={window.location.pathname}>
        <FeeDetailsSkeleton />
      </PageLayout>
    );

  return (
    <PageLayout currentPage={window.location.pathname}>
      <main className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col gap-7 px-4 py-6 font-sans sm:px-6 lg:px-8 lg:py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">Finance</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">Fee Details</h1>
            <p className="mt-1 text-sm text-white/80">The financial damage report. Dekh le bhai, degree pe kitna investment ho chuka hai.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 text-[#101010] backdrop-blur-sm dark:text-white">
            <CreditCard size={19} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">Total paid</p>
              <p className="text-base font-bold">Rs. {totalPaid}</p>
            </div>
          </div>
        </header>

        <NotificationBanner alerts={alerts} />

        <section aria-labelledby="fee-overview-heading" className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">Overview</p>
              <h2 id="fee-overview-heading" className="text-xl font-bold tracking-tight text-white">Financial Summary</h2>
            </div>
            <p className="text-xs text-white/75">Where did all the money go? Payments, remaining dues, and everything in between.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            <StatsCard
              variant="dashboard"
              icon={DollarSign}
              label="Lifetime paid"
              value={`Rs. ${totalPaid}`}
              subValue="Total tuition & dues paid"
            />
            <StatsCard
              variant="dashboard"
              icon={TrendingUp}
              label="Current CGPA"
              value={semesters[0]?.academic.cgpa || "N/A"}
              subValue={semesters[0]?.name ? `${semesters[0].name} standing` : "Cumulative standing"}
            />
            <StatsCard variant="dashboard" icon={Layers} label="Semesters" value={semesters.length} subValue="Fee records available" />
            <StatsCard variant="dashboard" icon={History} label="Last payment" value={transactions[0]?.amount ? `Rs. ${transactions[0].amount}` : "N/A"} subValue={transactions[0]?.paymentDate || "No payment recorded"} />
          </div>
        </section>

        <section aria-labelledby="fee-semesters-heading" className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">Financial record</p>
              <h2 id="fee-semesters-heading" className="text-xl font-bold tracking-tight text-white">Semester Fees</h2>
            </div>
            <p className="text-xs text-white/75">The cost of each semester. Turns out, even suffering has a price tag.</p>
          </div>
          {semesters.length ? (
            <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
              {semesters.map((semester) => <SemesterAccordion key={semester.id} semester={semester} />)}
            </div>
          ) : (
            <div className="rounded-[24px] bg-white p-6 text-sm text-[#101010] dark:bg-black dark:text-white">No semester fee details are available.</div>
          )}
        </section>

        <section aria-labelledby="fee-history-heading" className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">Transactions</p>
              <h2 id="fee-history-heading" className="text-xl font-bold tracking-tight text-white">Transaction History</h2>
            </div>
            <p className="text-xs text-white/75">Wallet's villain origin story. A complete history of your financial sacrifices.</p>
          </div>
          <div className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-white">
            {transactions.length ? (
              <>
                <div className="hidden overflow-x-auto py-4 md:block">
                  <table className="sf-data-table w-full min-w-[900px] border-collapse text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-white/[0.04]">
                      <tr className="border-b border-black/[0.06] dark:border-white/[0.1]">{["Semester / Challan", "Instrument", "Amount", "Due date", "Payment date", "Source", "Status"].map((heading) => <th key={heading} className="whitespace-nowrap px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{heading}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.08]">
                      {transactions.map((transaction, index) => {
                        const isPaid = /\bpaid\b/i.test(transaction.status) && !/\bunpaid\b/i.test(transaction.status);
                        return <tr key={`${transaction.sNo}-${transaction.challanNo}-${index}`} className="group transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.025]">
                          <td className="px-5 py-4"><p className="font-bold text-slate-900 dark:text-white">{transaction.semester}</p><p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">{transaction.challanNo || "No challan number"}</p></td>
                          <td className="px-5 py-4"><p className="font-medium">{transaction.instrumentType || "—"}</p><p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{transaction.instrumentNo || ""}</p></td>
                          <td className="whitespace-nowrap px-5 py-4 font-bold">Rs. {transaction.amount}</td>
                          <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-300">{transaction.dueDate || "—"}</td>
                          <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-300">{transaction.paymentDate || "—"}</td>
                          <td className="px-5 py-4 font-medium text-slate-600 dark:text-slate-300">{transaction.enteredBy || "—"}</td>
                          <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${isPaid ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-300/10 dark:text-emerald-200" : "bg-rose-50 text-rose-800 dark:bg-rose-300/10 dark:text-rose-200"}`}>{transaction.status || "Unknown"}</span></td>
                        </tr>;
                      })}
                    </tbody>
                  </table>
                </div>
                <ul className="divide-y divide-black/[0.06] md:hidden dark:divide-white/[0.1]">
                  {transactions.map((transaction, index) => {
                    const isPaid = /\bpaid\b/i.test(transaction.status) && !/\bunpaid\b/i.test(transaction.status);
                    return <li key={`${transaction.sNo}-${transaction.challanNo}-${index}`} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-bold">{transaction.semester}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Challan {transaction.challanNo || "—"}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${isPaid ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-300/10 dark:text-emerald-200" : "bg-rose-50 text-rose-800 dark:bg-rose-300/10 dark:text-rose-200"}`}>{transaction.status || "Unknown"}</span></div>
                      <div className="flex items-end justify-between gap-3"><div className="text-xs text-slate-500 dark:text-slate-400"><p>{transaction.instrumentType || "Payment"}{transaction.instrumentNo ? ` · ${transaction.instrumentNo}` : ""}</p><p className="mt-1">{transaction.paymentDate || transaction.dueDate || "Date unavailable"}</p></div><p className="whitespace-nowrap text-sm font-bold">Rs. {transaction.amount}</p></div>
                    </li>;
                  })}
                </ul>
              </>
            ) : <div className="p-6 text-sm text-slate-500 dark:text-slate-400">No payment transactions are available.</div>}
          </div>
        </section>
      </main>
    </PageLayout>
  );
}

export default FeeDetailsPage;
