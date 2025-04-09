import React, { useEffect, useState } from "react";
import "../styles/loading.css";

function LoadingOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Check if document is already loaded
    if (document.readyState === "complete") {
      setVisible(false);
      return;
    }

    // Handler function to hide overlay
    const hideOverlay = () => {
      setVisible(false);
    };

    // Add event listener
    window.addEventListener("load", hideOverlay);

    // Fallback timeout (3 seconds)
    const timeoutId = setTimeout(() => {
      setVisible(false);
    }, 3000);

    // Cleanup function
    return () => {
      window.removeEventListener("load", hideOverlay);
      clearTimeout(timeoutId);
    };
  }, []);

  // Don't render anything if not visible
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 opacity-100 transition-opacity duration-500">
      <div className="spinner"></div>
    </div>
  );
}

export default LoadingOverlay;
