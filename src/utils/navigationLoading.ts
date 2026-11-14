/**
 * Triggers the native Android splash screen immediately when a navigation begins
 * so the APK shows feedback before the server responds, without causing a
 * duplicate outgoing/incoming overlay flash in the browser extension.
 */
export function startNavigationLoading(): void {
  try {
    (globalThis as { SFNative?: { loading?: () => void } }).SFNative?.loading?.();
  } catch {
    // Ignore bridge unavailability in browser extension mode.
  }
}

/** Checks whether a clicked anchor will perform a standard same-origin navigation. */
export function isInternalNavigationAnchor(anchor: HTMLAnchorElement, event: MouseEvent): boolean {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return false;
  }

  const rawHref = anchor.getAttribute("href");
  if (!rawHref || rawHref.startsWith("#") || anchor.hasAttribute("download")) return false;
  if (anchor.target && anchor.target !== "_self") return false;

  try {
    const target = new URL(anchor.href, window.location.origin);
    if (target.origin !== window.location.origin) return false;
    const sameDocumentHash =
      target.pathname === window.location.pathname &&
      target.search === window.location.search &&
      Boolean(target.hash);
    return !sameDocumentHash;
  } catch {
    return false;
  }
}
