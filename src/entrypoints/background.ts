import {
  extensionRequestSchema,
  streamRequestSchema,
  geminiModelListSchema,
  geminiResponseSchema,
  geminiSettingsSchema,
  getGeminiText,
} from "../schemas/gemini";
import { defineBackground } from "wxt/utils/define-background";

const CAMPUS_DIRECTORY_URLS = {
  karachi: [
    "https://khi.nu.edu.pk/Faculty.php",
    "https://khi.nu.edu.pk/department-of-sciences-humanities/",
    "https://khi.nu.edu.pk/department-of-management-sciences/",
  ],
  lahore: ["https://lhr.nu.edu.pk/faculty/"],
  islamabad: [
    "https://isb.nu.edu.pk/Academics/Faculty-DCS.php",
    "https://isb.nu.edu.pk/Academics/Faculty-DSE.php",
    "https://isb.nu.edu.pk/Academics/Faculty-DAI.php",
  ],
  cfd: [
    "https://cfd.nu.edu.pk/department-cs/",
    "https://cfd.nu.edu.pk/department-se/",
    "https://cfd.nu.edu.pk/department-ai/",
    "https://cfd.nu.edu.pk/department-sh/",
  ],
  multan: ["https://mtn.nu.edu.pk/faculty/", "https://mtn.nu.edu.pk/"],
  peshawar: [
    "https://pwr.nu.edu.pk/cs-faculty/",
    "https://pwr.nu.edu.pk/ee-faculty/",
    "https://pwr.nu.edu.pk/ce-faculty",
    "https://pwr.nu.edu.pk/sh-faculty/",
    "https://pwr.nu.edu.pk/hec-faculty/",
  ],
};

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const AI_PERMISSION_KEY = "superflex_ai_permission_status";
const STORAGE_RESET_FLAG = "superflex_storage_reset_v1";
const PORTAL_ORIGIN = "https://flexstudent.nu.edu.pk";

const isPortalSender = (sender) => {
  try {
    return new URL(sender?.url || "").origin === "https://flexstudent.nu.edu.pk";
  } catch {
    return false;
  }
};

const hasAiPermission = async () =>
  (await chrome.storage.local.get(AI_PERMISSION_KEY))[AI_PERMISSION_KEY] === "granted";

const notifyPortalTabsOfKeyUpdate = () => {
  chrome.tabs.query({ url: "https://flexstudent.nu.edu.pk/*" }, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id != null)
        chrome.tabs.sendMessage(
          tab.id,
          { type: "SUPERFLEX_AI_KEY_UPDATED" },
          () => void chrome.runtime.lastError,
        );
    });
  });
};

const fetchAvailableGeminiModels = async (apiKey) => {
  const listUrl = `${GEMINI_API_BASE}?key=${encodeURIComponent(apiKey)}`;
  const listRes = await fetch(listUrl);
  const listData = await listRes.json().catch(() => ({}));
  if (!listRes.ok) {
    throw new Error(
      geminiResponseSchema.safeParse(listData).data?.error?.message ||
        `Failed to fetch Gemini models (status ${listRes.status})`,
    );
  }

  const parsedList = geminiModelListSchema.safeParse(listData);
  if (!parsedList.success) throw new Error("Gemini returned an invalid model list.");
  const rawModels = parsedList.data.models;
  const supported = rawModels.filter((m) => {
    const name = m.name || "";
    const methods = m.supportedGenerationMethods || [];
    if (!methods.includes("generateContent")) return false;
    if (
      name.includes("embedding") ||
      name.includes("aqa") ||
      name.includes("bison") ||
      name.includes("imagen")
    ) {
      return false;
    }

    if (name.endsWith("gemini-2.0-flash")) return false;
    return true;
  });

  const formatted = supported.map((m) => {
    const modelId = m.name.startsWith("models/") ? m.name.slice(7) : m.name;
    return {
      id: modelId,
      name: m.displayName || modelId,
      description: m.description || "",
      contextWindow: m.inputTokenLimit || 1048576,
      provider: "Google AI",
      tier: "free",
      isFlash: modelId.toLowerCase().includes("flash"),
    };
  });

  const priorityOrder = [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-3.8-flash",
    "gemini-1.5-flash-8b",
    "gemini-2.0-flash-lite",
    "gemini-2.5-pro",
    "gemini-1.5-pro",
  ];

  formatted.sort((a, b) => {
    const idxA = priorityOrder.indexOf(a.id);
    const idxB = priorityOrder.indexOf(b.id);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    if (a.isFlash && !b.isFlash) return -1;
    if (!a.isFlash && b.isFlash) return 1;
    return a.name.localeCompare(b.name);
  });

  return formatted;
};

const isHighDemandOrUnavailable = (status, errMsg = "") => {
  const msg = String(errMsg).toLowerCase();
  return (
    status === 503 ||
    status === 429 ||
    msg.includes("high demand") ||
    msg.includes("overloaded") ||
    msg.includes("resource has been exhausted") ||
    msg.includes("temporarily unavailable") ||
    msg.includes("spikes in demand")
  );
};

const callGeminiGenerateContent = async (modelId, apiKey, payload) => {
  const cleanId = modelId.startsWith("models/") ? modelId.slice(7) : modelId;
  const url = `${GEMINI_API_BASE}/${cleanId}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const parsed = geminiResponseSchema.safeParse(await res.json().catch(() => null));
  if (!parsed.success)
    return {
      ok: false,
      status: 502,
      data: { error: { message: "Gemini returned an invalid response." } },
    };
  return { ok: res.ok, status: res.status, data: parsed.data };
};

const streamGeminiContent = async (modelId, apiKey, payload, onChunk) => {
  const cleanId = modelId.startsWith("models/") ? modelId.slice(7) : modelId;
  const url = `${GEMINI_API_BASE}/${cleanId}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const parsed = geminiResponseSchema.safeParse(await res.json().catch(() => null));
    const errorData = parsed.success
      ? parsed.data
      : { error: { message: "Gemini returned an invalid error response." } };
    return { ok: false, status: res.status, errorData };
  }

  const reader = res.body?.getReader();
  if (!reader) {
    return {
      ok: false,
      status: 500,
      errorData: { error: { message: "Streaming not supported by browser" } },
    };
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const jsonStr = trimmed.slice(5).trim();
      if (!jsonStr || jsonStr === "[DONE]") continue;

      try {
        const parsed = JSON.parse(jsonStr);
        const chunkText = getGeminiText(parsed);
        if (chunkText) {
          fullText += chunkText;
          onChunk(chunkText, fullText);
        }
      } catch {}
    }
  }

  if (buffer.trim().startsWith("data:")) {
    const jsonStr = buffer.trim().slice(5).trim();
    if (jsonStr && jsonStr !== "[DONE]") {
      try {
        const parsed = JSON.parse(jsonStr);
        const chunkText = getGeminiText(parsed);
        if (chunkText) {
          fullText += chunkText;
          onChunk(chunkText, fullText);
        }
      } catch {}
    }
  }

  return { ok: true, status: 200, fullText };
};

export default defineBackground(() => {
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== "SUPERFLEX_AI_STREAM") return;
    if (!isPortalSender(port.sender)) {
      port.disconnect();
      return;
    }

    let isDisconnected = false;
    port.onDisconnect.addListener(() => {
      isDisconnected = true;
    });

    port.onMessage.addListener(async (rawMessage) => {
      const parsed = streamRequestSchema.safeParse(rawMessage);
      if (!parsed.success) {
        port.postMessage({ type: "ERROR", error: "Invalid AI stream request." });
        return;
      }
      const msg = parsed.data;

      if (!(await hasAiPermission())) {
        port.postMessage({
          type: "ERROR",
          error: "Enable AI and grant data permission in SuperFlex settings first.",
        });
        return;
      }

      chrome.storage.local.get<Record<string, unknown>>(
        ["superflex_gemini_api_key", "superflex_gemini_model", "superflex_gemini_models"],
        async (rawStored) => {
          const stored = geminiSettingsSchema.parse(rawStored);
          if (isDisconnected) return;
          const apiKey = stored.superflex_gemini_api_key;
          if (!apiKey) {
            port.postMessage({
              type: "ERROR",
              error: "Add your Google Gemini API key to connect.",
            });
            return;
          }

          let available = stored.superflex_gemini_models;
          if (!Array.isArray(available) || available.length === 0) {
            try {
              available = await fetchAvailableGeminiModels(apiKey);
              chrome.storage.local.set({ superflex_gemini_models: available });
            } catch (err) {
              if (!isDisconnected)
                port.postMessage({
                  type: "ERROR",
                  error: err.message || "Failed to list Gemini models.",
                });
              return;
            }
          }

          let currentModel = stored.superflex_gemini_model;
          if (!currentModel?.id || currentModel.id === "gemini-2.0-flash") {
            currentModel = available[0] || { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" };
            chrome.storage.local.set({ superflex_gemini_model: currentModel });
          }

          const queue = [currentModel, ...available.filter((m) => m.id !== currentModel.id)];

          let lastError = null;
          let usedModel = null;
          let streamedFullText = "";

          for (let i = 0; i < queue.length; i++) {
            if (isDisconnected) return;
            const candidate = queue[i];
            let candidateText = "";

            const { ok, status, errorData } = await streamGeminiContent(
              candidate.id,
              apiKey,
              msg.payload,
              (chunk, full) => {
                if (isDisconnected) return;
                candidateText = full;
                port.postMessage({ type: "CHUNK", text: chunk, fullText: full });
              },
            );

            if (ok) {
              streamedFullText = candidateText;
              usedModel = candidate;
              break;
            }

            const errorMsg = errorData?.error?.message || `API error ${status}`;
            lastError = errorMsg;

            if (
              isHighDemandOrUnavailable(status, errorMsg) ||
              status === 404 ||
              errorMsg.includes("no longer available")
            ) {
              console.warn(
                `[SuperFlex AI Stream] Model ${candidate.id} unavailable (${errorMsg}). Trying fallback candidate...`,
              );
              continue;
            }
            break;
          }

          if (isDisconnected) return;

          if (usedModel && streamedFullText !== undefined) {
            const switched = usedModel.id !== currentModel.id;
            if (switched) {
              chrome.storage.local.set({ superflex_gemini_model: usedModel });
            }
            port.postMessage({
              type: "DONE",
              fullText: streamedFullText,
              modelSwitched: switched,
              model: usedModel,
            });
          } else {
            port.postMessage({
              type: "ERROR",
              error: lastError || "All Gemini models are currently busy. Please try again shortly.",
            });
          }
        },
      );
    });
  });

  chrome.runtime.onMessage.addListener((rawMessage, sender, sendResponse) => {
    if (!isPortalSender(sender)) return undefined;
    const parsed = extensionRequestSchema.safeParse(rawMessage);
    if (!parsed.success) {
      sendResponse({ error: "Invalid extension request." });
      return undefined;
    }
    const message = parsed.data;
    if (message?.type === "SUPERFLEX_RESET_STORAGE_ONCE") {
      chrome.storage.local.get(STORAGE_RESET_FLAG, (stored) => {
        if (stored[STORAGE_RESET_FLAG]) {
          sendResponse({ reset: false });
          return;
        }
        chrome.browsingData.remove(
          { origins: [PORTAL_ORIGIN] },
          {
            cache: true,
            cacheStorage: true,
            cookies: true,
            fileSystems: true,
            indexedDB: true,
            localStorage: true,
            serviceWorkers: true,
          },
          () => {
            if (chrome.runtime.lastError) {
              sendResponse({ error: chrome.runtime.lastError.message });
              return;
            }
            chrome.storage.local.clear(() => {
              if (chrome.runtime.lastError) {
                sendResponse({ error: chrome.runtime.lastError.message });
                return;
              }
              chrome.storage.local.set({ [STORAGE_RESET_FLAG]: true }, () =>
                sendResponse({ reset: !chrome.runtime.lastError }),
              );
            });
          },
        );
      });
      return true;
    }

    if (message?.type === "SUPERFLEX_AI_PERMISSION_GET") {
      chrome.storage.local.get(AI_PERMISSION_KEY, (stored) =>
        sendResponse({ status: stored[AI_PERMISSION_KEY] === "granted" ? "granted" : "denied" }),
      );
      return true;
    }

    if (message?.type === "SUPERFLEX_AI_PERMISSION_SET") {
      chrome.storage.local.set({ [AI_PERMISSION_KEY]: message.status }, () =>
        sendResponse({ status: message.status }),
      );
      return true;
    }

    if (message?.type === "SUPERFLEX_AI_CONFIG") {
      chrome.storage.local.get<Record<string, unknown>>(
        ["superflex_gemini_api_key", "superflex_gemini_model", "superflex_gemini_models"],
        async (rawSaved) => {
          const saved = geminiSettingsSchema.parse(rawSaved);
          if (!saved.superflex_gemini_api_key) {
            sendResponse({ configured: false, model: null, availableModels: [] });
            return;
          }
          sendResponse({
            configured: true,
            model: saved.superflex_gemini_model || null,
            availableModels: saved.superflex_gemini_models || [],
          });
        },
      );
      return true;
    }

    if (message?.type === "SUPERFLEX_AI_SAVE_KEY") {
      const apiKey = String(message.apiKey || "").trim();
      if (!apiKey) {
        sendResponse({ error: "Enter a Google Gemini API key first." });
        return undefined;
      }
      fetchAvailableGeminiModels(apiKey)
        .then((models) => {
          if (!models.length) {
            throw new Error("No compatible Gemini model found for this API key.");
          }
          const activeModel = models[0];
          chrome.storage.local.set(
            {
              superflex_gemini_api_key: apiKey,
              superflex_gemini_model: activeModel,
              superflex_gemini_models: models,
            },
            () => {
              notifyPortalTabsOfKeyUpdate();
              sendResponse({ configured: true, model: activeModel, availableModels: models });
            },
          );
        })
        .catch((error) =>
          sendResponse({ error: error.message || "Could not validate Google Gemini API key." }),
        );
      return true;
    }

    if (message?.type === "SUPERFLEX_AI_REFRESH_MODELS") {
      chrome.storage.local.get<Record<string, unknown>>(
        ["superflex_gemini_api_key"],
        async (saved) => {
          const { superflex_gemini_api_key: apiKey } = geminiSettingsSchema.parse(saved);
          if (!apiKey) {
            sendResponse({ error: "Add your Google Gemini API key first." });
            return;
          }
          try {
            const models = await fetchAvailableGeminiModels(apiKey);
            chrome.storage.local.set({ superflex_gemini_models: models });
            sendResponse({ success: true, models });
          } catch (error) {
            sendResponse({ error: error.message || "Failed to refresh models." });
          }
        },
      );
      return true;
    }

    if (message?.type === "SUPERFLEX_AI_SELECT_MODEL") {
      const model = message.model;
      chrome.storage.local.set({ superflex_gemini_model: model }, () => {
        sendResponse({ success: true, model });
      });
      return true;
    }

    if (message?.type === "SUPERFLEX_AI_CHAT") {
      chrome.storage.local.get<Record<string, unknown>>(
        ["superflex_gemini_api_key", "superflex_gemini_model", "superflex_gemini_models"],
        async (rawStored) => {
          const stored = geminiSettingsSchema.parse(rawStored);
          if (!(await hasAiPermission())) {
            sendResponse({
              error: "Enable AI and grant data permission in SuperFlex settings first.",
            });
            return;
          }
          const apiKey = stored.superflex_gemini_api_key;
          if (!apiKey) {
            sendResponse({ error: "Add your Google Gemini API key to connect." });
            return;
          }

          let available = stored.superflex_gemini_models;
          if (!Array.isArray(available) || available.length === 0) {
            try {
              available = await fetchAvailableGeminiModels(apiKey);
              chrome.storage.local.set({ superflex_gemini_models: available });
            } catch (err) {
              sendResponse({ error: err.message || "Failed to list Gemini models." });
              return;
            }
          }

          let currentModel = stored.superflex_gemini_model;
          if (!currentModel?.id || currentModel.id === "gemini-2.0-flash") {
            currentModel = available[0] || { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" };
            chrome.storage.local.set({ superflex_gemini_model: currentModel });
          }

          const queue = [currentModel, ...available.filter((m) => m.id !== currentModel.id)];

          let lastError = null;
          let usedModel = null;
          let textResult = null;

          for (let i = 0; i < queue.length; i++) {
            const candidate = queue[i];
            const { ok, status, data } = await callGeminiGenerateContent(
              candidate.id,
              apiKey,
              message.payload,
            );

            if (ok) {
              const text = getGeminiText(data);
              textResult = text;
              usedModel = candidate;
              break;
            }

            const errorMsg = data.error?.message || `API error ${status}`;
            lastError = errorMsg;

            if (
              isHighDemandOrUnavailable(status, errorMsg) ||
              status === 404 ||
              errorMsg.includes("no longer available")
            ) {
              console.warn(
                `[SuperFlex AI] Model ${candidate.id} unavailable (${errorMsg}). Trying fallback candidate...`,
              );
              continue;
            }

            break;
          }

          if (textResult !== null && usedModel) {
            const switched = usedModel.id !== currentModel.id;
            if (switched) {
              chrome.storage.local.set({ superflex_gemini_model: usedModel });
            }
            sendResponse({
              text: textResult,
              modelSwitched: switched,
              model: usedModel,
            });
            return;
          }

          sendResponse({
            error:
              lastError ||
              "All Gemini models are currently experiencing high demand. Please try again in a few moments or select another model in settings.",
          });
        },
      );
      return true;
    }

    if (message?.type !== "SUPERFLEX_GET_CAMPUS_FACULTY") return undefined;
    const urls = CAMPUS_DIRECTORY_URLS[message.campusId];
    if (!urls) {
      sendResponse({ error: "No official directory is configured for this campus." });
      return undefined;
    }

    Promise.all(
      urls.map(async (url) => {
        try {
          const response = await fetch(url, { credentials: "omit" });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return { url: response.url || url, html: await response.text() };
        } catch (error) {
          return { url, error: error.message };
        }
      }),
    ).then((pages) => sendResponse({ pages }));
    return true;
  });
});
