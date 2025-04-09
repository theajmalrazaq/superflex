import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";

function AttendancePage() {
  const [elemContent, setElemContent] = useState(null);

  const badgeAlertPath =
    "M12 16v-4 M12 8h.01 M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z";

  useEffect(() => {
    const alertElement = document.querySelector(
      ".m-alert.m-alert--icon.m-alert--icon-solid.m-alert--outline.alert.alert-info.alert-dismissible.fade.show"
    );
    if (alertElement) {
      alertElement.classList.add(
        "!bg-black",
        "!text-white",
        "!border-white/10",
        "!font-bold",
        "!p-4",
        "!rounded-3xl",
        "!flex",
        "!justify-between",
        "!items-center"
      );
      alertElement.style.visibility = "visible";
      alertElement.style.display = "block";
    }

    const iconElement = alertElement?.querySelector(".m-alert__icon");
    if (iconElement) {
      iconElement.classList.add(
        "!text-white",
        "!text-2xl",
        "!bg-x",
        "!rounded-full",
        "!p-2",
        "!w-12",
        "!h-12",
        "!flex",
        "!items-center",
        "!justify-center"
      );

      // Create SVG element
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "24");
      svg.setAttribute("height", "24");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "2");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
      svg.classList.add("w-6", "h-6", "text-white");

      // Create path element
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute("d", badgeAlertPath);

      // Append path to SVG and SVG to icon element
      svg.appendChild(path);
      iconElement.innerHTML = ""; // Clear existing content
      iconElement.appendChild(svg);
    }

    // Find the close button and add the close icon SVG
    const closeButton = alertElement?.querySelector(
      'button.close[data-dismiss="alert"]'
    );
    if (closeButton) {
      // Hide the ::before pseudo-element
      closeButton.style.cssText = "content: none !important;";
      // Add a style tag to ensure ::before is hidden
      const style = document.createElement("style");
      style.textContent =
        'button.close[data-dismiss="alert"]::before { display: none !important; content: none !important; }';
      document.head.appendChild(style);

      // Create SVG element for close button
      const closeSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      closeSvg.setAttribute("width", "24");
      closeSvg.setAttribute("height", "24");
      closeSvg.setAttribute("viewBox", "0 0 24 24");
      closeSvg.setAttribute("fill", "none");
      closeSvg.setAttribute("stroke", "currentColor");
      closeSvg.setAttribute("stroke-width", "2");
      closeSvg.setAttribute("stroke-linecap", "round");
      closeSvg.setAttribute("stroke-linejoin", "round");
      closeSvg.classList.add("w-4", "h-4", "text-white");

      // Create paths for X shape
      const line1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line1.setAttribute("x1", "18");
      line1.setAttribute("y1", "6");
      line1.setAttribute("x2", "6");
      line1.setAttribute("y2", "18");

      const line2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line2.setAttribute("x1", "6");
      line2.setAttribute("y1", "6");
      line2.setAttribute("x2", "18");
      line2.setAttribute("y2", "18");

      // Append paths to SVG and SVG to close button
      closeSvg.appendChild(line1);
      closeSvg.appendChild(line2);
      closeButton.innerHTML = ""; // Clear any existing content
      closeButton.appendChild(closeSvg);
      closeButton.classList.add("!focus:outline-none");
    }
    document
      .querySelector(".m-portlet__head")
      .classList.add(
        "!bg-black",
        "!border",
        "!border-white/10",
        "!rounded-t-3xl",
        "!p-4",
        "!flex",
        "!items-center",
        "!justify-between"
      );
    document
      .querySelector(".m-portlet__body")
      .classList.add(
        "!bg-black",
        "rounded-3xl",
        "!p-8",
        "!border",
        "!border-white/10",
        "!shadow-lg",
        "!flex",
        "!flex-col",
        "!items-center",
        "!justify-center",
        "text-white"
      );

    const targetElement = document.querySelector(
      ".m-grid.m-grid--hor.m-grid--root.m-page"
    );

    if (targetElement) {
      setElemContent(targetElement.innerHTML);
      targetElement.remove();
    }
  }, []);

  return (
    <PageLayout currentPage={window.location.pathname}>
      {elemContent && (
        <div
          className="m-grid m-grid--hor m-grid--root m-page"
          dangerouslySetInnerHTML={{ __html: elemContent }}
        />
      )}
    </PageLayout>
  );
}

export default AttendancePage;
