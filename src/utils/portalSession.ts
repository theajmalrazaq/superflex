import { clearActiveStudentId } from "./studentIdentity";
import { pageCache } from "./pjaxNavigator";

export function isStandaloneApp(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.location?.pathname?.startsWith("/__app__") ||
    (window as any).SFNative ||
    (typeof document !== "undefined" && document.body?.classList.contains("superflex-standalone")),
  );
}

export interface SessionCheckResult {
  authenticated: boolean;
  html?: string;
}

/**
 * Checks whether the student has an active ASP.NET session.
 * If authenticated, populates the hidden DOM container with the profile page.
 */
export async function checkPortalSession(): Promise<SessionCheckResult> {
  if (typeof window === "undefined") return { authenticated: false };

  try {
    const res = await fetch("/Student/StudentProfile", {
      credentials: "include",
      headers: { "X-Requested-With": "SuperFlex-SessionCheck" },
    });

    const isLogin =
      !res.ok ||
      res.url.toLowerCase().includes("/login") ||
      res.redirected;

    if (isLogin) {
      return { authenticated: false };
    }

    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    // If response body contains login markers, session is expired
    if (doc.querySelector(".m-login") !== null || doc.querySelector('form[action*="Login"]')) {
      return { authenticated: false };
    }

    const nextRoot = doc.querySelector<HTMLElement>(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
    );
    const portalRoot = document.querySelector<HTMLElement>(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
    );

    if (nextRoot && portalRoot) {
      portalRoot.innerHTML = nextRoot.innerHTML;
      pageCache.set("/", portalRoot.innerHTML);
    }

    return { authenticated: true, html };
  } catch (error) {
    console.warn("SuperFlex session check failed", error);
    return { authenticated: false };
  }
}

/**
 * Fetches the raw ASP.NET login portal and mounts it into the designated login container.
 */
export async function loadLoginPortalDom(): Promise<boolean> {
  if (typeof document === "undefined") return false;

  try {
    const res = await fetch("/Login", {
      credentials: "include",
      headers: { "X-Requested-With": "SuperFlex-LoginMount" },
    });

    if (!res.ok) return false;

    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    const loginNode =
      doc.querySelector<HTMLElement>(".m-grid.m-grid--hor.m-grid--root.m-page") ||
      doc.querySelector<HTMLElement>(".m-login") ||
      doc.body;

    let target = document.getElementById("superflex-login-container");
    if (!target) {
      target = document.createElement("div");
      target.id = "superflex-login-container";
      document.body.appendChild(target);
    }

    if (loginNode) {
      target.innerHTML = loginNode.outerHTML;
      return true;
    }
    return false;
  } catch (error) {
    console.error("SuperFlex failed to load login portal DOM", error);
    return false;
  }
}

/**
 * Handles smooth in-memory login submission without triggering a full WebView reload.
 */
export async function performStandaloneLogin(
  loginForm: HTMLFormElement,
): Promise<{ success: boolean; error?: string }> {
  try {
    const formData = new FormData(loginForm);
    const actionUrl = loginForm.action || "/Login/Login";

    const res = await fetch(actionUrl, {
      method: "POST",
      body: new URLSearchParams(formData as any),
      credentials: "include",
    });

    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");

    const isLoginFailure =
      doc.querySelector(".m-login") !== null ||
      res.url.toLowerCase().includes("/login");

    if (isLoginFailure) {
      const errEl =
        doc.querySelector(".m-alert__text") ||
        doc.querySelector("#m_inputmask_4-error") ||
        doc.querySelector(".m-alert");
      const msg = errEl?.textContent?.trim() || "Invalid Roll Number or Password";

      return { success: false, error: msg };
    }

    // Login succeeded! Update DOM with returned or fetched dashboard
    const portalRoot = document.querySelector<HTMLElement>(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
    );
    const nextRoot = doc.querySelector<HTMLElement>(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
    );

    if (nextRoot && portalRoot) {
      portalRoot.innerHTML = nextRoot.innerHTML;
      pageCache.set("/", portalRoot.innerHTML);
    } else {
      const profRes = await fetch("/Student/StudentProfile", { credentials: "include" });
      if (profRes.ok) {
        const profHtml = await profRes.text();
        const profDoc = new DOMParser().parseFromString(profHtml, "text/html");
        const profRoot = profDoc.querySelector<HTMLElement>(
          ".m-grid.m-grid--hor.m-grid--root.m-page",
        );
        if (portalRoot && profRoot) {
          portalRoot.innerHTML = profRoot.innerHTML;
          pageCache.set("/", portalRoot.innerHTML);
        }
      }
    }

    // Clean up login container
    const loginContainer = document.getElementById("superflex-login-container");
    if (loginContainer) loginContainer.innerHTML = "";

    window.history.pushState({ pjax: true, href: "/" }, "", "/");
    window.dispatchEvent(new CustomEvent("superflex-route-change", { detail: "/" }));
    window.dispatchEvent(new PopStateEvent("popstate"));

    return { success: true };
  } catch (error) {
    console.warn("In-memory login error, submitting form natively", error);
    loginForm.submit();
    return { success: false, error: "Network error occurred. Falling back to browser submit." };
  }
}

/**
 * Handles smooth logout without full WebView destruction.
 */
export async function performStandaloneLogout(): Promise<void> {
  try {
    await fetch("/Login/logout", { credentials: "include" });
  } catch {}

  clearActiveStudentId();
  await loadLoginPortalDom();

  window.history.pushState({ pjax: true, href: "/Login" }, "", "/Login");
  window.dispatchEvent(new CustomEvent("superflex-route-change", { detail: "/Login" }));
  window.dispatchEvent(new PopStateEvent("popstate"));
}
