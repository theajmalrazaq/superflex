import React, { useEffect, useState, useRef } from "react";
import PageLayout from "../layouts/PageLayout";

function StudyPlanPage() {
  const [elemContent, setElemContent] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const targetElement = document.querySelector(
      ".m-grid.m-grid--hor.m-grid--root.m-page"
    );

    if (targetElement) {
      // Apply styling and DOM modifications before removing the element
      applyCustomStyling(targetElement);

      setElemContent(targetElement.innerHTML);
      targetElement.remove();
    }
  }, []);

  useEffect(() => {
    // After content is rendered, apply accordion functionality
    if (elemContent && contentRef.current) {
      setupAccordions();
    }
  }, [elemContent]);

  const setupAccordions = () => {
    if (!contentRef.current) return;

    const accordionHeaders =
      contentRef.current.querySelectorAll(".semester-header");

    accordionHeaders.forEach((header) => {
      // Add the new styling classes to each header
      header.classList.add(
        "cursor-pointer",
        "bg-black/50",
        "!rounded-xl",
        "!p-6",
        "!mb-2",
        "!flex",
        "!items-center",
        "!justify-between",
        "!border",
        "!border-white/10",
        "!text-white",
        "!font-bold",
        "!text-lg",
        "!bg-white/10"
      );

      header.addEventListener("click", function () {
        // Find the closest parent col and then find the accordion content within it
        const parentCol = this.closest(".semester-container")?.querySelector(
          ".accordion-content"
        );
        if (!parentCol) return;

        const isExpanded = parentCol.classList.contains("expanded");

        // Close all accordions first
        const allAccordions =
          contentRef.current.querySelectorAll(".accordion-content");
        allAccordions.forEach((acc) => {
          acc.style.maxHeight = "0";
          acc.style.opacity = "0";
          acc.classList.remove("expanded");

          // Update chevron icons
          const accHeader = acc
            .closest(".semester-container")
            ?.querySelector(".semester-header");
          if (accHeader) {
            const chevronDown = accHeader.querySelector(".chevron-down");
            const chevronUp = accHeader.querySelector(".chevron-up");

            if (chevronDown) chevronDown.classList.add("hidden");
            if (chevronUp) chevronUp.classList.remove("hidden");
          }
        });

        // Toggle current accordion
        if (!isExpanded) {
          parentCol.style.maxHeight = "2000px";
          parentCol.style.opacity = "1";
          parentCol.classList.add("expanded");

          // Update chevron icons for this header
          const chevronDown = this.querySelector(".chevron-down");
          const chevronUp = this.querySelector(".chevron-up");

          if (chevronDown) chevronDown.classList.remove("hidden");
          if (chevronUp) chevronUp.classList.add("hidden");
        }
      });
    });
  };

  const applyCustomStyling = (element) => {
    // Add custom scrollbar styling
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      .accordion-content {
        transition: max-height 0.5s ease, opacity 0.3s ease;
        overflow: hidden;
      }
      
      .accordion-content.expanded {
        max-height: 2000px !important; /* Use a large value as fallback */
        opacity: 1 !important;
      }
      
      .grade-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        padding: 2px 10px;
        font-weight: 600;
        min-width: 36px;
        text-align: center;
      }
      
      .semester-container {
        margin-bottom: 1.5rem;
      }
      
     
      
      .studyplan-table {
        border-spacing: 0;
        width: 100%;
      }
      
      .studyplan-table th {
        background-color: rgba(30, 30, 30, 0.8) !important;
        backdrop-filter: blur(4px);
        font-weight: 500 !important;
        padding: 12px !important;
        letter-spacing: 0.5px;
      }
      
      .studyplan-table td {
        padding: 12px !important;
        font-size: 0.95rem;
      }
      
      .type-badge {
        display: inline-flex;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 500;
      }
      
      .type-core {
        background-color: rgba(52, 211, 153, 0.2);
        color: rgb(52, 211, 153);
      }
      
      .type-elective {
        background-color: rgba(251, 191, 36, 0.2);
        color: rgb(251, 191, 36);
      }
    `;
    document.head.appendChild(styleElement);

    // Style the portlet container
    const portlet = element.querySelector(".m-portlet");
    if (portlet) {
      portlet.classList.add(
        "!bg-black",
        "!border-none",
        "!rounded-3xl",
        "!p-4",
        "!shadow-lg"
      );

      // Remove unnecessary classes
      portlet.classList.remove(
        "m-portlet--brand",
        "m-portlet--head-solid-bg",
        "m-portlet--border-bottom-brand",
        "m-portlet--head-sm"
      );
    }

    // Style the portlet head
    const portletHead = element.querySelector(".m-portlet__head");
    if (portletHead) {
      portletHead.classList.add(
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

      // Style the heading
      const headingText = portletHead.querySelector(".m-portlet__head-text");
      if (headingText) {
        headingText.classList.add("!text-white", "!text-xl", "!font-bold");
      }
    }

    // Style the portlet body
    const portletBody = element.querySelector(".m-portlet__body");
    if (portletBody) {
      portletBody.classList.add(
        "!bg-black",
        "!rounded-b-3xl",
        "!p-6",
        "!border",
        "!border-white/10",
        "!shadow-lg",
        "!text-white",
        "!h-[calc(100vh-220px)]",
        "!max-h-[800px]",
        "!overflow-y-auto",
        "custom-scrollbar"
      );
    }

    // Restructure and style the semester sections
    const sectionContent = element.querySelector(".m-section__content");
    if (sectionContent) {
      // Get all semester columns
      const semesterCols = sectionContent.querySelectorAll(".col-md-6");

      semesterCols.forEach((semesterCol) => {
        // Create a container for each semester
        const semesterContainer = document.createElement("div");
        semesterContainer.className = "semester-container";
        semesterContainer.classList.add(
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

        // Style the semester header
        const semesterHeader = semesterCol.querySelector("h4");
        if (semesterHeader) {
          // Create a header row for accordion functionality
          const headerRow = document.createElement("div");
          headerRow.className = "semester-header cursor-pointer";
          headerRow.innerHTML = semesterHeader.outerHTML;

          // Replace the original h4 with our new header row
          semesterHeader.parentNode.insertBefore(headerRow, semesterHeader);
          semesterHeader.remove();

          // Add collapse/expand icon
          const collapseIcon = document.createElement("div");
          collapseIcon.className =
            "h-8 w-8 rounded-lg !bg-x !flex !items-center !justify-center mr-2 shadow-inner";
          collapseIcon.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron-up !text-white transition-transform duration-300">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron-down !text-white hidden transition-transform duration-300">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          `;

          // Style the semester title with flex container
          const h4Element = headerRow.querySelector("h4");
          if (h4Element) {
            const titleWrapper = document.createElement("div");
            titleWrapper.className = "!flex !items-center";

            // Wrap the title in the container with the icon
            h4Element.parentNode.insertBefore(titleWrapper, h4Element);
            titleWrapper.appendChild(collapseIcon);
            titleWrapper.appendChild(h4Element);

            // Style the header text
            h4Element.classList.add(
              "!text-white",
              "!font-bold",
              "!text-lg",
              "!mb-0"
            );

            // Style the small text
            const smallText = h4Element.querySelector("small");
            if (smallText) {
              smallText.classList.add("!text-white/60", "!ml-2");
            }
          }
        }

        // Style the table
        const table = semesterCol.querySelector("table");
        if (table) {
          // Create a container with modern styling
          const tableContainer = document.createElement("div");
          tableContainer.className =
            "rounded-xl overflow-hidden !border !border-white/10 accordion-content";
          tableContainer.dataset.expanded = "false";

          // Insert container before table
          table.parentNode.insertBefore(tableContainer, table);
          tableContainer.appendChild(table);

          // Style the table
          table.classList.add("studyplan-table");
          table.classList.remove(
            "table",
            "m-table",
            "m-table--head-bg-info",
            "table-bordered",
            "table-striped",
            "table-responsive",
            "span12"
          );

          // Style the table head
          const thead = table.querySelector("thead");
          if (thead) {
            thead.classList.add(
              "bg-zinc-900",
              "!rounded-t-lg",
              "top-0",
              "z-10"
            );

            const headers = thead.querySelectorAll("th");
            headers.forEach((header) => {
              header.classList.add(
                "!bg-transparent",
                "!text-slate-400",
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
            tbody.classList.add("!divide-y", "!divide-white/10");

            const rows = tbody.querySelectorAll("tr");
            rows.forEach((row) => {
              row.classList.add(
                "!bg-black",
                "!hover:bg-white/5",
                "!transition-colors"
              );

              // Style cells
              const cells = row.querySelectorAll("td");
              cells.forEach((cell, index) => {
                cell.classList.add(
                  "!p-3",
                  "!text-white/80",
                  "!border-y",
                  "!border-white/10"
                );

                // Apply special styling to credit hours (centered column)
                if (cell.classList.contains("text-center")) {
                  cell.classList.add("!font-semibold", "!text-white");
                }

                // Style course type with badges
                if (index === 3) {
                  // Type column
                  const courseType = cell.textContent.trim();

                  // Create badge element
                  const badgeElement = document.createElement("span");

                  if (courseType === "Core") {
                    badgeElement.className = "type-badge type-core";
                  } else if (courseType === "Elective") {
                    badgeElement.className = "type-badge type-elective";
                  }

                  badgeElement.textContent = courseType;

                  // Replace text with badge
                  cell.textContent = "";
                  cell.appendChild(badgeElement);
                }
              });
            });
          }
        }
      });

      // Fix accordion functionality after all elements have been created
      semesterCols.forEach((semesterCol) => {
        const headerRow = semesterCol.querySelector(".semester-header");
        const tableContainer = semesterCol.querySelector(".accordion-content");

        if (headerRow && tableContainer) {
          // Set initial collapsed state
          tableContainer.style.maxHeight = "0";
          tableContainer.style.opacity = "0";
          tableContainer.style.overflow = "hidden";

          const chevronDown = headerRow.querySelector(".chevron-down");
          const chevronUp = headerRow.querySelector(".chevron-up");

          if (chevronDown && chevronUp) {
            chevronDown.classList.add("hidden");
            chevronUp.classList.remove("hidden");
          }

          // Add click event listener to toggle visibility
          headerRow.addEventListener("click", function () {
            console.log("Header clicked");
            const isExpanded = tableContainer.classList.contains("expanded");

            // Toggle all other accordions closed
            const allAccordions =
              element.querySelectorAll(".accordion-content");
            allAccordions.forEach((acc) => {
              if (acc !== tableContainer) {
                acc.style.maxHeight = "0";
                acc.style.opacity = "0";
                acc.classList.remove("expanded");

                // Update chevrons for other accordions
                const otherHeader = acc
                  .closest(".col-md-6")
                  .querySelector(".semester-header");
                if (otherHeader) {
                  const otherChevronDown =
                    otherHeader.querySelector(".chevron-down");
                  const otherChevronUp =
                    otherHeader.querySelector(".chevron-up");
                  if (otherChevronDown)
                    otherChevronDown.classList.add("hidden");
                  if (otherChevronUp) otherChevronUp.classList.remove("hidden");
                }
              }
            });

            if (isExpanded) {
              // Collapse
              console.log("Collapsing accordion");
              tableContainer.style.maxHeight = "0";
              tableContainer.style.opacity = "0";
              tableContainer.classList.remove("expanded");

              if (chevronDown && chevronUp) {
                chevronDown.classList.add("hidden");
                chevronUp.classList.remove("hidden");
              }
            } else {
              // Expand
              console.log("Expanding accordion");
              const scrollHeight = tableContainer.scrollHeight;
              console.log("Scroll height:", scrollHeight);

              // First set a large value to ensure it expands
              tableContainer.style.maxHeight = "2000px";
              tableContainer.style.opacity = "1";
              tableContainer.classList.add("expanded");

              // Then after a short delay, set the actual height
              setTimeout(() => {
                // Only adjust if still expanded to avoid race conditions
                if (tableContainer.classList.contains("expanded")) {
                  tableContainer.style.maxHeight = `${scrollHeight + 50}px`;
                }
              }, 50);

              if (chevronDown && chevronUp) {
                chevronDown.classList.remove("hidden");
                chevronUp.classList.add("hidden");
              }
            }
          });
        }
      });

      // Remove auto-clicking of first semester
      // We're leaving this comment to show the removal of the auto-click code
    }
  };

  return (
    <PageLayout currentPage={window.location.pathname}>
      {elemContent && (
        <div
          ref={contentRef}
          className="m-grid m-grid--hor m-grid--root m-page"
          dangerouslySetInnerHTML={{ __html: elemContent }}
        />
      )}
    </PageLayout>
  );
}

export default StudyPlanPage;
