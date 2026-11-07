import React from "react";
import { cn } from "../../utils/cn";

type FieldProps = { label?: React.ReactNode; error?: React.ReactNode };

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & FieldProps) => {
  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <label className="text-[10px] font-medium text-foreground/50  tracking-[0px] px-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className={cn(
            "w-full rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-4 text-sm font-medium text-foreground transition-all duration-300 placeholder:text-xs placeholder:tracking-[0px] placeholder:text-foreground/40 focus:border-accent/30 focus:bg-foreground/[0.05] focus:outline-none",
            error && "border-rose-500/50 focus:border-rose-500",
          )}
          {...props}
        />
        {}
        <div className="absolute inset-0 rounded-2xl border border-accent/0 group-focus-within:border-accent/30 pointer-events-none transition-all duration-500" />
      </div>
      {error && <p className="text-[10px] text-rose-400 font-bold   px-1">{error}</p>}
    </div>
  );
};

export const TextArea = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  className = "",
  rows = 4,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps) => {
  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <label className="text-[10px] font-bold text-foreground/50  tracking-[0px] px-1">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full resize-none rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-4 text-sm font-medium text-foreground transition-all duration-300 placeholder:text-xs placeholder:tracking-[0px] placeholder:text-foreground/40 focus:border-accent/30 focus:bg-foreground/[0.05] focus:outline-none",
          error && "border-rose-500/50 focus:border-rose-500",
        )}
        {...props}
      />
      {error && <p className="text-[10px] text-rose-400 font-bold   px-1">{error}</p>}
    </div>
  );
};

export default Input;
