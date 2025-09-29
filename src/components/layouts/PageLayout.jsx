import React from "react";
import NavBar from "../NavBar";

function PageLayout({ children, currentPage, onAttendanceLinkFound }) {
  return (
    <div className="flex h-screen">
      <div className="fixed h-full">
        <NavBar
          currentPage={currentPage}
          onAttendanceLinkFound={onAttendanceLinkFound}
        />
      </div>
      <div className="ml-[250px] flex-1 !p-5">{children}</div>
    </div>
  );
}

export default PageLayout;
