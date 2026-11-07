export type SiteTheme = "light" | "dark";

export function readSiteTheme(): SiteTheme {
  try {
    return localStorage.getItem("superflex-theme-mode") === "dark" ? "dark" : "light";
  } catch {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  }
}

const moonIcon =
  '<svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6.5 6.5 0 0 0 8.268 8.268c.344-.215.825-.003.803.401"/></svg>';
const sunIcon =
  '<svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>';

export function applySiteTheme(mode: SiteTheme, persist = true) {
  const isDark = mode === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  if (persist) {
    try {
      localStorage.setItem("superflex-theme-mode", mode);
    } catch {}
  }
  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.setAttribute("aria-pressed", String(isDark));
    toggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
    toggle.innerHTML = `${isDark ? sunIcon : moonIcon}<span>${isDark ? "Light" : "Dark"}</span>`;
  }
  document.querySelectorAll<HTMLImageElement>("img[data-light-source]").forEach((logo) => {
    const lightSource = logo.dataset.lightSource;
    if (lightSource)
      logo.src = isDark ? lightSource.replace("logo-light.svg", "logo-dark.svg") : lightSource;
  });
}

if (typeof document !== "undefined") {
  const tailwind = (window as Window & { tailwind?: { config?: Record<string, unknown> } })
    .tailwind;
  if (tailwind) tailwind.config = { ...tailwind.config, darkMode: "class" };
  applySiteTheme(readSiteTheme(), false);
}
