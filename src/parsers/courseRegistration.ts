import { parsePortalAlerts, readText } from "./dom";
import type { PortalAlert, RegistrationTable } from "./types";

export type ParsedCourseRegistrationPage = {
  alerts: PortalAlert[];
  tables: RegistrationTable[];
};

export function parseCourseRegistrationPage(root: ParentNode): ParsedCourseRegistrationPage {
  const tables = Array.from(root.querySelectorAll<HTMLTableElement>("table")).flatMap((table) => {
    const headers = Array.from(table.querySelectorAll("thead th"), (header) => readText(header));
    const rows = Array.from(table.querySelectorAll("tbody tr"), (row) =>
      Array.from(row.querySelectorAll("td"), (cell) => cell.innerHTML),
    ).filter((cells) => cells.length > 0);
    if (rows.length === 0) return [];

    const portlet = table.closest(".m-portlet");
    return [{
      title: readText(portlet?.querySelector(".m-portlet__head-text"), "Course List"),
      headers,
      rows,
    }];
  });

  return { alerts: parsePortalAlerts(root), tables };
}
