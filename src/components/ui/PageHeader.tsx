import React from "react";

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const PageHeader = ({ title, subtitle, children, className = "" }: PageHeaderProps) => {
  return (
    <div
      className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6 md:mb-10 ${className}`}
    >
      <div className="space-y-1">
        <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-foreground/50 font-medium text-sm md:text-lg">{subtitle}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-start lg:justify-end">
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
