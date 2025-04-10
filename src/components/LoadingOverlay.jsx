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
    window.addEventListener("load", () => {
      setLoading(false);
    });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", () => {
        setLoading(false);
      });
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
      className={`loading-overlay h-screen ${
        !show || !loading ? "fade-out" : ""
      }`}
    >
      <div className="absolute inset-0 bg-black flex items-center justify-center"></div>
      <div className="flex flex-col items-center">
        <div className="spinner mb-4"></div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
