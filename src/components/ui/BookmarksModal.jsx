import React from "react";
import { createPortal } from "react-dom";
import { Bookmark, X } from "lucide-react";

export default function BookmarksModal({ open, onClose, items, emptyHint, onSelect }) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2147483647] flex items-end justify-center bg-slate-950/60 px-3 pb-3 pt-3 backdrop-blur-md" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="bookmarks-modal-title" className="relative flex max-h-[76dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[34px] bg-white text-slate-900 shadow-[0_18px_60px_rgba(35,0,82,.24)] dark:bg-[#090909] dark:text-[#f5f6fb]">
        <div className="flex shrink-0 justify-center pt-3"><span className="h-1.5 w-14 rounded-full bg-[#ded9e5] dark:bg-white/20" /></div>
        <button type="button" onClick={onClose} aria-label="Close bookmarks" className="absolute right-4 top-6 z-10 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"><X size={20} /></button>
        <header className="flex shrink-0 flex-col items-center px-6 pb-3 pt-3 text-center sm:px-8">
          <span className="mb-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[#230052] text-white dark:bg-white dark:text-[#101027]"><Bookmark size={21} /></span>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#230052]/65 dark:text-white">Saved items</p>
          <h2 id="bookmarks-modal-title" className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Your bookmarks <span className="text-sm font-semibold text-slate-400">({items.length})</span></h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Open a saved item to jump back to it.</p>
        </header>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-5 pb-3 pt-1 sm:px-8">
          {items.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-5 py-10 text-center dark:bg-white/[.05]"><Bookmark size={24} className="mx-auto mb-3 text-slate-400" /><p className="text-sm font-semibold">No bookmarks yet</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{emptyHint}</p></div>
          ) : items.map((item) => (
            <button key={item.id} type="button" onClick={() => { onSelect(item); onClose(); }} className="flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/[.04] dark:hover:bg-white/[.08]">
              <span className="min-w-0"><span className="block truncate text-sm font-bold">{item.title}</span><span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</span></span>
              {item.badge && <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${item.badgeClass || "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200"}`}>{item.badge}</span>}
            </button>
          ))}
        </div>
        <footer className="shrink-0 border-t border-slate-100 bg-white/95 px-5 pb-3 pt-2.5 dark:border-white/10 dark:bg-[#090909]/95 sm:px-8">
          <button type="button" onClick={onClose} className="flex min-h-12 w-full items-center justify-center rounded-full bg-[#230052] px-5 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-[#101027]">Done</button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
