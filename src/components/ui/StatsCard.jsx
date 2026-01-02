import React from "react";

const StatsCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  delay = 0,
  className = "",
}) => {
  return (
    <div
      className={`flex-1 min-w-[200px] p-6 rounded-[2rem] border border-foreground/10 bg-secondary/50 backdrop-blur-xl hover:bg-secondary/70 transition-all duration-300 hover:-translate-y-1 group ${className}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3.5 bg-accent/10 rounded-2xl text-accent group-hover:scale-110 transition-transform duration-300">
          <Icon size={24} />
        </div>
      </div>
      <p className="text-foreground/50 text-[10px] Cap tracking-[0px] font-black mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-2 overflow-hidden">
        <h3 className="text-2xl md:text-3xl font-black font-sans text-foreground tracking-tighter truncate">
          {value}
        </h3>
        {subValue && (
          <span className="text-[10px] font-bold text-foreground/50 Cap tracking-[0px] truncate">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
