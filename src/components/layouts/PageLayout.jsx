import React, { useState } from "react";
import NavBar from "../NavBar";

function PageLayout({
  children,
  currentPage,
  onAttendanceLinkFound,
  onLinksFound,
  fullWidth = false,
}) {
  const [navLinks, setNavLinks] = useState([]);

  return (
    <div className="min-h-screen bg-background font-sans transition-colors duration-300 relative">
      {}
      <div className="fixed left-0 right-0 top-6 z-[100] flex justify-center px-6 pointer-events-none">
        <div className="w-full md:w-fit lg:w-fit rounded-full flex justify-center items-center border border-foreground/10 bg-background/20 backdrop-blur-2xl transition-all duration-300 pointer-events-auto">
          <NavBar
            currentPage={currentPage}
            onAttendanceLinkFound={onAttendanceLinkFound}
            onLinksFound={(links) => {
              setNavLinks(links);
              if (onLinksFound) onLinksFound(links);
            }}
          />
        </div>
      </div>

      <div
        className={`w-full flex-1 overflow-x-hidden ${fullWidth ? "" : "md:px-12 px-4 pt-28 pb-12"}`}
      >
        {children}
      </div>
    </div>
  );
}

export default PageLayout;
