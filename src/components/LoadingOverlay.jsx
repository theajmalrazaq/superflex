import React, { useEffect, useState } from "react";
import "../styles/loading.css";

const LoadingOverlay = ({ show = true, isFullScreen = true }) => {
  const [isVisible, setIsVisible] = useState(show);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      };
    }
  }, [isFullScreen]);

  useEffect(() => {
    if (!show || !loading) {
      
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [show, loading]);

  if (!isVisible) return null;

  return (
    <div
      className={`loading-overlay ${
        isFullScreen ? "h-screen fixed inset-0 z-50" : "absolute inset-0 w-full h-full z-10 rounded-[inherit]"
      } ${
        !show || (!isFullScreen ? false : !loading) ? "fade-out" : ""
      }`}
    >
      <div className={`absolute inset-0 bg-black flex items-center justify-center ${!isFullScreen ? "bg-black/50 backdrop-blur-sm rounded-[inherit]" : ""}`}>
        <div
          className={`bg-[url('res/bg.png')] bg-black border-7 border-white/5 bg-cover flex items-center justify-center ${
            isFullScreen ? "h-20 w-20 rounded-[29px]" : "h-16 w-16 rounded-[20px] scale-75"
          }`}
          data-aos={isFullScreen ? "zoom-in" : ""}
          data-aos-duration="1000"
        >
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            width={isFullScreen ? "84" : "64"}
            height={isFullScreen ? "84" : "64"}
            fill="none"
          >
            <path
              className="animate-splash"
              fill="#a098ff"
              d="M13.295 10.769l2.552-5.787-7.979 7.28 3.254.225-3.353 6.362 8.485-7.388-2.959-.692z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
