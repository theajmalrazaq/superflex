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

    // Find and move the semester selection form to portlet head
    const semesterForm = document.querySelector(
      'form[action="/Student/StudentAttendance"]'
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
          ".m-portlet.m-portlet--tabs.m-portlet--brand.m-portlet--border-bottom-brand.m-portlet--head-solid-bg.m-portlet--head-sm"
        )
        .classList.add(
          "!bg-black",
          "!border",
          "!border-white/0",
          "!rounded-3xl",
          "!p-4",
          "!shadow-lg"
        );

      // Make the select control match the theme
      const selectElement = formClone.querySelector("select");
      if (selectElement) {
        selectElement.classList.add(
          "!bg-black",
          "!text-white",
          "!border",
          "!border-white/10",
          "!rounded-xl",
          "!px-4",
          "!py-2",
          "!cursor-pointer",
          "!focus:ring-2",
          "!focus:ring-x",
          "!focus:outline-none"
        );

        // Remove background image styling and keep default select appearance
        selectElement.style.paddingRight = "1rem";
      }
    }

    // Style course tabs UI with modern design
    const styleCourseElements = () => {
      // Style the tabs navigation
      const tabsNav = document.querySelector(
        ".nav.nav-tabs.m-tabs.m-tabs-line"
      );
      if (tabsNav) {
        tabsNav.classList.add(
          "!flex",
          "!flex-wrap",
          "!gap-2",
          "!border-0",
          "!border-b",
          "!border-white/10"
        );

        // Style individual course tabs
        const tabItems = tabsNav.querySelectorAll(".nav-item.m-tabs__item");
        tabItems.forEach((tab) => {
          tab.classList.add("!m-0");

          const tabLink = tab.querySelector(".nav-link");
          if (tabLink) {
            tabLink.classList.add(
              "!border",
              "!border-white/10",
              "!rounded-xl",
              "!px-4",
              "!py-2",
              "!text-white",
              "!font-medium",
              "!transition-all",
              "!duration-300"
            );

            // Set proper active styling for initial state
            if (tabLink.classList.contains("active")) {
              tabLink.classList.add("!bg-x", "!border-white/20", "!shadow-lg");
              // Remove any conflicting background classes
              tabLink.classList.remove(
                "!bg-black",
                "!bg-zinc-800",
                "!bg-white/10"
              );
            } else {
              tabLink.classList.add("!bg-black");
              tabLink.classList.remove("!bg-x", "!bg-white/10", "!bg-zinc-800");
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
                    "!shadow-lg"
                  );
                  // Reset border style
                  link.classList.remove("!border-white/20");
                  link.classList.add("!border-white/10");
                  // Apply default background
                  link.classList.add("!bg-black");
                }
              });

              // Apply active styling to clicked tab
              this.classList.remove(
                "!bg-black",
                "!bg-white/10",
                "!bg-zinc-800"
              );
              this.classList.add("!bg-x", "!border-white/20", "!shadow-lg");
            });

            // Enhanced hover effect with smoother transitions
            tabLink.addEventListener("mouseover", () => {
              if (!tabLink.classList.contains("active")) {
                tabLink.classList.remove("!bg-black", "!bg-zinc-800");
                tabLink.classList.add("!bg-white/10", "!border-white/20");
              }
            });

            tabLink.addEventListener("mouseout", () => {
              if (!tabLink.classList.contains("active")) {
                tabLink.classList.remove(
                  "!bg-white/10",
                  "!bg-zinc-800",
                  "!border-white/20"
                );
                tabLink.classList.add("!bg-black", "!border-white/10");
              }
            });
          }
        });
      }

      // Add custom styling to make nav tabs more accessible
      const style = document.createElement("style");
      style.textContent = `
        .nav-tabs .nav-link {
          position: relative;
          overflow: hidden;
        }
        .nav-tabs .nav-link:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
        }
        .nav-tabs .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 2px;
          background: white;
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateX(-50%);
        }
        .nav-tabs .nav-link:hover::after,
        .nav-tabs .nav-link.active::after {
          width: 80%;
          opacity: 0.7;
        }
      `;
      document.head.appendChild(style);

      document.querySelectorAll(".col-md-2").forEach((col) => {
        col.remove();
      });

      // Make tab content area scrollable
      const tabContent = document.querySelector(".tab-content");
      if (tabContent) {
        tabContent.classList.add(
          "max-h-fit",
          "overflow-y-auto",
          "overflow-x-hidden",
          "rounded-xl",
          "custom-scrollbar",
          "w-full"
        );
      }

      // Restyle attendance tables to match HomePage
      const tables = document.querySelectorAll(
        ".table.table-bordered.table-responsive"
      );

      tables.forEach((table) => {
        // Create a card container for the table
        const tableCard = document.createElement("div");
        tableCard.className = "!bg-black !rounded-2xl p-4 shadow-lg !w-full";
        table.parentNode.insertBefore(tableCard, table);

        // Add header with title and stats
        const tableHeader = document.createElement("div");
        tableHeader.className =
          "flex flex-col gap-4 mb-4 pb-4 border-b border-white/10";

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
                bar.getAttribute("aria-valuenow")
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
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-lg bg-x flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-white">${courseTitle}</h3>
            </div>
            <div class="bg-zinc-900 rounded-xl px-3 py-2 flex items-center gap-2 !border !border-white/10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span class="text-sm text-white/70">Attendance Log</span>
            </div>
          </div>
          <div class="w-full">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-white/70">Attendance Progress</span>
              <span class="text-sm font-bold" style="color: ${color}">${attendancePercentage}%</span>
            </div>
            <div class="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div class="h-full rounded-full" style="width: ${attendancePercentage}%; background-color: ${color};"></div>
            </div>
          </div>
        `;
        tableCard.appendChild(tableHeader);

        // Remove existing classes and add new ones
        table.className = "w-full table-auto";
        table.classList.add("!rounded-xl", "!border-collapse", "!border-0");

        // Style table headers - make them sticky like in HomePage
        const thead = table.querySelector("thead");
        if (thead) {
          thead.classList.add("sticky", "top-0", "bg-black", "z-10");

          document.querySelectorAll(".col-md-8").forEach((col) => {
            col.classList.remove("col-md-8");
            col.classList.add(
              "w-full",
              "flex",
              "flex-col",
              "justify-between",
              "items-center"
            );
          });

          const headers = thead.querySelectorAll("th");
          headers.forEach((header) => {
            header.className = ""; // Reset existing classes
            header.classList.add(
              "px-4",
              "py-3",
              "font-medium",
              "text-left",
              "text-gray-400",
              "border-b",
              "border-gray-800",
              "bg-black" // Ensure background color matches heading
            );
          });
        }

        // Style table body for scrolling
        const tbody = table.querySelector("tbody");
        if (tbody) {
          tbody.className = "divide-y divide-slate-700/50";

          // Add a style tag for better table rendering
          const tableStyle = document.createElement("style");
          tableStyle.innerHTML = `
            .attendance-table {
              width: 100% !important;
              table-layout: fixed !important;
            }
            .attendance-table tbody {
              display: block !important;
              width: 100% !important;
              max-height: 150px !important;
              overflow-y: auto !important;
            }
            .attendance-table thead, .attendance-table tbody tr {
              display: table !important;
              width: 100% !important;
              table-layout: fixed !important;
            }
            .attendance-table th, .attendance-table td {
              overflow: hidden !important;
              text-overflow: ellipsis !important;
            }
          `;
          document.head.appendChild(tableStyle);

          // Apply custom class to table
          table.classList.add("attendance-table");
          tbody.classList.add("custom-scrollbar");

          // Style table rows
          const rows = tbody.querySelectorAll("tr");
          rows.forEach((row) => {
            row.className = "hover:bg-white/5 transition-colors";
            row.style.display = "table"; // Makes the row behave like a table
            row.style.width = "100%"; // Full width rows
            row.style.tableLayout = "fixed"; // Consistent cell widths

            // Style cells
            const cells = row.querySelectorAll("td");
            cells.forEach((cell, cellIndex) => {
              cell.className = ""; // Reset existing classes
              cell.classList.add("px-4", "py-3");

              if (cellIndex === 0) {
                // First column - Course/date cell
                cell.classList.add("text-white", "font-medium");
              } else {
                cell.classList.add("text-slate-300");
              }

              // Style attendance markers (P/A) to match HomePage styling
              const attendanceLabel = cell.querySelector("label");
              if (attendanceLabel && attendanceLabel.textContent === "P") {
                attendanceLabel.className = ""; // Reset
                attendanceLabel.classList.add(
                  "bg-emerald-500/20",
                  "text-emerald-400",
                  "px-2",
                  "py-1",
                  "rounded-md",
                  "font-medium",
                  "inline-block"
                );
              } else if (
                cell.querySelector("b") &&
                cell.textContent.includes("A")
              ) {
                const absentElement = cell.querySelector("b");
                absentElement.className = ""; // Reset
                absentElement.classList.add(
                  "bg-rose-500/20",
                  "text-rose-400",
                  "px-2",
                  "py-1",
                  "rounded-md",
                  "font-medium",
                  "inline-block"
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
              "items-center"
            );
          });
        });
      });
    };

    // Call the function after a short delay to ensure DOM is fully loaded
    setTimeout(styleCourseElements, 300);

    document
      .querySelector(".m-portlet__head")
      ?.classList.add(
        "!bg-black",
        "!border",
        "!border-white/10",
        "!rounded-t-3xl",
        "!h-fit",
        "!p-4",
        "!flex",
        "!items-center",
        "!justify-between",
        "!mb-4"
      );

    document
      .querySelector(".m-portlet__body")
      ?.classList.add(
        "!bg-black",
        "!rounded-b-3xl",
        "!p-8",
        "!border",
        "!border-white/10",
        "!shadow-lg",
        "!text-white"
      );

    // Force a specific max-width for the table container if needed
    const tableContainers = document.querySelectorAll(".table-responsive");
    tableContainers.forEach((container) => {
      container.style.maxWidth = "100%";
      container.style.overflowX = "auto";
    });

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
