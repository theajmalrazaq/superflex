declare const marked: { parse(markdown: string): string };

const urlParams = new URLSearchParams(window.location.search);
const page = urlParams.get("page") || "guide";

const pages: Record<
  string,
  { file: string; tag: string; title: string; subtitle: string; image: string }
> = {
  guide: {
    file: "articles/superflexai.md",
    tag: "Guide",
    title: "SuperFlex AI Guide",
    subtitle:
      "A comprehensive guide to unlocking the full potential of SuperFlex AI models with advanced prompting techniques.",
    image: "res/prompt.png",
  },
  technical: {
    file: "articles/bts.md",
    tag: "Technical",
    title: "Behind the Scenes",
    subtitle:
      'A deep dive into the engineering decisions, "Parasitic Overlay" pattern, and security implementations.',
    image: "res/bts.png",
  },
  privacy: {
    file: "articles/privacy.md",
    tag: "Policy",
    title: "Privacy & Data Security",
    subtitle:
      "Our commitment to your security, transparency in how we handle your academic data, and your rights.",
    image: "res/privacy.png",
  },
};

const currentPage = pages[page] || pages.guide;

const setActiveNav = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove("text-zinc-400", "hover:text-white", "hover:bg-white/5");
    el.classList.add("nav-active", "border");
    el.setAttribute("aria-current", "page");
  }
};

if (page === "guide") setActiveNav("nav-guide");
if (page === "technical") setActiveNav("nav-technical");
if (page === "privacy") setActiveNav("nav-privacy");

document.getElementById("page-tag").textContent = currentPage.tag;
document.getElementById("hero-title").textContent = currentPage.title;
document.getElementById("hero-subtitle").textContent = currentPage.subtitle;

if (currentPage.image) {
  const bgContainer = document.createElement("div");
  bgContainer.className =
    "absolute top-0 left-0 w-full h-[800px] z-0 overflow-hidden pointer-events-none select-none";

  const bgImage = document.createElement("div");
  bgImage.className = "w-full h-full opacity-10";
  bgImage.style.backgroundImage = `url(${currentPage.image})`;
  bgImage.style.backgroundSize = "cover";
  bgImage.style.backgroundPosition = "center top";
  bgImage.style.backgroundRepeat = "no-repeat";

  bgImage.style.maskImage =
    "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 100%)";
  bgImage.style.webkitMaskImage =
    "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 100%)";

  bgContainer.appendChild(bgImage);

  document.body.prepend(bgContainer);
}

const generateTOC = () => {
  const content = document.getElementById("markdown-content");

  if (content) {
    const wordCount = content.innerText.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    const rtEl = document.getElementById("read-time");
    if (rtEl) rtEl.textContent = `${readTime} min read`;
  }
};

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

async function loadContent() {
  try {
    const response = await fetch(currentPage.file);
    if (!response.ok) throw new Error("File not found");
    const text = await response.text();

    const cleanText = text.replace(/^---[\s\S]*?---\n/, "");

    document.getElementById("markdown-content").innerHTML = marked.parse(cleanText);

    requestAnimationFrame(() => {
      generateTOC();
    });
  } catch (e) {
    console.error(e);
    document.getElementById("markdown-content").innerHTML = `
         <div class="p-4 border border-red-500/20 bg-red-500/10 rounded-lg text-red-400">
            Failed to load content: ${e.message}
         </div>
      `;
  }
}

loadContent();
