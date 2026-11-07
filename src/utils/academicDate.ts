import * as z from "zod/mini";

const isoDateSchema = z.iso.date();
function calendarDate(year: string, month: string, day: string): Date | null {
  const iso = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  if (!isoDateSchema.safeParse(iso).success) return null;
  const date = new Date(0);
  date.setFullYear(Number(year), Number(month) - 1, Number(day));
  date.setHours(0, 0, 0, 0);
  return date;
}

export function parseAcademicDate(
  value: unknown,
  dateOrder: "month-first" | "day-first" = "month-first",
): Date | null {
  const text = String(value || "").trim();
  const iso = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (iso) return calendarDate(iso[1], iso[2], iso[3]);

  const first = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (first) {
    const [, a, b, year] = first;
    const day = dateOrder === "day-first" ? a : b;
    const month = dateOrder === "day-first" ? b : a;
    return calendarDate(year, month, day);
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
