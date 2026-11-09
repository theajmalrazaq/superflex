import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseHTML } from "linkedom";
import { isStandaloneApp, checkPortalSession, loadLoginPortalDom } from "../../src/utils/portalSession";

describe("portalSession utility", () => {
  let dom: ReturnType<typeof parseHTML>;

  beforeEach(() => {
    dom = parseHTML("<!DOCTYPE html><html><head></head><body></body></html>");
    vi.stubGlobal("window", dom.window);
    vi.stubGlobal("document", dom.document);
    vi.stubGlobal("DOMParser", dom.DOMParser);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("identifies standalone app mode via path, body class or native bridge", () => {
    expect(isStandaloneApp()).toBe(false);

    dom.document.body.classList.add("superflex-standalone");
    expect(isStandaloneApp()).toBe(true);

    dom.document.body.className = "";
    (dom.window as any).SFNative = { ready: vi.fn() };
    expect(isStandaloneApp()).toBe(true);
  });

  it("handles authenticated portal session check", async () => {
    const portalContainer = dom.document.createElement("div");
    portalContainer.className = "m-grid m-grid--hor m-grid--root m-page";
    dom.document.body.appendChild(portalContainer);

    const mockProfileHtml = `
      <div class="m-grid m-grid--hor m-grid--root m-page">
        <div id="student-name">Ajmal Razaq</div>
      </div>
    `;

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      url: "https://flexstudent.nu.edu.pk/Student/StudentProfile",
      redirected: false,
      text: async () => mockProfileHtml,
    } as unknown as Response);

    const result = await checkPortalSession();
    expect(result.authenticated).toBe(true);
    expect(portalContainer.innerHTML).toContain("Ajmal Razaq");
  });

  it("detects expired / unauthenticated sessions redirecting to login", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      url: "https://flexstudent.nu.edu.pk/Login",
      redirected: true,
      text: async () => `<div class="m-login">Login Form</div>`,
    } as unknown as Response);

    const result = await checkPortalSession();
    expect(result.authenticated).toBe(false);
  });

  it("mounts fetched login portal DOM into designated container", async () => {
    const mockLoginHtml = `
      <div class="m-login m-login--1">
        <form action="/Login/Login" method="post">
          <input name="username" id="m_inputmask_4" value="" />
        </form>
      </div>
    `;

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      text: async () => mockLoginHtml,
    } as unknown as Response);

    const mounted = await loadLoginPortalDom();
    expect(mounted).toBe(true);

    const container = dom.document.getElementById("superflex-login-container");
    expect(container).not.toBeNull();
    expect(container?.innerHTML).toContain("m-login--1");
  });
});
