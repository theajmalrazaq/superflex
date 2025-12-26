import React, { useState } from "react";
import NavBar from "../NavBar";

function PageLayout({
  children,
  currentPage,
  onAttendanceLinkFound,
  onLinksFound,
}) {
  const [navLinks, setNavLinks] = useState([]);

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans transition-colors duration-300">
      
      {/* Navbar Container */}
      <div className="sticky flex justify-center top-4 z-[100] px-6 mb-2">
        <div className="w-full md:w-fit lg:w-fit rounded-full flex justify-center items-center border border-white/10 bg-black/20 backdrop-blur-2xl transition-all duration-300">
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

      <div className="w-full flex-1 p-6 pt-4 overflow-x-hidden">{children}</div>
    </div>
  );
}

export default PageLayout;
