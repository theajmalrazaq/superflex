import React, { useEffect, useState } from "react";
import "../../styles/loading.css";
import { getExtensionUrl } from "../../utils/extensionApi";

const LoadingOverlay = ({ show = true }) => {
  const [isVisible, setIsVisible] = useState(show);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const handleCustomLoading = (e) => {
      const next =
        typeof e.detail === "boolean"
          ? e.detail
          : e.detail?.isLoading !== undefined
            ? Boolean(e.detail.isLoading)
            : null;
      if (next === null) return;
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      setLoading(next);
      if (next) {
        setIsVisible(true);
        fallbackTimer = setTimeout(() => setLoading(false), 10000);
      }
    };

    window.addEventListener("superflex-update-loading", handleCustomLoading);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 700);

    const handleLoad = () => {
      setLoading(false);
    };

    window.addEventListener("load", handleLoad);

    return () => {
      clearTimeout(timer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      window.removeEventListener("load", handleLoad);
      window.removeEventListener("superflex-update-loading", handleCustomLoading);
    };
  }, []);

  useEffect(() => {
    if (!show || !loading) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [show, loading]);

  if (!isVisible) return null;

  const isFading = !show || !loading;
  const cloudUrl = getExtensionUrl("assets/clouds/cloud-2.webp");

  return (
    <div aria-hidden="true" className={`loading-overlay ${isFading ? "fade-out" : ""}`}>
      {}
      {cloudUrl && (
        <>
          <img
            src={cloudUrl}
            alt=""
            className="overlay-cloud-left pointer-events-none absolute -left-12 top-10 w-80 select-none opacity-80 sm:w-96 dark:opacity-20"
          />
          <img
            src={cloudUrl}
            alt=""
            className="overlay-cloud-right pointer-events-none absolute -right-16 bottom-16 w-88 select-none opacity-75 sm:w-[28rem] dark:opacity-20"
          />
        </>
      )}

      {}
      <div className="relative z-10 flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28%] border border-white/40 bg-white/60 shadow-none backdrop-blur-md dark:border-white/10 dark:bg-black/40">
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          width="56"
          height="56"
          fill="none"
          className="relative z-10"
        >
          <path
            fill="currentColor"
            className="animate-splash text-[#230052] dark:text-white"
            d="M13.295 10.769l2.552-5.787-7.979 7.28 3.254.225-3.353 6.362 8.485-7.388-2.959-.692z"
          />
        </svg>
      </div>
    </div>
  );
};

export default LoadingOverlay;
