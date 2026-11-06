import type { PortalAlert, SemesterOption } from "./types";

export function findFlexPageRoot(document: Document): HTMLElement | null {
  return document.querySelector<HTMLElement>(".m-grid.m-grid--hor.m-grid--root.m-page");
}

export const readText = (element: Element | null | undefined, fallback = ""): string =>
  element?.textContent?.replace(/\s+/g, " ").trim() || fallback;

export const parseNumber = (value: string | null | undefined, fallback = 0): number => {
  const parsed = Number.parseFloat(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const parseInteger = (value: string | null | undefined, fallback = 0): number => {
  const parsed = Number.parseInt(String(value ?? "").replace(/,/g, "").trim(), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function parsePortalAlerts(root: ParentNode, selector = ".m-alert, .alert"): PortalAlert[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).flatMap((alert) => {
    if (alert.style.display === "none" || alert.id === "DataErrormsgdiv" || alert.closest(".modal")) {
      return [];
    }

    const clone = (alert.querySelector(".m-alert__text") || alert).cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".m-alert__close, button, a, strong, .m-alert__icon").forEach((el) => el.remove());
    const message = (clone.textContent || "")
      .replace(/Alert!/gi, "")
      .replace(/Close/gi, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (message.length <= 3) return [];
    return [{
      type: alert.classList.contains("alert-danger") || alert.classList.contains("m-alert--outline-danger")
        ? "error" as const
        : "info" as const,
      message,
    }];
  });
}

export function parseSemesterOptions(form: ParentNode | null): SemesterOption[] {
  const select = form?.querySelector("select");
  if (!(select instanceof HTMLSelectElement)) return [];
  return Array.from(select.options).map((option) => ({
    label: option.text.trim(),
    value: option.value,
    selected: option.selected,
  }));
}

export function hideFlexPageRoot(root: HTMLElement | null): void {
  if (!root) return;
  root.style.position = "fixed";
  root.style.top = "0";
  root.style.left = "0";
  root.style.width = "0";
  root.style.height = "0";
  root.style.overflow = "hidden";
  root.style.opacity = "0";
  root.style.pointerEvents = "none";
  root.style.zIndex = "-9999";
}
