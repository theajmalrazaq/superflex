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

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "SUPERFLEX_GROQ_CONFIG") {
      chrome.storage.local.get(["superflex_groq_api_key", "superflex_groq_models"], (saved) => {
        sendResponse({
          configured: Boolean(saved.superflex_groq_api_key),
          models: saved.superflex_groq_models || [],
        });
      });
      return true;
    }

    if (message?.type === "SUPERFLEX_GROQ_SAVE_KEY") {
      const apiKey = String(message.apiKey || "").trim();
      if (!apiKey) {
        sendResponse({ error: "Enter a GroqCloud API key first." });
        return undefined;
      }
      fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error?.message || `API returned ${response.status}`);
          const models = (data.data || [])
            .filter((model) => model.id && model.active !== false && !/(whisper|guard|embedding|tts|speech|transcription)/i.test(model.id))
            .map((model) => ({ id: model.id, name: model.id, provider: model.owned_by || "GroqCloud" }))
            .sort((a, b) => a.name.localeCompare(b.name));
          if (!models.length) throw new Error("No chat models were returned for this GroqCloud API key.");
          chrome.storage.local.set(
            { superflex_groq_api_key: apiKey, superflex_groq_models: models },
            () => sendResponse({ configured: true, models }),
          );
        })
        .catch((error) => sendResponse({ error: error.message || "Could not connect to GroqCloud." }));
      return true;
    }

    if (message?.type === "SUPERFLEX_GROQ_CHAT") {
      chrome.storage.local.get("superflex_groq_api_key", async ({ superflex_groq_api_key: apiKey }) => {
        if (!apiKey) {
          sendResponse({ error: "Add your GroqCloud API key to connect." });
          return;
        }
        try {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: message.model,
              messages: message.messages,
              max_completion_tokens: 600,
            }),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error?.message || `API returned ${response.status}`);
          sendResponse({ text: data.choices?.[0]?.message?.content || "" });
        } catch (error) {
          sendResponse({ error: error.message || "GroqCloud request failed." });
        }
      });
      return true;
    }

    if (message?.type === "SUPERFLEX_APPLY_DEFAULT_ZOOM") {
      const tabId = _sender.tab?.id;
      if (tabId == null) {
        sendResponse({ applied: false });
        return undefined;
      }
      chrome.tabs.getZoom(tabId, (zoom) => {
        if (chrome.runtime.lastError) {
          sendResponse({ applied: false });
          return;
        }
        if (Math.abs(zoom - 1) < 0.001) {
          chrome.tabs.setZoom(tabId, 1.1, () => sendResponse({ applied: !chrome.runtime.lastError, zoom: 1.1 }));
          return;
        }
        sendResponse({ applied: false, zoom });
      });
      return true;
    }

    if (message?.type !== "SUPERFLEX_GET_CAMPUS_FACULTY") return undefined;
    const urls = CAMPUS_DIRECTORY_URLS[message.campusId];
    if (!urls) {
      sendResponse({ error: "No official directory is configured for this campus." });
      return undefined;
    }

    Promise.all(urls.map(async (url) => {
      try {
        const response = await fetch(url, { credentials: "omit" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return { url, html: await response.text() };
      } catch (error) {
        return { url, error: error.message };
      }
    })).then((pages) => sendResponse({ pages }));
    return true;
  });
});
