import React, { useEffect, useState } from "react";
import "../../styles/loading.css";

const LoadingOverlay = ({ show = true, isFullScreen = true }) => {
  const [isVisible, setIsVisible] = useState(show);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCustomLoading = (e) => {
      if (typeof e.detail === "boolean") {
        setLoading(e.detail);
        if (e.detail) setIsVisible(true);
      } else if (e.detail?.isLoading !== undefined) {
        setLoading(e.detail.isLoading);
        if (e.detail.isLoading) setIsVisible(true);
      }
    };

    window.addEventListener("superflex-update-loading", handleCustomLoading);

    if (isFullScreen) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);

      const handleLoad = () => {
        setLoading(false);
      };

      window.addEventListener("load", handleLoad);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("load", handleLoad);
        window.removeEventListener(
          "superflex-update-loading",
          handleCustomLoading,
        );
      };
    }

    return () => {
      window.removeEventListener(
        "superflex-update-loading",
        handleCustomLoading,
      );
    };
  }, [isFullScreen]);

  useEffect(() => {
    if (!show || !loading) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [show, loading]);

  if (!isVisible) return null;

  return (
    <div
      className={`loading-overlay fixed inset-0 z-[10000] h-screen w-screen flex items-center justify-center ${
        !show || !loading ? "fade-out" : ""
      }`}
    >
      <div className="bg-background border flex items-center justify-center h-24 w-24 rounded-[32px] relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/10 blur-xl"></div>
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          fill="none"
          className="relative z-10"
        >
          <path
            className="animate-splash"
            fill="var(--accent)"
            d="M13.295 10.769l2.552-5.787-7.979 7.28 3.254.225-3.353 6.362 8.485-7.388-2.959-.692z"
          />
        </svg>
      </div>
    </div>
  );
};

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      <div className="bg-background/50 border flex items-center justify-center h-16 w-16 rounded-[20px] relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/5 blur-md"></div>
        <svg
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          width="42"
          height="42"
          fill="none"
          className="relative z-10"
        >
          <path
            className="animate-splash"
            fill="var(--accent)"
            d="M13.295 10.769l2.552-5.787-7.979 7.28 3.254.225-3.353 6.362 8.485-7.388-2.959-.692z"
          />
        </svg>
      </div>
    </div>
  );
};

export default LoadingOverlay;
