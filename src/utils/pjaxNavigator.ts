/**
 * Smooth in-memory PJAX navigation for SuperFlex.
 * Replaces hard full-page browser reloads with asynchronous DOM swaps,
 * eliminating the white screen / loading flash on Android WebView and desktop.
 */

let isNavigating = false;
let navigationAbortController: AbortController | null = null;
const pageCache = new Map<string, string>();

export function getIsNavigating(): boolean {
  return isNavigating;
}

/**
 * Saves current page portal container into in-memory cache
 */
export function cacheCurrentPage(): void {
  if (typeof document === "undefined") return;
  const currentRoot = document.querySelector<HTMLElement>(
    ".m-grid.m-grid--hor.m-grid--root.m-page",
  );
  if (currentRoot && currentRoot.innerHTML) {
    pageCache.set(window.location.pathname, currentRoot.innerHTML);
  }
}

/**
 * Perform smooth in-memory navigation without destroying the WebView context
 */
export async function pjaxNavigate(href: string): Promise<boolean> {
  if (typeof window === "undefined" || !href || href === "#") return false;

  let targetUrl: URL;
  try {
    targetUrl = new URL(href, window.location.origin);
  } catch {
    window.location.href = href;
    return false;
  }

  // Cross-origin: let standard browser navigation handle it
  if (targetUrl.origin !== window.location.origin) {
    window.location.href = href;
    return false;
  }

  const targetPath = targetUrl.pathname;
  const currentPath = window.location.pathname;

  // Same page: do nothing
  if (targetPath === currentPath && targetUrl.search === window.location.search) {
    return true;
  }

  // Auth / Login / Logout: perform full reload to clear credentials cleanly
  const authPaths = ["/login", "/login/index", "/login/logout"];
  if (authPaths.includes(targetPath.toLowerCase())) {
    window.location.href = href;
    return false;
  }

  // Cache current DOM before leaving
  cacheCurrentPage();

  // Cancel any active in-flight fetch
  if (navigationAbortController) {
    navigationAbortController.abort();
  }
  navigationAbortController = new AbortController();

  isNavigating = true;
  window.dispatchEvent(new CustomEvent("superflex-navigating", { detail: true }));

  try {
    const response = await fetch(targetUrl.href, {
      credentials: "include",
      signal: navigationAbortController.signal,
      headers: {
        "X-Requested-With": "SuperFlex-PJAX",
      },
    });

    if (!response.ok) {
      window.location.href = href;
      return false;
    }

    const html = await response.text();
    const nextDoc = new DOMParser().parseFromString(html, "text/html");

    // Check if session expired or university redirected to login
    const isLoginRedirect =
      response.url.toLowerCase().includes("/login") ||
      nextDoc.querySelector('form[action*="Login"]') !== null ||
      nextDoc.querySelector(".m-login") !== null;

    if (isLoginRedirect) {
      window.location.href = "/Login";
      return false;
    }

    // 1. Swap main portal container
    const nextRoot = nextDoc.querySelector<HTMLElement>(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
    );
    const currentRoot = document.querySelector<HTMLElement>(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
    );

    if (nextRoot && currentRoot) {
      currentRoot.innerHTML = nextRoot.innerHTML;
    } else {
      const nextContent = nextDoc.querySelector<HTMLElement>(".m-content");
      const currentContent = document.querySelector<HTMLElement>(".m-content");
      if (nextContent && currentContent) {
        currentContent.innerHTML = nextContent.innerHTML;
      }
    }

    // Cache the newly fetched DOM
    if (nextRoot?.innerHTML) {
      pageCache.set(targetPath, nextRoot.innerHTML);
    }

    // 2. Synchronize ASP.NET form state (__VIEWSTATE, __EVENTVALIDATION, etc.)
    const nextForm = nextDoc.querySelector<HTMLFormElement>("form");
    const currentForm = document.querySelector<HTMLFormElement>("form");
    if (nextForm && currentForm) {
      if (nextForm.action) currentForm.action = nextForm.action;
      nextForm.querySelectorAll<HTMLInputElement>('input[type="hidden"]').forEach((input) => {
        if (!input.name) return;
        try {
          const existing = currentForm.querySelector<HTMLInputElement>(
            `input[name="${CSS.escape(input.name)}"]`,
          );
          if (existing) {
            existing.value = input.value;
          } else {
            currentForm.appendChild(input.cloneNode(true));
          }
        } catch {
          // Ignore invalid CSS selector names
        }
      });
    }

    // 3. Update document title
    if (nextDoc.title) {
      document.title = nextDoc.title;
    }

    // 4. Update browser URL history without hard reload
    window.history.pushState({ pjax: true, href: targetUrl.href }, "", targetUrl.href);

    // 5. Notify PathRouter and UI of route change
    window.dispatchEvent(new PopStateEvent("popstate"));

    // 6. Reset viewport scroll
    window.scrollTo({ top: 0, behavior: "instant" });

    return true;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return false;
    }
    console.warn("SuperFlex PJAX navigation failed, falling back to full reload", err);
    window.location.href = href;
    return false;
  } finally {
    isNavigating = false;
    window.dispatchEvent(new CustomEvent("superflex-navigating", { detail: false }));
  }
}

/**
 * Handle browser back/forward buttons seamlessly
 */
export function restoreCachedPage(path: string): boolean {
  if (typeof document === "undefined") return false;
  const cachedHtml = pageCache.get(path);
  if (!cachedHtml) return false;

  const currentRoot = document.querySelector<HTMLElement>(
    ".m-grid.m-grid--hor.m-grid--root.m-page",
  );
  if (currentRoot) {
    currentRoot.innerHTML = cachedHtml;
    return true;
  }
  return false;
}
