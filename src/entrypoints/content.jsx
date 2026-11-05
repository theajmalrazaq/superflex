import { defineContentScript } from "wxt/utils/define-content-script";
import { createRoot } from "react-dom/client";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import LoginPageStyles from "../components/LoginPageStyles";
import PathRouter from "../components/PathRouter";
import { getExtensionUrl, sendExtensionMessage } from "../utils/extensionApi";
import "../styles/tailwind.css";

export default defineContentScript({
  matches: ["https://flexstudent.nu.edu.pk/*"],
  main() {
    sendExtensionMessage({ type: "SUPERFLEX_APPLY_DEFAULT_ZOOM" });

    (() => {
      const scriptUmami = document.createElement("script");
      scriptUmami.src = getExtensionUrl("scripts/umami.js");
      scriptUmami.defer = true;
      scriptUmami.dataset.websiteId = "17490ccf-0b15-4d8a-a908-5e774ad648de";
      if (scriptUmami.src) document.head.appendChild(scriptUmami);

      const scriptBridge = document.createElement("script");
      scriptBridge.src = getExtensionUrl("scripts/bridge.js");
      scriptBridge.defer = true;
      if (scriptBridge.src) document.head.appendChild(scriptBridge);
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

    const faviconUrl = getExtensionUrl("assets/favicon.svg");
    if (faviconUrl) favicon.href = faviconUrl;
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

    if (!isLoginPage) {
      const savedMode = localStorage.getItem("superflex-theme-mode") || "light";
      if (savedMode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      document.body.style.backgroundColor = "transparent";
    }

    root.render(
      <>
        <LoadingOverlay />
        {isLoginPage ? <LoginPageStyles /> : <PathRouter />}
      </>,
    );

    setTimeout(() => {
      document.body.classList.add("!visible");
    }, 450);
  },
});
