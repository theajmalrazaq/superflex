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
      className={`mb-4 flex flex-col items-start justify-between gap-3 sm:mb-6 sm:gap-6 md:mb-10 lg:flex-row lg:items-center ${className}`}
    >
      <div className="space-y-1">
        <h1 className="text-[30px] font-extrabold leading-[1.08] tracking-[-0.035em] text-foreground sm:text-3xl sm:font-black sm:tracking-tighter md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs font-medium text-foreground/60 sm:text-sm md:text-lg">{subtitle}</p>
        )}
      </div>
      <div className="flex w-full flex-wrap items-center justify-start gap-2.5 sm:gap-4 lg:w-auto lg:justify-end">
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
