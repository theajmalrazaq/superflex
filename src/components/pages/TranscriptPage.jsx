import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";

function TranscriptPage() {
  const [elemContent, setElemContent] = useState(null);

  useEffect(() => {
    const conelem = document.querySelector(".m-content");
    conelem.querySelector(".row").remove(); // Remove the first row element

    // Style the alert message
    const alertElement = document.querySelector(
      ".m-alert.m-alert--icon.m-alert--icon-solid.m-alert--outline.alert.alert-info"
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

    // Style the alert icon
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

      // Create SVG element for info icon
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

      // Create circle for info icon
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", "12");
      circle.setAttribute("cy", "12");
      circle.setAttribute("r", "10");

      // Create line for info icon
      const line1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line1.setAttribute("x1", "12");
      line1.setAttribute("y1", "16");
      line1.setAttribute("x2", "12");
      line1.setAttribute("y2", "12");

      // Create dot for info icon
      const line2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line2.setAttribute("x1", "12");
      line2.setAttribute("y1", "8");
      line2.setAttribute("x2", "12.01");
      line2.setAttribute("y2", "8");

      // Append paths to SVG and SVG to icon element
      svg.appendChild(circle);
      svg.appendChild(line1);
      svg.appendChild(line2);
      iconElement.innerHTML = ""; // Clear existing content
      iconElement.appendChild(svg);
    }

    // Style the alert text
    const alertText = alertElement?.querySelector(".m-alert__text");
    if (alertText) {
      alertText.classList.add("!text-white/90", "!font-medium");

      // Enhance the link text
      const boldText = alertText.querySelector("b");
      if (boldText) {
        boldText.classList.add("!text-blue-400");
      }
    }

    // Style close button in alert
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

    // Style portlet headers and body
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
      .querySelector(".m-portlet__head-text")
      ?.classList.add("!text-white", "!text-xl", "!font-bold");

    // Add background to the main portlet container
    document
      .querySelector(
        ".m-portlet.m-portlet--brand.m-portlet--head-solid-bg.m-portlet--border-bottom-brand.m-portlet--head-sm"
      )
      ?.classList.add("!bg-black", "!border-none");

    document
      .querySelector(".m-portlet__body")
      ?.classList.add(
        "!bg-black",
        "!rounded-b-3xl",
        "!p-6",
        "!border",
        "!border-white/10",
        "!shadow-lg",
        "!text-white",
        "!h-[calc(100vh-220px)]",
        "!overflow-y-auto",
        "custom-scrollbar"
      );

    // Style tables with MarksPage-like design
    const styleTranscriptTables = () => {
      // Remove the custom stylesheet creation and instead apply Tailwind classes directly

      // Restructure and style the semester sections
      const sectionContent = document.querySelector(".m-section__content");
      if (sectionContent) {
        // Style transcript links
        document.querySelectorAll(".transcript-link").forEach((link) => {
          link.classList.add(
            "text-blue-500",
            "underline",
            "transition-colors",
            "duration-200",
            "hover:text-blue-400"
          );
        });

        // Style transcript tables
        document.querySelectorAll("table").forEach((table) => {
          if (table.closest(".modal-body")) return; // Skip tables in modals

          table.classList.add("w-full", "border-collapse", "border-0");

          // Style the table head
          const thead = table.querySelector("thead");
          if (thead) {
            thead.classList.add("bg-zinc-900", "sticky", "top-0", "z-10");

            const headers = thead.querySelectorAll("th");
            headers.forEach((header) => {
              header.classList.add(
                "bg-transparent",
                "text-slate-400",
                "font-medium",
                "p-3",
                "text-left",
                "border-b",
                "border-white/10"
              );
            });
          }

          // Style the table body
          const tbody = table.querySelector("tbody");
          if (tbody) {
            tbody.classList.add("border-t", "border-white/10");

            const rows = tbody.querySelectorAll("tr");
            rows.forEach((row) => {
              row.classList.add(
                "bg-black",
                "transition-colors",
                "duration-200",
                "hover:bg-white/5"
              );

              // Style cells
              const cells = row.querySelectorAll("td");
              cells.forEach((cell) => {
                cell.classList.add(
                  "p-3",
                  "text-white/80",
                  "border-b",
                  "border-white/10"
                );

                // Apply grade-specific styling
                if (cell.textContent.includes("A")) {
                  cell.classList.add("text-green-400", "font-medium");
                } else if (
                  cell.textContent.includes("B") ||
                  cell.textContent.includes("C+")
                ) {
                  cell.classList.add("text-amber-400", "font-medium");
                } else if (
                  cell.textContent.includes("C") ||
                  cell.textContent.includes("D") ||
                  cell.textContent.includes("F")
                ) {
                  cell.classList.add("text-red-400", "font-medium");
                }
              });
            });
          }
        });

        // First, get the row containing all semester divs
        const mainRow = sectionContent.querySelector(".row");
        if (mainRow) {
          // Get all semester columns (col-md-6)
          const semesterCols = mainRow.querySelectorAll(".col-md-6");

          semesterCols.forEach((semesterCol) => {
            // Create a container for each semester
            const semesterContainer = document.createElement("div");
            semesterContainer.className = "semester-container";
            semesterContainer.classList.add(
              "!mb-4",
              "!rounded-xl",
              "w-full",
              "bg-black",
              "!p-4",
              "!border-none"
            );

            // Move the semester content into the container
            semesterCol.parentNode.insertBefore(semesterContainer, semesterCol);
            semesterContainer.appendChild(semesterCol);

            // Remove the column class and set full width
            semesterCol.classList.remove("col-md-6");
            semesterCol.style.width = "100%";

            // Style the semester header (row with h5 and stats)
            const headerRow = semesterCol.querySelector(".row");
            if (headerRow) {
              headerRow.className = "semester-header cursor-pointer";
              headerRow
                .querySelector(".pull-right")
                .classList.add("!text-white/80", "text-base");
              // Add collapse/expand icon
              const collapseIcon = document.createElement("div");
              collapseIcon.className =
                "h-6 w-6 rounded-full !bg-white/10 !flex !items-center !justify-center mr-2";
              collapseIcon.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron-down !text-white">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron-up !text-white hidden">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              `;

              // Style the semester title with flex container
              const semesterTitle = headerRow.querySelector("h5");
              if (semesterTitle) {
                const titleWrapper = document.createElement("div");
                titleWrapper.className = "!flex !items-center";

                // Wrap the title in the container with the icon
                semesterTitle.parentNode.insertBefore(
                  titleWrapper,
                  semesterTitle
                );
                titleWrapper.appendChild(collapseIcon);
                titleWrapper.appendChild(semesterTitle);
              }
            }

            // Style the table
            const table = semesterCol.querySelector("table");
            if (table) {
              // Create a container with modern styling (like in MarksPage)
              const tableContainer = document.createElement("div");
              tableContainer.className =
                "rounded-xl overflow-hidden !border !border-white/10 custom-scrollbar accordion-content";
              tableContainer.dataset.expanded = "false";

              // Insert container before table
              table.parentNode.insertBefore(tableContainer, table);
              tableContainer.appendChild(table);

              // Style the table
              table.classList.add("transcript-table");
              table.classList.remove("table-bordered");

              // Add transcript-table class for styling
              table.classList.add("!w-full", "!border-collapse", "!border-0");
            }
          });

          // Fix accordion functionality after all elements have been created
          semesterCols.forEach((semesterCol) => {
            const headerRow = semesterCol.querySelector(".semester-header");
            headerRow.classList.add(
              "cursor-pointer",
              "bg-black/50",
              "!rounded-xl",
              "!p-3",
              "!mb-2",
              "!flex",
              "!items-center",
              "!justify-between",
              "!border",
              "!border-white/10",
              "!text-white",
              "!font-bold",
              "!text-lg"
            );
            const tableContainer =
              semesterCol.querySelector(".accordion-content");

            if (headerRow && tableContainer) {
              // Set initial collapsed state
              tableContainer.style.maxHeight = "0px";
              tableContainer.style.opacity = "0";
              tableContainer.style.overflow = "hidden";
              tableContainer.style.transition =
                "max-height 0.3s ease, opacity 0.3s ease";

              const chevronDown = headerRow.querySelector(".chevron-down");
              const chevronUp = headerRow.querySelector(".chevron-up");

              if (chevronDown && chevronUp) {
                chevronDown.classList.add("hidden");
                chevronUp.classList.remove("hidden");
              }

              // Add single click handler to toggle visibility
              headerRow.addEventListener("click", function () {
                const isExpanded = tableContainer.dataset.expanded === "true";

                if (isExpanded) {
                  // Collapse
                  tableContainer.style.maxHeight = "0px";
                  tableContainer.style.opacity = "0";
                  tableContainer.dataset.expanded = "false";

                  if (chevronDown && chevronUp) {
                    chevronDown.classList.add("hidden");
                    chevronUp.classList.remove("hidden");
                  }
                } else {
                  // Expand
                  tableContainer.style.maxHeight = `${
                    tableContainer.scrollHeight + 30
                  }px`; // Add padding
                  tableContainer.style.opacity = "1";
                  tableContainer.dataset.expanded = "true";

                  if (chevronDown && chevronUp) {
                    chevronDown.classList.remove("hidden");
                    chevronUp.classList.add("hidden");
                  }
                }
              });
            }
          });
        }
      }

      // Style the tables (separate from accordion setup)
      document.querySelectorAll("table").forEach((table) => {
        if (table.closest(".modal-body")) return; // Skip tables in modals

        // Only add transcript-table if not already added
        if (!table.classList.contains("transcript-table")) {
          table.classList.add("transcript-table");
          table.classList.remove("table-bordered");
        }

        // Style the table head
        const thead = table.querySelector("thead");
        if (thead) {
          const headers = thead.querySelectorAll("th");
          headers.forEach((header) => {
            header.classList.add(
              "bg-transparent",
              "!text-gray-400",
              "!font-medium",
              "!p-3",
              "!text-left",
              "!border-b",
              "!border-white/10"
            );
          });
        }

        // Style the table body
        const tbody = table.querySelector("tbody");
        if (tbody) {
          const rows = tbody.querySelectorAll("tr");
          rows.forEach((row) => {
            row.classList.add(
              "!bg-black",
              "!hover:bg-white/5",
              "!transition-colors"
            );

            // Style the cells
            const cells = row.querySelectorAll("td");
            cells.forEach((cell) => {
              cell.classList.add(
                "!p-3",
                "!text-white/80",
                "!border-y",
                "!border-white/10"
              );

              // Style grades with color indicators
              if (cell.textContent.includes("A")) {
                cell.classList.add("transcript-good-grade");
              } else if (
                cell.textContent.includes("B") ||
                cell.textContent.includes("C+")
              ) {
                cell.classList.add("transcript-average-grade");
              } else if (
                cell.textContent.includes("C") ||
                cell.textContent.includes("D") ||
                cell.textContent.includes("F")
              ) {
                cell.classList.add("transcript-poor-grade");
              }
            });
          });
        }
      });

      // Update the toggleable behavior to work with new styling
      const headerRows = document.querySelectorAll(".semester-header");
      headerRows.forEach((headerRow) => {
        const chevronDown = headerRow.querySelector(".chevron-down");
        const chevronUp = headerRow.querySelector(".chevron-up");

        // Find the corresponding table container
        const tableContainer = headerRow
          .closest(".semester-container")
          ?.querySelector(".rounded-xl");

        if (tableContainer && chevronDown && chevronUp) {
          // Set initial state - tables collapsed
          tableContainer.style.maxHeight = "0px";
          tableContainer.style.transition =
            "max-height 0.3s ease, opacity 0.3s ease";
          tableContainer.style.overflow = "hidden";
          tableContainer.style.opacity = "0";
          chevronDown.classList.add("hidden");
          chevronUp.classList.remove("hidden");

          // Add click event
          headerRow.addEventListener("click", () => {
            if (tableContainer.style.maxHeight === "0px") {
              // Show the table container
              tableContainer.style.maxHeight = `${tableContainer.scrollHeight}px`;
              tableContainer.style.opacity = "1";
              // Switch icons
              chevronDown.classList.remove("hidden");
              chevronUp.classList.add("hidden");
            } else {
              // Hide the table container
              tableContainer.style.maxHeight = "0px";
              tableContainer.style.opacity = "0";
              // Switch icons
              chevronDown.classList.add("hidden");
              chevronUp.classList.remove("hidden");
            }
          });
        }
      });
    };

    // Call the styling function with a slight delay to ensure DOM is loaded
    setTimeout(styleTranscriptTables, 300);

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

export default TranscriptPage;
