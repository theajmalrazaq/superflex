import { usePreferencesStore } from "../stores/preferencesStore";
import { defineContentScript } from "wxt/utils/define-content-script";
import { createRoot } from "react-dom/client";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import LoginPageStyles from "../components/LoginPageStyles";
import PathRouter from "../components/PathRouter";
import { getExtensionUrl } from "../utils/extensionApi";
import { clearActiveStudentId } from "../utils/studentIdentity";
import { cleanStorageOnce } from "../utils/clean";
import "../styles/tailwind.css";

export default defineContentScript({
  matches: ["https://flexstudent.nu.edu.pk/*"],
  async main() {
    try {
      if (await cleanStorageOnce()) {
        sessionStorage.clear();
        window.location.reload();
        return;
      }
    } catch (error) {
      console.error("SuperFlex storage reset failed", error);
    }

    (() => {
      const scriptBridge = document.createElement("script");
      scriptBridge.src = getExtensionUrl("bridge.js");
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
      if (!document.querySelector<HTMLElement>(`link[href="${linkDef.href}"]`)) {
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

    chrome.runtime.onMessage.addListener((message, sender) => {
      if (sender.id === chrome.runtime.id && message?.type === "SUPERFLEX_AI_KEY_UPDATED") {
        window.dispatchEvent(new CustomEvent("superflex-ai-key-updated"));
      }
    });

    const loginPaths = new Set(["/login", "/login/index", "/login/logout"]);
    const isLoginPage = loginPaths.has(window.location.pathname.replace(/\/$/, "").toLowerCase());
    if (isLoginPage) clearActiveStudentId();

    if (document.getElementById("overlay23")) {
      document.getElementById("overlay23").remove();
    }

    let favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    const faviconUrl = getExtensionUrl("assets/favicon.svg");
    if (faviconUrl) favicon.href = faviconUrl;
    document.title = "Superflex";

    if (document.querySelector<HTMLElement>(".m-grid__item.m-footer")) {
      document.querySelector<HTMLElement>(".m-grid__item.m-footer").remove();
    }

    const unwantedCss = document.querySelector<HTMLLinkElement>(
      'link[href="/Assets/demo/demo3/base/style.bundle.css"]',
    );
    if (unwantedCss) {
      unwantedCss.remove();
    }

    const unwantedVendorsCss = document.querySelector<HTMLLinkElement>(
      'link[href="/Assets/vendors/base/vendors.bundle.css"]',
    );
    if (unwantedVendorsCss) {
      unwantedVendorsCss.remove();
    }

    document.body.style.fontFamily = "'Google Sans Flex', sans-serif";
    document.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
      input.style.fontFamily = "'Google Sans Flex', sans-serif";
    });
    document.querySelectorAll<HTMLElement>("button").forEach((button) => {
      button.style.fontFamily = "'Google Sans Flex', sans-serif";
    });

    if (!isLoginPage) {
      const savedMode = usePreferencesStore.getState().themeMode;
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
      try {
        (globalThis as any).SFNative?.ready?.();
      } catch {}
    }, 450);
  },
});
