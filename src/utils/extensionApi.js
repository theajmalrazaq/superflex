/** Safe wrappers for extension APIs that can become unavailable after a reload. */
export function getExtensionUrl(path) {
  try {
    return globalThis.chrome?.runtime?.getURL(path) || "";
  } catch {
    return "";
  }
}

export function getExtensionVersion(fallback = "") {
  try {
    return globalThis.chrome?.runtime?.getManifest?.().version || fallback;
  } catch {
    return fallback;
  }
}

export function sendExtensionMessage(message, callback) {
  try {
    if (!globalThis.chrome?.runtime?.sendMessage) {
      callback?.(null, new Error("Extension context is unavailable"));
      return false;
    }
    chrome.runtime.sendMessage(message, (response) => {
      try {
        const error = chrome.runtime.lastError;
        callback?.(response, error ? new Error(error.message) : null);
      } catch (error) {
        callback?.(null, error);
      }
    });
    return true;
  } catch (error) {
    callback?.(null, error);
    return false;
  }
}
