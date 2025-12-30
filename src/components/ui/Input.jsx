import React from "react";

const Input = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  error, 
  className = "",
  ...props 
}) => {
  return (
    <div className={`space-y-2 w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full bg-white/[0.03] border border-white/5 text-white p-4 rounded-2xl text-sm font-medium 
            focus:outline-none focus:border-x/30 focus:bg-white/[0.05]
            placeholder:text-zinc-600 placeholder:text-xs placeholder:uppercase placeholder:tracking-widest
            transition-all duration-300
            ${error ? "border-rose-500/50 focus:border-rose-500" : ""}
          `}
          {...props}
        />
        {/* Animated border gradient effect on focus */}
        <div className="absolute inset-0 rounded-2xl border border-x/0 group-focus-within:border-x/30 pointer-events-none transition-all duration-500" />
      </div>
      {error && (
        <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider px-1">
          {error}
        </p>
      )}
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
}) => {
  return (
    <div className={`space-y-2 w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`
          w-full bg-white/[0.03] border border-white/5 text-white p-4 rounded-2xl text-sm font-medium 
          focus:outline-none focus:border-x/30 focus:bg-white/[0.05]
          placeholder:text-zinc-600 placeholder:text-xs placeholder:uppercase placeholder:tracking-widest
          transition-all duration-300 resize-none
          ${error ? "border-rose-500/50 focus:border-rose-500" : ""}
        `}
        {...props}
      />
      {error && (
        <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider px-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
