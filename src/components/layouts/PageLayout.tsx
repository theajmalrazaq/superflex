import type { z } from "zod/mini";
import type { sidebarLinkSchema } from "../../stores/preferencesSchemas";

interface PageLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onAttendanceLinkFound?: (href: string) => void;
  onLinksFound?: (links: z.infer<typeof sidebarLinkSchema>[]) => void;
  fullWidth?: boolean;
}

import React from "react";
import NavBar from "../NavBar";
import { getExtensionUrl } from "../../utils/extensionApi";
import { usePreferencesStore } from "../../stores/preferencesStore";

function PageLayout({
  children,
  currentPage,
  onAttendanceLinkFound,
  onLinksFound,
  fullWidth = false,
}: PageLayoutProps) {
  const customBackground = usePreferencesStore((state) => state.customBackground);
  const customUrl = customBackground.url;
  const customVideo = customUrl
    ? ["mp4", "webm", "ogg"].includes(
        new URL(customUrl).pathname.split(".").pop()?.toLowerCase() || "",
      )
    : false;
  const cloudAssetUrl = getExtensionUrl("assets/clouds/cloud-2.webp");

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#e4eff7] font-sans text-slate-900 transition-colors duration-300 dark:bg-black dark:text-[#f5f6fb]">
      <div
        aria-hidden="true"
        className="superflex-account-backdrop pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {customBackground.enabled &&
          customUrl &&
          (customVideo ? (
            <video
              src={customUrl}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <img src={customUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ))}
        {cloudAssetUrl && (
          <>
            <img
              src={cloudAssetUrl}
              alt=""
              className="superflex-account-cloud absolute -right-10 -top-6 w-72 select-none opacity-80 sm:w-96"
            />
            <img
              src={cloudAssetUrl}
              alt=""
              className="superflex-account-cloud absolute left-[4%] top-32 w-44 -scale-x-100 select-none opacity-70 sm:w-56"
            />
          </>
        )}
      </div>

      <NavBar
        currentPage={currentPage}
        onAttendanceLinkFound={onAttendanceLinkFound}
        onLinksFound={onLinksFound}
      />

      <main
        className={`relative z-10 min-h-screen overflow-x-hidden lg:ml-[276px] ${
          fullWidth ? "pb-24 lg:pb-0" : "px-4 pb-24 pt-2 sm:px-6 sm:py-6 lg:px-8 lg:py-8"
        }`}
      >
        {children}
      </main>
    </div>
  );
}

export default PageLayout;
