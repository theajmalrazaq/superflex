import React, { useEffect, useState, useMemo } from "react";
import PageLayout from "../components/layouts/PageLayout";
import { DollarSign, Calendar, CheckCircle2, AlertCircle, Printer, FileText, Clock, ExternalLink, Receipt } from "lucide-react";
import NotificationBanner from "../components/ui/NotificationBanner";
import PageHeader from "../components/ui/PageHeader";
import StatsCard from "../components/ui/StatsCard";
import LoadingOverlay, {
  LoadingSpinner,
} from "../components/ui/LoadingOverlay";

function FeeChallanPage() {
  const [loading, setLoading] = useState(true);
  const [challans, setChallans] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("superflex-update-loading", { detail: true }),
    );

    const parseData = () => {
      try {
        const root = document.querySelector(
          ".m-grid.m-grid--hor.m-grid--root.m-page",
        );
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

        const challanList = [];
        const challanTable = root.querySelector("table table");
        if (challanTable) {
          const rows = challanTable.querySelectorAll("tbody tr");
          rows.forEach((row) => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 6) {
              const amountMatch = cells[cells.length - 2]?.textContent
                .trim()
                .match(/\d+(,\d+)?(\.\d+)?/);
              const amount = amountMatch ? amountMatch[0] : "0";

              const printBtn = cells[cells.length - 1]?.querySelector("a");
              const onclick = printBtn?.getAttribute("onclick") || "";

              const challanNoMatch = onclick.match(/\d+/);
              const challanNo = challanNoMatch ? challanNoMatch[0] : null;

              challanList.push({
                srNo: cells[0].textContent.trim(),
                description: cells[1].textContent.trim(),
                issueDate: cells[2].textContent.trim(),
                dueDate: cells[3].textContent.trim(),
                status: cells[4].textContent.trim(),
                amount: amount,
                challanNo: challanNo,
              });
            }
          });
        }

        const infoPanel = root.querySelector(
          "td[style*='border-right:solid 1px']",
        );
        if (infoPanel) {
          setInstructions(infoPanel.innerHTML);
        }

        setChallans(challanList);
        root.style.display = "none";
        setLoading(false);
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
      } catch (e) {
        console.error("Fee Challan Parsing Error", e);
        setLoading(false);
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
      }
    };

    parseData();
  }, []);

  const stats = useMemo(() => {
    const unpaid = challans.filter((c) =>
      c.status.toLowerCase().includes("unpaid"),
    ).length;
    const paid = challans.filter((c) =>
      c.status.toLowerCase().includes("paid"),
    ).length;
    const latestAmount = challans.length > 0 ? challans[0].amount : "0";

    return { unpaid, paid, latestAmount, total: challans.length };
  }, [challans]);

  const handlePrint = (challanNo) => {
    if (challanNo) {
      window.open(
        `../Student/PrintStdChallanForm?ChallanNo=${challanNo}`,
        "_blank",
      );
    }
  };

  const handleOnlinePayment = (challanNo) => {
    if (challanNo) {
      window.open(
        `../Student/CardPaymentThroughKuickpay?ChallanNo=${challanNo}`,
        "_blank",
      );
    }
  };

  const PaymentInstructions = () => (
    <div className="space-y-10 text-sm font-sans">
      <div className="space-y-8">
        {[
          {
            step: "Step 1",
            text: "Sign in to your Internet Banking, Mobile Banking or visit an ATM machine",
          },
          {
            step: "Step 2",
            text: (
              <>
                Select Bill Payment / Payments and then select{" "}
                <span className="text-x font-bold">'kuickpay'</span> from given
                categories
              </>
            ),
          },
          {
            step: "Step 3",
            text: (
              <>
                Enter the voucher or invoice number & continue. Make sure to
                enter{" "}
                <span className="text-emerald-400 font-bold">
                  Institution ID as prefix
                </span>{" "}
                (mentioned on challan)
              </>
            ),
          },
          {
            step: "Step 4",
            text: "Confirm your voucher details and proceed to payment. Payment alerts will be received accordingly.",
          },
        ].map((item, idx) => (
          <div key={idx} className="flex gap-4">
            <div className="mt-1">
              <div className="w-5 h-5 rounded-full border border-x/50 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-x/20"></div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-white font-bold tracking-wide">{item.step}</p>
              <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6 pt-2">
        <div className="space-y-4">
          <p className="text-[10px] text-x font-black uppercase tracking-[0.2em]">
            * Supported Banks
          </p>
          <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
            Allied Bank, Askari Bank, Bank Al Habib, Bank Alfalah, Bank Islami,
            Bank of Punjab, Dubai Islamic Bank, Faysal Bank, First Women Bank,
            Habib Metro Bank, Habib Bank Limited, JS Bank, MCB Bank, MCB Islamic
            Bank, Meezan Bank, National Bank, NRSP Bank, SAMBA Bank, Soneri
            bank, Summit Bank, UBL and Keenu App.
          </p>
        </div>

        <div className="py-3.5 px-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></div>
          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest leading-none">
            EasyPaisa & JazzCash Supported via Kuickpay
          </p>
        </div>

        <div className="pt-2">
          <a
            href="https://app.kuickpay.com/PaymentsBillPayment"
            className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all text-xs font-bold"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={14} />
            Kuickpay Help & Clarification
          </a>
        </div>
      </div>

      <div className="pt-6 border-t border-white/5">
        <div className="flex gap-4">
          <div className="w-5 h-5 rounded-full border border-amber-500/50 flex items-center justify-center shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/20"></div>
          </div>
          <div className="space-y-1">
            <p className="text-white font-bold tracking-wide uppercase text-xs">
              Physical Cash Deposit
            </p>
            <p className="text-zinc-500 text-xs leading-relaxed font-medium">
              Print the challan form and then visit any nearest{" "}
              <strong className="text-white font-bold">
                Faysal Bank branch
              </strong>{" "}
              for cash deposit.
            </p>
          </div>
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
      <div className="w-full min-h-screen p-4 md:p-8 space-y-10 relative z-10">
        {}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-x/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none z-0"></div>
        <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none z-0"></div>

        <PageHeader
          title="Fee Challans"
          subtitle="Manage your semester invoices and payments"
        >
          <div className="flex items-center gap-4 bg-zinc-900/50 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-xl group hover:bg-zinc-900/70 transition-all">
            <div className="text-right">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Payment Status
              </p>
              <h4
                className={`text-lg font-bold font-sans ${stats.unpaid > 0 ? "text-amber-400" : "text-emerald-400"}`}
              >
                {stats.unpaid > 0 ? `${stats.unpaid} Outstanding` : "All Paid"}
              </h4>
            </div>
            <div className="w-px h-8 bg-white/10 mx-2"></div>
            <Receipt className="text-x" size={24} />
          </div>
        </PageHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={AlertCircle}
            label="Outstanding"
            value={stats.unpaid}
            subValue="Challans"
            delay={100}
          />
          <StatsCard
            icon={CheckCircle2}
            label="Paid"
            value={stats.paid}
            subValue="Total"
            delay={200}
          />
          <StatsCard
            icon={DollarSign}
            label="Latest Amount"
            value={`Rs. ${stats.latestAmount}`}
            delay={300}
          />
          <StatsCard
            icon={Calendar}
            label="Total Generated"
            value={stats.total}
            subValue="Invoices"
            delay={400}
          />
        </div>

        {}
        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-6">
            {}
            <NotificationBanner
              alerts={[
                ...alerts,
                {
                  type: "info",
                  message:
                    "Payments made through the online portal are verified automatically within 24-48 hours. Please keep your receipt until the status is updated.",
                },
              ].filter(
                (v, i, a) => a.findIndex((t) => t.message === v.message) === i,
              )}
            />

            <div className="bg-zinc-900/40 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 overflow-hidden">
              <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-8">
                <div className="p-3 bg-zinc-800 rounded-xl text-zinc-400">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight font-sans">
                    Invoice History
                  </h3>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest font-sans">
                    Download and proof of payment
                  </p>
                </div>
              </div>

              {}
              <div className="hidden md:block overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse border-spacing-0">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-sans">
                        Sr.
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-sans w-full">
                        Description
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider font-sans">
                        Status
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-right font-sans">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-right font-sans">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {challans.map((c, idx) => (
                      <tr
                        key={idx}
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-5">
                          <span className="text-zinc-500 font-bold font-sans text-xs">
                            {c.srNo}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-white font-bold group-hover:text-x transition-colors font-sans">
                              {c.description}
                            </span>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                              <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-tight font-sans whitespace-nowrap">
                                <div className="p-1 bg-zinc-800/50 rounded-md">
                                  <Clock size={10} className="text-x" />
                                </div>
                                Issued:{" "}
                                <span className="text-zinc-400">
                                  {c.issueDate}
                                </span>
                              </span>
                              <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-tight font-sans whitespace-nowrap">
                                <div className="p-1 bg-zinc-800/50 rounded-md">
                                  <Calendar
                                    size={10}
                                    className="text-emerald-400"
                                  />
                                </div>
                                Due:{" "}
                                <span className="text-zinc-400">
                                  {c.dueDate}
                                </span>
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center w-full">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-sans ${
                                c.status.toLowerCase().includes("paid")
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse"
                              }`}
                            >
                              {c.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right font-sans">
                          <span className="text-white font-black text-sm">
                            Rs. {c.amount}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {c.status.toLowerCase().includes("unpaid") && (
                              <button
                                onClick={() => handleOnlinePayment(c.challanNo)}
                                className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all group/pay"
                                title="Pay Online (KuickPay)"
                              >
                                <ExternalLink
                                  size={18}
                                  className="group-hover/pay:scale-110 transition-transform"
                                />
                              </button>
                            )}
                            <button
                              onClick={() => handlePrint(c.challanNo)}
                              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-x hover:border-x transition-all group/btn disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Download/Print Challan"
                              disabled={!c.challanNo}
                            >
                              <Printer
                                size={18}
                                className="group-hover/btn:scale-110 transition-transform"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {}
              <div className="md:hidden space-y-4">
                {challans.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-[2rem] bg-zinc-900/50 border border-white/5 space-y-6"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                          DESCRIPTION
                        </p>
                        <h4 className="text-lg font-black text-x leading-tight">
                          {c.description}
                        </h4>
                      </div>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-sans ${
                          c.status.toLowerCase().includes("paid")
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                          <Clock size={10} className="text-x" />
                          ISSUED
                        </div>
                        <p className="text-xs font-bold text-white ml-4">
                          {c.issueDate}
                        </p>
                      </div>
                      <div className="space-y-1.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                          <Calendar size={10} className="text-emerald-400" />
                          DUE
                        </div>
                        <p className="text-xs font-bold text-white mr-4">
                          {c.dueDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          Total Amount
                        </p>
                        <p className="text-xl font-black text-white">
                          Rs. {c.amount}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.status.toLowerCase().includes("unpaid") && (
                          <button
                            onClick={() => handleOnlinePayment(c.challanNo)}
                            className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 active:scale-95 transition-all"
                          >
                            <ExternalLink size={20} />
                          </button>
                        )}
                        <button
                          onClick={() => handlePrint(c.challanNo)}
                          className="p-3.5 rounded-2xl bg-x/10 border border-x/20 text-x active:scale-95 transition-all disabled:opacity-30"
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
                <div className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-50">
                    <Receipt size={48} className="text-zinc-500" />
                    <p className="text-zinc-400 font-medium font-sans">
                      No challans found in the records.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {}
          <div className="space-y-6">
            <div className="bg-x/5 border border-x/10 backdrop-blur-2xl rounded-[2.5rem] p-8">
              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                <div className="p-3 bg-x/10 rounded-xl text-x">
                  <Printer size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight font-sans">
                    Payment Portal
                  </h3>
                  <p className="text-[10px] text-x font-bold uppercase tracking-widest font-sans underline decoration-x/30 underline-offset-4">
                    Legal Roadmap
                  </p>
                </div>
              </div>

              <PaymentInstructions />
            </div>
          </div>
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

const ChevronRight = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default FeeChallanPage;
