import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import NavBar from "../../src/components/NavBar";

afterEach(() => vi.unstubAllGlobals());

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
