import { createRoot } from "react-dom/client";
import LoadingOverlay from "./components/ui/LoadingOverlay";
import LoginPageStyles from "./components/LoginPageStyles";
import PathRouter from "./components/PathRouter";
import { safeGetURL } from "./utils/chromeUtils";
import "./styles/tailwind.css";

(() => {
  const scripts = [
    { src: "scripts/umami.js", id: "umami-script" },
    { src: "scripts/puter.js", id: "puter-script" },
    { src: "scripts/bridge.js", id: "bridge-script" },
  ];

  scripts.forEach((s) => {
    const url = safeGetURL(s.src);
    if (url) {
      const script = document.createElement("script");
      script.src = url;
      script.defer = true;
      if (s.src.includes("umami")) {
        script.dataset.websiteId = "17490ccf-0b15-4d8a-a908-5e774ad648de";
      }
      document.head.appendChild(script);
    }
  });
})();

const fontLinks = [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap",
  },
];

fontLinks.forEach((linkDef) => {
  if (!document.querySelector(`link[href="${linkDef.href}"]`)) {
    const link = document.createElement("link");
    link.rel = linkDef.rel;
    link.href = linkDef.href;
    if (linkDef.crossOrigin) {
      link.crossOrigin = "";
    }
    document.head.appendChild(link);
  }
});

const container = document.createElement("div");
container.id = "react-chrome-app";
document.body.insertBefore(container, document.body.firstChild);

const root = createRoot(container);

const isLoginPage = window.location.href.includes("Login");

if (document.getElementById("overlay23")) {
  document.getElementById("overlay23").remove();
}

let favicon = document.querySelector("link[rel~='icon']");
if (!favicon) {
  favicon = document.createElement("link");
  favicon.rel = "icon";
  document.head.appendChild(favicon);
}

favicon.href = safeGetURL("assets/favicon.svg") || favicon.href;
document.title = "Superflex";

if (document.querySelector(".m-grid__item.m-footer")) {
  document.querySelector(".m-grid__item.m-footer").remove();
}

const unwantedCss = document.querySelector(
  'link[href="/Assets/demo/demo3/base/style.bundle.css"]',
);
if (unwantedCss) {
  unwantedCss.remove();
}

const unwantedVendorsCss = document.querySelector(
  'link[href="/Assets/vendors/base/vendors.bundle.css"]',
);
if (unwantedVendorsCss) {
  unwantedVendorsCss.remove();
}

document.body.style.fontFamily = "'Google Sans Flex', sans-serif";
document.querySelectorAll("input").forEach((input) => {
  input.style.fontFamily = "'Google Sans Flex', sans-serif";
});
document.querySelectorAll("button").forEach((button) => {
  button.style.fontFamily = "'Google Sans Flex', sans-serif";
});

document.documentElement.classList.add("dark");
document.body.style.backgroundColor = "black";

const bgUrl = safeGetURL("assets/overlay.png");
if (bgUrl) {
  document.body.style.backgroundImage = `url("${bgUrl}")`;
}
document.body.style.backgroundRepeat = "no-repeat";

root.render(
  <>
    <LoadingOverlay />
    {isLoginPage ? <LoginPageStyles /> : <PathRouter />}
  </>,
);

setTimeout(() => {
  document.body.classList.add("!visible");
}, 500);
