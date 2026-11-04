import { parseNumber, parsePortalAlerts, parseSemesterOptions, readText } from "./dom";
import type { AttendanceCourse, PortalAlert, SemesterOption } from "./types";

export type ParsedAttendancePage = {
  alerts: PortalAlert[];
  courses: AttendanceCourse[];
  semesters: SemesterOption[];
};

export function findAttendanceForm(document: Document): HTMLFormElement | null {
  return document.querySelector<HTMLFormElement>('form[action="/Student/StudentAttendance"]');
}

function hasStatus(record: { status: string }, expected: "P" | "L" | "A"): boolean {
  const status = record.status.trim().toUpperCase();
  const labels = { P: "PRESENT", L: "LATE", A: "ABSENT" };
  return status === expected || status === labels[expected];
}

export function parseAttendancePage(root: ParentNode, form: ParentNode | null): ParsedAttendancePage {
  const courses = Array.from(root.querySelectorAll<HTMLElement>(".tab-pane")).map((pane) => {
    const title = readText(pane.querySelector("h5"), pane.id)
      .replace(/\(.*\)/, "")
      .trim();
    const percentage = parseNumber(pane.querySelector(".progress-bar")?.getAttribute("aria-valuenow"));
    const records = Array.from(pane.querySelectorAll("tbody tr")).flatMap((row) => {
      const cells = row.querySelectorAll("td");
      if (cells.length < 4) return [];
      const date = readText(cells[1]);
      let day = "";
      const parts = date.split("-");
      if (parts.length === 3) {
        const parsedDate = new Date(`${parts[1]} ${parts[0]}, ${parts[2]}`);
        if (!Number.isNaN(parsedDate.getTime())) {
          day = parsedDate.toLocaleDateString("en-US", { weekday: "short" });
        }
      }
      return [{
        date,
        day,
        time: readText(cells[2]),
        status: readText(cells[3]),
        type: readText(cells[4], "Lecture"),
      }];
    });

    return {
      id: pane.id,
      title,
      percentage,
      records,
      present: records.filter((record) => hasStatus(record, "P")).length,
      late: records.filter((record) => hasStatus(record, "L")).length,
      absent: records.filter((record) => hasStatus(record, "A")).length,
    };
  });

  return { alerts: parsePortalAlerts(root, ".alert"), courses, semesters: parseSemesterOptions(form) };
}
