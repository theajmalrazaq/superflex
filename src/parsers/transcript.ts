import { parseNumber, parseInteger, parsePortalAlerts, readText } from "./dom";
import type { PortalAlert, TranscriptSemester } from "./types";

export type ParsedTranscriptPage = { alerts: PortalAlert[]; semesters: TranscriptSemester[] };

export function parseTranscriptPage(root: ParentNode, document: Document): ParsedTranscriptPage {
  const semesters = Array.from(
    root.querySelectorAll<HTMLElement>(".m-section__content .row .col-md-6"),
  ).map((column) => {
    const title = readText(column.querySelector("h5"), "Untitled Semester");
    const summaryValues = Array.from(
      column.querySelectorAll(".pull-right span"),
      (span) => (span.textContent || "").split(":")[1]?.trim() || "0",
    );
    const summary = {
      crRegistered: parseInteger(summaryValues[0], Number.NaN),
      crEarned: parseInteger(summaryValues[1], Number.NaN),
      cgpa: parseNumber(summaryValues[2], Number.NaN),
      sgpa: parseNumber(summaryValues[3], Number.NaN),
    };

    const courses = Array.from(column.querySelectorAll("tbody tr")).flatMap((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length < 7) return [];
      const codeCell = cells[0];
      const link = codeCell.querySelector("a");
      let mca: string | null = null;
      let gradingScheme: string | null = null;
      let schemeDetailId: string | null = null;

      if (link) {
        const title = link.getAttribute("title") || link.getAttribute("data-original-title");
        const mcaMatch = title?.match(/MCA[:\s]+(\d+)/i);
        if (title?.includes("MCA") && mcaMatch) mca = mcaMatch[1];

        const detailMatch = link.getAttribute("onclick")?.match(/fn_StdGradeSchemeDetail\((\d+)\)/);
        if (detailMatch) schemeDetailId = detailMatch[1];

        const target = link.getAttribute("data-target");
        if (target) {
          const modal = document.querySelector(target);
          const gradeTable = modal?.querySelector("#tblGradeDetailmodal");
          const dataCells = gradeTable?.querySelectorAll("tr")[1]?.querySelectorAll("td");
          if (dataCells && dataCells.length >= 2) {
            gradingScheme = readText(dataCells[0]);
            mca = readText(dataCells[1]);
          }
        }
      }

      return [
        {
          code: readText(codeCell),
          description: readText(cells[1]),
          section: readText(cells[2]),
          crHrs: parseNumber(readText(cells[3])),
          grade: readText(cells[4]),
          points: parseNumber(readText(cells[5])),
          type: readText(cells[6]),
          mca,
          gradingScheme,
          schemeDetailId,
        },
      ];
    });

    return { title, summary, courses };
  });

  return { alerts: parsePortalAlerts(root), semesters };
}
