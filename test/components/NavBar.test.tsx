import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import NavBar from "../../src/components/NavBar";
import { usePreferencesStore } from "../../src/stores/preferencesStore";

afterEach(() => {
  usePreferencesStore.setState({ aiEnabled: true });
  vi.unstubAllGlobals();
});

it("keeps sidebar links in their portal groups without draggable controls or saved rearrangements", () => {
  const links = [
    { href: "/", text: "Home", path: "/" },
    { href: "/Student/Attendance", text: "Attendance", path: "/Student/Attendance" },
    { href: "/Student/Marks", text: "Marks", path: "/Student/Marks" },
    { href: "/Student/FeeDetails", text: "Fee Details", path: "/Student/FeeDetails" },
  ];
  vi.stubGlobal("window", { location: { origin: "https://flexstudent.nu.edu.pk" } });
  vi.stubGlobal("localStorage", {
    getItem: (key: string) =>
      key === "superflex-sidebar-links"
        ? JSON.stringify(links)
        : key === "superflex-nav-order"
          ? '["Finance:Marks","Overview:Fee Details"]'
          : null,
  });
  const markup = renderToStaticMarkup(<NavBar currentPage="/Student/Marks" />);
  expect(markup).toContain('aria-label="Main navigation"');
  expect(markup).toContain('aria-current="page"');
  expect(markup).not.toContain("Reorder");
  expect(markup).not.toContain("Drag to reorder");
  expect(markup.indexOf(">Home<")).toBeLessThan(markup.indexOf(">Attendance<"));
  expect(markup.indexOf(">Attendance<")).toBeLessThan(markup.indexOf(">Marks<"));
  expect(markup.indexOf(">Marks<")).toBeLessThan(markup.indexOf(">Fee Details<"));
});

it("replaces Octopus AI in the mobile bottom bar with another nav link when AI is disabled", async () => {
  const links = [
    { href: "/", text: "Home", path: "/" },
    { href: "/Student/Attendance", text: "Attendance", path: "/Student/Attendance" },
    { href: "/Student/Marks", text: "Marks", path: "/Student/Marks" },
    { href: "/Student/Transcript", text: "Transcript", path: "/Student/Transcript" },
    { href: "/Student/FeeDetails", text: "Fee Details", path: "/Student/FeeDetails" },
  ];
  vi.stubGlobal("window", {
    location: { origin: "https://flexstudent.nu.edu.pk" },
    matchMedia: () => ({ matches: false }),
    addEventListener: () => {},
  });
  vi.stubGlobal("localStorage", {
    getItem: (key: string) =>
      key === "superflex-sidebar-links"
        ? JSON.stringify(links)
        : key === "superflex_ai_enabled"
          ? "false"
          : null,
    setItem: () => {},
    removeItem: () => {},
  });

  vi.resetModules();
  const { default: FreshNavBar } = await import("../../src/components/NavBar");
  const disabledMarkup = renderToStaticMarkup(<FreshNavBar currentPage="/Student/FeeDetails" />);
  const disabledBottomNav = disabledMarkup.slice(
    disabledMarkup.indexOf('aria-label="Mobile bottom navigation"'),
  );
  expect(disabledBottomNav).not.toContain('aria-label="Octopus AI"');
  expect(disabledBottomNav).toContain('aria-label="Fee Details"');
});
