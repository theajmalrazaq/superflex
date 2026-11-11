import { parsePortalAlerts, parseSemesterOptions, readText } from "./dom";
import type { MarkCourse, PortalAlert, SemesterOption } from "./types";

export type ParsedMarksPage = {
  alerts: PortalAlert[];
  semesters: SemesterOption[];
  courses: MarkCourse[];
};

function numberOrZero(value: string | null | undefined): number {
  const parsed = Number.parseFloat(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function findMarksForm(document: Document): HTMLFormElement | null {
  return document.querySelector<HTMLFormElement>('form[action="/Student/StudentMarks"]');
}

export function parseMarksPage(root: ParentNode, form: ParentNode | null): ParsedMarksPage {
  const courses: MarkCourse[] = Array.from(root.querySelectorAll<HTMLElement>(".tab-pane")).map(
    (pane) => {
      const title = readText(pane.querySelector("h5"), pane.id)
        .replace(/\(.*\)/, "")
        .trim();
      const sections: MarkCourse["sections"] = [];
      let globalWeightage = 0;
      let globalObtained = 0;
      let globalAverage = 0;
      let globalMinimum = 0;
      let globalMaximum = 0;
      let globalStdDev = 0;

      Array.from(pane.querySelectorAll<HTMLElement>("div[id]"))
        .filter((sectionElement) => sectionElement.id.startsWith(pane.id))
        .forEach((sectionElement) => {
          const sectionId = sectionElement.id;
          if (sectionId.endsWith("Grand_Total_Marks")) return;
          const heading =
            sectionElement.previousElementSibling?.querySelector(".btn-link") ||
            sectionElement.querySelector(".card-header button");
          const sectionTitle = readText(
            heading,
            sectionId.replace(`${pane.id}-`, "").replace(/_/g, " "),
          );
          const rows = Array.from(
            sectionElement.querySelectorAll<HTMLElement>(".calculationrow"),
          ).map((row) => {
            const rawObtainedText = readText(row.querySelector(".ObtMarks"));
            const ungraded = !rawObtainedText || rawObtainedText === "-";
            const weight = numberOrZero(row.querySelector(".weightage")?.textContent);
            const total = numberOrZero(row.querySelector(".GrandTotal")?.textContent);
            const obtained = ungraded ? 0 : numberOrZero(rawObtainedText);
            const avg = numberOrZero(row.querySelector(".AverageMarks")?.textContent);
            const min = numberOrZero(row.querySelector(".MinMarks")?.textContent);
            const max = numberOrZero(row.querySelector(".MaxMarks")?.textContent);
            let stdDev = numberOrZero(row.querySelector(".StdDev")?.textContent);
            if (stdDev === 0 && (max > 0 || min > 0)) stdDev = (max - min) / 4;
            return {
              title: readText(row.querySelector("td:first-child")),
              weight,
              obtained,
              total,
              avg,
              stdDev,
              min,
              max,
              included: true,
              ungraded,
            };
          });

          const totalRows = sectionElement.querySelectorAll("[class*='totalColumn_']");
          const footer = totalRows.length
            ? totalRows[totalRows.length - 1]
            : sectionElement.querySelector("tfoot tr");
          let obtained = 0;
          let weight = 0;
          if (footer) {
            weight = numberOrZero(footer.querySelector(".totalColweightage")?.textContent);
            obtained = numberOrZero(footer.querySelector(".totalColObtMarks")?.textContent);
          } else {
            weight = rows.reduce((sum, row) => sum + row.weight, 0);
            obtained = rows.reduce((sum, row) => sum + row.obtained, 0);
          }

          const rowsWeightSum = rows.reduce((sum, row) => sum + row.weight, 0);
          const effectiveWeight = weight > 0 ? weight : rowsWeightSum;
          if (effectiveWeight > 0) {
            let usedWeight = 0;
            const included = new Set<number>();
            rows
              .map((row, index) => ({
                index,
                ratio: row.total > 0 ? row.obtained / row.total : 0,
                weight: row.weight,
              }))
              .sort((a, b) => b.ratio - a.ratio)
              .forEach((row) => {
                if (usedWeight < effectiveWeight - 0.001) {
                  usedWeight += row.weight;
                  included.add(row.index);
                }
              });
            rows.forEach((row, index) => {
              row.included = included.has(index);
            });
            globalWeightage += effectiveWeight;
            globalObtained += obtained;
          }

          const stats = { weightedAvg: 0, weightedStdDev: 0, weightedMin: 0, weightedMax: 0 };
          rows.forEach((row) => {
            if (!row.included || row.total <= 0 || effectiveWeight <= 0) return;
            const factor = row.weight / row.total;
            stats.weightedAvg += row.avg * factor;
            stats.weightedMin += row.min * factor;
            stats.weightedMax += row.max * factor;
            stats.weightedStdDev += row.stdDev * factor;
          });
          globalAverage += stats.weightedAvg;
          globalMinimum += stats.weightedMin;
          globalMaximum += stats.weightedMax;
          globalStdDev += stats.weightedStdDev;

          sections.push({
            id: sectionId,
            title: sectionTitle,
            weight: effectiveWeight,
            obtained,
            rows,
            stats,
          });
        });

      if (sections.length) {
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
            weightedMax: globalMaximum,
          },
        });
      }
      return {
        id: pane.id,
        title,
        sections,
        grandTotalStats: {
          weight: globalWeightage,
          obtained: globalObtained,
          percentage: globalWeightage > 0 ? (globalObtained / globalWeightage) * 100 : 0,
        },
      };
    },
  );

  return { alerts: parsePortalAlerts(root), semesters: parseSemesterOptions(form), courses };
}
