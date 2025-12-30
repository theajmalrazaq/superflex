import React from "react";

const Button = ({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary", 
  disabled = false,
  className = "",
  icon,
  isLoading = false
}) => {
  const baseStyles = "relative flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 overflow-hidden group";
  
  const variants = {
    primary: "bg-x text-zinc-950 border-none hover:bg-[#b0a8ff]",
    secondary: "bg-white/5 text-zinc-400 hover:text-white border border-white/5 hover:bg-white/10",
    danger: "bg-rose-500 text-white border-none hover:bg-rose-600 disabled:bg-zinc-800 disabled:text-zinc-400",
    success: "bg-emerald-500 text-white border-none hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-400",
    outline: "bg-transparent text-zinc-400 border border-white/10 hover:border-white/20 hover:text-white"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      <div className="flex items-center justify-center w-full min-h-[1.5rem]">
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
        ) : (
          <div className="flex items-center justify-center gap-2.5">
            {icon && (
              <span className="shrink-0 flex items-center justify-center translate-y-[0.5px]">
                {icon}
              </span>
            )}
            <span className="truncate">{children}</span>
          </div>
        )}
      </div>
    </button>
  );
};

export default Button;
