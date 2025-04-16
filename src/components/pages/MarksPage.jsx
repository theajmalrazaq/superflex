import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";

function MarksPage() {
  const [elemContent, setElemContent] = useState(null);

  useEffect(() => {
    // Style semester selection form
    const styleMarksPageElements = () => {
      const parseFloatOrZero = (value) => {
        if (!value || value === "-" || value.trim() === "") return 0;
        const parsedValue = parseFloat(value);
        return isNaN(parsedValue) ? 0 : parsedValue;
      };

      const calculateMarks = (courseId, id) => {
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

        // Function to check for best off marks
        const checkBestOff = (section, weightage) => {
          const calculationRows = section.querySelectorAll(`.calculationrow`);
          let weightsOfAssessments = 0;
          let count = 0;
          for (let row of calculationRows) {
            const weightageOfAssessment = parseFloatOrZero(
              row.querySelector(".weightage")?.textContent
            );
            weightsOfAssessments += weightageOfAssessment;

            if (weightage < weightsOfAssessments) {
              return count;
            }
            count++;
          }
          return count;
        };

        // Function to reorder calculation rows based on obtained marks
        const reorderCalculationRows = (section, bestOff) => {
          const sectionArray = Array.from(
            section.querySelectorAll(`.calculationrow`)
          );
          sectionArray.sort((a, b) => {
            const aObtained = parseFloatOrZero(
              a.querySelector(".ObtMarks")?.textContent
            );
            const bObtained = parseFloatOrZero(
              b.querySelector(".ObtMarks")?.textContent
            );
            return bObtained - aObtained;
          });
          return sectionArray.slice(0, bestOff);
        };

        sections.forEach((section) => {
          // Find the total row for this section
          const totalRows = section.querySelectorAll("[class*='totalColumn_']");
          if (!totalRows.length) return;

          const totalRow = totalRows[totalRows.length - 1]; // Use the last total row
          if (!totalRow) return;

          // Extract values from the section's total row
          const localWeightage = parseFloatOrZero(
            totalRow.querySelector(".totalColweightage")?.textContent
          );
          const localObtained = parseFloatOrZero(
            totalRow.querySelector(".totalColObtMarks")?.textContent
          );

          if (localWeightage > 0) {
            globalWeightage += localWeightage;
            globalObtained += localObtained;

            // Check if there are any best off marks
            const bestOff = checkBestOff(section, localWeightage);
            const calculationRows = reorderCalculationRows(section, bestOff);

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
          td.textContent = typeof value === "number" ? value.toFixed(2) : value;
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

        // Additional calculations for each section's table
        sections.forEach((section) => {
          // Find all tables in this section
          const tables = section.querySelectorAll(".sum_table");

          tables.forEach((table) => {
            // Get all calculation rows
            const calculationRows = table.querySelectorAll(".calculationrow");

            // Values for weighted calculations
            let weightedAvgSum = 0;
            let weightedMinSum = 0;
            let weightedMaxSum = 0;

            calculationRows.forEach((row) => {
              const weightage = parseFloatOrZero(
                row.querySelector(".weightage")?.textContent
              );
              const totalMarks = parseFloatOrZero(
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

              if (totalMarks > 0 && average > 0) {
                // Calculate weighted values
                weightedAvgSum += average * (weightage / totalMarks);
                weightedMinSum += minimum * (weightage / totalMarks);
                weightedMaxSum += maximum * (weightage / totalMarks);
              }
            });

            // Try to find footer row in tfoot
            const tfoot = table.querySelector("tfoot");
            if (tfoot && tfoot.querySelector("tr")) {
              const footerRow = tfoot.querySelector("tr");
              // Update footer cells with weighted calculations
              const avgCell = footerRow.querySelector(".totalColAverageMarks");
              const minCell = footerRow.querySelector(".totalColMinMarks");
              const maxCell = footerRow.querySelector(".totalColMaxMarks");

              if (avgCell) avgCell.textContent = weightedAvgSum.toFixed(2);
              if (minCell) minCell.textContent = weightedMinSum.toFixed(2);
              if (maxCell) maxCell.textContent = weightedMaxSum.toFixed(2);
            } else {
              // If no tfoot exists, find the last row in tbody and update it
              const tbody = table.querySelector("tbody");
              if (tbody) {
                const rows = tbody.querySelectorAll("tr");
                if (rows.length > 0) {
                  const lastRow = rows[rows.length - 1];
                  // Check if this is a total row by looking for specific classes
                  const isTotalRow =
                    lastRow.className.includes("totalColumn_") ||
                    lastRow.querySelector(".totalColweightage") !== null;

                  if (isTotalRow) {
                    // Update last row cells with weighted calculations
                    const avgCell =
                      lastRow.querySelector(".totalColAverageMarks") ||
                      lastRow.querySelector("td:nth-child(5)"); // 5th cell is usually average
                    const minCell =
                      lastRow.querySelector(".totalColMinMarks") ||
                      lastRow.querySelector("td:nth-child(7)"); // 7th cell is usually min
                    const maxCell =
                      lastRow.querySelector(".totalColMaxMarks") ||
                      lastRow.querySelector("td:nth-child(8)"); // 8th cell is usually max

                    if (avgCell)
                      avgCell.textContent = weightedAvgSum.toFixed(2);
                    if (minCell)
                      minCell.textContent = weightedMinSum.toFixed(2);
                    if (maxCell)
                      maxCell.textContent = weightedMaxSum.toFixed(2);
                  } else {
                    // Create a new row for totals if the last row isn't a total row
                    const newTotalRow = document.createElement("tr");
                    newTotalRow.className = `totalColumn_${id} !bg-zinc-900 !font-bold`;

                    // Create cells for the new row
                    newTotalRow.innerHTML = `
                      <td class="text-center !p-3 !text-white">Total</td>
                      <td class="text-center totalColweightage !p-3 !text-white"></td>
                      <td class="text-center totalColObtMarks !p-3 !text-white"></td>
                      <td class="text-center totalColGrandTotal !p-3 !text-white"></td>
                      <td class="text-center totalColAverageMarks !p-3 !text-white">${weightedAvgSum.toFixed(
                        2
                      )}</td>
                      <td class="text-center totalColStdDev !p-3 !text-white"></td>
                      <td class="text-center totalColMinMarks !p-3 !text-white">${weightedMinSum.toFixed(
                        2
                      )}</td>
                      <td class="text-center totalColMaxMarks !p-3 !text-white">${weightedMaxSum.toFixed(
                        2
                      )}</td>
                    `;

                    // Add the new row to tbody
                    tbody.appendChild(newTotalRow);
                  }
                }
              }
            }
          });
        });
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
          "!border-white/0"
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
          "!bg-white/10",
          "!border",
          "!border-white/10",
          "!rounded-2xl",
          "!p-4",
          "!mb-4"
        );

        // Style the card header
        const cardHeader = card.querySelector(".card-header");
        if (cardHeader) {
          cardHeader.classList.add("!bg-black", "!border-none", "!p-0");

          // Style the accordion button
          const accordionBtn = cardHeader.querySelector(".btn-link");
          if (accordionBtn) {
            accordionBtn.classList.add(
              "!text-white",
              "!no-underline",
              "!w-full",
              "!text-left",
              "!flex",
              "!bg-white/10",
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

            const updateIconState = (button) => {
              const isExpanded =
                button.getAttribute("aria-expanded") === "true";
              const plusIcon = button.querySelector(".plus-icon");
              const minusIcon = button.querySelector(".minus-icon");

              if (plusIcon && minusIcon) {
                if (isExpanded) {
                  plusIcon.classList.add("hidden");
                  minusIcon.classList.remove("hidden");
                } else {
                  plusIcon.classList.remove("hidden");
                  minusIcon.classList.add("hidden");
                }
              }
            };

            updateIconState(accordionBtn);

            const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (
                  mutation.type === "attributes" &&
                  mutation.attributeName === "aria-expanded"
                ) {
                  updateIconState(accordionBtn);
                }
              });
            });

            observer.observe(accordionBtn, { attributes: true });

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

            // Remove the old click handler and add a simpler one
            // that relies on the MutationObserver
            accordionBtn.addEventListener("click", function () {
              // No need to do anything here - the observer will handle icon updates
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
            "!border-white/0",
            "!rounded-[22px]"
          );
        }
      });

      // Style the marks tables
      const marksTables = document.querySelectorAll(".sum_table");
      marksTables.forEach((table) => {
        // Create a container for the table with modern styling
        const tableContainer = document.createElement("div");
        tableContainer.className =
          "rounded-xl overflow-hidden !border !border-white/10";
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
              "!border-white/0"
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

                    // Set just the marks without percentage badge
                    cell.textContent = marks;
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
