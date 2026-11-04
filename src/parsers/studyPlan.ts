import { parseInteger, parsePortalAlerts, readText } from "./dom";
import type { PortalAlert, StudyPlanSemester } from "./types";

export type ParsedStudyPlanPage = {
  alerts: PortalAlert[];
  semesters: StudyPlanSemester[];
};

export function parseStudyPlanPage(root: ParentNode): ParsedStudyPlanPage {
  const semesters = Array.from(root.querySelectorAll<HTMLElement>(".col-md-6")).flatMap((column) => {
    const heading = column.querySelector("h4");
    if (!heading) return [];

    const small = heading.querySelector("small");
    const title = readText(heading).replace(readText(small), "").trim();
    const crHrs = parseInteger(readText(small).match(/[\d,]+/)?.[0]);
    const courses = Array.from(column.querySelectorAll("table tbody tr")).flatMap((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length < 4) return [];

      return [{
        code: readText(cells[0]),
        title: readText(cells[1]),
        crHrs: parseInteger(readText(cells[2])),
        type: readText(cells[3]),
      }];
    });

    return [{ title: title || "Untitled Semester", crHrs, courses }];
  });

  return { alerts: parsePortalAlerts(root), semesters };
}
