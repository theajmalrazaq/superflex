import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

export const buttonVariants = cva(
  "group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-4 text-[10px] font-bold tracking-[0px] transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
  {
    variants: {
      variant: {
        primary: "border-none bg-accent text-[var(--accent-foreground)] hover:opacity-90",
        secondary:
          "border border-foreground/10 bg-foreground/5 text-foreground/60 hover:bg-foreground/10 hover:text-foreground",
        danger:
          "border-none bg-error text-white hover:opacity-90 disabled:bg-tertiary disabled:text-foreground/60",
        success:
          "border-none bg-success text-white hover:opacity-90 disabled:bg-tertiary disabled:text-foreground/60",
        outline:
          "border border-foreground/10 bg-transparent text-foreground/60 hover:border-foreground/20 hover:text-foreground",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { icon?: React.ReactNode; isLoading?: boolean };

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  icon,
  isLoading = false,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    >
      <div className="flex min-h-[1.5rem] w-full items-center justify-center">
        {isLoading ? (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : (
          <div className="flex items-center justify-center gap-2.5">
            {icon && (
              <span className="flex shrink-0 translate-y-[0.5px] items-center justify-center">
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
