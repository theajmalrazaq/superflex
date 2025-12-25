export const parseFloatOrZero = (val) => {
  if (!val) return 0;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};

export const parseProfile = (doc) => {
  try {
    let uniInfo = {};
    let studentName = null;
    const allSections = [];

    const rows = doc.querySelectorAll(".row");
    rows.forEach((row) => {
      const portletTitle = row.querySelector(".m-portlet__head-text")?.textContent.trim();

      if (portletTitle) {
        const sectionData = {};
        row.querySelectorAll(".col-md-4 p").forEach((p) => {
          const label = p.querySelector(".m--font-boldest")?.textContent.trim().replace(":", "");
          const value = p.querySelector("span:not(.m--font-boldest)")?.textContent.trim();
          if (label && value) sectionData[label] = value;
        });

        if (Object.keys(sectionData).length > 0) {
          allSections.push({ title: portletTitle, data: sectionData });
          if (portletTitle === "University Information") uniInfo = sectionData;
          if (portletTitle === "Personal Information" && sectionData["Name"]) {
            studentName = sectionData["Name"];
          }
        }
      }
    });

    return { studentName, universityInfo: uniInfo, profileSections: allSections };
  } catch (e) {
    console.error("Parse Profile Failed", e);
    return null;
  }
};

export const parseAttendance = (doc) => {
  try {
    const summaryData = [];
    const tables = doc.querySelectorAll(".table.table-bordered.table-responsive");

    tables.forEach((table) => {
      const tabPane = table.closest(".tab-pane");
      let title = tabPane?.querySelector("h5")?.textContent.trim() || "Course";
      title = title.replace(/\(.*\)/, "").trim();

      const rows = table.querySelectorAll("tbody tr");
      let present = 0, absent = 0;
      const logs = [];

      rows.forEach((r) => {
        const cells = r.querySelectorAll("td");
        if (cells.length >= 4) {
          const date = cells[1].textContent.trim();
          const type = cells[2].textContent.trim();
          const status = cells[3].textContent.trim();

          let day = "";
          try {
            const parts = date.split("-");
            if (parts.length === 3) {
              const d = new Date(`${parts[1]} ${parts[0]}, ${parts[2]}`);
              if (!isNaN(d)) day = d.toLocaleDateString("en-US", { weekday: "short" });
            }
          } catch (e) {}

          if (status.includes("P")) present++;
          if (status.includes("A")) absent++;
          logs.push({ date, day, type, status });
        }
      });

      let percentage = 0;
      const progress = tabPane?.querySelector(".progress-bar");
      if (progress) percentage = parseFloat(progress.getAttribute("aria-valuenow") || 0);

      summaryData.push({
        title,
        present,
        absent,
        total: rows.length,
        percentage,
        logs,
      });
    });
    return summaryData;
  } catch (e) {
    console.error("Parse Attendance Failed", e);
    return null;
  }
};

export const parseMarks = (doc) => {
  try {
    const parsedCourses = [];
    const tabPanes = doc.querySelectorAll(".tab-pane");

    tabPanes.forEach((pane) => {
      const courseId = pane.id;
      let courseTitle = pane.querySelector("h5")?.textContent.trim() || courseId;
      courseTitle = courseTitle.replace(/\(.*\)/, "").trim();

      const sections = [];
      let globalWeightage = 0;
      let globalObtained = 0;
      let globalAverage = 0;
      let globalMinimum = 0;
      let globalMaximum = 0;
      let globalStdDev = 0;

      const allCourseDivs = Array.from(
        pane.querySelectorAll(`div[id^="${pane.id}"]`),
      );

      allCourseDivs.forEach((secDiv) => {
        const secId = secDiv.id;
        const isGrandTotal = secId.endsWith("Grand_Total_Marks");
        if (isGrandTotal) return;

        const secTitleBtn =
          secDiv.previousElementSibling?.querySelector(".btn-link") ||
          secDiv.querySelector(".card-header button");
        let secTitle = secTitleBtn?.textContent.trim();
        if (!secTitle)
          secTitle = secId.replace(pane.id + "-", "").replace(/_/g, " ");

        const rowsData = [];
        const calcRows = secDiv.querySelectorAll(".calculationrow");

        calcRows.forEach((row) => {
          const weight = parseFloatOrZero(
            row.querySelector(".weightage")?.textContent,
          );
          const grandTotal = parseFloatOrZero(
            row.querySelector(".GrandTotal")?.textContent,
          );
          const obtMarks = parseFloatOrZero(
            row.querySelector(".ObtMarks")?.textContent,
          );
          const avg = parseFloatOrZero(
            row.querySelector(".AverageMarks")?.textContent,
          );
          const min = parseFloatOrZero(
            row.querySelector(".MinMarks")?.textContent,
          );
          const max = parseFloatOrZero(
            row.querySelector(".MaxMarks")?.textContent,
          );
          let stdDev = parseFloatOrZero(
            row.querySelector(".StdDev")?.textContent,
          );

          if (stdDev === 0 && (max > 0 || min > 0)) {
            stdDev = (max - min) / 4;
          }

          rowsData.push({
            name: row.querySelector("td:first-child")?.textContent.trim(),
            title: row.querySelector("td:first-child")?.textContent.trim(),
            weight,
            obtained: obtMarks,
            total: grandTotal,
            avg,
            stdDev,
            min,
            max,
            included: true,
          });
        });

        let secWeight = 0,
          secObtained = 0;

        const totalRows = secDiv.querySelectorAll("[class*='totalColumn_']");
        let footerRow = null;
        if (totalRows.length > 0) {
          footerRow = totalRows[totalRows.length - 1];
        } else {
          footerRow = secDiv.querySelector("tfoot tr");
        }

        if (footerRow) {
          secWeight = parseFloatOrZero(
            footerRow.querySelector(".totalColweightage")?.textContent,
          );
          secObtained = parseFloatOrZero(
            footerRow.querySelector(".totalColObtMarks")?.textContent,
          );
        } else {
          secWeight = rowsData.reduce((acc, r) => acc + r.weight, 0);
          secObtained = rowsData.reduce((acc, r) => acc + r.obtained, 0);
        }

        const includeInStats = secWeight > 0;

        if (includeInStats) {
          let currentAccWeight = 0;
          const EPSILON = 0.001;

          const sorted = [...rowsData].map((r, i) => {
            const ratio = r.total > 0 ? r.obtained / r.total : 0;
            const score = ratio * r.weight;
            return {
              ...r,
              originalIdx: i,
              _sortScore: score
            };
          });

          sorted.sort((a, b) => b._sortScore - a._sortScore);

          const includedIndices = new Set();
          for (let item of sorted) {
            if (currentAccWeight < secWeight - EPSILON) {
              currentAccWeight += item.weight;
              includedIndices.add(item.originalIdx);
            }
          }

          rowsData.forEach((r, i) => {
            r.included = includedIndices.has(i);
            r.percentage = r.total > 0 ? (r.obtained / r.total) * 100 : 0;
          });

          globalWeightage += secWeight;
          globalObtained += secObtained;
        }

        let secWeightedAvg = 0,
          secWeightedMin = 0,
          secWeightedMax = 0,
          secWeightedStd = 0;

        rowsData.forEach((r) => {
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
          name: secTitle,
          title: secTitle,
          assessments: rowsData,
          stats: {
            totalWeight: secWeight,
            totalObtainedWeighted: secObtained,
            weightedAvg: secWeightedAvg,
            weightedStdDev: secWeightedStd,
            weightedMin: secWeightedMin,
            weightedMax: secWeightedMax,
            percentage: secWeight > 0 ? (secObtained / secWeight) * 100 : 0
          }
        });
      });

      parsedCourses.push({
        id: courseId,
        title: courseTitle,
        categories: sections,
        obtained: globalObtained,
        total: globalWeightage,
        percentage: globalWeightage > 0 ? (globalObtained / globalWeightage) * 100 : 0,
        grandTotalStats: {
          weight: globalWeightage,
          obtained: globalObtained,
          weightedAvg: globalAverage,
          weightedStdDev: globalStdDev,
          weightedMin: globalMinimum,
          weightedMax: globalMaximum
        }
      });
    });
    return parsedCourses;
  } catch (e) {
    console.error("Parse Marks Failed", e);
    return null;
  }
};

export const parseStudyPlan = (doc) => {
  try {
    const parsedSemesters = [];
    const semesterCols = doc.querySelectorAll(".col-md-6");

    semesterCols.forEach((col) => {
      const h4 = col.querySelector("h4");
      if (!h4) return;
      const title = h4.textContent.replace(h4.querySelector("small")?.textContent || "", "").trim();
      const crHrs = parseInt((h4.querySelector("small")?.textContent || "").match(/\d+/)?.[0] || "0");
      const courses = [];

      const table = col.querySelector("table");
      if (table) {
        table.querySelectorAll("tbody tr").forEach((tr) => {
          const cells = tr.querySelectorAll("td");
          if (cells.length >= 4) {
            courses.push({
              code: cells[0].textContent.trim(),
              title: cells[1].textContent.trim(),
              crHrs: parseInt(cells[2].textContent.trim()),
              type: cells[3].textContent.trim(),
            });
          }
        });
      }
      parsedSemesters.push({ title, crHrs, courses });
    });
    return parsedSemesters.length > 0 ? parsedSemesters : null;
  } catch (e) {
    console.error("Parse StudyPlan Failed", e);
    return null;
  }
};
