import React, { useEffect, useState, useRef } from "react";
import PageLayout from "../layouts/PageLayout";
import { LoadingSpinner } from "../LoadingOverlay";
import { 
  BarChart3, 
  TrendingUp, 
  Target,
  FileBarChart,
  Layout,
  Info
} from "lucide-react";

function MarksPloReportPage() {
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState([]);
  const [reportHtml, setReportHtml] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  
  const hiddenContentRef = useRef(null);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("superflex-update-loading", { detail: true }),
    );

    const parseData = () => {
      try {
        let root = document.querySelector(".m-wrapper");
        
        // Fallback for strict mode / re-renders
        if (!root || root.children.length === 0) {
            if (hiddenContentRef.current && hiddenContentRef.current.children.length > 0) {
                root = hiddenContentRef.current;
            } else {
                setLoading(false);
                window.dispatchEvent(
                    new CustomEvent("superflex-update-loading", { detail: false }),
                );
                return;
            }
        }

        // 1. Parse Semesters
        const legacyForm = root.querySelector("form") || root.querySelector(".row"); // Sometimes form IS the row
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

        // 2. Parse Report Table
        const table = root.querySelector("table.sum_table");
        if (table) {
            // Process Summary Data from Table Footer
            const lastRow = table.querySelector("tr:last-child");
            if (lastRow) {
                // Assuming last valid cell is percentage
                // Logic based on previous code: obtainPercentage = tr:last-child td.text-center.bold
                const boldCells = lastRow.querySelectorAll("td.bold.text-center");
                const percentageCell = boldCells.length > 0 ? boldCells[boldCells.length - 1] : null;

                if (percentageCell) {
                    const percentage = parseFloat(percentageCell.textContent.trim()) || 0;
                    
                    // Parse PLO Breakdown
                    // PLO cells are between some indices in the last row.
                    // Previous code: slice(2, -1) from "td.text-center"
                    const allCenterCells = Array.from(lastRow.querySelectorAll("td.text-center"));
                    // Heuristic: PLO values are usually numeric cells before the final total?
                    // Let's deduce from headers if possible, or stick to the heuristic
                    // The previous code used slice(2, -1). Let's try to map all numeric values found that are NOT the total
                    
                    const ploValues = [];
                    // Using the previous code's logic as it was specific to this page's structure
                    const validPloCells = allCenterCells.slice(2, -1);
                    validPloCells.forEach((cell, idx) => {
                        const txt = cell.textContent.trim();
                        if (txt !== '-' && txt !== '') {
                            ploValues.push({
                                id: idx + 1,
                                value: parseFloat(txt) || 0
                            });
                        }
                    });

                    setSummaryData({
                        percentage,
                        ploBreakdown: ploValues
                    });
                }
            }

            // Style and Save Table HTML
            // We clone it to modify it safeley
            const clonedTable = table.cloneNode(true);
            
            // Apply Tailwind Classes
            clonedTable.classList.add("w-full", "border-collapse");
            clonedTable.classList.remove("table-bordered", "table-striped", "table-responsive", "m-table", "sum_table");
            
            // Header
            const thead = clonedTable.querySelector("thead");
            if (thead) {
                thead.classList.add("bg-zinc-900/50", "text-xs", "uppercase", "tracking-wider", "font-bold", "text-zinc-400");
                const ths = thead.querySelectorAll("th");
                ths.forEach(th => {
                   th.classList.add("p-3", "border", "border-white/5", "text-center"); 
                   th.removeAttribute("style"); // remove inline borders
                });
            }

            // Body
            const tbody = clonedTable.querySelector("tbody");
            if (tbody) {
                const trs = tbody.querySelectorAll("tr");
                trs.forEach(tr => {
                    tr.classList.add("border-b", "border-white/5", "hover:bg-white/5", "transition-colors");
                    tr.removeAttribute("style"); // remove legacy bg colors

                    const tds = tr.querySelectorAll("td");
                    tds.forEach(td => {
                        td.classList.add("p-3", "text-sm", "border-x", "border-white/5", "text-zinc-300");
                        
                        // Colorize scores
                        const txt = td.textContent.trim();
                        if (/^\d+(\.\d+)?$/.test(txt)) { // Is number
                            const val = parseFloat(txt);
                            if (val < 30) td.classList.add("text-rose-400", "font-bold");
                            else if (val < 60) td.classList.add("text-amber-400", "font-bold");
                            else if (val >= 60) td.classList.add("text-emerald-400", "font-bold");
                        }
                        
                        // Handle 'bold' class from legacy
                        if (td.classList.contains("bold")) td.classList.add("font-bold", "text-white");
                    });
                });
                
                // Highlight last row (Totals)
                const lastTr = tbody.querySelector("tr:last-child");
                if (lastTr) {
                    lastTr.classList.add("bg-white/5", "!font-bold");
                    const tds = lastTr.querySelectorAll("td");
                    tds.forEach(td => td.classList.add("!text-white")); // Ensure visible
                }
            }

            setReportHtml(clonedTable.outerHTML);
        } else {
            console.log("No table found");
        }

        // 3. Move Content for Legacy Form Functionality
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
            select.dispatchEvent(new Event('change'));
            // If there's a form, submit it
            const form = select.closest("form");
            if (form) form.submit();
        }
    }
  };

  // Helper for status visual
  const getStatus = (pct) => {
      if (pct < 30) return { label: "Poor", color: "text-rose-400", bg: "bg-rose-500/20" };
      if (pct < 60) return { label: "Average", color: "text-amber-400", bg: "bg-amber-500/20" };
      return { label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/20" };
  };

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="w-full min-h-screen p-6 md:p-8 space-y-8 print:p-0 print:bg-white">
        
        {/* Header - No Print */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              PLO Report
            </h1>
            <p className="text-zinc-400 font-medium">
              Program Learning Outcomes attainment analysis
            </p>
          </div>

          <div className="flex gap-4">
             {semesters.length > 0 && (
                 <div className="flex gap-2 bg-zinc-900/50 p-1.5 rounded-full border border-white/5 backdrop-blur-sm overflow-x-auto custom-scrollbar">
                    {semesters.map((sem, idx) => (
                        <button
                        key={idx}
                        onClick={() => handleSemesterChange(sem.value)}
                        className={`px-5 py-2 border rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                            sem.selected
                            ? "bg-[#a098ff]/10 text-[#a098ff] border-[#a098ff]/20"
                            : "text-zinc-500 border-transparent hover:text-white hover:bg-white/5"
                        }`}
                        >
                        {sem.label}
                        </button>
                    ))}
                </div>
             )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Dashboard Summary */}
            {summaryData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:gap-4">
                    {/* Overall Score */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 relative overflow-hidden group print:border-gray-200 print:bg-white">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                             <Target size={80} className="text-white print:text-black" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-zinc-400 font-medium text-sm flex items-center gap-2 print:text-black">
                                <BarChart3 size={16} /> Overall Attainment
                            </h3>
                            <div className={`mt-4 text-5xl font-black tracking-tighter ${getStatus(summaryData.percentage).color} print:text-black`}>
                                {summaryData.percentage}%
                            </div>
                            <div className="mt-2 text-sm text-zinc-500 print:text-gray-600">Based on CLO mapping</div>
                        </div>
                    </div>

                     {/* Status */}
                     <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 relative overflow-hidden group print:border-gray-200 print:bg-white">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                             <TrendingUp size={80} className="text-white print:text-black" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-zinc-400 font-medium text-sm flex items-center gap-2 print:text-black">
                                <Layout size={16} /> Performance Status
                            </h3>
                            <div className="mt-4 flex items-center gap-3">
                                <span className={`px-4 py-2 rounded-xl text-lg font-bold border ${getStatus(summaryData.percentage).bg} ${getStatus(summaryData.percentage).color} border-transparent print:border-gray-200 print:text-black print:bg-transparent`}>
                                    {getStatus(summaryData.percentage).label}
                                </span>
                            </div>
                             <div className="mt-4 w-full bg-zinc-800 rounded-full h-2 overflow-hidden print:bg-gray-200">
                                <div 
                                    className={`h-full ${getStatus(summaryData.percentage).bg.replace('/20', '')}`} 
                                    style={{ width: `${summaryData.percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* PLO Breakdown */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:col-span-1 print:border-gray-200 print:bg-white">
                         <h3 className="text-zinc-400 font-medium text-sm flex items-center gap-2 mb-4 print:text-black">
                            <FileBarChart size={16} /> PLO Breakdown
                        </h3>
                        <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-2">
                             {summaryData.ploBreakdown.map((plo, i) => (
                                 <div key={i} className="flex flex-col items-center bg-black/20 rounded-lg p-2 border border-white/5 hover:border-white/10 transition-colors print:border-gray-200 print:bg-transparent">
                                     <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider print:text-black">PLO {plo.id}</span>
                                     <span className={`text-sm font-bold ${getStatus(plo.value).color} print:text-black`}>
                                         {plo.value}%
                                     </span>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Printable section removed */}

            {/* Detailed Report Table */}
            {reportHtml ? (
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-white/5">
                        <div className="p-2 bg-[#a098ff]/10 rounded-lg text-[#a098ff]">
                            <Layout size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-white">Detailed Result</h3>
                    </div>
                    {/* Render extracted HTML */}
                    <div className="overflow-x-auto custom-scrollbar p-0">
                         <div 
                            className="legacy-table-wrapper w-full [&_table]:w-full [&_table]:border-collapse [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap"
                            dangerouslySetInnerHTML={{ __html: reportHtml }} 
                         />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50 border border-white/5 rounded-3xl bg-zinc-900/20">
                    <Info size={48} className="mb-4 text-zinc-500" />
                    <p className="text-xl font-bold text-white">No PLO Report Available</p>
                    <p className="text-zinc-400 mt-2">There is no PLO attainment data available for the selected semester.</p>
                    <p className="text-zinc-500 text-sm mt-1">Please select a different semester.</p>
                </div>
            )}

          </div>
        )}

        {/* Hidden Legacy Container */}
        <div ref={hiddenContentRef} className="hidden" />

      </div>
    </PageLayout>
  );
}

export default MarksPloReportPage;
