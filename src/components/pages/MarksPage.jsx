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
          `div[id^="${courseId}"]:not([id$="Grand_Total_Marks"])`,
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
              row.querySelector(".weightage")?.textContent,
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
            section.querySelectorAll(`.calculationrow`),
          );
          sectionArray.sort((a, b) => {
            const aObtained = parseFloatOrZero(
              a.querySelector(".ObtMarks")?.textContent,
            );
            const bObtained = parseFloatOrZero(
              b.querySelector(".ObtMarks")?.textContent,
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
            totalRow.querySelector(".totalColweightage")?.textContent,
          );
          const localObtained = parseFloatOrZero(
            totalRow.querySelector(".totalColObtMarks")?.textContent,
          );

          if (localWeightage > 0) {
            globalWeightage += localWeightage;
            globalObtained += localObtained;

            // Check if there are any best off marks
            const bestOff = checkBestOff(section, localWeightage);
            const calculationRows = reorderCalculationRows(section, bestOff);

            calculationRows.forEach((row) => {
              const weightage = parseFloatOrZero(
                row.querySelector(".weightage")?.textContent,
              );

              const total = parseFloatOrZero(
                row.querySelector(".GrandTotal")?.textContent,
              );
              const average = parseFloatOrZero(
                row.querySelector(".AverageMarks")?.textContent,
              );
              const minimum = parseFloatOrZero(
                row.querySelector(".MinMarks")?.textContent,
              );
              const maximum = parseFloatOrZero(
                row.querySelector(".MaxMarks")?.textContent,
              );
              const stdDev = parseFloatOrZero(
                row.querySelector(".StdDev")?.textContent,
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
          `${courseId}-Grand_Total_Marks`,
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
        totalRow.className = `totalColumn_${id} !bg-transparent !transition-colors`;

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

        // Apply modern color scheme with percentage indicator
        if (percentage < 50) {
          obtTd.classList.add("!text-rose-400", "!font-medium");
          obtTd.innerHTML = `<span class="inline-flex items-center">${globalObtained.toFixed(2)} <span class="ml-1 text-xs opacity-70">(${percentage.toFixed(0)}%)</span></span>`;
        } else if (percentage < 70) {
          obtTd.classList.add("!text-amber-400", "!font-medium");
          obtTd.innerHTML = `<span class="inline-flex items-center">${globalObtained.toFixed(2)} <span class="ml-1 text-xs opacity-70">(${percentage.toFixed(0)}%)</span></span>`;
        } else {
          obtTd.classList.add("!text-emerald-400", "!font-semibold");
          obtTd.innerHTML = `<span class="inline-flex items-center">${globalObtained.toFixed(2)} <span class="ml-1 text-xs opacity-70">(${percentage.toFixed(0)}%)</span></span>`;
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
                row.querySelector(".weightage")?.textContent,
              );
              const totalMarks = parseFloatOrZero(
                row.querySelector(".GrandTotal")?.textContent,
              );
              const average = parseFloatOrZero(
                row.querySelector(".AverageMarks")?.textContent,
              );
              const minimum = parseFloatOrZero(
                row.querySelector(".MinMarks")?.textContent,
              );
              const maximum = parseFloatOrZero(
                row.querySelector(".MaxMarks")?.textContent,
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
                    newTotalRow.className = `totalColumn_${id} !font-medium !text-white/90`;

                    // Create cells for the new row
                    newTotalRow.innerHTML = `
                      <td class="text-center !py-4 !px-4 !text-white">Total</td>
                      <td class="text-center totalColweightage !py-4 !px-4 !text-white/90"></td>
                      <td class="text-center totalColObtMarks !py-4 !px-4 !text-white/90 !font-semibold"></td>
                      <td class="text-center totalColGrandTotal !py-4 !px-4 !text-white/90"></td>
                      <td class="text-center totalColAverageMarks !py-4 !px-4 !text-white/90">${weightedAvgSum.toFixed(
                        2,
                      )}</td>
                      <td class="text-center totalColStdDev !py-4 !px-4 !text-white/90"></td>
                      <td class="text-center totalColMinMarks !py-4 !px-4 !text-white/90">${weightedMinSum.toFixed(
                        2,
                      )}</td>
                      <td class="text-center totalColMaxMarks !py-4 !px-4 !text-white/90">${weightedMaxSum.toFixed(
                        2,
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
              '[class*="totalColumn_"]',
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
        'form[action="/Student/StudentMarks"]',
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

        // Add modern styles to the portlet container
        const bgelem = document.querySelector(
          ".m-portlet.m-portlet--brand.m-portlet--head-solid-bg.m-portlet--border-bottom-metal.m-portlet--head-sm",
        );
        bgelem?.classList.add(
          "!bg-transparent",
          "!border",
          "!border-none",
          "scrollbar-hide",
        );
        bgelem?.classList.remove(
          "m-portlet--head-solid-bg",
          "m-portlet--border-bottom-metal",
          "m-portlet",
        );

        // Enhanced select control styling to match AttendancePage theme
        const selectElement = formClone.querySelector("select");
        if (selectElement) {
          selectElement.classList.add(
            "!bg-[#161616]",
            "!text-white",
            "!border-2",
            "!border-[#1c1c1c]",
            "!rounded-3xl",
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

      // Enhanced tabs navigation styling
      const tabsNav = document.querySelector(
        ".nav.nav-tabs.m-tabs.m-tabs-line",
      );
      if (tabsNav) {
        tabsNav.classList.add(
          "!flex",
          "!flex-wrap",
          "!m-0",
          "!gap-4",
          "!border-0",
        );

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

      // Enhanced custom styling for nav tabs with AttendancePage consistency
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

      // Make tab content area scrollable and responsive
      const tabContent = document.querySelector(".tab-content");
      if (tabContent) {
        tabContent.classList.add("rounded-xl", "custom-scrollbar", "w-full");

        // Make each tab pane responsive
        const tabPanes = tabContent.querySelectorAll(".tab-pane");
        tabPanes.forEach((pane) => {
          pane.classList.add("max-w-full");

          // Add responsive wrappers around each table container
          pane.querySelectorAll(".sum_table").forEach((table) => {
            const parent = table.parentElement;
            if (parent && !parent.classList.contains("overflow-auto")) {
              parent.classList.add(
                "overflow-x-auto",
                "custom-scrollbar",
                "max-w-full",
                "rounded-xl",
              );
            }
          });
        });
      }

      // Style accordion elements for assessment categories
      const accordionCards = document.querySelectorAll("#accordion .card");
      accordionCards.forEach((card) => {
        card.classList.add(
          "!bg-[#161616]",
          "!border-2",
          "!border-[#1c1c1c]",
          "!rounded-[30px]",
          "!p-4",
          "!mb-6",
          "!overflow-hidden",
          "backdrop-blur-xl",
        );

        // Style the card header
        const cardHeader = card.querySelector(".card-header");
        if (cardHeader) {
          cardHeader.classList.add("!bg-transparent", "!border-none", "!p-4");

          // Style the accordion button
          const accordionBtn = cardHeader.querySelector(".btn-link");
          if (accordionBtn) {
            accordionBtn.classList.add(
              "!text-white",
              "!no-underline",
              "!w-full",
              "!text-left",
              "!flex",
              "!bg-transparent",
              "!items-center",
              "!font-semibold",
              "!text-xl",
              "!tracking-tight",
              "!p-0",
              "!transition-all",
              "!duration-300",
            );

            // Add icon before button text
            const buttonText = accordionBtn.textContent.trim();
            accordionBtn.innerHTML = `
                <div class="flex items-center gap-4 w-full">
                

  <div class="bg-[#1c1c1c] border-2 border-white/10 rounded-2xl px-4 py-3 w-fit flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-x plus-icon">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-x minus-icon hidden">
                      <path d="M5 12h14"/>
                    </svg>
                   
                  </div>


                  <div class="flex flex-col">
                    <h3 class="!text-lg !font-semibold text-white tracking-tight">${buttonText}</h3>
                    <p class="text-white/70 !text-sm !font-medium !m-0">Marks breakdown and statistics</p>
                  </div>
                  
                </div>
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
                accordionBtn.getAttribute("data-target"),
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
          cardBody.classList.add("!p-0", "!bg-transparent", "!border-0");
        }
      });

      // Style the marks tables
      const marksTables = document.querySelectorAll(".sum_table");
      marksTables.forEach((table) => {
        // Create a responsive container for the table with modern styling
        const tableContainer = document.createElement("div");
        tableContainer.className =
          "!overflow-auto !rounded-xl !mb-0 shadow-lg !backdrop-blur-sm !border !border-white/10";
        table.parentNode.insertBefore(tableContainer, table);
        tableContainer.appendChild(table);

        // Style the table with modern, minimal design
        table.classList.add(
          "!w-full",
          "!border-collapse",
          "!border-spacing-0",
          "!border-0",
          "!mb-0",
        );
        table.classList.remove("table-bordered");

        // Style the table headers
        const thead = table.querySelector("thead");
        if (thead) {
          thead.classList.add(
            "!bg-black/40",
            "!sticky",
            "!top-0",
            "!z-10",
            "!backdrop-blur-md",
          );

          const headers = thead.querySelectorAll("th");
          headers.forEach((header) => {
            header.classList.add(
              "!bg-transparent",
              "!text-gray-300",
              "!font-medium",
              "!py-4",
              "!px-4",
              "!text-left",
              "!text-xs",
              "!uppercase",
              "!tracking-wider",
              "!border-b",
              "!border-white/10",
            );
          });
        }

        // Style the table body with cleaner, more minimal approach
        const tbody = table.querySelector("tbody");
        if (tbody) {
          tbody.classList.add("!bg-black/20");

          // Style table rows
          const rows = tbody.querySelectorAll("tr");
          rows.forEach((row, index) => {
            // Alternate row background for better readability
            if (index % 2 === 0) {
              row.classList.add("!bg-black/10");
            } else {
              row.classList.add("!bg-transparent");
            }

            row.classList.add(
              "!hover:bg-white/5",
              "!transition-all",
              "!duration-200",
            );

            // Style cells with more consistent padding and typography
            const cells = row.querySelectorAll("td");
            cells.forEach((cell) => {
              cell.classList.add(
                "!py-3",
                "!px-4",
                "!text-white/80",
                "!text-sm",
                "!border-0",
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
                      totalMarksCell.textContent.trim(),
                    );
                    const percentage = (obtMarks / totalMarks) * 100;

                    // Apply enhanced color and styling for marks based on percentage
                    cell.classList.add("!font-medium");

                    if (percentage < 50) {
                      cell.classList.add("!text-rose-400");
                      // Add percentage in small text
                      cell.innerHTML = `<span class="flex items-center gap-1">
                        ${marks}
                        <span class="text-xs opacity-70">(${percentage.toFixed(0)}%)</span>
                      </span>`;
                    } else if (percentage < 70) {
                      cell.classList.add("!text-amber-400");
                      // Add percentage in small text
                      cell.innerHTML = `<span class="flex items-center gap-1">
                        ${marks}
                        <span class="text-xs opacity-70">(${percentage.toFixed(0)}%)</span>
                      </span>`;
                    } else {
                      cell.classList.add("!text-emerald-400", "!font-semibold");
                      // Add percentage in small text with checkmark for high scores
                      cell.innerHTML = `<span class="flex items-center gap-1">
                        ${marks}
                        <span class="text-xs opacity-70">(${percentage.toFixed(0)}%)</span>
                        ${percentage >= 90 ? '<svg class="w-3 h-3 text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>' : ""}
                      </span>`;
                    }
                  }
                }
              }
            });
          });
        }

        // Style table footer with more distinct appearance
        const tfoot = table.querySelector("tfoot");
        if (tfoot) {
          tfoot.classList.add("!border-t-2", "!border-white/20");

          const footerRows = tfoot.querySelectorAll("tr");
          footerRows.forEach((row) => {
            row.classList.add(
              "!bg-gradient-to-r",
              "!from-black/60",
              "!to-black/40",
              "!backdrop-blur-md",
            );

            const cells = row.querySelectorAll("td");
            cells.forEach((cell) => {
              cell.classList.add(
                "!py-4",
                "!px-4",
                "!text-white/90",
                "!font-medium",
                "!text-sm",
              );
            });
          });
        }
      });

      // Add custom scrollbar and table styles (consistent with AttendancePage)
      const styleElement = document.createElement("style");
      styleElement.textContent = `
        /* Custom Scrollbar Styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
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
        
        /* Enhanced Table Styling */
        .sum_table {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          border-radius: 0.75rem;
          overflow: hidden;
        }
        
        .sum_table thead th {
          position: sticky;
          top: 0;
          z-index: 10;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.025em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .sum_table tbody tr:last-child td {
          border-bottom: none;
        }
        
        /* Add subtle animation to row hover */
        .sum_table tbody tr {
          transition: all 0.2s ease;
        }
        
        .sum_table tbody tr:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        
        /* Add colored left border for visual hierarchy */
        .sum_table tbody tr.calculationrow td:first-child {
          border-left: 3px solid transparent;
        }
        
        .sum_table tbody tr.calculationrow:hover td:first-child {
          border-left-color: rgba(160, 152, 255, 0.5);
        }
        
        /* Style the total rows differently */
        .sum_table tr[class*="totalColumn_"] {
          font-weight: 600;
          background: linear-gradient(90deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4)) !important;
        }
      `;
      document.head.appendChild(styleElement);

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

        // Remove title if exists to match AttendancePage
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

      // Add grading summary cards to each tab pane
      document.querySelectorAll(".tab-pane").forEach((tabPane) => {
        const courseTitle = tabPane.querySelector("h5");
        courseTitle.classList.add(
          "!text-white",
          "!font-semibold",
          "!text-2xl",
          "!mb-4",
        );
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
                                      1,
                                    )}%)</span>
                                    <span class="text-sm font-bold ${
                                      percentage < 50
                                        ? "text-rose-400"
                                        : percentage < 70
                                          ? "text-amber-400"
                                          : "text-emerald-400"
                                    }">${totalObtained.toFixed(
                                      1,
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

export default MarksPage;
