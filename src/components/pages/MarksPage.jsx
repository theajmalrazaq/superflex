import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";

function MarksPage() {
  const [elemContent, setElemContent] = useState(null);

  useEffect(() => {
    // Style semester selection form
    const styleMarksPageElements = () => {
      // Define all variables at the beginning to prevent hoisting issues
      let portletHead, semesterForm, formClone, selectElement, tabsNav;
      let tabItems, tabContent, accordionCards, marksTables;
      let styleElement;

      // Helper functions
      const parseFloatOrZero = (value) => {
        if (!value || value === "-" || value.trim() === "") return 0;
        const parsedValue = parseFloat(value);
        return isNaN(parsedValue) ? 0 : parsedValue;
      };

      // Helper function to get cell value (either from text content or input)
      const getCellValue = (cell) => {
        if (!cell) return 0;
        return parseFloatOrZero(cell.textContent);
      };

      // Helper function to format decimal numbers properly
      const formatDecimal = (value) => {
        if (typeof value !== "number") {
          value = parseFloatOrZero(value);
        }
        // Format to 2 decimal places and remove trailing zeros
        return parseFloat(value.toFixed(2)).toString();
      };

      const calculateMarks = (courseId, id) => {
        console.log(`Calculating marks for course ${courseId}`);
        const course = document.getElementById(courseId);
        if (!course) return;

        const sections = course.querySelectorAll(
          `div[id^="${courseId}"]:not([id$="Grand_Total_Marks"])`
        );
        if (!sections.length) return;

        let globalWeightage = 0;
        let globalObtained = 0;
        let globalAverage = 0;
        let globalMinimum = 0;
        let globalMaximum = 0;
        let globalStdDev = 0;

        sections.forEach((section) => {
          const totalRows = section.querySelectorAll("[class*='totalColumn_']");
          if (!totalRows.length) return;

          const totalRow = totalRows[totalRows.length - 1]; // Use the last total row
          if (!totalRow) return;

          const totalObtMarksCell = totalRow.querySelector(".totalColObtMarks");
          const totalWeightCell = totalRow.querySelector(".totalColweightage");

          if (totalObtMarksCell && totalWeightCell) {
            const existingObtMarks = parseFloatOrZero(
              totalObtMarksCell.textContent
            );
            const existingWeight = parseFloatOrZero(
              totalWeightCell.textContent
            );

            // If both obtained marks and total weight are valid values, skip calculation for this section
            if (existingObtMarks > 0 && existingWeight > 0) {
              // Just add to global totals without recalculating
              globalWeightage += existingWeight;
              globalObtained += existingObtMarks;

              // Extract other statistics if they exist
              const calculationRows =
                section.querySelectorAll(".calculationrow");
              calculationRows.forEach((row) => {
                const weightage = parseFloatOrZero(
                  row.querySelector(".weightage")?.textContent
                );
                const total = parseFloatOrZero(
                  row.querySelector(".GrandTotal")?.textContent
                );
                const average = parseFloatOrZero(
                  row.querySelector(".AverageMarks")?.textContent
                );
                const minimum = parseFloatOrZero(
                  row.querySelector(".MinMarks")?.textContent
                );
                const maximum = parseFloatOrZero(
                  row.querySelector(".MaxMarks")?.textContent
                );
                const stdDev = parseFloatOrZero(
                  row.querySelector(".StdDev")?.textContent
                );

                // Calculate global statistics using the weightage/total ratio
                if (total > 0) {
                  globalAverage += average * (weightage / total);
                  globalMinimum += minimum * (weightage / total);
                  globalMaximum += maximum * (weightage / total);
                  globalStdDev += stdDev * (weightage / total);
                }
              });

              return; // Skip further calculation for this section
            }
          }

          // If we reach here, we need to calculate for this section
          // Skip recalculating section's total based on current marks
          // Instead, just extract the values we need for the grand total

          // Extract values from the section's total row for grand total calculations
          const localWeightage = parseFloatOrZero(
            totalRow.querySelector(".totalColweightage")?.textContent
          );
          const localObtained = getCellValue(
            totalRow.querySelector(".totalColObtMarks")
          );

          if (localWeightage > 0) {
            globalWeightage += localWeightage;
            globalObtained += localObtained;

            // Extract statistics from calculation rows without recalculating section totals
            const calculationRows = section.querySelectorAll(".calculationrow");
            calculationRows.forEach((row) => {
              const weightage = parseFloatOrZero(
                row.querySelector(".weightage")?.textContent
              );

              const total = parseFloatOrZero(
                row.querySelector(".GrandTotal")?.textContent
              );
              const average = parseFloatOrZero(
                row.querySelector(".AverageMarks")?.textContent
              );
              const minimum = parseFloatOrZero(
                row.querySelector(".MinMarks")?.textContent
              );
              const maximum = parseFloatOrZero(
                row.querySelector(".MaxMarks")?.textContent
              );
              const stdDev = parseFloatOrZero(
                row.querySelector(".StdDev")?.textContent
              );

              // Calculate global statistics using the weightage/total ratio
              if (total > 0) {
                globalAverage += average * (weightage / total);
                globalMinimum += minimum * (weightage / total);
                globalMaximum += maximum * (weightage / total);
                globalStdDev += stdDev * (weightage / total);
              }
            });
          }
        });

        // Find or create the grand total table body
        const grandTotalSection = document.getElementById(
          `${courseId}-Grand_Total_Marks`
        );
        if (!grandTotalSection) return;

        // Find the table inside the grand total section
        const table = grandTotalSection.querySelector("table");
        if (!table) return;

        const tableBody = table.querySelector("tbody");
        if (!tableBody) return;

        // Clear any existing rows
        tableBody.innerHTML = "";

        // Create grand total row
        const totalRow = document.createElement("tr");
        totalRow.className = `totalColumn_${id} !bg-black !hover:bg-white/5 !transition-colors`;

        // Helper to create a cell
        const createTd = (value, className) => {
          const td = document.createElement("td");
          td.className = `text-center ${className} !p-3 !text-white/80 !border-y !border-white/10`;
          td.textContent =
            typeof value === "number" ? formatDecimal(value) : value;
          return td;
        };

        // Create and add cells
        totalRow.appendChild(createTd(globalWeightage, "GrandtotalColMarks"));

        // Apply color to obtained marks based on percentage
        const obtTd = createTd(globalObtained, "GrandtotalObtMarks");
        const percentage = (globalObtained / globalWeightage) * 100;
        if (percentage < 50) {
          obtTd.classList.add("!text-rose-400");
        } else if (percentage < 70) {
          obtTd.classList.add("!text-amber-400");
        } else {
          obtTd.classList.add("!text-emerald-400");
        }
        totalRow.appendChild(obtTd);

        // Add remaining statistics
        totalRow.appendChild(createTd(globalAverage, "GrandtotalClassAvg"));
        totalRow.appendChild(createTd(globalMinimum, "GrandtotalClassMin"));
        totalRow.appendChild(createTd(globalMaximum, "GrandtotalClassMax"));
        totalRow.appendChild(createTd(globalStdDev, "GrandtotalClassStdDev"));

        // Add the row to the table
        tableBody.appendChild(totalRow);

        // Update course summary card with new calculation results
        updateCourseSummaryCard(courseId, globalObtained, globalWeightage);

        return { globalObtained, globalWeightage, percentage };
      };

      // Function to update a course's summary card after recalculation
      const updateCourseSummaryCard = (courseId, obtained, weightage) => {
        if (!courseId || !obtained || !weightage) return;

        // Find the tab pane containing this course
        const tabPane = document
          .querySelector(`#${courseId}`)
          .closest(".tab-pane");
        if (!tabPane) return;

        // Find the summary card
        const summaryCard = tabPane.querySelector(".bg-zinc-900.rounded-2xl");
        if (!summaryCard) return;

        // Calculate percentage and determine grade
        const percentage = (obtained / weightage) * 100;
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

        // Update grade display
        const gradeDisplay = summaryCard.querySelector(".text-2xl.font-bold");
        if (gradeDisplay) {
          gradeDisplay.textContent = grade;
          gradeDisplay.className = `text-2xl font-bold ${gradeColor}`;
        }

        // Update progress percentage text
        const progressText = summaryCard.querySelector(
          ".text-sm.text-white\\/70"
        );
        if (progressText) {
          progressText.textContent = `Progress (${percentage.toFixed(1)}%)`;
        }

        // Update obtained/weight text
        const obtainedText = summaryCard.querySelector(".text-sm.font-bold");
        if (obtainedText) {
          obtainedText.textContent = `${formatDecimal(
            obtained
          )}/${formatDecimal(weightage)}`;
          obtainedText.className = `text-sm font-bold ${
            percentage < 50
              ? "text-rose-400"
              : percentage < 70
              ? "text-amber-400"
              : "text-emerald-400"
          }`;
        }

        // Update progress bar
        const progressBar = summaryCard.querySelector(
          ".w-full.h-2.bg-black .h-full"
        );
        if (progressBar) {
          progressBar.style.width = `${percentage}%`;
          progressBar.className = `h-full rounded-full ${
            percentage < 50
              ? "bg-rose-400"
              : percentage < 70
              ? "bg-amber-400"
              : "bg-emerald-400"
          }`;
        }
      };

      // Attach event listeners to Grand Total accordions
      document
        .querySelectorAll('button[data-target*="Grand_Total_Marks"]')
        .forEach((btn) => {
          // Extract course ID and assessment ID
          const targetId = btn.getAttribute("data-target");
          if (!targetId) return;

          const courseId = targetId.split("-")[0];
          const onclick = btn.getAttribute("onclick");

          if (onclick && onclick.includes("ftn_calculateMarks")) {
            // Extract ID from the onclick attribute
            const idMatch = onclick.match(/ftn_calculateMarks\('(\d+)'\)/);
            if (idMatch && idMatch[1]) {
              const id = idMatch[1];

              // Replace the onclick handler
              btn.removeAttribute("onclick");
              btn.addEventListener("click", () => calculateMarks(courseId, id));

              // Also trigger calculation when the accordion is expanded
              btn.addEventListener("click", () => {
                setTimeout(() => {
                  if (btn.getAttribute("aria-expanded") === "true") {
                    calculateMarks(courseId, id);
                  }
                }, 100);
              });
            }
          }
        });

      // Auto-calculate all grand totals on page load
      setTimeout(() => {
        document
          .querySelectorAll('[id$="Grand_Total_Marks"]')
          .forEach((section) => {
            const courseId = section.id.split("-")[0];

            // Find an ID from a total row in this course
            const courseElement = document.getElementById(courseId);
            if (!courseElement) return;

            let id = null;
            const totalColumnElements = courseElement.querySelectorAll(
              '[class*="totalColumn_"]'
            );
            if (totalColumnElements.length > 0) {
              const classNames = totalColumnElements[0].className.split(" ");
              for (const className of classNames) {
                if (className.startsWith("totalColumn_")) {
                  id = className.replace("totalColumn_", "");
                  break;
                }
              }
            }

            if (id) {
              calculateMarks(courseId, id);
            }
          });
      }, 500);

      // Move the semester selection form to the portlet head
      portletHead = document.querySelector(".m-portlet__head");
      semesterForm = document.querySelector(
        'form[action="/Student/StudentMarks"]'
      );

      if (semesterForm && portletHead) {
        // Clone the form before removing it
        formClone = semesterForm.cloneNode(true);
        // Remove the original form
        semesterForm.remove();
        // Add the form to the portlet head
        portletHead.appendChild(formClone);
        formClone.classList.add("!flex", "!items-center", "!gap-4");

        // Apply additional styling to the form inside portlet head
        formClone.classList.add("ml-4", "flex-1");

        // Make the select control match the theme
        selectElement = formClone.querySelector("select");
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
      tabsNav = document.querySelector(".nav.nav-tabs.m-tabs.m-tabs-line");
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
        tabItems = tabsNav.querySelectorAll(".nav-item.m-tabs__item");
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
      tabContent = document.querySelector(".tab-content");
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
      accordionCards = document.querySelectorAll("#accordion .card");
      accordionCards.forEach((card) => {
        card.classList.add(
          "!bg-black",
          "!border",
          "!border-white/10",
          "!rounded-2xl",
          "!p-4",
          "!mb-4"
        );

        // Style the card header
        const cardHeader = card.querySelector(".card-header");
        if (cardHeader) {
          cardHeader.classList.add("!bg-black", "!border-none");

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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="plus-icon text-white">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="minus-icon text-white hidden">
                        <path d="M5 12h14"/>
                    </svg>
                </div>
                ${buttonText}
            `;

            // Force all accordions to be collapsed initially
            if (accordionBtn.getAttribute("aria-expanded") === "true") {
              accordionBtn.setAttribute("aria-expanded", "false");
              const collapseTarget = document.querySelector(
                accordionBtn.getAttribute("data-target")
              );
              if (collapseTarget) {
                collapseTarget.classList.remove("show");
              }
            }

            // Change icon for expanded state
            accordionBtn.addEventListener("click", function () {
              setTimeout(() => {
                const isExpanded =
                  this.getAttribute("aria-expanded") === "true";
                const plusIcon = this.querySelector(".plus-icon");
                const minusIcon = this.querySelector(".minus-icon");

                if (plusIcon && minusIcon) {
                  if (isExpanded) {
                    plusIcon.classList.add("hidden");
                    minusIcon.classList.remove("hidden");
                  } else {
                    plusIcon.classList.remove("hidden");
                    minusIcon.classList.add("hidden");
                  }
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
            "!border-white/0"
          );
        }
      });

      // Style the marks tables
      marksTables = document.querySelectorAll(".sum_table");
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
                const originalMarks = cell.textContent.trim();

                // Apply color based on percentage to the text
                const totalMarksCell = row.querySelector(".GrandTotal");
                if (totalMarksCell && originalMarks !== "-") {
                  const totalMarks = parseFloat(
                    totalMarksCell.textContent.trim()
                  );
                  const obtMarks = parseFloat(originalMarks);
                  if (
                    !isNaN(obtMarks) &&
                    !isNaN(totalMarks) &&
                    totalMarks > 0
                  ) {
                    const percentage = (obtMarks / totalMarks) * 100;

                    // Apply color based on percentage
                    if (percentage < 50) {
                      cell.classList.add("!text-rose-400");
                    } else if (percentage < 70) {
                      cell.classList.add("!text-amber-400");
                    } else {
                      cell.classList.add("!text-emerald-400");
                    }
                  }
                }
              }
            });
          });
        }
      });

      // Add custom scrollbar styling
      styleElement = document.createElement("style");
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

      document
        .querySelector(".m-portlet__body")
        ?.classList.add(
          "!bg-black",
          "!rounded-b-3xl",
          "!p-8",
          "!border",
          "!border-white/10",
          "!shadow-lg",
          "!text-white",
          "!h-[calc(100vh-220px)]",
          "!max-h-[800px]",
          "!overflow-y-auto",
          "custom-scrollbar"
        );

      // Make the main portlet match the theme
      document
        .querySelector(".m-portlet")
        ?.classList.add(
          "!bg-black",
          "!border",
          "!border-white/0",
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
