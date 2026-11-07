import React from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import BottomSheet, {
  BottomSheetClose,
  BottomSheetDescription,
  BottomSheetTitle,
} from "./BottomSheet";

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  eyebrow,
  children,
  maxWidth = "max-w-lg",
  icon,
}) => {
  const widthClass = maxWidth === "max-w-lg" ? "max-w-2xl" : maxWidth;

  return (
    <BottomSheet open={isOpen} onClose={onClose} className={widthClass} animated>
      <div className="flex shrink-0 justify-center pt-3">
        <span className="h-1.5 w-14 rounded-full bg-[#ded9e5] dark:bg-white" />
      </div>
      <BottomSheetClose asChild>
        <button
          type="button"
          className="absolute right-4 top-6 z-10 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:text-slate-300 dark:hover:bg-white/10"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
      </BottomSheetClose>
      <header className="flex shrink-0 flex-col items-center px-6 pb-3 pt-3 text-center sm:px-8">
        {icon && (
          <span className="mb-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[#230052] text-white dark:bg-white dark:text-[#101027]">
            {icon}
          </span>
        )}
        {eyebrow ? (
          <>
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#230052]/65 dark:text-white">
              {eyebrow}
            </p>
            <BottomSheetTitle className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
              {title}
            </BottomSheetTitle>
            <BottomSheetDescription
              className={cn(
                "mt-1 text-sm text-slate-500 dark:text-slate-400",
                !subtitle && "sr-only",
              )}
            >
              {subtitle || `${title} dialog`}
            </BottomSheetDescription>
          </>
        ) : (
          <>
            <BottomSheetDescription
              className={cn(
                "text-[10px] font-bold uppercase tracking-[.16em] text-[#230052]/65 dark:text-white",
                !subtitle && "sr-only",
              )}
            >
              {subtitle || `${title} dialog`}
            </BottomSheetDescription>
            <BottomSheetTitle className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
              {title}
            </BottomSheetTitle>
          </>
        )}
      </header>
      <div className="min-h-0 overflow-y-auto px-5 pb-5 pt-1 sm:px-8">{children}</div>
    </BottomSheet>
  );
};

export default Modal;
