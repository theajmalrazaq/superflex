import React, { useEffect, useState, useRef } from "react";
import PageLayout from "../layouts/PageLayout";

function StudyPlanPage() {
  const [elemContent, setElemContent] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const targetElement = document.querySelector(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
    );

    if (targetElement) {
      
      applyCustomStyling(targetElement);

      setElemContent(targetElement.innerHTML);
      targetElement.remove();
    }
  }, []);

  useEffect(() => {
    
    if (elemContent && contentRef.current) {
      setupAccordions();
    }
  }, [elemContent]);

  const setupAccordions = () => {
    if (!contentRef.current) return;

    const accordionHeaders =
      contentRef.current.querySelectorAll(".semester-header");

    accordionHeaders.forEach((header) => {
      
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
        "!bg-white/10",
      );

      header.addEventListener("click", function () {
        
        const parentCol = this.closest(".semester-container")?.querySelector(
          ".accordion-content",
        );
        if (!parentCol) return;

        const isExpanded = parentCol.classList.contains("expanded");

        
        const allAccordions =
          contentRef.current.querySelectorAll(".accordion-content");
        allAccordions.forEach((acc) => {
          acc.style.maxHeight = "0";
          acc.style.opacity = "0";
          acc.classList.remove("expanded");

          
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

        
        if (!isExpanded) {
          parentCol.style.maxHeight = "2000px";
          parentCol.style.opacity = "1";
          parentCol.classList.add("expanded");

          
          const chevronDown = this.querySelector(".chevron-down");
          const chevronUp = this.querySelector(".chevron-up");

          if (chevronDown) chevronDown.classList.remove("hidden");
          if (chevronUp) chevronUp.classList.add("hidden");
        }
      });
    });
  };

  const applyCustomStyling = (element) => {
    
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

    
    const portlet = element.querySelector(".m-portlet");
    if (portlet) {
      portlet.classList.add(
        "!bg-black",
        "!border-none",
        "!rounded-3xl",
        "!p-4",
        "!shadow-lg",
      );

      
      portlet.classList.remove(
        "m-portlet--brand",
        "m-portlet--head-solid-bg",
        "m-portlet--border-bottom-brand",
        "m-portlet--head-sm",
      );
    }

    
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
        "!mb-4",
      );

      
      const headingText = portletHead.querySelector(".m-portlet__head-text");
      if (headingText) {
        headingText.classList.add("!text-white", "!text-xl", "!font-bold");
      }
    }

    
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
        "custom-scrollbar",
      );
    }

    
    const sectionContent = element.querySelector(".m-section__content");
    if (sectionContent) {
      
      const semesterCols = sectionContent.querySelectorAll(".col-md-6");

      semesterCols.forEach((semesterCol) => {
        
        const semesterContainer = document.createElement("div");
        semesterContainer.className = "semester-container";
        semesterContainer.classList.add(
          "!rounded-xl",
          "w-full",
          "bg-black",
          "!p-4",
          "!border-none",
        );

        
        semesterCol.parentNode.insertBefore(semesterContainer, semesterCol);
        semesterContainer.appendChild(semesterCol);

        
        semesterCol.classList.remove("col-md-6");
        semesterCol.style.width = "100%";

        
        const semesterHeader = semesterCol.querySelector("h4");
        if (semesterHeader) {
          
          const headerRow = document.createElement("div");
          headerRow.className = "semester-header cursor-pointer";
          headerRow.innerHTML = semesterHeader.outerHTML;

          
          semesterHeader.parentNode.insertBefore(headerRow, semesterHeader);
          semesterHeader.remove();

          
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

          
          const h4Element = headerRow.querySelector("h4");
          if (h4Element) {
            const titleWrapper = document.createElement("div");
            titleWrapper.className = "!flex !items-center";

            
            h4Element.parentNode.insertBefore(titleWrapper, h4Element);
            titleWrapper.appendChild(collapseIcon);
            titleWrapper.appendChild(h4Element);

            
            h4Element.classList.add(
              "!text-white",
              "!font-bold",
              "!text-lg",
              "!mb-0",
            );

            
            const smallText = h4Element.querySelector("small");
            if (smallText) {
              smallText.classList.add("!text-white/60", "!ml-2");
            }
          }
        }

        
        const table = semesterCol.querySelector("table");
        if (table) {
          
          const tableContainer = document.createElement("div");
          tableContainer.className =
            "rounded-xl overflow-hidden !border !border-white/10 accordion-content";
          tableContainer.dataset.expanded = "false";

          
          table.parentNode.insertBefore(tableContainer, table);
          tableContainer.appendChild(table);

          
          table.classList.add("studyplan-table");
          table.classList.remove(
            "table",
            "m-table",
            "m-table--head-bg-info",
            "table-bordered",
            "table-striped",
            "table-responsive",
            "span12",
          );

          
          const thead = table.querySelector("thead");
          if (thead) {
            thead.classList.add(
              "bg-zinc-900",
              "!rounded-t-lg",
              "top-0",
              "z-10",
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
                "!border-white/10",
              );
            });
          }

          
          const tbody = table.querySelector("tbody");
          if (tbody) {
            tbody.classList.add("!divide-y", "!divide-white/10");

            const rows = tbody.querySelectorAll("tr");
            rows.forEach((row) => {
              row.classList.add(
                "!bg-black",
                "!hover:bg-white/5",
                "!transition-colors",
              );

              
              const cells = row.querySelectorAll("td");
              cells.forEach((cell, index) => {
                cell.classList.add(
                  "!p-3",
                  "!text-white/80",
                  "!border-y",
                  "!border-white/10",
                );

                
                if (cell.classList.contains("text-center")) {
                  cell.classList.add("!font-semibold", "!text-white");
                }

                
                if (index === 3) {
                  
                  const courseType = cell.textContent.trim();

                  
                  const badgeElement = document.createElement("span");

                  if (courseType === "Core") {
                    badgeElement.className = "type-badge type-core";
                  } else if (courseType === "Elective") {
                    badgeElement.className = "type-badge type-elective";
                  }

                  badgeElement.textContent = courseType;

                  
                  cell.textContent = "";
                  cell.appendChild(badgeElement);
                }
              });
            });
          }
        }
      });

      
      semesterCols.forEach((semesterCol) => {
        const headerRow = semesterCol.querySelector(".semester-header");
        const tableContainer = semesterCol.querySelector(".accordion-content");

        if (headerRow && tableContainer) {
          
          tableContainer.style.maxHeight = "0";
          tableContainer.style.opacity = "0";
          tableContainer.style.overflow = "hidden";

          const chevronDown = headerRow.querySelector(".chevron-down");
          const chevronUp = headerRow.querySelector(".chevron-up");

          if (chevronDown && chevronUp) {
            chevronDown.classList.add("hidden");
            chevronUp.classList.remove("hidden");
          }

          
          headerRow.addEventListener("click", function () {
            
            const isExpanded = tableContainer.classList.contains("expanded");

            
            const allAccordions =
              element.querySelectorAll(".accordion-content");
            allAccordions.forEach((acc) => {
              if (acc !== tableContainer) {
                acc.style.maxHeight = "0";
                acc.style.opacity = "0";
                acc.classList.remove("expanded");

                
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
              
              
              tableContainer.style.maxHeight = "0";
              tableContainer.style.opacity = "0";
              tableContainer.classList.remove("expanded");

              if (chevronDown && chevronUp) {
                chevronDown.classList.add("hidden");
                chevronUp.classList.remove("hidden");
              }
            } else {
              
              
              const scrollHeight = tableContainer.scrollHeight;
              

              
              tableContainer.style.maxHeight = "2000px";
              tableContainer.style.opacity = "1";
              tableContainer.classList.add("expanded");

              
              setTimeout(() => {
                
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
