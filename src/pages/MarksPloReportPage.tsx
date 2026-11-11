import React, { useEffect, useState, useRef } from "react";
import { parsePortalAlerts, parseSelectOptions } from "../parsers/dom";
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

  const hiddenContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const parseData = () => {
      try {
        let root = document.querySelector<HTMLElement>(".m-wrapper");

        if (!root || root.children.length === 0) {
          if (hiddenContentRef.current && hiddenContentRef.current.children.length > 0) {
            root = hiddenContentRef.current;
          } else {
            setLoading(false);
            return;
          }
        }

        setAlerts(parsePortalAlerts(root));

        const portalForm =
          root.querySelector<HTMLFormElement>("form") || root.querySelector<HTMLElement>(".row");
        if (portalForm) {
          const select = portalForm.querySelector<HTMLSelectElement>("select#SemId");
          if (select) {
            setSemesters(parseSelectOptions(select));
          }
        }

        const table = root.querySelector<HTMLElement>("table.sum_table");
        if (table) {
          const lastRow = table.querySelector<HTMLElement>("tr:last-child");
          if (lastRow) {
            const boldCells = lastRow.querySelectorAll<HTMLElement>("td.bold.text-center");
            const percentageCell = boldCells.length > 0 ? boldCells[boldCells.length - 1] : null;

            if (percentageCell) {
              const percentage = parseFloat(percentageCell.textContent.trim()) || 0;

              const allCenterCells = Array.from(
                lastRow.querySelectorAll<HTMLElement>("td.text-center"),
              );

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

          const clonedTable = table.cloneNode(true) as HTMLElement;

          clonedTable.className = "w-full min-w-[680px] border-collapse text-left";

          const thead = clonedTable.querySelector<HTMLElement>("thead");
          if (thead) {
            thead.className =
              "bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:bg-white/[.04] dark:text-slate-400";
            const ths = thead.querySelectorAll<HTMLElement>("th");
            ths.forEach((th) => {
              th.className =
                "border-b border-slate-100 px-4 py-3 text-left dark:border-white/10 sm:px-5";
              th.removeAttribute("style");
            });
          }

          const tbody = clonedTable.querySelector<HTMLElement>("tbody");
          if (tbody) {
            const trs = tbody.querySelectorAll<HTMLElement>("tr");
            trs.forEach((tr) => {
              tr.className =
                "border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50 dark:border-white/[.08] dark:hover:bg-white/[.025]";
              tr.removeAttribute("style");

              const tds = tr.querySelectorAll<HTMLElement>("td");
              tds.forEach((td) => {
                const isBold = td.classList.contains("bold");
                td.className = `px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300 sm:px-5 ${isBold ? "font-bold text-slate-900 dark:text-white" : ""}`;

                const txt = td.textContent.trim();
                if (/^\d+(\.\d+)?$/.test(txt)) {
                  const val = parseFloat(txt);
                  if (val < 30)
                    td.classList.add("!font-bold", "!text-rose-700", "dark:!text-rose-300");
                  else if (val < 60)
                    td.classList.add("!font-bold", "!text-amber-700", "dark:!text-amber-300");
                  else if (val >= 60)
                    td.classList.add("!font-bold", "!text-emerald-700", "dark:!text-emerald-300");
                }
              });
            });

            const lastTr = tbody.querySelector<HTMLElement>("tr:last-child");
            if (lastTr) {
              lastTr.classList.add("bg-slate-50", "font-bold", "dark:bg-white/[.04]");
              const tds = lastTr.querySelectorAll<HTMLElement>("td");
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
      } catch (e) {
        console.error("Marks PLO Parsing Error", e);
        setLoading(false);
      }
    };

    parseData();
  }, []);

  const handleSemesterChange = (val) => {
    if (hiddenContentRef.current) {
      const select = hiddenContentRef.current.querySelector<HTMLSelectElement>("select#SemId");
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
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[1600px] flex-col gap-3.5 pb-6 sm:gap-5 sm:pb-24 print:p-0">
        <header className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end sm:gap-4 print:hidden">
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-white/90 sm:text-[10px] sm:font-bold sm:tracking-[0.16em] sm:text-white/80">
              Academics
            </p>
            <h1 className="text-[30px] font-extrabold leading-[1.08] tracking-[-0.035em] text-white sm:text-3xl sm:font-bold sm:tracking-tight">
              Marks PLO Report
            </h1>
            <p className="text-xs text-white/85 sm:text-sm">
              Wait, we're grading outcomes too? Because apparently, marks alone weren't enough.
            </p>
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
          <div className="space-y-3.5 sm:space-y-5">
            <NotificationBanner alerts={alerts} />

            {summaryData && (
              <div className="sf-mobile-cards-scroll pb-1 scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-4 sm:pb-0 xl:grid-cols-3 print:gap-3">
                {[
                  {
                    icon: Target,
                    label: "Overall attainment",
                    value: `${summaryData.percentage}%`,
                    detail: "Based on CLO mapping",
                    valueClass: getStatus(summaryData.percentage).color,
                  },
                  {
                    icon: TrendingUp,
                    label: "Performance status",
                    value: getStatus(summaryData.percentage).label,
                    detail: "Current semester",
                    valueClass: getStatus(summaryData.percentage).color,
                  },
                ].map(({ icon: Icon, label, value, detail, valueClass }) => (
                  <div
                    key={label}
                    className="flex min-h-[106px] flex-col rounded-2xl border border-black/[0.06] bg-white p-3.5 text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:min-h-[150px] sm:rounded-[24px] sm:p-6 print:border-gray-200"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f] sm:h-12 sm:w-12 sm:rounded-2xl">
                        <Icon size={18} className="sm:h-[22px] sm:w-[22px]" />
                      </span>
                      <span className="text-xs font-semibold text-[#40404a] dark:text-[#c4cad6] sm:text-sm">
                        {label}
                      </span>
                    </div>
                    <p
                      className={`mt-auto pt-2.5 text-xl font-bold leading-none tracking-tight sm:pt-5 sm:text-3xl ${valueClass}`}
                    >
                      {value}
                    </p>
                    <p className="mt-1 text-[10px] text-[#777780] dark:text-[#9ca3b3] sm:mt-2 sm:text-[11px]">
                      {detail}
                    </p>
                  </div>
                ))}
                <div className="sf-mobile-card-wide rounded-2xl border border-black/[0.06] bg-white p-3.5 text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:rounded-[24px] sm:p-6 print:border-gray-200">
                  <div className="mb-3 flex items-center gap-2.5 sm:mb-4 sm:gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f] sm:h-12 sm:w-12 sm:rounded-2xl">
                      <FileBarChart size={18} className="sm:h-[22px] sm:w-[22px]" />
                    </span>
                    <h2 className="text-xs font-semibold sm:text-sm">Outcome Breakdown</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2">
                    {summaryData.ploBreakdown.map((plo) => (
                      <div
                        key={plo.id}
                        className="flex flex-col items-center rounded-xl bg-slate-50 px-2 py-2 dark:bg-white/[.06] sm:py-2.5"
                      >
                        <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 sm:text-[10px]">
                          PLO{plo.id}
                        </span>
                        <span className="mt-0.5 text-[11px] font-bold text-[#230052] dark:text-white sm:mt-1 sm:text-xs">
                          {plo.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {reportHtml ? (
              <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white text-[#101010] dark:border-white/[0.14] dark:bg-black dark:text-[#f5f6fb] sm:rounded-[24px] print:border-gray-200">
                <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10 sm:px-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f] sm:rounded-2xl">
                    <FileBarChart size={20} />
                  </span>
                  <div>
                    <h2 className="text-base font-bold">Full PLO Report</h2>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      The full investigation. Every learning outcome, every assessment, every
                      percentage.
                    </p>
                  </div>
                </div>
                <div className="sf-data-table-wrapper overflow-x-auto scrollbar-hide">
                  <div
                    className="portal-table-wrapper [&_table]:w-full [&_table]:border-collapse [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap"
                    dangerouslySetInnerHTML={{ __html: reportHtml }}
                  />
                </div>
              </section>
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[24px] border border-black/[0.06] bg-white px-6 py-12 text-center dark:border-white/[0.14] dark:bg-black">
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#230052] text-white dark:bg-white dark:text-[#0a192f]">
                  <Info size={25} />
                </span>
                <p className="text-xl font-bold text-[#101010] dark:text-[#f5f6fb]">
                  No PLO Report Available
                </p>
                <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">
                  Even the PLOs gave up. No report available for this semester.
                </p>
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
