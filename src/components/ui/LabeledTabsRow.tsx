import React from "react";
import SuperTabs from "./SuperTabs";

export default function LabeledTabsRow({ label, tabs, onTabChange, ariaLabel = label }) {
  const activeTab = tabs.find((tab) => tab.selected)?.value;
  return (
    <section aria-label={ariaLabel} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="w-20 shrink-0 text-xs font-semibold text-white/85">{label}</span>
      <SuperTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        size="sm"
        className="!border-0 !bg-white/55 !backdrop-blur-xl dark:!bg-black/25 dark:!backdrop-blur-xl"
      />
    </section>
  );
}
