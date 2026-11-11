import React from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import BottomSheet, {
  BottomSheetClose,
  BottomSheetDescription,
  BottomSheetTitle,
} from "./BottomSheet";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  icon?: React.ReactNode;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  eyebrow,
  children,
  maxWidth = "max-w-lg",
  icon,
}: ModalProps) => {
  const widthClass = maxWidth === "max-w-lg" ? "max-w-2xl" : maxWidth;

  return (
    <BottomSheet open={isOpen} onClose={onClose} className={widthClass} animated>
      <div className="flex shrink-0 justify-center pt-2.5 sm:pt-3">
        <span className="h-1 w-11 rounded-full bg-[#ded9e5] dark:bg-white sm:h-1.5 sm:w-14" />
      </div>
      <BottomSheetClose asChild>
        <button
          type="button"
          className="absolute right-3 top-3.5 z-10 rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:text-slate-300 dark:hover:bg-white/10 sm:right-4 sm:top-6 sm:p-2"
          aria-label="Close modal"
        >
          <X size={18} className="sm:h-5 sm:w-5" />
        </button>
      </BottomSheetClose>
      <header className="flex shrink-0 flex-col items-center px-5 pb-3 pt-2 text-center sm:px-8 sm:pb-3.5 sm:pt-3">
        {icon && (
          <span className="mb-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#230052] text-white dark:bg-white dark:text-[#101027] sm:mb-2 sm:h-11 sm:w-11 sm:rounded-[16px]">
            {icon}
          </span>
        )}
        {eyebrow ? (
          <>
            <p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#230052]/65 dark:text-white sm:text-[10px]">
              {eyebrow}
            </p>
            <BottomSheetTitle className="mt-0.5 text-base font-bold tracking-tight sm:mt-1 sm:text-2xl">
              {title}
            </BottomSheetTitle>
            <BottomSheetDescription
              className={cn(
                "mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:mt-1 sm:text-sm",
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
                "text-[9px] font-bold uppercase tracking-[.16em] text-[#230052]/65 dark:text-white sm:text-[10px]",
                !subtitle && "sr-only",
              )}
            >
              {subtitle || `${title} dialog`}
            </BottomSheetDescription>
            <BottomSheetTitle className="mt-0.5 text-base font-bold tracking-tight sm:mt-1 sm:text-2xl">
              {title}
            </BottomSheetTitle>
          </>
        )}
      </header>
      <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-5 pt-1.5 sm:px-8 sm:pb-6">
        {children}
      </div>
    </BottomSheet>
  );
};

export default Modal;
