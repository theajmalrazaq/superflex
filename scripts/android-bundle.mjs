import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const web = join(root, "android", "assets", "web");
const shimdir = join(root, "android", "shim");

function read(path) {
  return readFileSync(path, "utf8");
}

function stop(text) {
  console.error(text);
  process.exit(1);
}

function extractCssBlock(css, marker) {
  const start = css.indexOf(marker);
  if (start === -1) stop("Missing CSS marker: " + marker);
  let depth = 0;
  let opened = false;
  for (let i = start; i < css.length; i += 1) {
    if (css[i] === "{") {
      depth += 1;
      opened = true;
    } else if (css[i] === "}" && opened) {
      depth -= 1;
      if (depth === 0) return css.slice(start, i + 1);
    }
  }
  stop("Unclosed CSS block: " + marker);
}

function buildSplashHtml() {
  const tailwindCss = read(join(root, "src", "styles", "tailwind.css"));
  const loadingCss = read(join(root, "src", "styles", "loading.css"));

  const rootVars = extractCssBlock(tailwindCss, ":root {");
  const oklabSupports = extractCssBlock(
    tailwindCss,
    "@supports (background: linear-gradient(in oklab, #000, #fff))",
  );
  const ditherOverlay = extractCssBlock(loadingCss, ".dark .loading-overlay");
  const cloudLeftDark = extractCssBlock(loadingCss, ".dark .loading-overlay .overlay-cloud-left");
  const cloudRightDark = extractCssBlock(loadingCss, ".dark .loading-overlay .overlay-cloud-right");
  const fadeOutRule = extractCssBlock(loadingCss, ".loading-overlay.fade-out");
  const splashKeyframes = extractCssBlock(loadingCss, "@keyframes splash");
  const splashAnimClass = extractCssBlock(loadingCss, ".animate-splash");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<script>
(function () {
  var theme = new URLSearchParams(location.search).get("theme");
  var dark = theme ? theme === "dark" : !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
})();
</script>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
${rootVars}
${oklabSupports}
.loading-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--superflex-light-loading-gradient);
  opacity: 1;
  visibility: visible;
  transform: scale(1);
  transition:
    opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    visibility 0.6s;
  will-change: opacity, transform;
  overflow: hidden;
}
${ditherOverlay}
.dark .loading-overlay::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: var(--superflex-dark-dither);
  background-repeat: repeat;
  background-size: 128px 128px;
  image-rendering: pixelated;
  opacity: 0.032;
  -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 45%, transparent 82%);
  mask-image: linear-gradient(180deg, #000 0%, #000 45%, transparent 82%);
}
.overlay-cloud-left {
  position: absolute;
  left: -3rem;
  top: 2.5rem;
  width: 20rem;
  height: auto;
  opacity: 0.8;
  pointer-events: none;
}
.overlay-cloud-right {
  position: absolute;
  right: -4rem;
  bottom: 4rem;
  width: 22rem;
  height: auto;
  opacity: 0.75;
  pointer-events: none;
}
@media (min-width: 640px) {
  .overlay-cloud-left { width: 24rem; }
  .overlay-cloud-right { width: 28rem; }
}
${cloudLeftDark}
${cloudRightDark}
${fadeOutRule}
.splash-card {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  overflow: hidden;
  border-radius: 28%;
  border: 1px solid rgb(255 255 255 / 0.4);
  background: rgb(255 255 255 / 0.6);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  color: #230052;
}
.dark .splash-card {
  border-color: rgb(255 255 255 / 0.1);
  background: rgb(0 0 0 / 0.4);
  color: #ffffff;
}
.splash-bolt {
  position: relative;
  z-index: 10;
  display: block;
}
${splashKeyframes}
${splashAnimClass}
</style>
</head>
<body>
  <div id="splash-overlay" aria-hidden="true" class="loading-overlay">
    <img src="assets/clouds/cloud-2.webp" alt="" class="overlay-cloud-left" />
    <img src="assets/clouds/cloud-2.webp" alt="" class="overlay-cloud-right" />
    <div class="splash-card">
      <svg class="splash-bolt" viewBox="0 0 24 24" width="56" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" class="animate-splash" d="M13.295 10.769l2.552-5.787-7.979 7.28 3.254.225-3.353 6.362 8.485-7.388-2.959-.692z" />
      </svg>
    </div>
  </div>
<script>
window.setTheme = function (dark) {
  document.documentElement.classList.toggle("dark", Boolean(dark));
};
window.fadeOutSplash = function () {
  var el = document.getElementById("splash-overlay");
  if (el) el.classList.add("fade-out");
};
window.resetSplash = function () {
  var el = document.getElementById("splash-overlay");
  if (!el) return;
  el.classList.remove("fade-out");
  void el.offsetWidth;
};
</script>
</body>
</html>
`;
}

function main() {
  const need = [
    "background.js",
    "content-scripts/content.js",
    "content-scripts/content.css",
    "bridge.js",
  ];
  for (const item of need) {
    if (!existsSync(join(dist, item))) stop("Missing " + item + ". Run the wxt build first.");
  }
  const version = JSON.parse(read(join(root, "package.json"))).version;
  const shim = read(join(shimdir, "shim.js")).replace("__VERSION__", version);
  const tail = read(join(shimdir, "tail.js"));
  const bg = read(join(dist, "background.js"));
  const ct = read(join(dist, "content-scripts", "content.js"));

  const parts = [
    "(function(){",
    'if(location.origin!=="https://flexstudent.nu.edu.pk"||window.__superflex)return;',
    "window.__superflex=true;",
    shim,
    "(function(chrome,fetch){",
    bg,
    "\n})(bgchrome,remotefetch);",
    "(function(chrome){",
    ct,
    "\n})(ctchrome);",
    tail,
    "})();",
  ];

  rmSync(web, { recursive: true, force: true });
  mkdirSync(web, { recursive: true });
  writeFileSync(join(web, "superflex.js"), parts.join("\n"));
  cpSync(join(dist, "content-scripts", "content.css"), join(web, "content.css"));
  cpSync(join(dist, "bridge.js"), join(web, "bridge.js"));
  cpSync(join(dist, "reviews.json"), join(web, "reviews.json"));
  cpSync(join(dist, "assets"), join(web, "assets"), { recursive: true });
  writeFileSync(join(web, "splash.html"), buildSplashHtml());
  writeFileSync(join(web, "early.js"), read(join(shimdir, "early.js")));
  writeFileSync(join(web, "main.js"), read(join(shimdir, "main.js")));
  console.log("Android web bundle ready in " + web);
}

main();
