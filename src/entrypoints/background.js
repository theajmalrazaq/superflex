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
