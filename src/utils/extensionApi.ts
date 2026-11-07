import {
  extensionRequestSchema,
  extensionResponseSchema,
  type ExtensionResponse,
} from "../schemas/gemini";

export function getExtensionUrl(path: string) {
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

export function sendExtensionMessage(
  message: unknown,
  callback?: (response: ExtensionResponse | null, error?: Error) => void,
) {
  try {
    if (!globalThis.chrome?.runtime?.sendMessage) {
      callback?.(null, new Error("Extension context is unavailable"));
      return false;
    }
    const request = extensionRequestSchema.safeParse(message);
    if (!request.success) {
      callback?.(null, new Error("Invalid extension request"));
      return false;
    }
    chrome.runtime.sendMessage(request.data, (response) => {
      const error = chrome.runtime.lastError;
      if (error) {
        callback?.(null, new Error(error.message));
        return;
      }
      const parsed = extensionResponseSchema.safeParse(response);
      if (!parsed.success) {
        callback?.(null, new Error("Invalid extension response"));
        return;
      }
      callback?.(parsed.data, null);
    });
    return true;
  } catch (error) {
    callback?.(null, error);
    return false;
  }
}
