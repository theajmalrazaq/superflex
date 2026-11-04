import React, { useEffect, useState, useMemo } from "react";
import PageLayout from "../components/layouts/PageLayout";
import {
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Printer,
  FileText,
  Clock,
  ExternalLink,
  Receipt,
  ChevronDown,
  Landmark,
} from "lucide-react";
import NotificationBanner from "../components/ui/NotificationBanner";
import StatsCard from "../components/ui/StatsCard";
import { LoadingSpinner } from "../components/ui/LoadingOverlay";

const isPaidStatus = (status) => {
  const normalized = String(status || "").trim();
  return /\bpaid\b/i.test(normalized) && !/\bunpaid\b/i.test(normalized);
};

function FeeChallanPage() {
  const [loading, setLoading] = useState(true);
  const [challans, setChallans] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: true }));

    const parseData = () => {
      try {
        const root = document.querySelector(".m-grid.m-grid--hor.m-grid--root.m-page");
        if (!root) {
          setTimeout(parseData, 500);
          return;
        }

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

        const challanList = [];
        const challanTable = root.querySelector("table table");
        if (challanTable) {
          const rows = challanTable.querySelectorAll("tbody tr");
          rows.forEach((row) => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 5) {
              const description = cells[1].textContent.trim();
              const status = cells[4]?.textContent.trim() || "";

              let amount = "0";
              const amountInCells = cells.length >= 6 ? cells[5]?.textContent.trim() : "";
              const amountMatchCell = amountInCells.match(/\d+([,]\d+)*([.]\d+)?/);

              if (amountMatchCell && amountMatchCell[0] !== "0") {
                amount = amountMatchCell[0];
              } else {
                const amountMatchDesc = description.match(/\d+([,]\d+)*([.]\d+)?/);
                if (amountMatchDesc) {
                  amount = amountMatchDesc[0];
                }
              }

              const printBtn = cells[cells.length - 1]?.querySelector("a");
              const onclick = printBtn?.getAttribute("onclick") || "";
              const challanNoMatch = onclick.match(/\d+/);
              const challanNo = challanNoMatch ? challanNoMatch[0] : null;

              challanList.push({
                srNo: cells[0].textContent.trim(),
                description: description,
                issueDate: cells[2]?.textContent.trim() || "-",
                dueDate: cells[3]?.textContent.trim() || "-",
                status: status,
                amount: amount,
                challanNo: challanNo,
              });
            }
          });
        }

        const infoPanel = root.querySelector("td[style*='border-right:solid 1px']");
        if (infoPanel) {
          setInstructions(infoPanel.innerHTML);
        }

        setChallans(challanList);
        root.style.display = "none";
        setLoading(false);
        window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: false }));
      } catch (e) {
        console.error("Fee Challan Parsing Error", e);
        setLoading(false);
        window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: false }));
      }
    };

    parseData();
  }, []);

  const stats = useMemo(() => {
    const unpaid = challans.filter((challan) => challan.status.trim() && !isPaidStatus(challan.status)).length;
    const paid = challans.filter((challan) => isPaidStatus(challan.status)).length;

    const latestUnpaid = challans.find((challan) => challan.status.trim() && !isPaidStatus(challan.status));
    const latestAmount = latestUnpaid
      ? latestUnpaid.amount
      : challans.length > 0
        ? challans[0].amount
        : "0";

    return { unpaid, paid, latestAmount, total: challans.length };
  }, [challans]);

  const handlePrint = (challanNo) => {
    if (challanNo) {
      window.open(`../Student/PrintStdChallanForm?ChallanNo=${challanNo}`, "_blank");
    }
  };

  const handleOnlinePayment = (challanNo) => {
    if (challanNo) {
      window.open(`../Student/CardPaymentThroughKuickpay?ChallanNo=${challanNo}`, "_blank");
    }
  };

  const PaymentInstructions = () => (
    <div className="space-y-4 font-sans">
      <div className="flex items-center justify-between rounded-2xl bg-[#f2ecfc] px-4 py-3 dark:bg-white/[0.08]">
        <div>
          <p className="text-sm font-bold text-[#230052] dark:text-white">Pay online with Kuickpay</p>
          <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">Use your bank app or internet banking.</p>
        </div>
        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#230052] dark:bg-white/10 dark:text-white">Online</span>
      </div>

      <ol className="divide-y divide-black/[0.06] dark:divide-white/[0.1]">
        {[
          { title: "Open your banking app", text: "Sign in to mobile or internet banking, or use an ATM." },
          { title: "Choose bill payment", text: <>Select <strong className="text-[#230052] dark:text-white">Kuickpay</strong> from the bill payment categories.</> },
          { title: "Enter the voucher number", text: <>Use the invoice number shown on your challan, including the <strong className="text-emerald-700 dark:text-emerald-300">Institution ID prefix</strong>.</> },
          { title: "Review and pay", text: "Confirm the voucher details, then complete the payment." },
        ].map((step, index) => (
          <li key={step.title} className="flex gap-3 py-3 first:pt-1 last:pb-1">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[36%] bg-[#230052] text-[11px] font-bold text-white dark:bg-white dark:text-[#0a192f]">{index + 1}</span>
            <div className="min-w-0 pt-0.5">
              <p className="text-xs font-bold text-slate-900 dark:text-white">{step.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 dark:bg-emerald-300/10">
        <CheckCircle2 size={18} className="shrink-0 text-emerald-700 dark:text-emerald-300" />
        <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">EasyPaisa and JazzCash are supported through Kuickpay.</p>
      </div>

      <details className="group rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/[0.05]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold text-slate-800 dark:text-slate-200">
          Supported banks and apps
          <ChevronDown size={15} className="shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          Allied Bank, Askari Bank, Bank Al Habib, Bank Alfalah, Bank Islami, Bank of Punjab, Dubai Islamic Bank, Faysal Bank, First Women Bank, Habib Metro Bank, Habib Bank Limited, JS Bank, MCB Bank, MCB Islamic Bank, Meezan Bank, National Bank, NRSP Bank, SAMBA Bank, Soneri Bank, Summit Bank, UBL, and Keenu App.
        </p>
      </details>

      <a
        href="https://app.kuickpay.com/PaymentsBillPayment"
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#230052] px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-[#35106a] dark:bg-white dark:text-[#0a192f] dark:hover:bg-white/90"
        target="_blank"
        rel="noopener noreferrer"
      >
        <ExternalLink size={14} /> Kuickpay help
      </a>

      <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-200/10 dark:bg-amber-300/[0.08]">
        <Landmark size={17} className="mt-0.5 shrink-0 text-amber-800 dark:text-amber-200" />
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Pay by cash at a branch</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">Print the challan and deposit it at any Faysal Bank branch.</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <PageLayout currentPage={window.location.pathname}>
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1600px] flex-col gap-5 pb-24">
        <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">Finance</p>
            <h1 className="text-3xl font-bold tracking-tight text-white">Fee Challans</h1>
            <p className="text-sm text-white/80">Review your invoices, payment status, and due dates.</p>
          </div>
          <div className="flex w-fit items-center gap-3 rounded-full bg-white/15 px-4 py-2.5 text-[#101010] dark:bg-white/10 dark:text-white">
            <Receipt size={19} />
            <span className="text-sm font-semibold">
              {stats.unpaid > 0 ? `${stats.unpaid} outstanding` : "All paid"}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatsCard
            icon={AlertCircle}
            label="Outstanding"
            value={stats.unpaid}
            subValue="unpaid challans"
            variant="dashboard"
          />
          <StatsCard
            icon={CheckCircle2}
            label="Paid"
            value={stats.paid}
            subValue="paid challans"
            variant="dashboard"
          />
          <StatsCard
            icon={DollarSign}
            label="Latest Amount"
            value={`Rs. ${stats.latestAmount}`}
            subValue="latest unpaid"
            variant="dashboard"
          />
          <StatsCard
            icon={Calendar}
            label="Total Generated"
            value={stats.total}
            subValue="all invoices"
            variant="dashboard"
          />
        </div>

        <NotificationBanner
          alerts={[
            ...alerts,
            {
              type: "info",
              message: "Payments made through the online portal are verified automatically within 24-48 hours. Please keep your receipt until the status is updated.",
            },
          ].filter((value, index, all) => all.findIndex((item) => item.message === value.message) === index)}
        />

        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
          <section className="min-w-0 overflow-hidden rounded-[24px] border border-black/[0.06] bg-white text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb]">
            <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-4 dark:border-white/[0.1] sm:px-6">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Invoice history</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">View status, payment, and print options.</p>
              </div>
            </div>

            <div>
              <div className="hidden md:block overflow-x-auto scrollbar-hide">
                <table className="sf-data-table w-full text-left border-collapse border-spacing-0">
                  <thead className="bg-slate-50 dark:bg-white/[0.04]">
                    <tr className="border-b border-black/[0.06] dark:border-white/[0.1]">
                      <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:px-6">
                        Sr.
                      </th>
                      <th className="w-full px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Description
                      </th>
                      <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Status
                      </th>
                      <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Amount
                      </th>
                      <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:px-6">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.08]">
                    {challans.map((c, idx) => (
                      <tr key={idx} className="group transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.025]">
                        <td className="px-5 py-4 sm:px-6">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            {c.srNo}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 transition-colors group-hover:text-[#230052] dark:text-white dark:group-hover:text-white">
                              {c.description}
                            </span>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                              <span className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                <Clock size={12} /> Issued: <span className="text-slate-700 dark:text-slate-300">{c.issueDate}</span>
                              </span>
                              <span className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                <Calendar size={12} /> Due: <span className="text-slate-700 dark:text-slate-300">{c.dueDate}</span>
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-center w-full">
                            <span
                              className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold ${
                                isPaidStatus(c.status)
                                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-300/10 dark:text-emerald-200"
                                  : "bg-rose-50 text-rose-800 dark:bg-rose-300/10 dark:text-rose-200"
                              }`}
                            >
                              {c.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="whitespace-nowrap text-sm font-bold">Rs. {c.amount}</span>
                        </td>
                        <td className="px-5 py-4 text-right sm:px-6">
                          <div className="flex items-center justify-end gap-2">
                            {c.status.toLowerCase().includes("unpaid") && (
                              <button
                                onClick={() => handleOnlinePayment(c.challanNo)}
                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-emerald-700 text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-300/15 dark:text-emerald-200 dark:hover:bg-emerald-300/25"
                                title="Pay Online (KuickPay)"
                              >
                                <ExternalLink size={17} />
                              </button>
                            )}
                            <button
                              onClick={() => handlePrint(c.challanNo)}
                              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-white/[0.08] dark:text-slate-200 dark:hover:bg-white/[0.14]"
                              title="Download/Print Challan"
                              disabled={!c.challanNo}
                            >
                              <Printer size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-4 md:hidden">
                {challans.map((c, idx) => (
                  <div
                    key={idx}
                    className="space-y-4 rounded-[20px] border border-black/[0.06] bg-white p-4 dark:border-white/[0.1] dark:bg-black"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Description</p>
                        <h4 className="text-base font-bold leading-tight text-slate-900 dark:text-white">
                          {c.description}
                        </h4>
                      </div>
                      <span
                          className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold ${
                          isPaidStatus(c.status)
                              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-300/10 dark:text-emerald-200"
                              : "bg-rose-50 text-rose-800 dark:bg-rose-300/10 dark:text-rose-200"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-black/[0.06] pt-4 dark:border-white/[0.1]">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          <Clock size={12} /> Issued
                        </div>
                        <p className="ml-5 text-xs font-semibold text-slate-800 dark:text-slate-200">{c.issueDate}</p>
                      </div>
                      <div className="space-y-1.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          <Calendar size={12} /> Due
                        </div>
                        <p className="mr-5 text-xs font-semibold text-slate-800 dark:text-slate-200">{c.dueDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-black/[0.06] pt-4 dark:border-white/[0.1]">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total amount</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">Rs. {c.amount}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.status.toLowerCase().includes("unpaid") && (
                          <button
                            onClick={() => handleOnlinePayment(c.challanNo)}
                            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-emerald-700 text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-300/15 dark:text-emerald-200"
                          >
                            <ExternalLink size={20} />
                          </button>
                        )}
                        <button
                          onClick={() => handlePrint(c.challanNo)}
                          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-white/[0.08] dark:text-slate-200 dark:hover:bg-white/[0.14]"
                          disabled={!c.challanNo}
                        >
                          <Printer size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {challans.length === 0 && (
                <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[36%] bg-[#f2ecfc] text-[#230052] dark:bg-white/[0.1] dark:text-white">
                    <Receipt size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">No challans found</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Generated fee invoices will appear here.</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-5 text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:p-6">
            <div className="mb-5 flex items-center gap-3 border-b border-black/[0.06] pb-4 dark:border-white/[0.1]">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]">
                <Printer size={19} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Payment instructions</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Online and branch payment options.</p>
              </div>
            </div>
            <PaymentInstructions />
          </section>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .scrollbar-hide::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-hide::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .scrollbar-hide::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </PageLayout>
  );
}

export default FeeChallanPage;
