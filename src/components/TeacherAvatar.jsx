import React from "react";

export default function TeacherAvatar({ teacher, size = "md" }) {
  const dimensions = size === "sm" ? "h-10 w-10 text-xs" : "h-11 w-11 text-sm";
  return teacher.image ? (
    <img
      src={teacher.image}
      alt=""
      className={`${dimensions} shrink-0 rounded-2xl object-cover`}
      loading="lazy"
    />
  ) : (
    <span
      className={`${dimensions} flex shrink-0 items-center justify-center rounded-2xl bg-[#230052]/10 font-bold text-[#230052] dark:bg-white/15 dark:text-white`}
    >
      {(teacher.name || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()}
    </span>
  );
}
