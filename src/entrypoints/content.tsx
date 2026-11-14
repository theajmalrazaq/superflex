import { usePreferencesStore } from "../stores/preferencesStore";
import { defineContentScript } from "wxt/utils/define-content-script";
import { createRoot } from "react-dom/client";
import LoadingOverlay from "../components/ui/LoadingOverlay";
import LoginPageStyles from "../components/LoginPageStyles";
import PathRouter from "../components/PathRouter";
import { getExtensionUrl } from "../utils/extensionApi";
import { clearActiveStudentId } from "../utils/studentIdentity";
import { cleanStorageOnce } from "../utils/clean";
import { isInternalNavigationAnchor, startNavigationLoading } from "../utils/navigationLoading";
import "../styles/tailwind.css";

export default defineContentScript({
  matches: ["https://flexstudent.nu.edu.pk/*"],
  async main() {
    const hasNativeLoader = Boolean((globalThis as { SFNative?: unknown }).SFNative);

    try {
      if (await cleanStorageOnce()) {
        sessionStorage.clear();
        if (!hasNativeLoader) {
          window.location.reload();
          return;
        }
      }
    } catch (error) {
      console.error("SuperFlex storage reset failed", error);
    }

    const loginPaths = new Set(["/login", "/login/index", "/login/logout"]);
    const isLoginPage = loginPaths.has(window.location.pathname.replace(/\/$/, "").toLowerCase());

    const isSessionExpired = () => {
      const txt = (
        (document.body?.textContent || "") +
        " " +
        (document.title || "") +
        " " +
        (document.querySelector<HTMLElement>("h1")?.textContent || "")
      )
        .toLowerCase()
        .replace(/\s+/g, " ");

      return [
        "server error",
        "runtime error",
        "internal server error",
        "server error in '/' application",
        "application error",
        "custom error settings",
      ].some((err) => txt.includes(err));
    };

    if (!isLoginPage && isSessionExpired()) {
      startNavigationLoading();
      window.location.replace("/Login");
      return;
    }

    if (isLoginPage) clearActiveStudentId();

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

    if (globalThis.chrome?.runtime?.onMessage?.addListener) {
      chrome.runtime.onMessage.addListener((message, sender) => {
        if (sender?.id === chrome?.runtime?.id && message?.type === "SUPERFLEX_AI_KEY_UPDATED") {
          window.dispatchEvent(new CustomEvent("superflex-ai-key-updated"));
        }
      });
    }

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

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (isInternalNavigationAnchor(anchor, event)) {
        startNavigationLoading();
      }
    });

    const toastObserver = new MutationObserver(() => {
      const toastContainer = document.getElementById("toast-container");
      if (
        toastContainer &&
        toastContainer.parentElement &&
        toastContainer.parentElement !== document.body
      ) {
        document.body.appendChild(toastContainer);
      }
      if (toastContainer) {
        toastContainer.querySelectorAll<HTMLElement>(".toast").forEach((toast) => {
          const existingBtn = toast.querySelector<HTMLElement>(".toast-close-button");
          if (!existingBtn) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "toast-close-button";
            btn.setAttribute("aria-label", "Dismiss notification");
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
            btn.addEventListener("click", (e) => {
              e.stopPropagation();
              e.preventDefault();
              toast.style.opacity = "0";
              toast.style.transform = "translateY(-6px) scale(0.96)";
              setTimeout(() => toast.remove(), 200);
            });
            toast.appendChild(btn);
          } else if (!existingBtn.querySelector("svg")) {
            existingBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
          }
        });
      }
    });
    toastObserver.observe(document.documentElement, { childList: true, subtree: true });

    root.render(
      <>
        {!hasNativeLoader && <LoadingOverlay />}
        {isLoginPage ? <LoginPageStyles /> : <PathRouter />}
      </>,
    );

    const revealDelayMs = hasNativeLoader ? 120 : 450;

    setTimeout(() => {
      document.body.classList.add("!visible");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            try {
              (globalThis as { SFNative?: { ready?: () => void } }).SFNative?.ready?.();
            } catch {
              // Ignore native bridge errors in browser environments.
            }
          }, 120);
        });
      });
    }, revealDelayMs);
  },
});
