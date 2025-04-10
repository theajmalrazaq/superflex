import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";

function MarksPage() {
  const [elemContent, setElemContent] = useState(null);

  useEffect(() => {
    // Style semester selection form
    const styleMarksPageElements = () => {
      // Move the semester selection form to the portlet head
      const semesterForm = document.querySelector(
        'form[action="/Student/StudentMarks"]'
      );
      const portletHead = document.querySelector(".m-portlet__head");

      if (semesterForm && portletHead) {
        // Clone the form before removing it
        const formClone = semesterForm.cloneNode(true);
        // Remove the original form
        semesterForm.remove();
        // Add the form to the portlet head
        portletHead.appendChild(formClone);
        formClone.classList.add("!flex", "!items-center", "!gap-4");

        // Apply additional styling to the form inside portlet head
        formClone.classList.add("ml-4", "flex-1");

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

      // Style tab content area
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

      // Style accordion elements for assessment categories
      const accordionCards = document.querySelectorAll("#accordion .card");
      accordionCards.forEach((card) => {
        card.classList.add(
          "!bg-black",
          "!border",
          "!border-white/10",
          "!rounded-2xl",
          "!mb-4"
        );

        // Style the card header
        const cardHeader = card.querySelector(".card-header");
        if (cardHeader) {
          cardHeader.classList.add(
            "!bg-black",
            "!border-b",
            "!border-white/10",
            "!p-4"
          );

          // Style the accordion button
          const accordionBtn = cardHeader.querySelector(".btn-link");
          if (accordionBtn) {
            accordionBtn.classList.add(
              "!text-white",
              "!no-underline",
              "!w-full",
              "!text-left",
              "!flex",
              "!items-center",
              "!font-medium"
            );

            // Add icon before button text
            const buttonText = accordionBtn.textContent.trim();
            accordionBtn.innerHTML = `
                            <div class="h-8 w-8 rounded-lg bg-x mr-2 flex items-center justify-center">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                                    <path d="M12 5v14M5 12h14"/>
                                </svg>
                            </div>
                            ${buttonText}
                        `;

            // Change icon for expanded state
            accordionBtn.addEventListener("click", function () {
              setTimeout(() => {
                const isExpanded =
                  this.getAttribute("aria-expanded") === "true";
                const iconContainer = this.querySelector("svg");
                if (isExpanded && iconContainer) {
                  iconContainer.innerHTML = '<path d="M5 12h14"/>';
                } else if (iconContainer) {
                  iconContainer.innerHTML = '<path d="M12 5v14M5 12h14"/>';
                }
              }, 100);
            });
          }
        }

        // Style the card body
        const cardBody = card.querySelector(".card-body");
        if (cardBody) {
          cardBody.classList.add(
            "!p-4",
            "!bg-black",
            "!border",
            "!border-white/10"
          );
        }
      });

      // Style the marks tables
      const marksTables = document.querySelectorAll(".sum_table");
      marksTables.forEach((table) => {
        // Create a container for the table with modern styling
        const tableContainer = document.createElement("div");
        tableContainer.className =
          "rounded-xl overflow-hidden !border !border-white/10 mb-4";
        table.parentNode.insertBefore(tableContainer, table);
        tableContainer.appendChild(table);

        // Style the table
        table.classList.add("!w-full", "!border-collapse", "!border-0");
        table.classList.remove("table-bordered");

        // Style the table headers
        const thead = table.querySelector("thead");
        if (thead) {
          thead.classList.add("!bg-zinc-900", "!sticky", "!top-0", "!z-10");

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
          tbody.classList.add("!divide-y", "!divide-white/10");

          // Style table rows
          const rows = tbody.querySelectorAll("tr");
          rows.forEach((row) => {
            row.classList.add(
              "!bg-black",
              "!hover:bg-white/5",
              "!transition-colors"
            );

            // Style cells
            const cells = row.querySelectorAll("td");
            cells.forEach((cell) => {
              cell.classList.add(
                "!p-3",
                "!text-white/80",
                "!border-y",
                "!border-white/10"
              );

              // Style obtained marks with color indicators based on performance
              if (cell.classList.contains("ObtMarks")) {
                const marks = cell.textContent.trim();
                if (marks !== "-") {
                  // Calculate percentage if possible
                  const obtMarks = parseFloat(marks);
                  const totalMarksCell = row.querySelector(".GrandTotal");
                  if (totalMarksCell) {
                    const totalMarks = parseFloat(
                      totalMarksCell.textContent.trim()
                    );
                    const percentage = (obtMarks / totalMarks) * 100;

                    // Apply color based on percentage
                    if (percentage < 50) {
                      cell.classList.add("!text-rose-400");
                    } else if (percentage < 70) {
                      cell.classList.add("!text-amber-400");
                    } else {
                      cell.classList.add("!text-emerald-400");
                    }

                    // Add percentage badge
                    cell.innerHTML = `
                                            <div class="flex items-center gap-2">
                                                <span>${marks}</span>
                                                <span class="text-xs px-2 py-1 rounded-md ${
                                                  percentage < 50
                                                    ? "bg-rose-500/20 text-rose-400"
                                                    : percentage < 70
                                                    ? "bg-amber-500/20 text-amber-400"
                                                    : "bg-emerald-500/20 text-emerald-400"
                                                }">
                                                    ${percentage.toFixed(0)}%
                                                </span>
                                            </div>
                                        `;
                  }
                }
              }
            });
          });
        }

        // Style table footer
        const tfoot = table.querySelector("tfoot");
        if (tfoot) {
          const footerRows = tfoot.querySelectorAll("tr");
          footerRows.forEach((row) => {
            row.classList.add("!bg-zinc-900", "!font-bold");

            const cells = row.querySelectorAll("td");
            cells.forEach((cell) => {
              cell.classList.add("!p-3", "!text-white");
            });
          });
        }
      });

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
                
                /* Style course headings */
                .tab-pane h5 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .tab-pane h5:before {
                    content: "";
                    display: block;
                    width: 40px;
                    height: 40px;
                    background-color: rgb(16, 185, 129);
                    border-radius: 12px;
                    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'%3E%3C/path%3E%3Cpath d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'%3E%3C/path%3E%3C/svg%3E");
                    mask-repeat: no-repeat;
                    mask-position: center;
                    mask-size: 24px;
                }
            `;
      document.head.appendChild(styleElement);

      // Style portlet containers
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

      document.querySelector(".m-portlet__body")?.classList.add(
        "!bg-black",
        "!rounded-b-3xl",
        "!p-8",
        "!border",
        "!border-white/10",
        "!shadow-lg",
        "!text-white",
        "!h-[calc(100vh-220px)]", // Fixed height calculation
        "!max-h-[800px]", // Maximum height limit
        "!overflow-y-auto", // Enable vertical scrolling
        "custom-scrollbar" // Apply custom scrollbar styling
      );

      // Make the main portlet match the theme
      document
        .querySelector(".m-portlet")
        ?.classList.add(
          "!bg-black",
          "!border",
          "!border-white/10",
          "!rounded-3xl",
          "!p-4",
          "!shadow-lg"
        );

      // Add grading summary cards to each tab pane
      document.querySelectorAll(".tab-pane").forEach((tabPane) => {
        const courseTitle = tabPane.querySelector("h5")?.textContent;
        if (courseTitle) {
          // Find all total marks from this tab
          const totalMarkRows = tabPane.querySelectorAll(".totalColumn_");
          let totalObtained = 0;
          let totalWeight = 0;
          let totalMaxWeight = 0;

          totalMarkRows.forEach((row) => {
            const obtMarksElem = row.querySelector(".totalColObtMarks");
            const weightElem = row.querySelector(".totalColweightage");

            if (obtMarksElem && weightElem) {
              const obtMarks = parseFloat(obtMarksElem.textContent);
              const weight = parseFloat(weightElem.textContent);

              if (!isNaN(obtMarks) && !isNaN(weight) && weight > 0) {
                totalObtained += obtMarks;
                totalWeight += weight;
              }

              // Track maximum possible weight for this course
              if (!isNaN(weight)) {
                totalMaxWeight += weight;
              }
            }
          });

          // Only create summary card if we have data
          if (totalWeight > 0) {
            const percentage = (totalObtained / totalWeight) * 100;
            let grade = "N/A";
            let gradeColor = "text-white";

            // Determine grade based on percentage
            if (percentage >= 90) {
              grade = "A";
              gradeColor = "text-emerald-400";
            } else if (percentage >= 80) {
              grade = "B+";
              gradeColor = "text-emerald-400";
            } else if (percentage >= 70) {
              grade = "B";
              gradeColor = "text-blue-400";
            } else if (percentage >= 60) {
              grade = "C+";
              gradeColor = "text-blue-400";
            } else if (percentage >= 50) {
              grade = "C";
              gradeColor = "text-amber-400";
            } else {
              grade = "F";
              gradeColor = "text-rose-400";
            }

            // Create summary card
            const summaryCard = document.createElement("div");
            summaryCard.className =
              "bg-zinc-900 rounded-2xl p-4 mb-6 border border-white/10";
            summaryCard.innerHTML = `
                            <div class="flex justify-between items-start mb-4">
                                <div class="flex items-center gap-3">
                                    <div class="h-10 w-10 rounded-lg bg-x flex items-center justify-center">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-bold text-white">Course Progress Summary</h3>
                                        <p class="text-sm text-white/70">Based on ${totalWeight}/${totalMaxWeight} weightage marks</p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="bg-black rounded-xl px-6 py-3 border border-white/10 text-center">
                                        <span class="block text-xs text-white/70 mb-1">Current Grade</span>
                                        <span class="text-2xl font-bold ${gradeColor}">${grade}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="w-full">
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm text-white/70">Progress (${percentage.toFixed(
                                      1
                                    )}%)</span>
                                    <span class="text-sm font-bold ${
                                      percentage < 50
                                        ? "text-rose-400"
                                        : percentage < 70
                                        ? "text-amber-400"
                                        : "text-emerald-400"
                                    }">${totalObtained.toFixed(
              1
            )}/${totalWeight}</span>
                                </div>
                                <div class="w-full h-2 bg-black rounded-full overflow-hidden">
                                    <div class="h-full rounded-full ${
                                      percentage < 50
                                        ? "bg-rose-400"
                                        : percentage < 70
                                        ? "bg-amber-400"
                                        : "bg-emerald-400"
                                    }" style="width: ${percentage}%;"></div>
                                </div>
                            </div>
                        `;

            // Insert at the top of tab pane content, after the heading
            const h5Element = tabPane.querySelector("h5");
            if (h5Element && h5Element.nextSibling) {
              tabPane.insertBefore(summaryCard, h5Element.nextSibling);
            } else {
              tabPane.insertBefore(summaryCard, tabPane.firstChild);
            }
          }
        }
      });
    };

    // Call the styling function after a delay to ensure DOM is loaded
    setTimeout(styleMarksPageElements, 300);

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

export default MarksPage;
