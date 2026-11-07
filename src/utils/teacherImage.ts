import { httpUrlSchema } from "../schemas/common";

export function resolveFacultyImageUrl(src: string, pageUrl: string, baseHref?: string): string {
  if (!src) return "";
  let baseUrl = pageUrl;
  if (baseHref) {
    try {
      const declaredBase = httpUrlSchema.safeParse(new URL(baseHref, pageUrl).href);
      if (declaredBase.success) baseUrl = declaredBase.data;
    } catch {}
  }
  try {
    const parsed = httpUrlSchema.safeParse(new URL(src, baseUrl).href);
    return parsed.success ? parsed.data : "";
  } catch {
    return "";
  }
}

export function getTeacherImageUrl(image: string): string {
  const parsed = httpUrlSchema.safeParse(image);
  if (!parsed.success) return "";
  const url = new URL(parsed.data);
  const segments = url.pathname.split("/").filter(Boolean);
  if (
    url.hostname === "pwr.nu.edu.pk" &&
    ["cs-faculty", "ee-faculty", "ce-faculty", "sh-faculty", "hec-faculty"].includes(segments[0]) &&
    segments[1] === "images" &&
    segments[2] === "faculty"
  ) {
    url.pathname = `/${segments.slice(1).join("/")}`;
  }
  return url.href;
}
