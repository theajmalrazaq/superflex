import React, { useEffect, useState } from "react";
import "../styles/loading.css";

const LoadingOverlay = ({ show = true }) => {
  const [isVisible, setIsVisible] = useState(show);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to hide the loading overlay after 2 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Listen for when the page has finished loading
    const handleLoad = () => {
      setLoading(false);
    };

    window.addEventListener("load", handleLoad);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  useEffect(() => {
    if (!show || !loading) {
      // Add a small delay before hiding to allow animation to complete
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
      className={`loading-overlay h-screen fixed inset-0 z-50 ${
        !show || !loading ? "fade-out" : ""
      }`}
    >
      <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
        <div className="h-20 w-20 bg-[url('res/bg.png')] bg-black border-7 border-white/5 bg-cover rounded-[29px] flex items-center justify-center" data-aos="zoom-in" data-aos-duration="1000">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="84" height="84" fill="none">
            <path className="animate-splash" fill="#a098ff" d="M13.295 10.769l2.552-5.787-7.979 7.28 3.254.225-3.353 6.362 8.485-7.388-2.959-.692z"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
