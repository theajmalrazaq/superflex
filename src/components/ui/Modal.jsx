import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-lg",
  icon,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      {}
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {}
      <div
        className={`relative w-full ${maxWidth} bg-background border border-foreground/10 rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]`}
      >
        {}
        <div className="p-6 md:p-8 flex justify-between items-start shrink-0">
          <div className="flex items-start gap-4">
            {icon && (
              <div className="p-3 bg-accent/10 text-accent rounded-2xl shrink-0">
                {icon}
              </div>
            )}
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-accent text-[10px] font-black Cap tracking-[0px] opacity-80">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-foreground/5 hover:bg-foreground/10 rounded-2xl text-foreground/50 hover:text-foreground transition-all duration-300 group"
            aria-label="Close modal"
          >
            <X
              size={20}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
          </button>
        </div>

        {}
        <div className="px-6 md:px-8 pb-8 overflow-y-auto scrollbar-hide flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
