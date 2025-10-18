import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";

// Add custom scrollbar styles (consistent with HomePage)
const scrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

function AttendancePage() {
  const [elemContent, setElemContent] = useState(null);

  const badgeAlertPath =
    "M12 16v-4 M12 8h.01 M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z";

  useEffect(() => {
    // Add custom scrollbar styles (consistent with HomePage)
    const styleElement = document.createElement("style");
    styleElement.textContent = scrollbarStyle;
    document.head.appendChild(styleElement);

    const alertElement = document.querySelector(
      ".m-alert.m-alert--icon.m-alert--icon-solid.m-alert--outline.alert.alert-info.alert-dismissible.fade.show",
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
    const scrollTopEl = document.querySelector(
      ".m-scroll-top.m-scroll-top--skin-top",
    );
    if (scrollTopEl) {
      scrollTopEl.remove();
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
        "path",
      );
      path.setAttribute("d", badgeAlertPath);

      // Append path to SVG and SVG to icon element
      svg.appendChild(path);
      iconElement.innerHTML = ""; // Clear existing content
      iconElement.appendChild(svg);
    }

    // Find the close button and add the close icon SVG
    const closeButton = alertElement?.querySelector(
      'button.close[data-dismiss="alert"]',
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

      // Create paths for X shape
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

      // Append paths to SVG and SVG to close button
      closeSvg.appendChild(line1);
      closeSvg.appendChild(line2);
      closeButton.innerHTML = ""; // Clear any existing content
      closeButton.appendChild(closeSvg);
      closeButton.classList.add("!focus:outline-none");
    }

    // Find and move the semester selection form to portlet head
    const semesterForm = document.querySelector(
      'form[action="/Student/StudentAttendance"]',
    );
    const portletHead = document.querySelector(".m-portlet__head");

    if (semesterForm && portletHead) {
      // Clone the form before removing it (to avoid reference issues)
      const formClone = semesterForm.cloneNode(true);
      // Remove the original form
      semesterForm.remove();
      // Add the form to the portlet head
      portletHead.appendChild(formClone);
      formClone.classList.add("!flex", "!items-center", "!gap-4");

      // Apply additional styling to the form inside portlet head
      formClone.classList.add("ml-4", "flex-1");

      // Add modern styles to the portlet container
      document
        .querySelector(
          ".m-portlet.m-portlet--tabs.m-portlet--brand.m-portlet--border-bottom-brand.m-portlet--head-solid-bg.m-portlet--head-sm",
        )
        .classList.add(
          "!bg-transparent",
          "!border",
          "!border-white/0",
          "!shadow-lg",
        );

      // Enhanced select control styling to match HomePage theme
      const selectElement = formClone.querySelector("select");
      if (selectElement) {
        selectElement.classList.add(
          "!bg-[#161616]",
          "!text-white",
          "!border-2",
          "!border-[#1c1c1c]",
          "!rounded-3xl",
          "!min-w-fit",
          "!px-6",
          "!py-3",
          "!text-base",
          "!font-medium",
          "!cursor-pointer",
          "!transition-all",
          "!duration-300",
          "!hover:border-x/30",
          "!focus:ring-2",
          "!focus:ring-x/20",
          "!focus:border-x",
          "!focus:outline-none",
        );

        // Enhanced styling and proper padding
        selectElement.style.paddingRight = "2.5rem";
        selectElement.style.minWidth = "200px";
      }

      // Style the form label if it exists
      const formLabel = formClone.querySelector("label");
      if (formLabel) {
        formLabel.classList.add(
          "!text-white",
          "!font-semibold",
          "!text-base",
          "!mb-2",
        );
      }
    }

    // Style course tabs UI with modern design
    const styleCourseElements = () => {
      // Enhanced tabs navigation styling
      const tabsNav = document.querySelector(
        ".nav.nav-tabs.m-tabs.m-tabs-line",
      );
      if (tabsNav) {
        tabsNav.classList.add("!flex", "!flex-wrap", "!gap-4", "!border-0");

        // Enhanced individual course tabs styling
        const tabItems = tabsNav.querySelectorAll(".nav-item.m-tabs__item");
        tabItems.forEach((tab) => {
          tab.classList.add("!m-0");

          const tabLink = tab.querySelector(".nav-link");
          if (tabLink) {
            tabLink.classList.add(
              "!border-2",
              "!border-[#1c1c1c]",
              "!rounded-3xl",
              "!px-6",
              "!py-4",
              "!text-white",
              "!font-semibold",
              "!text-base",
              "!transition-all",
              "!duration-300",
              "!min-w-fit",
              "!whitespace-nowrap",
            );

            // Enhanced active styling for initial state
            if (tabLink.classList.contains("active")) {
              tabLink.classList.add(
                "!bg-x",
                "!border-x/30",
                "!shadow-xl",
                "!text-white",
              );
              // Remove any conflicting background classes
              tabLink.classList.remove(
                "!bg-[#161616]",
                "!bg-black",
                "!bg-zinc-800",
                "!bg-white/10",
              );
            } else {
              tabLink.classList.add("!bg-[#161616]");
              tabLink.classList.remove(
                "!bg-x",
                "!bg-white/10",
                "!bg-zinc-800",
                "!bg-black",
              );
            }

            // Add click event listener to handle tab switching
            tabLink.addEventListener("click", function () {
              // Remove active styling from all tabs
              tabItems.forEach((item) => {
                const link = item.querySelector(".nav-link");
                if (link) {
                  // Clean all state classes to avoid conflicts
                  link.classList.remove(
                    "!bg-x",
                    "!bg-white/10",
                    "!bg-zinc-800",
                    "!shadow-lg",
                  );
                  // Reset border style
                  link.classList.remove("!border-white/20");
                  link.classList.add("!border-white/10");
                  // Apply default background
                  link.classList.add("!bg-black");
                }
              });

              // Apply enhanced active styling to clicked tab
              this.classList.remove(
                "!bg-[#161616]",
                "!bg-black",
                "!bg-white/10",
                "!bg-zinc-800",
              );
              this.classList.add(
                "!bg-x",
                "!border-x/30",
                "!shadow-xl",
                "!text-white",
              );
            });

            // Enhanced hover effect with smoother transitions
            tabLink.addEventListener("mouseover", () => {
              if (!tabLink.classList.contains("active")) {
                tabLink.classList.remove(
                  "!bg-[#161616]",
                  "!bg-black",
                  "!bg-zinc-800",
                );
                tabLink.classList.add("!bg-white/10", "!border-x/20");
              }
            });

            tabLink.addEventListener("mouseout", () => {
              if (!tabLink.classList.contains("active")) {
                tabLink.classList.remove(
                  "!bg-white/10",
                  "!bg-zinc-800",
                  "!border-x/20",
                );
                tabLink.classList.add("!bg-[#161616]", "!border-[#1c1c1c]");
              }
            });
          }
        });
      }

      // Enhanced custom styling for nav tabs with HomePage consistency
      const tabStyle = document.createElement("style");
      tabStyle.textContent = `
        .nav-tabs .nav-link {
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }
        .nav-tabs .nav-link:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(160, 152, 255, 0.3);
        }
        /* Remove any unwanted before/after content */
        .nav-tabs .nav-link::before,
        .nav-tabs .nav-link::after,
        .nav-tabs::before,
        .nav-tabs::after,
        .m-tabs::before,
        .m-tabs::after,
        .m-tabs-line::before,
        .m-tabs-line::after {
          display: none !important;
          content: none !important;
        }
        /* Custom hover gradient effect */
        .nav-tabs .nav-link:hover {
          background: linear-gradient(135deg, rgba(160, 152, 255, 0.1) 0%, rgba(160, 152, 255, 0.05) 100%) !important;
        }
        .nav-tabs .nav-link.active {
          background: linear-gradient(135deg, rgba(160, 152, 255, 0.2) 0%, rgba(160, 152, 255, 0.1) 100%) !important;
        }
      `;
      document.head.appendChild(tabStyle);

      document.querySelectorAll(".col-md-2").forEach((col) => {
        col.remove();
      });

      // Make tab content area scrollable
      const tabContent = document.querySelector(".tab-content");
      if (tabContent) {
        tabContent.classList.add("rounded-xl", "custom-scrollbar", "w-full");
      }

      // Restyle attendance tables to match HomePage
      const tables = document.querySelectorAll(
        ".table.table-bordered.table-responsive",
      );

      tables.forEach((table) => {
        // Create enhanced card container for the table
        const tableCard = document.createElement("div");
        tableCard.className =
          "w-full p-8 rounded-[30px] border-2 border-[#1c1c1c] bg-[#161616] mb-6 backdrop-blur-xl overflow-hidden";
        table.parentNode.insertBefore(tableCard, table);

        // Enhanced header with title and stats
        const tableHeader = document.createElement("div");
        tableHeader.className = "flex flex-col gap-6 mb-8 ";

        // Get course title from nearest tab pane
        const tabPane = table.closest(".tab-pane");

        // Find and extract information from the first row, which we'll be removing
        let courseTitle = "Course Attendance";
        let attendancePercentage = 0;

        if (tabPane) {
          // Get the first row div
          const firstRow = tabPane.querySelector(".row");

          // Extract course title if available
          const courseTitleElem = firstRow?.querySelector("h5");
          if (courseTitleElem) {
            courseTitle = courseTitleElem.textContent || courseTitle;
          }

          // Find the progress bar for this course
          const progressBar = tabPane.querySelector(".progress.m-progress--lg");
          if (progressBar) {
            const bar = progressBar.querySelector(".progress-bar");
            if (bar) {
              attendancePercentage = parseInt(
                bar.getAttribute("aria-valuenow"),
              );
            }
          }

          // Remove the first row div after extracting information
          if (firstRow) {
            firstRow.remove();
          }
        }

        // Determine color based on percentage
        let color;
        if (attendancePercentage < 75) {
          color = "rgb(225, 29, 72)"; // Red for critical
        } else if (attendancePercentage < 85) {
          color = "rgb(245, 158, 11)"; // Amber for warning
        } else {
          color = "rgb(16, 185, 129)"; // Green for good
        }

        tableHeader.innerHTML = `
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
              <div class="flex flex-col">
                <h3 class="!text-xl !font-bold text-white !tracking-tight">${courseTitle}</h3>
                <p class="!text-white/70 !text-sm !font-medium">Course Attendance Details</p>
              </div>
            </div>
            <div class="bg-[#1c1c1c] border-2 border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-x">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span class="text-base font-semibold text-white">Attendance Log</span>
            </div>
          </div>
          <div class="w-full">
            <div class="flex justify-between items-center mb-3">
              <span class="text-base font-semibold text-white/90">Attendance Progress</span>
              <span class="text-lg font-bold" style="color: ${color}">${attendancePercentage}%</span>
            </div>
            <div class="w-full h-3 bg-[#1c1c1c] rounded-full overflow-hidden !border !border-white/5">
              <div class="h-full rounded-full transition-all duration-500 ease-out shadow-lg" style="width: ${attendancePercentage}%; background-color: ${color};"></div>
            </div>
          </div>
        `;
        tableCard.appendChild(tableHeader);

        // Remove existing classes and add new ones
        table.className = "w-full table-auto";
        table.classList.add(
          "!rounded-xl",
          "!border-collapse",
          "!border-0",
          "!overflow-x-hidden",
        );

        // Enhanced table headers styling
        const thead = table.querySelector("thead");
        if (thead) {
          thead.classList.add(
            "bg-[#161616]",
            "z-10",
            "backdrop-blur-xl",
            "!rounded-t-2xl",
            "!p-2",
          );

          document.querySelectorAll(".col-md-8").forEach((col) => {
            col.classList.remove("col-md-8");
            col.classList.add(
              "w-full",
              "flex",
              "flex-col",
              "justify-between",
              "items-center",
            );
          });

          const headers = thead.querySelectorAll("th");
          headers.forEach((header, index) => {
            header.className = ""; // Reset existing classes
            header.classList.add(
              "px-4",
              "py-3",
              "font-semibold",
              "text-left",
              "text-white/90",
              "text-sm",
              "border-b-2",
              "border-white/10",
              "bg-[#161616]",
              "tracking-tight",
              "h-12",
              "align-middle",
            );

            // Add different styling for first and last headers
            if (index === 0) {
              header.classList.add("rounded-tl-2xl");
            }
            if (index === headers.length - 1) {
              header.classList.add("rounded-tr-2xl");
            }
          });
        }

        // Enhanced table body styling for scrolling
        const tbody = table.querySelector("tbody");
        if (tbody) {
          tbody.className = "divide-y divide-white/5";

          // Enhanced style tag for better table rendering
          const tableStyle = document.createElement("style");
          tableStyle.innerHTML = `
            .attendance-table {
              width: 100% !important;
              table-layout: fixed !important;
              border-radius: 20px !important;
              overflow-x: hidden !important;
            }
            .attendance-table tbody {
              display: block !important;
              width: 100% !important;
              overflow-y: auto !important;
              overflow-x: hidden !important;
            }
            .attendance-table thead, .attendance-table tbody tr {
              display: table !important;
              width: 100% !important;
              table-layout: fixed !important;
            }
            .attendance-table th, .attendance-table td {
              overflow: hidden !important;
              text-overflow: ellipsis !important;
              padding: 12px 24px !important;
              height: 50px !important;
              vertical-align: middle !important;
            }
            .attendance-table tbody tr {
              height: 50px !important;
              min-height: 50px !important;
              max-height: 50px !important;
            }
            .attendance-table tbody tr:nth-child(even) {
              background-color: rgba(255, 255, 255, 0.02) !important;
            }
            
          `;
          document.head.appendChild(tableStyle);

          // Apply custom class to table
          table.classList.add("attendance-table");
          tbody.classList.add("custom-scrollbar");

          // Enhanced table rows styling
          const rows = tbody.querySelectorAll("tr");
          rows.forEach((row) => {
            row.className =
              "transition-all duration-200 ease-in-out cursor-pointer";
            row.style.display = "table"; // Makes the row behave like a table
            row.style.width = "100%"; // Full width rows
            row.style.tableLayout = "fixed"; // Consistent cell widths

            // Enhanced cell styling
            const cells = row.querySelectorAll("td");
            cells.forEach((cell, cellIndex) => {
              cell.className = ""; // Reset existing classes
              cell.classList.add(
                "px-4",
                "py-2",
                "text-sm",
                "h-12",
                "align-middle",
              );

              if (cellIndex === 0) {
                // First column - Course/date cell
                cell.classList.add(
                  "text-white",
                  "font-semibold",
                  "tracking-tight",
                );
              } else {
                cell.classList.add("text-white/80", "font-medium");
              }

              // Enhanced attendance markers styling
              const attendanceLabel = cell.querySelector("label");
              if (attendanceLabel && attendanceLabel.textContent === "P") {
                attendanceLabel.className = ""; // Reset
                attendanceLabel.classList.add(
                  "bg-gradient-to-r",
                  "from-emerald-500/20",
                  "to-emerald-400/20",
                  "text-emerald-300",
                  "px-3",
                  "py-2",
                  "rounded-xl",
                  "font-bold",
                  "inline-block",
                  "text-sm",
                  "!border",
                  "border-emerald-500/30",
                  "backdrop-blur-sm",
                );
              } else if (
                cell.querySelector("b") &&
                cell.textContent.includes("A")
              ) {
                const absentElement = cell.querySelector("b");
                absentElement.className = ""; // Reset
                absentElement.classList.add(
                  "bg-gradient-to-r",
                  "from-rose-500/20",
                  "to-rose-400/20",
                  "text-rose-300",
                  "px-3",
                  "py-2",
                  "rounded-xl",
                  "font-bold",
                  "inline-block",
                  "text-sm",
                  "!border",
                  "border-rose-500/30",
                  "backdrop-blur-sm",
                );
              }
            });
          });
        }
      });

      // Remove styling functions for course headings since we're removing those elements
      // Instead, ensure the tab content wrappers look clean
      const tabPanes = document.querySelectorAll(".tab-pane");
      tabPanes.forEach((pane) => {
        // Make sure the remaining row has proper styling
        const remainingRows = pane.querySelectorAll(".row");
        remainingRows.forEach((row) => {
          row.classList.add("w-full");

          // Ensure the column takes full width
          const cols = row.querySelectorAll("[class*='col-']");
          cols.forEach((col) => {
            col.classList.add(
              "w-full",
              "flex",
              "justify-between",
              "items-center",
            );
          });
        });
      });
    };

    // Call the function after a short delay to ensure DOM is fully loaded
    setTimeout(styleCourseElements, 300);

    // Enhanced portlet head styling with consistent typography
    const mainPortletHead = document.querySelector(".m-portlet__head");
    if (mainPortletHead) {
      mainPortletHead.classList.add(
        "!bg-transparent",
        "!border-none",
        "!h-fit",
        "!p-0",
        "!flex",
        "!items-center",
        "!justify-between",
        "!mb-8",
      );

      mainPortletHead
        .querySelector(".m-portlet__head-caption .m-portlet__head-title")
        ?.remove();
    }

    // Enhanced portlet body styling
    const portletBody = document.querySelector(".m-portlet__body");
    if (portletBody) {
      portletBody.classList.add(
        "!bg-transparent",
        "!border-0",
        "!p-0",
        "!text-white",
      );
    }

    // Force a specific max-width for the table container if needed
    const tableContainers = document.querySelectorAll(".table-responsive");
    tableContainers.forEach((container) => {
      container.style.maxWidth = "100%";
      container.style.overflowX = "auto";
    });

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
      <div className="flex pb-12 w-full">
        <div className="p-6 w-full flex flex-col">
          {elemContent && (
            <div
              className="m-grid m-grid--hor m-grid--root m-page"
              dangerouslySetInnerHTML={{ __html: elemContent }}
            />
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default AttendancePage;
