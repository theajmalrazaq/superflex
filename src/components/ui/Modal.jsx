import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Premium Modal Component
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to call when closing the modal
 * @param {string} title - Modal title
 * @param {string} subtitle - Modal subtitle (optional)
 * @param {React.ReactNode} children - Modal content
 * @param {string} maxWidth - Tailwind max-width class (default: max-w-lg)
 * @param {React.ReactNode} icon - Optional icon to display next to title
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children, 
  maxWidth = "max-w-lg",
  icon
}) => {
  // Prevent body scroll when modal is open
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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className={`relative w-full ${maxWidth} bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="p-6 md:p-8 flex justify-between items-start shrink-0">
          <div className="flex items-start gap-4">
            {icon && (
              <div className="p-3 bg-x/10 text-x rounded-2xl shrink-0">
                {icon}
              </div>
            )}
            <div className="space-y-1">
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-x text-[10px] font-black uppercase tracking-widest opacity-80">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-zinc-500 hover:text-white transition-all duration-300 group"
            aria-label="Close modal"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 md:px-8 pb-8 overflow-y-auto scrollbar-hide flex-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
