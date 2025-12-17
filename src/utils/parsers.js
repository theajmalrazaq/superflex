
export const parseFloatOrZero = (value) => {
  if (!value || value === "-" || value.trim() === "") return 0;
  const cleaned = value.toString().replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const parseMarksData = (root) => {
    try {
        if (!root) return null;

        
        let alertInfo = null;
        const alertEl = root.querySelector(".alert");
        if(alertEl?.textContent.trim()) {
            alertInfo = {
                type: alertEl.classList.contains("alert-danger") ? "error" : "info",
                message: alertEl.textContent.trim()
            };
        }

        
        const parsedCourses = [];
        const tabPanes = root.querySelectorAll(".tab-pane");

        tabPanes.forEach(pane => {
            let courseTitle = pane.querySelector("h5")?.textContent.trim() || pane.id;
            courseTitle = courseTitle.replace(/\(.*\)/, "").trim();

            const sections = [];
            
            
            let globalWeightage = 0;
            let globalObtained = 0;
            let globalAverage = 0;
            let globalMinimum = 0;
            let globalMaximum = 0;
            let globalStdDev = 0;

            const allCourseDivs = Array.from(pane.querySelectorAll(`div[id^="${pane.id}"]`));
            
            allCourseDivs.forEach(secDiv => {
                const secId = secDiv.id;
                const isGrandTotal = secId.endsWith("Grand_Total_Marks");
                if (isGrandTotal) return; 

                const secTitleBtn = secDiv.previousElementSibling?.querySelector(".btn-link") || secDiv.querySelector(".card-header button");
                let secTitle = secTitleBtn?.textContent.trim();
                if(!secTitle) secTitle = secId.replace(pane.id + "-", "").replace(/_/g, " ");

                
                const rowsData = [];
                const calcRows = secDiv.querySelectorAll(".calculationrow");
                
                calcRows.forEach(row => {
                     const weight = parseFloatOrZero(row.querySelector(".weightage")?.textContent);
                     const grandTotal = parseFloatOrZero(row.querySelector(".GrandTotal")?.textContent);
                     const obtMarks = parseFloatOrZero(row.querySelector(".ObtMarks")?.textContent);
                     const avg = parseFloatOrZero(row.querySelector(".AverageMarks")?.textContent);
                     const min = parseFloatOrZero(row.querySelector(".MinMarks")?.textContent);
                     const max = parseFloatOrZero(row.querySelector(".MaxMarks")?.textContent);
                     let stdDev = parseFloatOrZero(row.querySelector(".StdDev")?.textContent);

                     if (stdDev === 0 && (max > 0 || min > 0)) {
                         stdDev = (max - min) / 4;
                     }

                     rowsData.push({
                         title: row.querySelector("td:first-child")?.textContent.trim(), 
                         weight,
                         obtained: obtMarks, 
                         total: grandTotal,
                         avg,
                         stdDev,
                         min,
                         max,
                         included: true
                     });
                });

                
                let secWeight = 0, secObtained = 0;
                const totalRows = secDiv.querySelectorAll("[class*='totalColumn_']");
                let footerRow = null;
                if (totalRows.length > 0) {
                    footerRow = totalRows[totalRows.length - 1];
                } else {
                    footerRow = secDiv.querySelector("tfoot tr");
                }

                if(footerRow) {
                    secWeight = parseFloatOrZero(footerRow.querySelector(".totalColweightage")?.textContent);
                    secObtained = parseFloatOrZero(footerRow.querySelector(".totalColObtMarks")?.textContent);
                } else {
                    secWeight = rowsData.reduce((acc, r) => acc + r.weight, 0);
                    secObtained = rowsData.reduce((acc, r) => acc + r.obtained, 0);
                }

                
                const includeInStats = secWeight > 0;
                if (includeInStats) {
                    let currentAccWeight = 0;
                    const sorted = [...rowsData].map((r, i) => ({...r, originalIdx: i}));
                    sorted.sort((a,b) => b.obtained - a.obtained);
                    
                    const includedIndices = new Set();
                    for(let item of sorted) {
                         if(currentAccWeight < secWeight) {
                             currentAccWeight += item.weight;
                             includedIndices.add(item.originalIdx);
                         }
                    }
                    
                    rowsData.forEach((r, i) => {
                         r.included = includedIndices.has(i);
                    });

                    globalWeightage += secWeight;
                    globalObtained += secObtained;
                }

                
                let secWeightedAvg = 0, secWeightedMin = 0, secWeightedMax = 0, secWeightedStd = 0;
                
                rowsData.forEach(r => {
                    if (r.included && r.total > 0 && includeInStats) {
                        const ratio = r.weight / r.total;
                        secWeightedAvg += r.avg * ratio;
                        secWeightedMin += r.min * ratio;
                        secWeightedMax += r.max * ratio;
                        secWeightedStd += r.stdDev * ratio;
                        
                        globalAverage += r.avg * ratio;
                        globalMinimum += r.min * ratio;
                        globalMaximum += r.max * ratio;
                        globalStdDev += r.stdDev * ratio;
                    }
                });
                
                sections.push({
                    id: secId,
                    title: secTitle,
                    weight: secWeight,
                    obtained: secObtained,
                    rows: rowsData,
                    stats: {
                        weightedAvg: secWeightedAvg,
                        weightedStdDev: secWeightedStd,
                        weightedMin: secWeightedMin,
                        weightedMax: secWeightedMax
                    }
                });
            });

            
            sections.push({
                id: `${pane.id}-Grand_Total_Marks`,
                title: "Grand Total Marks",
                weight: globalWeightage,
                obtained: globalObtained,
                rows: [], 
                stats: {
                    weightedAvg: globalAverage,
                    weightedStdDev: globalStdDev,
                    weightedMin: globalMinimum,
                    weightedMax: globalMaximum
                }
            });

            parsedCourses.push({
                id: pane.id,
                title: courseTitle,
                sections,
                grandTotalStats: {
                    weight: globalWeightage,
                    obtained: globalObtained,
                    percentage: globalWeightage > 0 ? (globalObtained / globalWeightage) * 100 : 0
                }
            });
        });

        return { courses: parsedCourses, alertInfo };
    } catch (e) {
        console.error("Marks Parsing Error", e);
        return { courses: [], alertInfo: null };
    }
};

export const parseAttendanceData = (root) => {
    try {
        if (!root) return null;

        const parsedAlerts = [];
        const alertNodes = root.querySelectorAll(".alert");
        alertNodes.forEach(alertEl => {
             const textEl = alertEl.querySelector(".m-alert__text");
             let message = textEl ? textEl.textContent.trim() : alertEl.textContent.replace("Close", "").trim();
             message = message.replace(/\s+/g, ' '); 
             
             const type = alertEl.classList.contains("alert-danger") ? "error" : "info";
             parsedAlerts.push({ type, message });
        });

        const parsedCourses = [];
        const tabPanes = root.querySelectorAll(".tab-pane");
        
        tabPanes.forEach((pane) => {
            let title = pane.querySelector("h5")?.textContent.trim() || pane.id;
            title = title.replace(/\(.*\)/, "").trim();

            const prog = pane.querySelector(".progress-bar");
            const percentage = prog ? parseFloat(prog.getAttribute("aria-valuenow") || 0) : 0;
            
            const records = [];
            const rows = pane.querySelectorAll("tbody tr");
            
            rows.forEach(row => {
               const cols = row.querySelectorAll("td");
               if(cols.length >= 4) {
                  const dateStr = cols[1]?.textContent.trim();
                  let day = "";
                  try {
                      const parts = dateStr.split('-');
                      if(parts.length === 3) {
                          const d = new Date(`${parts[1]} ${parts[0]}, ${parts[2]}`);
                          if(!isNaN(d)) day = d.toLocaleDateString('en-US', { weekday: 'short' });
                      }
                  } catch(e) {}

                  records.push({
                      date: dateStr,
                      day: day,
                      time: cols[2]?.textContent.trim(),
                      status: cols[3]?.textContent.trim(),
                      type: cols[4]?.textContent.trim() || "Lecture"
                  });
               }
            });

            parsedCourses.push({
                id: pane.id,
                title,
                percentage,
                records,
                present: records.filter(r => r.status.includes("P")).length,
                absent: records.filter(r => r.status.includes("A")).length
            });
        });

        return { courses: parsedCourses, alerts: parsedAlerts };

    } catch (e) {
        console.error("Attendance Parsing Error", e);
        return { courses: [], alerts: [] };
    }
};
