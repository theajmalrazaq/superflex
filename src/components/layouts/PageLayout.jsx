import React from "react";
import NavBar from "../NavBar";

function PageLayout({ children, currentPage, onAttendanceLinkFound, onLinksFound }) {
  return (
    <div className="min-h-screen bg-black flex flex-col font-sans transition-colors duration-300">

      {/* Floating Modern Header */}
      <div className="sticky flex justify-center top-4 z-[100] px-4 sm:px-6 mb-2">
        <div className="rounded-full flex justify-center items-center border border-white/10 bg-black/20 backdrop-blur-2xl transition-all duration-300">
          <NavBar
            currentPage={currentPage}
            onAttendanceLinkFound={onAttendanceLinkFound}
            onLinksFound={onLinksFound}
          />
        </div>
      </div>
      
      <div className="w-full flex-1 p-6 pt-4 overflow-x-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">{children}</div>
    </div>
  );
}

export default PageLayout;
