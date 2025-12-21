import React, { useEffect, useState, useRef } from "react";
import PageLayout from "../layouts/PageLayout";
import { LoadingSpinner } from "../LoadingOverlay";
import {
  BarChart3,
  TrendingUp,
  Target,
  FileBarChart,
  Layout,
  Info,
  AlertTriangle,
} from "lucide-react";
import NotificationBanner from "../NotificationBanner";
import PageHeader from "../PageHeader";
import StatsCard from "../StatsCard";
import SuperTabs from "../SuperTabs";

function MarksPloReportPage() {
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState([]);
  const [reportHtml, setReportHtml] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const hiddenContentRef = useRef(null);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("superflex-update-loading", { detail: true }),
    );

    const parseData = () => {
      try {
        let root = document.querySelector(".m-wrapper");

        if (!root || root.children.length === 0) {
          if (
            hiddenContentRef.current &&
            hiddenContentRef.current.children.length > 0
          ) {
            root = hiddenContentRef.current;
          } else {
            setLoading(false);
            window.dispatchEvent(
              new CustomEvent("superflex-update-loading", { detail: false }),
            );
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

        const legacyForm =
          root.querySelector("form") || root.querySelector(".row");
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
            const percentageCell =
              boldCells.length > 0 ? boldCells[boldCells.length - 1] : null;

            if (percentageCell) {
              const percentage =
                parseFloat(percentageCell.textContent.trim()) || 0;

              const allCenterCells = Array.from(
                lastRow.querySelectorAll("td.text-center"),
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

          const clonedTable = table.cloneNode(true);

          clonedTable.classList.add("w-full", "border-collapse");
          clonedTable.classList.remove(
            "table-bordered",
            "table-striped",
            "table-responsive",
            "m-table",
            "sum_table",
          );

          const thead = clonedTable.querySelector("thead");
          if (thead) {
            thead.classList.add(
              "bg-zinc-900/50",
              "text-xs",
              "uppercase",
              "tracking-wider",
              "font-bold",
              "text-zinc-400",
            );
            const ths = thead.querySelectorAll("th");
            ths.forEach((th) => {
              th.classList.add(
                "p-3",
                "border",
                "border-white/5",
                "text-center",
              );
              th.removeAttribute("style");
            });
          }

          const tbody = clonedTable.querySelector("tbody");
          if (tbody) {
            const trs = tbody.querySelectorAll("tr");
            trs.forEach((tr) => {
              tr.classList.add(
                "border-b",
                "border-white/5",
                "hover:bg-white/5",
                "transition-colors",
              );
              tr.removeAttribute("style");

              const tds = tr.querySelectorAll("td");
              tds.forEach((td) => {
                td.classList.add(
                  "p-3",
                  "text-sm",
                  "border-x",
                  "border-white/5",
                  "text-zinc-300",
                );

                const txt = td.textContent.trim();
                if (/^\d+(\.\d+)?$/.test(txt)) {
                  const val = parseFloat(txt);
                  if (val < 30) td.classList.add("text-rose-400", "font-bold");
                  else if (val < 60)
                    td.classList.add("text-amber-400", "font-bold");
                  else if (val >= 60)
                    td.classList.add("text-emerald-400", "font-bold");
                }

                if (td.classList.contains("bold"))
                  td.classList.add("font-bold", "text-white");
              });
            });

            const lastTr = tbody.querySelector("tr:last-child");
            if (lastTr) {
              lastTr.classList.add("bg-white/5", "!font-bold");
              const tds = lastTr.querySelectorAll("td");
              tds.forEach((td) => td.classList.add("!text-white"));
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
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
      } catch (e) {
        console.error("Marks PLO Parsing Error", e);
        setLoading(false);
        window.dispatchEvent(
          new CustomEvent("superflex-update-loading", { detail: false }),
        );
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
    if (pct < 30)
      return { label: "Poor", color: "text-rose-400", bg: "bg-rose-500/20" };
    if (pct < 60)
      return {
        label: "Average",
        color: "text-amber-400",
        bg: "bg-amber-500/20",
      };
    return {
      label: "Excellent",
      color: "text-emerald-400",
      bg: "bg-emerald-500/20",
    };
  };

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="w-full min-h-screen p-4 md:p-8 space-y-8 print:p-0 print:bg-white">
        <PageHeader
          className="print:hidden"
          title="PLO Report"
          subtitle="Program Learning Outcomes attainment analysis"
        >
          {semesters.length > 0 && (
            <SuperTabs
              tabs={semesters}
              activeTab={semesters.find((s) => s.selected)?.value}
              onTabChange={handleSemesterChange}
            />
          )}
        </PageHeader>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-8">
            {}
            <NotificationBanner alerts={alerts} />

            {}
            {summaryData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:gap-4">
                <StatsCard
                  icon={Target}
                  label="Overall Attainment"
                  value={`${summaryData.percentage}%`}
                  subValue="Based on CLO mapping"
                  delay={100}
                  className={`print:border-gray-200 print:bg-white ${getStatus(summaryData.percentage).color}`}
                />
                <StatsCard
                  icon={TrendingUp}
                  label="Performance Status"
                  value={getStatus(summaryData.percentage).label}
                  subValue="Performance Level"
                  delay={200}
                  className={`print:border-gray-200 print:bg-white ${getStatus(summaryData.percentage).color}`}
                />

                {}
                <div className="flex-1 min-w-[140px] p-6 rounded-[2rem] border bg-zinc-900/50 backdrop-blur-xl hover:bg-zinc-900/70 transition-all duration-300 hover:-translate-y-1 group print:border-gray-200 print:bg-white">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3.5 rounded-2xl bg-[#a098ff]/10 text-[#a098ff] group-hover:scale-110 transition-transform duration-300">
                      <FileBarChart size={24} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-1 print:text-black">
                      PLO Breakdown
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                      {summaryData.ploBreakdown.map((plo, i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center bg-black/20 rounded-lg p-2 border border-white/5 hover:border-white/10 transition-colors print:border-gray-200 print:bg-transparent"
                        >
                          <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest print:text-black leading-none mb-1">
                            PLO{plo.id}
                          </span>
                          <span
                            className={`text-[11px] font-black text-[#a098ff] print:text-black`}
                          >
                            {plo.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {}

            {}
            {reportHtml ? (
              <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-white/5">
                  <div className="p-2 bg-[#a098ff]/10 rounded-lg text-[#a098ff]">
                    <Layout size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-white">
                    Detailed Result
                  </h3>
                </div>
                {}
                <div className="overflow-x-auto scrollbar-hide p-0">
                  <div
                    className="legacy-table-wrapper w-full [&_table]:w-full [&_table]:border-collapse [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap"
                    dangerouslySetInnerHTML={{ __html: reportHtml }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-50 border border-white/5 rounded-3xl bg-zinc-900/20">
                <Info size={48} className="mb-4 text-zinc-500" />
                <p className="text-xl font-bold text-white">
                  No PLO Report Available
                </p>
                <p className="text-zinc-400 mt-2">
                  There is no PLO attainment data available for the selected
                  semester.
                </p>
                <p className="text-zinc-500 text-sm mt-1">
                  Please select a different semester.
                </p>
              </div>
            )}
          </div>
        )}

        {}
        <div ref={hiddenContentRef} className="hidden" />
      </div>
    </PageLayout>
  );
}

export default MarksPloReportPage;
