import React, { useEffect, useState, useRef } from "react";
import PageLayout from "../components/layouts/PageLayout";
import { TrendingUp, Target, FileBarChart, Info } from "lucide-react";
import NotificationBanner from "../components/ui/NotificationBanner";
import SuperTabs from "../components/ui/SuperTabs";
import { PageSkeleton } from "../components/ui/Skeleton";

function MarksPloReportPage() {
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState([]);
  const [reportHtml, setReportHtml] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const hiddenContentRef = useRef(null);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: true }));

    const parseData = () => {
      try {
        let root = document.querySelector(".m-wrapper");

        if (!root || root.children.length === 0) {
          if (hiddenContentRef.current && hiddenContentRef.current.children.length > 0) {
            root = hiddenContentRef.current;
          } else {
            setLoading(false);
            window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: false }));
            return;
          }
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

        const legacyForm = root.querySelector("form") || root.querySelector(".row");
        if (legacyForm) {
          const select = legacyForm.querySelector("select#SemId");
          if (select) {
            const opts = Array.from(select.options).map((o) => ({
              label: o.text.trim(),
              value: o.value,
              selected: o.selected,
            }));
            setSemesters(opts);
          }
        }

        const table = root.querySelector("table.sum_table");
        if (table) {
          const lastRow = table.querySelector("tr:last-child");
          if (lastRow) {
            const boldCells = lastRow.querySelectorAll("td.bold.text-center");
            const percentageCell = boldCells.length > 0 ? boldCells[boldCells.length - 1] : null;

            if (percentageCell) {
              const percentage = parseFloat(percentageCell.textContent.trim()) || 0;

              const allCenterCells = Array.from(lastRow.querySelectorAll("td.text-center"));

              const ploValues = [];

              const validPloCells = allCenterCells.slice(2, -1);
              validPloCells.forEach((cell, idx) => {
                const txt = cell.textContent.trim();
                if (txt !== "-" && txt !== "") {
                  ploValues.push({
                    id: idx + 1,
                    value: parseFloat(txt) || 0,
                  });
                }
              });

              setSummaryData({
                percentage,
                ploBreakdown: ploValues,
              });
            }
          }

          const clonedTable = table.cloneNode(true);

          clonedTable.className = "w-full min-w-[680px] border-collapse text-left";

          const thead = clonedTable.querySelector("thead");
          if (thead) {
            thead.className = "bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:bg-white/[.04] dark:text-slate-400";
            const ths = thead.querySelectorAll("th");
            ths.forEach((th) => {
              th.className = "border-b border-slate-100 px-4 py-3 text-left dark:border-white/10 sm:px-5";
              th.removeAttribute("style");
            });
          }

          const tbody = clonedTable.querySelector("tbody");
          if (tbody) {
            const trs = tbody.querySelectorAll("tr");
            trs.forEach((tr) => {
              tr.className = "border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50 dark:border-white/[.08] dark:hover:bg-white/[.025]";
              tr.removeAttribute("style");

              const tds = tr.querySelectorAll("td");
              tds.forEach((td) => {
                const isBold = td.classList.contains("bold");
                td.className = `px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300 sm:px-5 ${isBold ? "font-bold text-slate-900 dark:text-white" : ""}`;

                const txt = td.textContent.trim();
                if (/^\d+(\.\d+)?$/.test(txt)) {
                  const val = parseFloat(txt);
                  if (val < 30) td.classList.add("!font-bold", "!text-rose-700", "dark:!text-rose-300");
                  else if (val < 60) td.classList.add("!font-bold", "!text-amber-700", "dark:!text-amber-300");
                  else if (val >= 60) td.classList.add("!font-bold", "!text-emerald-700", "dark:!text-emerald-300");
                }
              });
            });

            const lastTr = tbody.querySelector("tr:last-child");
            if (lastTr) {
              lastTr.classList.add("bg-slate-50", "font-bold", "dark:bg-white/[.04]");
              const tds = lastTr.querySelectorAll("td");
              tds.forEach((td) => td.classList.add("!text-slate-900", "dark:!text-white"));
            }
          }

          setReportHtml(clonedTable.outerHTML);
        } else {
        }

        if (hiddenContentRef.current && root !== hiddenContentRef.current) {
          hiddenContentRef.current.innerHTML = "";
          while (root.firstChild) {
            hiddenContentRef.current.appendChild(root.firstChild);
          }
        }

        setLoading(false);
        window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: false }));
      } catch (e) {
        console.error("Marks PLO Parsing Error", e);
        setLoading(false);
        window.dispatchEvent(new CustomEvent("superflex-update-loading", { detail: false }));
      }
    };

    parseData();
  }, []);

  const handleSemesterChange = (val) => {
    if (hiddenContentRef.current) {
      const select = hiddenContentRef.current.querySelector("select#SemId");
      if (select) {
        select.value = val;
        select.dispatchEvent(new Event("change"));

        const form = select.closest("form");
        if (form) form.submit();
      }
    }
  };

  const getStatus = (pct) => {
    if (pct < 30) return { label: "Poor", color: "text-rose-700 dark:text-rose-300" };
    if (pct < 60)
      return {
        label: "Average",
        color: "text-amber-700 dark:text-amber-300",
      };
    return {
      label: "Excellent",
      color: "text-emerald-700 dark:text-emerald-300",
    };
  };

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1600px] flex-col gap-5 pb-24 print:p-0">
        <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end print:hidden">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">Academics</p>
            <h1 className="text-3xl font-bold tracking-tight text-white">Marks PLO Report</h1>
            <p className="text-sm text-white/80">Program learning outcomes and course attainment.</p>
          </div>
          {semesters.length > 0 && (
            <SuperTabs
              tabs={semesters}
              activeTab={semesters.find((s) => s.selected)?.value}
              onTabChange={handleSemesterChange}
              size="sm"
              className="!border-0 !bg-white/55 !backdrop-blur-xl dark:!bg-black/25"
            />
          )}
        </header>

        {loading ? (
          <PageSkeleton label="Loading marks PLO report" cards={3} rows={6} showHeader={false} />
        ) : (
          <div className="space-y-5">
            <NotificationBanner alerts={alerts} />

            {summaryData && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 print:gap-3">
                {[
                  { icon: Target, label: "Overall attainment", value: `${summaryData.percentage}%`, detail: "Based on CLO mapping", valueClass: getStatus(summaryData.percentage).color },
                  { icon: TrendingUp, label: "Performance status", value: getStatus(summaryData.percentage).label, detail: "Current semester", valueClass: getStatus(summaryData.percentage).color },
                ].map(({ icon: Icon, label, value, detail, valueClass }) => (
                  <div key={label} className="flex min-h-[150px] flex-col rounded-[24px] border border-black/[0.06] bg-white p-5 text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:p-6 print:border-gray-200">
                    <div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]"><Icon size={22} /></span><span className="text-sm font-semibold text-[#40404a] dark:text-[#c4cad6]">{label}</span></div>
                    <p className={`mt-auto pt-5 text-3xl font-bold leading-none tracking-tight ${valueClass}`}>{value}</p>
                    <p className="mt-2 text-[11px] text-[#777780] dark:text-[#9ca3b3]">{detail}</p>
                  </div>
                ))}
                <div className="rounded-[24px] border border-black/[0.06] bg-white p-5 text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:p-6 print:border-gray-200">
                  <div className="mb-4 flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]"><FileBarChart size={22} /></span><h2 className="text-sm font-semibold">PLO breakdown</h2></div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {summaryData.ploBreakdown.map((plo) => <div key={plo.id} className="flex flex-col items-center rounded-xl bg-slate-50 px-2 py-2.5 dark:bg-white/[.06]"><span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">PLO{plo.id}</span><span className="mt-1 text-xs font-bold text-[#230052] dark:text-white">{plo.value}%</span></div>)}
                  </div>
                </div>
              </div>
            )}

            {reportHtml ? (
              <section className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-white text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] print:border-gray-200">
                <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10 sm:px-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]"><FileBarChart size={20} /></span>
                  <div><h2 className="text-base font-bold">Detailed results</h2><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Course learning outcome attainment by assessment.</p></div>
                </div>
                <div className="sf-data-table-wrapper overflow-x-auto scrollbar-hide">
                  <div className="legacy-table-wrapper [&_table]:w-full [&_table]:border-collapse [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap" dangerouslySetInnerHTML={{ __html: reportHtml }} />
                </div>
              </section>
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[24px] border border-black/[0.06] bg-white px-6 py-12 text-center dark:border-white/[0.14] dark:bg-black">
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-[36%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]"><Info size={25} /></span>
                <p className="text-xl font-bold text-[#101010] dark:text-[#f5f6fb]">No PLO report available</p>
                <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">There is no PLO attainment data for the selected semester. Try another semester if one is available.</p>
              </div>
            )}
          </div>
        )}

        <div ref={hiddenContentRef} className="hidden" />
      </div>
    </PageLayout>
  );
}

export default MarksPloReportPage;
