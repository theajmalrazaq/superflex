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
  const baseStyles = "relative flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold uppercase text-xs transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 overflow-hidden group";
  
  const variants = {
    primary: "bg-x text-white border-none",
    secondary: "bg-white/5 text-zinc-400  hover:text-white border border-white/5",
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/10",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
