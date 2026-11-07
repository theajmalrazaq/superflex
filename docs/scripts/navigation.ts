import { applySiteTheme, readSiteTheme } from "./theme";

export function initSiteNavigation() {
  applySiteTheme(readSiteTheme(), false);
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    applySiteTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");
  });
  window.addEventListener("storage", (event) => {
    if (event.key === "superflex-theme-mode" || event.key === null)
      applySiteTheme(readSiteTheme(), false);
  });
  const mobileToggle = document.getElementById("mobile-toggle");
  const mobileOverlay = document.getElementById("mobile-overlay");
  if (!mobileToggle || !mobileOverlay) return;
  const setMenuOpen = (open: boolean) => {
    mobileOverlay.classList.toggle("active", open);
    mobileOverlay.classList.toggle("pointer-events-none", !open);
    mobileOverlay.setAttribute("aria-hidden", String(!open));
    mobileOverlay.inert = !open;
    mobileToggle.setAttribute("aria-expanded", String(open));
    mobileToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    const line1 = document.getElementById("line1");
    const line2 = document.getElementById("line2");
    if (line1) line1.style.transform = open ? "rotate(45deg) translateY(4px)" : "none";
    if (line2) line2.style.transform = open ? "rotate(-45deg) translateY(-4px)" : "none";
    const nav = document.getElementById("main-nav");
    nav?.classList.toggle("bg-white/10", open);
    nav?.classList.toggle("border-[#a098ff]/30", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  setMenuOpen(false);
  mobileToggle.addEventListener("click", () =>
    setMenuOpen(!mobileOverlay.classList.contains("active")),
  );
  mobileOverlay
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", () => setMenuOpen(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });
}
