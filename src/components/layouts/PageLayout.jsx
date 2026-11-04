import React, { useEffect, useState } from "react";
import NavBar from "../NavBar";

function PageLayout({
  children,
  currentPage,
  onAttendanceLinkFound,
  onLinksFound,
  fullWidth = false,
}) {
  const [customBackground, setCustomBackground] = useState(() => ({
    enabled: localStorage.getItem("superflex-bg-enabled") === "true",
    url: localStorage.getItem("superflex-bg-url") || "",
  }));

  useEffect(() => {
    const handleCustomBackground = (event) => setCustomBackground(event.detail);
    window.addEventListener("superflex-custom-background-changed", handleCustomBackground);
    return () => window.removeEventListener("superflex-custom-background-changed", handleCustomBackground);
  }, []);

  const customUrl = (() => {
    try {
      const parsed = new URL(customBackground.url);
      return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
    } catch {
      return "";
    }
  })();
  const customVideo = /\.(mp4|webm|ogg)(?:$|\?)/i.test(customUrl);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#e4eff7] font-sans text-slate-900 transition-colors duration-300 dark:bg-black dark:text-[#f5f6fb]">
      <div
        aria-hidden="true"
        className="superflex-account-backdrop pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {customBackground.enabled && customUrl && (customVideo ? (
          <video src={customUrl} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <img src={customUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ))}
        <img
          src={chrome.runtime.getURL("assets/clouds/cloud-2.webp")}
          alt=""
          className="superflex-account-cloud absolute -right-10 -top-6 w-72 select-none opacity-80 sm:w-96"
        />
        <img
          src={chrome.runtime.getURL("assets/clouds/cloud-2.webp")}
          alt=""
          className="superflex-account-cloud absolute left-[4%] top-32 w-44 -scale-x-100 select-none opacity-70 sm:w-56"
        />
      </div>

      <NavBar
        currentPage={currentPage}
        onAttendanceLinkFound={onAttendanceLinkFound}
        onLinksFound={onLinksFound}
      />

      <main
        className={`relative z-10 min-h-screen overflow-x-hidden lg:ml-[276px] ${
          fullWidth ? "" : "px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        }`}
      >
        {children}
      </main>
    </div>
  );
}

export default PageLayout;
