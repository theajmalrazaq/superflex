import React from "react";

const PageHeader = ({ title, subtitle, children, className = "" }) => {
  return (
    <div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 ${className}`}
    >
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
          {title}
        </h1>
        {subtitle && (
          <p className="text-zinc-400 font-medium text-lg">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-start lg:justify-end">
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
