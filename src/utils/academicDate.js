export function parseAcademicDate(value, dateOrder = "month-first") {
  const text = String(value || "").trim();
  const iso = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  const first = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (first) {
    const [, a, b, year] = first;
    const day = dateOrder === "day-first" ? a : b;
    const month = dateOrder === "day-first" ? b : a;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
