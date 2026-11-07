import React from "react";
import { cva } from "class-variance-authority";
import { Tabs } from "radix-ui";
import { cn } from "../../utils/cn";

const tabVariants = cva(
  "relative cursor-pointer whitespace-nowrap rounded-full font-bold transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  {
    variants: {
      size: {
        sm: "px-3 py-1.5 text-[11px]",
        md: "px-5 py-2 text-xs",
        lg: "px-6 py-3 text-sm",
      },
      active: {
        true: "!text-[var(--accent-foreground)]",
        false: "text-foreground/50 hover:bg-foreground/5 hover:text-foreground/70",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface SuperTabsProps<T extends string | number> {
  tabs: { value: T; label: React.ReactNode }[];
  activeTab: T;
  onTabChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const SuperTabs = <T extends string | number>({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  size = "md",
}: SuperTabsProps<T>) => {
  const handleValueChange = (value) => {
    const selectedTab = tabs.find((tab) => String(tab.value) === value);
    if (selectedTab) onTabChange(selectedTab.value);
  };

  return (
    <Tabs.Root
      value={activeTab == null ? undefined : String(activeTab)}
      onValueChange={handleValueChange}
    >
      <Tabs.List
        className={cn(
          "flex max-w-full gap-1.5 overflow-x-auto rounded-full border border-foreground/10 bg-secondary/50 p-1 backdrop-blur-md scrollbar-hide",
          className,
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <Tabs.Trigger
              key={tab.value}
              value={String(tab.value)}
              className={tabVariants({ size, active: isActive })}
            >
              {isActive && (
                <span className="absolute inset-0 -z-10 animate-in rounded-full bg-accent fade-in zoom-in-95 duration-300" />
              )}
              <span className="relative z-10">{tab.label}</span>
            </Tabs.Trigger>
          );
        })}
      </Tabs.List>
    </Tabs.Root>
  );
};

export default SuperTabs;
