import { parseNumber, parsePortalAlerts, readText } from "./dom";
import { parseMarksPage } from "./marks";
import { parseAttendancePage } from "./attendance";
import { parseStudyPlanSemesters } from "./studyPlan";
import type { HomeProfileData, RawMarkCourse, RawMarkRow, StudyPlanSemester } from "./types";

export function parseHomeProfile(root: ParentNode): HomeProfileData {
  const sections: HomeProfileData["sections"] = [];
  let universityInfo: Record<string, string> = {};
  let personalInfo: Record<string, string> = {};

  root.querySelectorAll(".row").forEach((row) => {
    const title = readText(row.querySelector(".m-portlet__head-text"));
    if (!title) return;

    const data: Record<string, string> = {};
    row.querySelectorAll(".col-md-4 p").forEach((paragraph) => {
      const label = readText(paragraph.querySelector(".m--font-boldest")).replace(/:$/, "");
      const value = readText(paragraph.querySelector("span:not(.m--font-boldest)"));
      if (label && value) data[label] = value;
    });

    if (Object.keys(data).length === 0) return;
    sections.push({ title, data });
    if (title === "University Information") universityInfo = data;
    if (title === "Personal Information") personalInfo = data;
  });

  return { alerts: parsePortalAlerts(root), sections, universityInfo, personalInfo };
}

export function parseHomeAttendanceReport(document: ParentNode) {
  try {
    const parsed = parseAttendancePage(document, null);
    if (parsed.courses && parsed.courses.length > 0) {
      return parsed.courses.map((c) => ({
        ...c,
        total: c.records.length,
      }));
    }
  } catch {}

  return Array.from(
    document.querySelectorAll<HTMLTableElement>(".table.table-bordered.table-responsive"),
  ).map((table) => {
    const tabPane = table.closest(".tab-pane");
    const title = readText(tabPane?.querySelector("h5"), "Course")
      .replace(/\s*\([^)]*\)/g, "")
      .trim();

    const rows = Array.from(table.querySelectorAll("tbody tr"));
    let present = 0;
    let absent = 0;
    const records = rows.flatMap((row) => {
      const cells = row.querySelectorAll("td");
      const status = readText(row.querySelector("td:nth-child(4)"));
      if (status.includes("P")) present += 1;
      if (status.includes("A")) absent += 1;
      if (cells.length < 4) return [];
      return [
        {
          date: readText(cells[1]),
          time: readText(cells[2]),
          status,
          type: readText(cells[4], "Lecture"),
        },
      ];
    });
    const percentage = parseNumber(
      tabPane?.querySelector(".progress-bar")?.getAttribute("aria-valuenow"),
    );
    return { id: tabPane?.id || "", title, present, absent, total: rows.length, percentage, records };
  });
}

export function parseHomeMarksReport(document: ParentNode): RawMarkCourse[] {
  try {
    const parsed = parseMarksPage(document, null);
    if (parsed.courses && parsed.courses.some((course) => course.sections.length > 0)) {
      return parsed.courses.map((course) => ({
        id: course.id,
        title: course.title,
        rawTitle: course.title,
        sections: course.sections
          .filter(
            (sec) => !sec.id.endsWith("Grand_Total_Marks") && sec.title !== "Grand Total Marks",
          )
          .map((sec) => ({
            id: sec.id,
            title: sec.title,
            weight: sec.weight,
            rows: sec.rows.filter(
              (row) => row.title !== "Total" && row.title !== "Grand Total",
            ),
          }))
          .filter((sec) => sec.rows.length > 0),
      }));
    }
  } catch {}

  return Array.from(document.querySelectorAll<HTMLElement>(".tab-pane")).map((pane) => {
    const id = pane.id;
    const title = readText(pane.querySelector("h5"), id)
      .replace(/\s*\([^)]*\)/g, "")
      .trim();

    const sections = Array.from(pane.querySelectorAll<HTMLElement>(".card")).flatMap((card) => {
      const title = readText(card.querySelector(".card-header button"));
      if (!title || title.includes("Grand Total")) return [];
      const rows: RawMarkRow[] = Array.from(card.querySelectorAll("tbody tr")).flatMap((row) => {
        if (row.classList.contains("totalColumn_1471") || row.querySelector(".totalColweightage"))
          return [];
        const cells = row.querySelectorAll("td");
        if (cells.length < 4) return [];
        const name = readText(cells[0]);
        if (name === "Total" || name === "Grand Total") return [];
        const obtainedText = readText(cells[2]);
        const ungraded = !obtainedText || obtainedText === "-";
        const parsedObtained = Number.parseFloat(obtainedText);
        if (!ungraded && !Number.isFinite(parsedObtained)) return [];
        const obtained = ungraded ? 0 : parsedObtained;
        return [
          {
            title: name,
            weight: parseNumber(readText(cells[1])),
            obtained,
            total: parseNumber(readText(cells[3])),
            avg: parseNumber(readText(cells[4])),
            stdDev: parseNumber(readText(cells[5])),
            min: parseNumber(readText(cells[6])),
            max: parseNumber(readText(cells[7])),
            included: true,
            ungraded,
          },
        ];
      });

      const footer =
        card.querySelector("tfoot tr") || card.querySelector('tr[class*="totalColumn"]');
      const weight =
        parseNumber(footer?.querySelector(".totalColweightage")?.textContent) ||
        rows.reduce((sum, row) => sum + row.weight, 0);
      return rows.length
        ? [{ id: `${id}-${title.replace(/\s+/g, "_")}`, title, weight, rows }]
        : [];
    });
    return { id, title, sections };
  });
}

export function parseHomeStudyPlan(document: ParentNode): StudyPlanSemester[] {
  return parseStudyPlanSemesters(document, "");
}
