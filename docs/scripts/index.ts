import { reviewsSchema, type Review } from "../../src/schemas/reviews";

const modal = document.getElementById("video-modal");
const openModalBtn = document.getElementById("how-to-use-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const modalBackdrop = document.getElementById("modal-backdrop");
const tutorialVideo = document.getElementById("tutorial-video") as HTMLVideoElement | null;

if (openModalBtn) {
  openModalBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
  });
}

const closeModal = () => {
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.body.style.overflow = "auto";
    if (tutorialVideo) tutorialVideo.pause();
  }
};

if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);

if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
    closeModal();
  }
});

const generateReviewCards = (items: Review[]): DocumentFragment => {
  const fragment = document.createDocumentFragment();
  for (const item of items) {
    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML =
      '<div class="review-header"><div class="review-user-info"><span class="review-name"></span><span class="review-verified">Student Verified</span></div></div><p class="review-comment"></p>';
    card.querySelector(".review-name")!.textContent = item.name;
    card.querySelector(".review-comment")!.textContent = `"${item.comment}"`;
    fragment.appendChild(card);
  }
  return fragment;
};

fetch("reviews.json")
  .then((res) => res.json())
  .then((data: unknown) => {
    const reviews = reviewsSchema.parse(data);
    const track = document.getElementById("review-track");
    if (track) {
      const subset = reviews.slice(0, 20);
      track.replaceChildren(generateReviewCards(subset), generateReviewCards(subset));
    }
  })
  .catch((err) => {
    console.error("Failed to load reviews:", err);
    const track = document.getElementById("review-track");
    if (track) {
      track.innerHTML = '<p class="text-zinc-500 text-sm">Feedback loading...</p>';
    }
  });

const mobileToggle = document.getElementById("mobile-toggle");
const mobileOverlay = document.getElementById("mobile-overlay");
const line1 = document.getElementById("line1");
const line2 = document.getElementById("line2");
const navPill = document.getElementById("main-nav");

const themeToggle = document.getElementById("theme-toggle");
const applyTheme = (mode) => {
  const isDark = mode === "dark";
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem("superflex-theme-mode", isDark ? "dark" : "light");
  document
    .querySelectorAll<HTMLImageElement>(
      'img[data-light-source], img[src$="logo-light.svg"], img[src$="logo-dark.svg"]',
    )
    .forEach((logo) => {
      const lightSource =
        logo.dataset.lightSource ||
        logo.getAttribute("src").replace("logo-dark.svg", "logo-light.svg");
      logo.dataset.lightSource = lightSource;
      logo.src = isDark ? lightSource.replace("logo-light.svg", "logo-dark.svg") : lightSource;
    });
  themeToggle?.setAttribute("aria-pressed", String(isDark));
  themeToggle?.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
  if (themeToggle)
    themeToggle.innerHTML = `${isDark ? '<svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>' : '<svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6.5 6.5 0 0 0 8.268 8.268c.344-.215.825-.003.803.401"/></svg>'}<span>${isDark ? "Light" : "Dark"}</span>`;
};
applyTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
themeToggle?.addEventListener("click", () =>
  applyTheme(document.documentElement.classList.contains("dark") ? "light" : "dark"),
);

if (mobileToggle) {
  mobileToggle.addEventListener("click", () => {
    const isActive = mobileOverlay.classList.toggle("active");
    mobileOverlay.classList.toggle("pointer-events-none");

    if (isActive) {
      line1.style.transform = "rotate(45deg) translateY(4px)";
      line2.style.transform = "rotate(-45deg) translateY(-4px)";
      navPill.classList.add("bg-white/10", "border-[#a098ff]/30");
      document.body.style.overflow = "hidden";
    } else {
      line1.style.transform = "none";
      line2.style.transform = "none";
      navPill.classList.remove("bg-white/10", "border-[#a098ff]/30");
      document.body.style.overflow = "auto";
    }
  });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (this: HTMLAnchorElement, e) {
    const href = this.getAttribute("href");

    if (href && href.startsWith("#") && href.length > 1) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  });
});
