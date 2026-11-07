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

export function getCourseCreditHours(rawTitle: string, id: string = ""): number {
  const fullText = `${rawTitle} ${id}`;
  const crMatch =
    fullText.match(/\b([1-4])\s*(?:cr(?:edit)?(?:\s*hrs?)?|credits?)\b/i) ||
    fullText.match(/\(\s*([1-4])\s*(?:cr(?:edit)?)?\s*\)/i) ||
    fullText.match(/\(\s*(\d)\s*\+\s*(\d)\s*\)/i);
  if (crMatch) {
    if (crMatch[2] !== undefined) {
      const c1 = parseInt(crMatch[1], 10);
      const c2 = parseInt(crMatch[2], 10);
      return c1 + c2 || 3;
    }
    return parseInt(crMatch[1], 10) || 3;
  }

  if (/\blab\b/i.test(fullText)) {
    return 1;
  }

  if (
    /\b(?:pak(?:istan)?\s*studies|islamic\s*(?:studies|ethics)|islamiat|ethics|quranic|ideology|constitution)\b/i.test(
      fullText,
    )
  ) {
    return 2;
  }

  return 3;
}

export function getAllowedAbsents(creditHours: number): number {
  if (creditHours === 3) return 6;
  if (creditHours === 2) return 3;
  if (creditHours === 1) return 3;
  if (creditHours >= 4) return 8;
  return 6;
}

export function parseAttendancePage(
  root: ParentNode,
  form: ParentNode | null,
): ParsedAttendancePage {
  const courses = Array.from(root.querySelectorAll<HTMLElement>(".tab-pane")).map((pane) => {
    const rawHeading = readText(pane.querySelector("h5"), pane.id);
    const title = rawHeading.replace(/\(.*\)/, "").trim();
    const creditHours = getCourseCreditHours(rawHeading, pane.id);
    const allowedAbsents = getAllowedAbsents(creditHours);
    const percentage = parseNumber(
      pane.querySelector(".progress-bar")?.getAttribute("aria-valuenow"),
    );
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
      return [
        {
          date,
          day,
          time: readText(cells[2]),
          status: readText(cells[3]),
          type: readText(cells[4], "Lecture"),
        },
      ];
    });

    return {
      id: pane.id,
      title,
      creditHours,
      allowedAbsents,
      percentage,
      records,
      present: records.filter((record) => hasStatus(record, "P")).length,
      late: records.filter((record) => hasStatus(record, "L")).length,
      absent: records.filter((record) => hasStatus(record, "A")).length,
    };
  });

  return {
    alerts: parsePortalAlerts(root, ".alert"),
    courses,
    semesters: parseSemesterOptions(form),
  };
}
