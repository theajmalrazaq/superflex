import React, { useEffect, useState } from "react";
import { usePreferencesStore } from "../stores/preferencesStore";
import { defineContentScript } from "wxt/utils/define-content-script";
import { createRoot } from "react-dom/client";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import LoginPageStyles from "../components/LoginPageStyles";
import PathRouter from "../components/PathRouter";
import { getExtensionUrl } from "../utils/extensionApi";
import { clearActiveStudentId } from "../utils/studentIdentity";
import { cleanStorageOnce } from "../utils/clean";
import { initGlobalPjaxLinkInterceptor } from "../utils/pjaxNavigator";
import {
  isStandaloneApp,
  checkPortalSession,
  loadLoginPortalDom,
} from "../utils/portalSession";
import "../styles/tailwind.css";

function AppRoot() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isBootstrapping, setIsBootstrapping] = useState(() => {
    return isStandaloneApp() && window.location.pathname.startsWith("/__app__");
  });

  const isLoginPage = ["/login", "/login/index", "/login/logout"].includes(
    currentPath.replace(/\/$/, "").toLowerCase(),
  );

  useEffect(() => {
    if (isLoginPage) {
      clearActiveStudentId();
    } else {
      const savedMode = usePreferencesStore.getState().themeMode;
      if (savedMode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      document.body.style.backgroundColor = "transparent";
    }
  }, [isLoginPage]);

  useEffect(() => {
    // 1. Standalone App Shell Bootstrapping
    if (isStandaloneApp() && window.location.pathname.startsWith("/__app__")) {
      async function bootstrap() {
        try {
          const res = await checkPortalSession();
          if (res.authenticated) {
            window.history.replaceState({ pjax: true, href: "/" }, "", "/");
            setCurrentPath("/");
          } else {
            await loadLoginPortalDom();
            window.history.replaceState({ pjax: true, href: "/Login" }, "", "/Login");
            setCurrentPath("/Login");
          }
        } catch (err) {
          console.warn("SuperFlex bootstrap error, defaulting to Login", err);
          await loadLoginPortalDom();
          window.history.replaceState({ pjax: true, href: "/Login" }, "", "/Login");
          setCurrentPath("/Login");
        } finally {
          setIsBootstrapping(false);
          document.body.classList.add("!visible");
          try {
            (globalThis as any).SFNative?.ready?.();
          } catch {}
        }
      }

      bootstrap();
    } else {
      setIsBootstrapping(false);
      setTimeout(() => {
        document.body.classList.add("!visible");
        try {
          (globalThis as any).SFNative?.ready?.();
        } catch {}
      }, 150);
    }

    // 2. Global route listeners
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    const handleCustomRoute = (e: any) => {
      if (e.detail) {
        setCurrentPath(e.detail);
      }
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("superflex-route-change" as any, handleCustomRoute);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("superflex-route-change" as any, handleCustomRoute);
    };
  }, []);

  return (
    <>
      <LoadingOverlay show={isBootstrapping} />
      {isLoginPage ? <LoginPageStyles /> : <PathRouter currentPath={currentPath} />}
    </>
  );
}

export default defineContentScript({
  matches: ["https://flexstudent.nu.edu.pk/*"],
  async main() {
    if ((globalThis as any).__superflex_loaded) return;
    (globalThis as any).__superflex_loaded = true;

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

    let container = document.getElementById("react-chrome-app");
    if (!container) {
      container = document.createElement("div");
      container.id = "react-chrome-app";
      document.body.insertBefore(container, document.body.firstChild);
    }

    const root = createRoot(container);

    if (globalThis.chrome?.runtime?.onMessage?.addListener) {
      chrome.runtime.onMessage.addListener((message, sender) => {
        if (sender?.id === chrome?.runtime?.id && message?.type === "SUPERFLEX_AI_KEY_UPDATED") {
          window.dispatchEvent(new CustomEvent("superflex-ai-key-updated"));
        }
      });
    }

    // Intercept internal relative links to use PJAX
    initGlobalPjaxLinkInterceptor();

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

    root.render(<AppRoot />);
  },
});
