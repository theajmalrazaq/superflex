import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";

function CourseRegistrationPage() {
  const [elemContent, setElemContent] = useState(null);

  const badgeAlertPath =
    "M12 8.5l3.5 7H8.5l3.5-7z M8.5 2h7L22 8.5v7L15.5 22h-7L2 15.5v-7L8.5 2z M12 16h.01";

  useEffect(() => {
    const alertElement = document.querySelector(
      ".m-alert.m-alert--icon.m-alert--icon-solid.m-alert--outline.alert.alert-warning.alert-dismissible.fade.show",
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
        "!items-center",
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
        "!justify-center",
      );

      
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

      
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("d", badgeAlertPath);

      
      svg.appendChild(path);
      iconElement.innerHTML = ""; 
      iconElement.appendChild(svg);
    }

    
    const closeButton = alertElement?.querySelector(
      'button.close[data-dismiss="alert"]',
    );
    if (closeButton) {
      
      closeButton.style.cssText = "content: none !important;";
      
      const style = document.createElement("style");
      style.textContent =
        'button.close[data-dismiss="alert"]::before { display: none !important; content: none !important; }';
      document.head.appendChild(style);

      
      const closeSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
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

      
      const line1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line1.setAttribute("x1", "18");
      line1.setAttribute("y1", "6");
      line1.setAttribute("x2", "6");
      line1.setAttribute("y2", "18");

      const line2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line2.setAttribute("x1", "6");
      line2.setAttribute("y1", "6");
      line2.setAttribute("x2", "18");
      line2.setAttribute("y2", "18");

      
      closeSvg.appendChild(line1);
      closeSvg.appendChild(line2);
      closeButton.innerHTML = ""; 
      closeButton.appendChild(closeSvg);
      closeButton.classList.add("!focus:outline-none");
    }

    const targetElement = document.querySelector(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
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

export default CourseRegistrationPage;
