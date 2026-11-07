import React from "react";
import { Dialog } from "radix-ui";
import { cn } from "../../utils/cn";

export const BottomSheetTitle = Dialog.Title;
export const BottomSheetDescription = Dialog.Description;
export const BottomSheetClose = Dialog.Close;

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
}

export default function BottomSheet({
  open,
  onClose,
  children,
  className,
  animated = false,
}: BottomSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[2147483646] bg-slate-950/60 backdrop-blur-md" />
        <Dialog.Content
          className={cn(
            "fixed bottom-3 left-1/2 z-[2147483647] flex max-h-[76dvh] w-[calc(100%_-_1.5rem)] max-w-2xl -translate-x-1/2 flex-col overflow-hidden rounded-[34px] bg-white text-slate-900 shadow-[0_18px_60px_rgba(35,0,82,.24)] dark:bg-[#090909] dark:text-[#f5f6fb]",
            animated && "animate-in slide-in-from-bottom-8 duration-300",
            className,
          )}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
