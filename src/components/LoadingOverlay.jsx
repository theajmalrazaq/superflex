import React, { useEffect, useState } from 'react';
import '../styles/loading.css';

function LoadingOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    window.addEventListener('load', () => {
      setVisible(false);
    });

    const timer = setTimeout(() => {
      setVisible(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 opacity-100 transition-opacity duration-500">
      <div className="spinner"></div>
    </div>
  );
}

export default LoadingOverlay;