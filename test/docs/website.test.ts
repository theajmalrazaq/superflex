import { describe, expect, it, vi } from "vitest";
import { parseHTML } from "linkedom";
import homeHtml from "../../docs/index.html?raw";
import docsHtml from "../../docs/docs.html?raw";
import themeScript from "../../docs/scripts/generated/theme.js?raw";
import homeScript from "../../docs/scripts/generated/index.js?raw";
import docsScript from "../../docs/scripts/generated/docs.js?raw";
import reviews from "../../public/reviews.json";

function openPage(
  html: string,
  script: string,
  options: { storedTheme?: string; blockedStorage?: boolean } = {},
) {
  const { window, document } = parseHTML(html);
  const values = new Map(
    options.storedTheme ? [["superflex-theme-mode", options.storedTheme]] : [],
  );
  const storage = {
    getItem: (key: string) => {
      if (options.blockedStorage) throw new Error("Storage blocked");
      return values.get(key) ?? null;
    },
    setItem: (key: string, value: string) => {
      if (options.blockedStorage) throw new Error("Storage blocked");
      values.set(key, value);
    },
  };
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { search: "?page=privacy" },
  });
  const fetch = vi.fn(async () => ({ ok: true, text: async () => "# Privacy\n\nLoaded article." }));
  const run = (code: string) =>
    new Function(
      "window",
      "document",
      "localStorage",
      "fetch",
      "requestAnimationFrame",
      "marked",
      code,
    )(window, document, storage, fetch, (callback: () => void) => callback(), {
      parse: () => "<h1>Privacy</h1><p>Loaded article.</p>",
    });
  run(themeScript);
  run(script);
  return { window, document, values, fetch };
}

describe.each([
  ["home", homeHtml, homeScript],
  ["documentation", docsHtml, docsScript],
])("static %s page", (_name, html, script) => {
  it("loads browser-ready scripts and includes a visible navbar theme label", () => {
    const { document } = parseHTML(html);
    const entries = [...document.querySelectorAll<HTMLScriptElement>('script[src^="./scripts/"]')];
    expect(entries).toHaveLength(2);
    expect(entries.every((entry) => entry.getAttribute("src")?.endsWith(".js"))).toBe(true);
    expect(entries.every((entry) => entry.type !== "module")).toBe(true);
    expect(document.querySelector("#main-nav #theme-toggle")?.textContent).toContain("Dark");
  });

  it("switches both theme modes, updates logos, and persists the selected mode", () => {
    const { window, document, values } = openPage(html, script);
    const button = document.getElementById("theme-toggle")!;
    button.dispatchEvent(new window.Event("click"));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(button.textContent).toBe("Light");
    expect(button.getAttribute("aria-label")).toBe("Switch to light mode");
    expect(values.get("superflex-theme-mode")).toBe("dark");
    expect(document.querySelector("#main-nav img")?.getAttribute("src")).toContain("logo-dark.svg");
    button.dispatchEvent(new window.Event("click"));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(button.textContent).toBe("Dark");
    expect(values.get("superflex-theme-mode")).toBe("light");
  });

  it("restores a saved theme and remains usable when storage is blocked", () => {
    const saved = openPage(html, script, { storedTheme: "dark" });
    expect(saved.document.documentElement.classList.contains("dark")).toBe(true);
    expect(saved.document.getElementById("theme-toggle")?.textContent).toBe("Light");
    const blocked = openPage(html, script, { blockedStorage: true });
    blocked.document
      .getElementById("theme-toggle")!
      .dispatchEvent(new blocked.window.Event("click"));
    expect(blocked.document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("opens and closes mobile navigation through the navbar control", () => {
    const { window, document } = openPage(html, script);
    const button = document.getElementById("mobile-toggle")!;
    const overlay = document.getElementById("mobile-overlay")!;
    expect(overlay.getAttribute("aria-hidden")).toBe("true");
    button.dispatchEvent(new window.Event("click"));
    expect(overlay.classList.contains("active")).toBe(true);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    button.dispatchEvent(new window.Event("click"));
    expect(overlay.classList.contains("active")).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });
});

it("shows the shared reviews without a separate reviews request", () => {
  const { document, fetch } = openPage(homeHtml, homeScript);
  const cards = document.querySelectorAll("#review-track .review-card");
  expect(cards).toHaveLength(Math.min(20, reviews.length) * 2);
  expect(cards[0].querySelector(".review-name")?.textContent).toBe(reviews[0].name);
  expect(cards[0].querySelector(".review-comment")?.textContent).toContain(reviews[0].comment);
  expect(fetch).not.toHaveBeenCalled();
});

it("loads documentation content independently of theme and menu controls", async () => {
  const { document, fetch } = openPage(docsHtml, docsScript);
  await vi.waitFor(() =>
    expect(document.getElementById("markdown-content")?.textContent).toContain("Loaded article."),
  );
  expect(fetch).toHaveBeenCalledWith("articles/privacy.md");
});
