import React from "react";
import SuperTabs from "./SuperTabs";

export default function LabeledTabsRow({ label, tabs, onTabChange, ariaLabel = label }) {
  const activeTab = tabs.find((tab) => tab.selected)?.value;
  return (
    <section
      aria-label={ariaLabel}
      className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-2"
    >
      <span className="shrink-0 text-xs font-semibold text-white/85 sm:w-20">{label}</span>
      <SuperTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        size="sm"
        className="w-fit !border-0 !bg-white/55 !backdrop-blur-xl dark:!bg-black/25 dark:!backdrop-blur-xl"
      />
    </section>
  );
}
