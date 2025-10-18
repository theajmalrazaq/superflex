import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";

function MarksPloReportPage() {
  const [elemContent, setElemContent] = useState(null);

  useEffect(() => {
    document
      .querySelectorAll("[style*='border']")
      .forEach((el) => (el.style.border = "none")); // Remove any inline border styles
    // Helper function to parse float values
    const parseFloatOrZero = (value) => {
      if (!value || value === "-" || value.trim() === "") return 0;
      const parsedValue = parseFloat(value);
      return isNaN(parsedValue) ? 0 : parsedValue;
    };

    // Get portlet head at the beginning of the function
    const portletHead = document.querySelector(".m-portlet__head");

    // Style semester selection form
    const semesterForm = document.querySelector(
      ".row:has(.col-md-12.text-center select#SemId)",
    );
    if (semesterForm) {
      // Add modern styling to the form container
      semesterForm.classList.add("!flex", "!items-center", "!gap-4", "!mb-4");
      semesterForm.classList.remove("row");

      // Style the form content container
      const formContentDiv = semesterForm.querySelector(".col-md-12");
      if (formContentDiv) {
        formContentDiv.classList.add("!flex", "!items-center", "!gap-2");
        formContentDiv.classList.remove("col-md-12", "text-center");

        // Style the label
        const label = formContentDiv.querySelector("label");
        if (label) {
          label.classList.add("!text-white", "!font-medium", "!m-0");
          // Remove non-breaking spaces
          label.innerHTML = "<strong>Semester:</strong>";
        }

        // Remove extra spacing
        formContentDiv.innerHTML = formContentDiv.innerHTML.replace(
          /&nbsp;/g,
          "",
        );

        // Style the select element
        const selectElement = formContentDiv.querySelector("select");
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
            "!focus:outline-none",
          );

          // Remove bootstrap and metronic classes
          selectElement.classList.remove(
            "m-dropdown__toggle",
            "btn",
            "btn-brand",
            "dropdown-toggle",
          );

          // Clean up select styling
          selectElement.style.paddingRight = "1rem";
          selectElement.style.appearance = "auto";
        }
      }

      // Move the form to portlet head if it exists
      if (portletHead) {
        const formClone = semesterForm.cloneNode(true);
        semesterForm.remove();
        portletHead.appendChild(formClone);
        formClone.classList.add("ml-4", "flex-1");
      }
    }
    // Check if any PLO tables exist
    const ploTables = document.querySelectorAll(".sum_table");

    // If no tables exist, show the "No PLO Report Available" message
    if (ploTables.length === 0) {
      const noReportMessage = document.createElement("div");
      noReportMessage.className =
        "rounded-xl p-8 bg-black !border !border-white/10 text-center mb-6";
      noReportMessage.innerHTML = `
          <svg class="w-16 h-16 mx-auto text-white/30 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-xl font-bold text-white mb-2">No PLO Report Available</h3>
          <p class="text-white/70">There is no PLO attainment data available for the selected semester.</p>
          <p class="text-white/50 text-sm mt-2">Please select a different semester from the dropdown above.</p>
        `;

      // Find the best place to insert the message
      const mContent = document.querySelector(".m-content");
      const portletBody = document.querySelector(".m-portlet__body");

      if (mContent && !portletBody) {
        // Case when only the form is present but no portlet body (as shown in the example)
        const form = mContent.querySelector("form");
        if (form) {
          form.insertAdjacentElement("afterend", noReportMessage);
        } else {
          mContent.appendChild(noReportMessage);
        }
      } else if (portletBody) {
        // Default case when portlet body exists
        portletBody.insertBefore(noReportMessage, portletBody.firstChild);
      }
    }

    // Style the CLO/PLO Attainment table
    ploTables.forEach((table) => {
      // Create a container with modern styling
      const tableContainer = document.createElement("div");
      tableContainer.className =
        "rounded-xl overflow-hidden !border !border-white/10 mb-6 max-w-full overflow-x-auto custom-scrollbar";

      // Insert container before table
      table.parentNode.insertBefore(tableContainer, table);
      tableContainer.appendChild(table);

      // Style the table
      table.classList.add(
        "!w-full",
        "!border-collapse",
        "!border-0",
        "!bg-black",
      );

      // Remove bootstrap classes
      table.classList.remove(
        "table-bordered",
        "table-striped",
        "table-responsive",
        "m-table",
        "m-table--head-bg-info",
        "table",
      );

      // Style the table header
      const thead = table.querySelector("thead");
      if (thead) {
        thead.classList.add(
          "!bg-zinc-900",
          "!sticky",
          "!top-0",
          "!z-10",
          "!border-none",
        );

        let headerrow = thead.querySelectorAll("tr");
        // Style header cells
        headerrow.forEach((row) => {
          const headerCells = row.querySelectorAll("th");
          headerCells.forEach((header) => {
            header.classList.add(
              "!bg-transparent",
              "!text-gray-400",
              "!font-medium",
              "!p-3",
              "!text-center",
              "!border-none",
            );
            header.style.cssText = "border: none !important;";
          });
        });

        // Style the main header
        const mainHeader = thead.querySelector("th[colspan='18']");
        if (mainHeader) {
          mainHeader.classList.add(
            "!text-white",
            "!font-bold",
            "!text-lg",
            "!py-4",
            "!bg-zinc-800",
          );
        }

        // Style domain and PLO headers
        const domainHeader = thead.querySelector("th[colspan='3']");
        const ploHeader = thead.querySelector("th[colspan='12']");

        if (domainHeader) {
          domainHeader.classList.add(
            "!bg-zinc-800/50",
            "!text-white",
            "!font-medium",
          );
        }

        if (ploHeader) {
          ploHeader.classList.add(
            "!bg-zinc-800/50",
            "!text-white",
            "!font-medium",
          );
        }

        // Style PLO number headers
        const ploNumberHeaders = thead.querySelectorAll(
          "th[style*='white-space: nowrap']",
        );
        ploNumberHeaders.forEach((header) => {
          header.classList.add("!whitespace-nowrap", "!px-4", "!py-2");
          header.removeAttribute("style");
        });
      }

      // Style the table body
      const tbody = table.querySelector("tbody");
      if (tbody) {
        tbody.classList.add("!divide-y", "!divide-white/10");

        // Style course rows
        const courseRows = tbody.querySelectorAll("tr td[rowspan]");
        courseRows.forEach((cell) => {
          cell.classList.add(
            "!font-medium",
            "!text-white",
            "!pl-4",
            "!bg-zinc-900/30",
          );
          cell.removeAttribute("style");
        });

        // Style CLO rows
        const cloRows = tbody.querySelectorAll("tr");
        cloRows.forEach((row) => {
          row.classList.add(
            "!bg-black",
            "!hover:bg-white/5",
            "!transition-colors",
          );

          // Style cells
          const cells = row.querySelectorAll("td");
          cells.forEach((cell) => {
            cell.classList.add(
              "!p-3",
              "!text-white/80",
              "!border-y",
              "!border-white/10",
            );

            // Style CLO cell
            if (
              cell.classList.contains("bold") &&
              cell.textContent.includes("CLO")
            ) {
              cell.classList.add("!text-white", "!font-medium", "!bg-x/10");
            }

            // Style values in the table
            if (
              cell.classList.contains("text-center") &&
              !cell.classList.contains("bold")
            ) {
              const value = parseFloatOrZero(cell.textContent);
              if (value > 0) {
                if (value < 30) {
                  cell.classList.add("!text-rose-400");
                } else if (value < 60) {
                  cell.classList.add("!text-amber-400");
                } else {
                  cell.classList.add("!text-emerald-400");
                }
                cell.classList.add("!font-medium");
              }
            }
          });
        });

        // Style total row with blue background
        const totalRows = tbody.querySelectorAll(
          "tr[style*='background: #36a3f7']",
        );
        totalRows.forEach((row) => {
          row.classList.add("!bg-x/80", "!text-white", "!font-medium");
          row.removeAttribute("style");

          // Style total cells
          const totalCells = row.querySelectorAll("td");
          totalCells.forEach((cell) => {
            cell.classList.add("!py-3", "!font-medium");

            // Style the "Total" and "Obtain %" text
            if (cell.classList.contains("text-right")) {
              cell.classList.add("!text-right", "!pr-6");
            }

            // Style percentage values
            if (
              cell.textContent.trim() !== "-" &&
              cell.classList.contains("text-center")
            ) {
              const value = parseFloatOrZero(cell.textContent);
              if (value > 0) {
                if (value < 30) {
                  cell.classList.add("!text-rose-200");
                } else if (value < 60) {
                  cell.classList.add("!text-amber-200");
                } else {
                  cell.classList.add("!text-emerald-200");
                }
              }
            }
          });
        });
      }
    });

    // Add enhanced visual summary card above the table
    const gridHtmlp = document.getElementById("GridHtmlp");
    if (gridHtmlp && gridHtmlp.querySelector(".sum_table")) {
      // Extract data from the table
      const table = gridHtmlp.querySelector(".sum_table");
      const obtainPercentage = table
        .querySelector("tr:last-child td.text-center.bold")
        ?.textContent.trim();

      // Extract individual PLO percentages if available
      const totalRow = table.querySelector("tr:last-child");
      const ploCells = totalRow
        ? Array.from(totalRow.querySelectorAll("td.text-center")).slice(2, -1)
        : [];
      const ploValues = ploCells.map((cell) => {
        const text = cell.textContent.trim();
        return text === "-" ? 0 : parseFloatOrZero(text);
      });

      // Only create summary if we have valid data
      if (obtainPercentage && obtainPercentage !== "-") {
        const percentage = parseFloatOrZero(obtainPercentage);

        // Calculate performance status
        const performanceStatus =
          percentage < 30 ? "Poor" : percentage < 60 ? "Average" : "Excellent";

        // Create enhanced summary card
        const summaryCard = document.createElement("div");
        summaryCard.className =
          "bg-zinc-900 rounded-2xl p-6 mb-6 !border !border-white/10";

        // Build PLO breakdown if we have values
        let ploBreakdown = "";
        if (ploValues.length > 0) {
          ploBreakdown = `
              <div class="mt-5 !border-t !border-white/10 pt-4">
                <h4 class="text-sm font-medium text-white/70 mb-3">PLO Breakdown</h4>
                <div class="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12">
                  ${ploValues
                    .map(
                      (value, index) => `
                    <div class="bg-black rounded-lg p-2 !border !border-white/5 text-center">
                      <div class="text-xs text-white/60 mb-1">PLO ${
                        index + 1
                      }</div>
                      <div class="text-sm font-bold ${
                        value < 30
                          ? "text-rose-400"
                          : value < 60
                            ? "text-amber-400"
                            : "text-emerald-400"
                      }">${value}%</div>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              </div>
            `;
        }

        summaryCard.innerHTML = `
            <div class="flex flex-col md:flex-row justify-between items-start gap-4">
              <div class="flex items-start gap-4">
                <div class="h-12 w-12 rounded-xl bg-x flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">PLO Attainment Summary</h3>
                  <p class="text-sm text-white/70 mt-1">Based on current semester assessment</p>
                </div>
              </div>
              <div class="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <div class="bg-black rounded-xl px-6 py-3 !border !border-white/10 text-center w-full md:w-auto">
                  <span class="block text-xs text-white/70 mb-1">Overall Attainment</span>
                  <span class="text-2xl font-bold ${
                    percentage < 30
                      ? "text-rose-400"
                      : percentage < 60
                        ? "text-amber-400"
                        : "text-emerald-400"
                  }">${percentage}%</span>
                </div>
                <div class="bg-black rounded-xl px-6 py-3 !border !border-white/10 text-center w-full md:w-auto">
                  <span class="block text-xs text-white/70 mb-1">Status</span>
                  <span class="text-sm font-bold ${
                    percentage < 30
                      ? "text-rose-400"
                      : percentage < 60
                        ? "text-amber-400"
                        : "text-emerald-400"
                  }">${performanceStatus}</span>
                </div>
              </div>
            </div>
            <div class="w-full mt-4">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm text-white/70">Progress</span>
                <span class="text-sm font-bold ${
                  percentage < 30
                    ? "text-rose-400"
                    : percentage < 60
                      ? "text-amber-400"
                      : "text-emerald-400"
                }">${percentage}%</span>
              </div>
              <div class="w-full h-3 bg-black rounded-full overflow-hidden">
                <div class="h-full rounded-full ${
                  percentage < 30
                    ? "bg-rose-400"
                    : percentage < 60
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                }" style="width: ${percentage}%;"></div>
              </div>
            </div>
            ${ploBreakdown}
          `;

        // Insert at the top of table container
        gridHtmlp.insertBefore(summaryCard, gridHtmlp.firstChild);
      }
    }

    // Apply print-specific classes to elements
    document
      .querySelectorAll(".bg-zinc-900, .bg-black, .bg-x, .bg-zinc-800")
      .forEach((el) => {
        el.classList.add("print:!bg-white");
      });

    document
      .querySelectorAll(".text-white, .text-gray-400, .text-white\\/80")
      .forEach((el) => {
        el.classList.add("print:!text-black");
      });

    document.querySelectorAll(".border-white\\/10").forEach((el) => {
      el.classList.add("print:!border-gray-200");
    });

    document
      .querySelectorAll(".rounded-xl, .rounded-2xl, .rounded-lg")
      .forEach((el) => {
        el.classList.add("print:!rounded-none");
      });

    // Add print:hidden class to elements that should be hidden in print
    document
      .querySelectorAll(".m-subheader, header, .m-footer")
      .forEach((el) => {
        el.classList.add("print:!hidden");
      });

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
        "!mb-4",
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
        "custom-scrollbar",
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
        "!shadow-lg",
      );

    // Add a print button
    if (portletHead) {
      const printBtn = document.createElement("button");
      printBtn.className =
        "bg-x hover:bg-x/80 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center gap-2";
      printBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Print Report
        `;
      printBtn.addEventListener("click", () => {
        window.print();
      });
      portletHead.appendChild(printBtn);
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

export default MarksPloReportPage;
