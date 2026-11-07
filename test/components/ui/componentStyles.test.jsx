import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import Button from "../../../src/components/ui/Button";
import Input from "../../../src/components/ui/Input";
import SuperTabs from "../../../src/components/ui/SuperTabs";

describe("shared UI style contracts", () => {
  it("preserves button styling while allowing caller overrides", () => {
    const markup = renderToStaticMarkup(
      <Button variant="secondary" className="rounded-full">
        Continue
      </Button>,
    );

    expect(markup).toContain("rounded-full");
    expect(markup).not.toContain("rounded-2xl");
    expect(markup).toContain("bg-foreground/5");
    expect(markup).toContain("Continue");
  });

  it("keeps input dimensions and error styling", () => {
    const markup = renderToStaticMarkup(
      <Input label="CGPA" value="3.5" error="Invalid CGPA" onChange={vi.fn()} />,
    );

    expect(markup).toContain("rounded-2xl");
    expect(markup).toContain("border-rose-500/50");
    expect(markup).toContain('aria-invalid="true"');
  });

  it("keeps the active tab background and sizing animation", () => {
    const markup = renderToStaticMarkup(
      <SuperTabs
        tabs={[{ label: "Fall 2026", value: "fall-2026" }]}
        activeTab="fall-2026"
        onTabChange={vi.fn()}
        size="sm"
      />,
    );

    expect(markup).toContain("px-3");
    expect(markup).toContain("bg-accent");
    expect(markup).toContain("zoom-in-95");
    expect(markup).toContain("Fall 2026");
  });
});
