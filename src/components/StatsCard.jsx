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
      className={`flex-1 min-w-[200px] p-6 rounded-[2rem] border border-white/5 bg-zinc-900/50 backdrop-blur-xl hover:bg-zinc-900/70 transition-all duration-300 hover:-translate-y-1 group ${className}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3.5 bg-[#a098ff]/10 rounded-2xl text-[#a098ff] group-hover:scale-110 transition-transform duration-300">
          <Icon size={24} />
        </div>
      </div>
      <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-2 overflow-hidden">
        <h3 className="text-2xl md:text-3xl font-black font-sans text-white tracking-tighter truncate">
          {value}
        </h3>
        {subValue && (
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
