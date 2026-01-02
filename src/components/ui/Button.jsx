import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  icon,
  isLoading = false,
}) => {
  const baseStyles =
    "relative flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold Cap text-[10px] tracking-[0px] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 overflow-hidden group";

  const variants = {
    primary: "bg-accent text-zinc-950 border-none hover:opacity-90",
    secondary:
      "bg-foreground/5 text-foreground/60 hover:text-foreground border border-foreground/10 hover:bg-foreground/10",
    danger:
      "bg-error text-foreground border-none hover:opacity-90 disabled:bg-tertiary disabled:text-foreground/60",
    success:
      "bg-success text-foreground border-none hover:opacity-90 disabled:bg-tertiary disabled:text-foreground/60",
    outline:
      "bg-transparent text-foreground/60 border border-foreground/10 hover:border-foreground/20 hover:text-foreground",
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
