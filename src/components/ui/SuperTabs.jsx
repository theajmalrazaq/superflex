import React from "react";

const SuperTabs = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-[11px]",
    md: "px-5 py-2 text-xs",
    lg: "px-6 py-3 text-sm",
  };

  return (
    <div
      className={`flex gap-1.5 bg-zinc-900/50 p-1 rounded-full border border-white/5 backdrop-blur-md overflow-x-auto scrollbar-hide max-w-full ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`
              ${sizeClasses[size] || sizeClasses.md}
              rounded-full font-bold transition-all duration-300 whitespace-nowrap relative
              ${
                isActive
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              }
            `}
          >
            {}
            {isActive && (
              <div className="absolute inset-0 bg-x rounded-full -z-10 animate-in fade-in zoom-in-95 duration-300" />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SuperTabs;
