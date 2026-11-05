import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Select } from "radix-ui";
import { cn } from "../../utils/cn";

export default function SelectMenu({
  value,
  options,
  onChange,
  placeholder,
  ariaLabel,
  triggerClassName,
  contentClassName,
  itemClassName,
  iconSize = 16,
}) {
  const selectableOptions = options.filter((option) => option.value !== "");
  const emptyOption = options.find((option) => option.value === "");

  return (
    <Select.Root value={value || undefined} onValueChange={onChange}>
      <Select.Trigger
        aria-label={ariaLabel}
        className={cn(
          "group flex cursor-pointer items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#230052]/30 dark:focus-visible:ring-white/30",
          triggerClassName,
        )}
      >
        <span className="min-w-0 truncate">
          <Select.Value placeholder={placeholder || emptyOption?.label} />
        </span>
        <Select.Icon asChild>
          <ChevronDown
            size={iconSize}
            className="shrink-0 text-slate-500 transition-transform group-data-[state=open]:rotate-180 dark:text-slate-400"
          />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={8}
          align="center"
          className={cn(
            "z-[2147483647] max-h-60 overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-1.5 text-slate-900 shadow-[0_12px_32px_rgba(15,23,42,.16)] dark:border-white/[0.12] dark:bg-[#111] dark:text-white dark:shadow-black/40",
            contentClassName,
          )}
        >
          <Select.Viewport>
            {selectableOptions.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm text-slate-700 outline-none transition-colors data-[highlighted]:bg-slate-100 data-[state=checked]:bg-[#230052] data-[state=checked]:font-semibold data-[state=checked]:text-white dark:text-slate-200 dark:data-[highlighted]:bg-white/[0.08] dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-[#0a192f]",
                  itemClassName,
                )}
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator><Check size={15} className="shrink-0" /></Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
