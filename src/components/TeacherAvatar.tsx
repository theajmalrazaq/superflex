import type { Teacher } from "../types/teacher";
import React, { useState } from "react";
import { cn } from "../utils/cn";
import { getTeacherImageUrl } from "../utils/teacherImage";

export default function TeacherAvatar({
  teacher,
  size = "md",
  className,
}: {
  teacher: Pick<Teacher, "image" | "name">;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const imageUrl = getTeacherImageUrl(teacher.image);
  const dimensions =
    size === "xs"
      ? "h-6 w-6 text-[9px]"
      : size === "sm"
        ? "h-10 w-10 text-xs"
        : "h-11 w-11 text-sm";
  return imageUrl && failedImage !== imageUrl ? (
    <img
      src={imageUrl}
      alt=""
      className={cn(dimensions, "shrink-0 rounded-2xl object-cover", className)}
      loading="lazy"
      onError={() => setFailedImage(imageUrl)}
    />
  ) : (
    <span
      aria-label={teacher.name}
      className={cn(
        dimensions,
        "flex shrink-0 items-center justify-center rounded-2xl bg-[#230052]/10 font-bold text-[#230052] dark:bg-white/15 dark:text-white",
        className,
      )}
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
