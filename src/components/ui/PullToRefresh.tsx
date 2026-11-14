import React, { useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { startNavigationLoading } from "../../utils/navigationLoading";

const PULL_THRESHOLD = 65;
const MAX_PULL = 84;

export default function PullToRefresh() {
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const canPullRef = useRef(false);
  const isPullingRef = useRef(false);

  useEffect(() => {
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;

    if (!isTouch) return undefined;

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshing) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      if (scrollY <= 0) {
        canPullRef.current = true;
        startYRef.current = e.touches[0].clientY;
        startXRef.current = e.touches[0].clientX;
      } else {
        canPullRef.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canPullRef.current || isRefreshing) return;
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const diffY = currentY - startYRef.current;
      const diffX = Math.abs(currentX - startXRef.current);

      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      if (scrollY > 0) {
        canPullRef.current = false;
        if (isPullingRef.current) {
          isPullingRef.current = false;
          setPullY(0);
        }
        return;
      }

      if (diffY > 8 && diffY > diffX) {
        isPullingRef.current = true;
        if (e.cancelable && diffY > 15) {
          e.preventDefault();
        }
        const damped = Math.min(MAX_PULL, Math.pow(diffY, 0.82) * 1.55);
        setPullY(damped);
      } else if (diffY <= 0 && isPullingRef.current) {
        isPullingRef.current = false;
        setPullY(0);
      }
    };

    const handleTouchEnd = () => {
      if (!canPullRef.current && !isPullingRef.current) return;
      canPullRef.current = false;

      if (isPullingRef.current && pullY >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        setPullY(50);
        try {
          navigator.vibrate?.(18);
        } catch {}

        startNavigationLoading();

        setTimeout(() => {
          window.location.reload();
        }, 200);
      } else {
        isPullingRef.current = false;
        setPullY(0);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [pullY, isRefreshing]);

  if (pullY <= 0 && !isRefreshing) return null;

  const progress = Math.min(1, pullY / PULL_THRESHOLD);
  const rotation = isRefreshing ? undefined : progress * 360;
  const scale = 0.7 + progress * 0.3;
  const opacity = Math.min(1, pullY / 20);

  return (
    <div
      className="pointer-events-none fixed top-0 left-1/2 z-[99999999] flex -translate-x-1/2 items-center justify-center transition-all duration-150 ease-out"
      style={{
        transform: `translate(-50%, ${pullY}px) scale(${scale})`,
        opacity,
      }}
      aria-hidden="true"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-[28%] border border-black/10 bg-white/95 text-slate-800 shadow-lg shadow-black/10 backdrop-blur-md dark:border-white/15 dark:bg-[#0c0d12]/95 dark:text-white dark:shadow-black/30">
        <RefreshCw
          size={18}
          className={isRefreshing ? "animate-spin text-primary" : "text-current transition-transform"}
          style={rotation !== undefined ? { transform: `rotate(${rotation}deg)` } : undefined}
        />
      </div>
    </div>
  );
}
