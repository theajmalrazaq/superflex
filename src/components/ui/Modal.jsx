import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = "max-w-lg", icon }) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const widthClass = maxWidth === "max-w-lg" ? "max-w-2xl" : maxWidth;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483647] flex items-end justify-center bg-slate-950/60 px-3 pb-3 pt-3 backdrop-blur-md"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="superflex-modal-title"
        className={`relative flex max-h-[76dvh] w-full ${widthClass} flex-col overflow-hidden rounded-[34px] bg-white text-slate-900 shadow-[0_18px_60px_rgba(35,0,82,.24)] animate-in slide-in-from-bottom-8 duration-300 dark:bg-[#090909] dark:text-[#f5f6fb]`}
      >
        <div className="flex shrink-0 justify-center pt-3"><span className="h-1.5 w-14 rounded-full bg-[#ded9e5] dark:bg-white" /></div>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-6 z-10 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        <header className="flex shrink-0 flex-col items-center px-6 pb-3 pt-3 text-center sm:px-8">
          {icon && <span className="mb-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[#230052] text-white dark:bg-white dark:text-[#101027]">{icon}</span>}
          {subtitle && <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#230052]/65 dark:text-white">{subtitle}</p>}
          <h2 id="superflex-modal-title" className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        </header>
        <div className="min-h-0 overflow-y-auto px-5 pb-5 pt-1 sm:px-8">{children}</div>
      </section>
    </div>,
    document.body,
  );
};

export default Modal;
