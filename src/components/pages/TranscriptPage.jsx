import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";

function TranscriptPage() {
  const [elemContent, setElemContent] = useState(null);

  useEffect(() => {
    const conelem = document.querySelector(".m-content");
    conelem.querySelector(".row").remove();

    const alertElement = document.querySelector(
      ".m-alert.m-alert--icon.m-alert--icon-solid.m-alert--outline.alert.alert-info",
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

      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      circle.setAttribute("cx", "12");
      circle.setAttribute("cy", "12");
      circle.setAttribute("r", "10");

      const line1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line1.setAttribute("x1", "12");
      line1.setAttribute("y1", "16");
      line1.setAttribute("x2", "12");
      line1.setAttribute("y2", "12");

      const line2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line2.setAttribute("x1", "12");
      line2.setAttribute("y1", "8");
      line2.setAttribute("x2", "12.01");
      line2.setAttribute("y2", "8");

      svg.appendChild(circle);
      svg.appendChild(line1);
      svg.appendChild(line2);
      iconElement.innerHTML = "";
      iconElement.appendChild(svg);
    }

    const alertText = alertElement?.querySelector(".m-alert__text");
    if (alertText) {
      alertText.classList.add("!text-white/90", "!font-medium");

      const boldText = alertText.querySelector("b");
      if (boldText) {
        boldText.classList.add("!text-x");
      }
    }

    const closeButton = alertElement?.querySelector(
      'button.close[data-dismiss="alert"]',
    );
    if (closeButton) {
      closeButton.style.cssText = "content: none !important;";

      const style = document.createElement("style");
      style.textContent =
        'button.close[data-dismiss="alert"]::before { display: none !important; content: none !important; }';
      document.head.appendChild(style);

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

      closeSvg.appendChild(line1);
      closeSvg.appendChild(line2);
      closeButton.innerHTML = "";
      closeButton.appendChild(closeSvg);
      closeButton.classList.add("!focus:outline-none");
    }

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
      .querySelector(".m-portlet__head-text")
      ?.classList.add("!text-white", "!text-xl", "!font-bold");

    const portletHeadCaption = document.querySelector(
      ".m-portlet__head-caption",
    );
    if (portletHeadCaption) {
      const portletHeadTitle = portletHeadCaption.querySelector(
        ".m-portlet__head-title",
      );

      const titleContainer = document.createElement("div");
      titleContainer.className = "flex items-center gap-4";

      if (portletHeadTitle) {
        titleContainer.appendChild(portletHeadTitle);
      }

      const planCGPAButton = document.createElement("button");
      planCGPAButton.className =
        "px-4 py-2 bg-x text-white text-sm rounded-lg flex items-center gap-2 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md";
      planCGPAButton.id = "portletPlanCGPAButton";
      planCGPAButton.innerHTML = `
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        Plan CGPA
      `;

      titleContainer.appendChild(planCGPAButton);

      portletHeadCaption.innerHTML = "";
      portletHeadCaption.appendChild(titleContainer);
    }

    document
      .querySelector(
        ".m-portlet.m-portlet--brand.m-portlet--head-solid-bg.m-portlet--border-bottom-brand.m-portlet--head-sm",
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
        "!h-[450px]",
        "!overflow-y-auto",
        "custom-scrollbar",
      );

    const styleTranscriptTables = () => {
      const sectionContent = document.querySelector(".m-section__content");
      if (sectionContent) {
        document.querySelectorAll(".transcript-link").forEach((link) => {
          link.classList.add(
            "text-blue-500",
            "underline",
            "transition-colors",
            "duration-200",
            "hover:text-x",
          );
        });

        document.querySelectorAll("table").forEach((table) => {
          if (table.closest(".modal-body")) return;

          table.classList.add("w-full", "border-collapse", "border-0");

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
                "bg-transparent",
                "text-slate-400",
                "font-medium",
                "p-3",
                "text-left",
                "border-b",
                "border-white/10",
              );
            });
          }

          const tbody = table.querySelector("tbody");
          if (tbody) {
            tbody.classList.add("border-t", "border-white/10");

            const rows = tbody.querySelectorAll("tr");
            rows.forEach((row) => {
              row.classList.add(
                "bg-black",
                "transition-colors",
                "duration-200",
                "hover:bg-white/5",
              );

              const cells = row.querySelectorAll("td");
              cells.forEach((cell) => {
                cell.classList.add(
                  "p-3",
                  "text-white/80",
                  "border-b",
                  "border-white/10",
                );

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

        const mainRow = sectionContent.querySelector(".row");
        if (mainRow) {
          const semesterCols = mainRow.querySelectorAll(".col-md-6");

          semesterCols.forEach((semesterCol) => {
            const semesterContainer = document.createElement("div");
            semesterContainer.className = "semester-container";
            semesterContainer.classList.add(
              "!mb-4",
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

            const headerRow = semesterCol.querySelector(".row");
            if (headerRow) {
              headerRow.className = "semester-header cursor-pointer";
              headerRow
                .querySelector(".pull-right")
                .classList.add("!text-white/80", "text-base", "!p-4");
              headerRow.querySelectorAll("h5").forEach((h5) => {
                h5.classList.add(
                  "!text-white",
                  "!font-bold",
                  "!text-lg",
                  "!mb-0",
                );
              });

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

              const semesterTitle = headerRow.querySelector("h5");
              if (semesterTitle) {
                const titleWrapper = document.createElement("div");
                titleWrapper.className = "!flex !items-center";

                semesterTitle.parentNode.insertBefore(
                  titleWrapper,
                  semesterTitle,
                );
                titleWrapper.appendChild(collapseIcon);
                titleWrapper.appendChild(semesterTitle);
              }
            }

            const table = semesterCol.querySelector("table");
            if (table) {
              const tableContainer = document.createElement("div");
              tableContainer.className =
                "rounded-xl overflow-hidden !border !border-white/10 custom-scrollbar accordion-content";
              tableContainer.dataset.expanded = "false";

              table.parentNode.insertBefore(tableContainer, table);
              tableContainer.appendChild(table);

              table.classList.add("transcript-table");
              table.classList.remove("table-bordered");

              const tableStyles = document.createElement("style");
              tableStyles.textContent = `
                .transcript-table {
                  border-spacing: 0;
                  width: 100%;
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                .transcript-table thead th {
                  background-color: rgba(30, 30, 30, 0.8) !important;
                  backdrop-filter: blur(4px);
                  font-weight: 500 !important;
                  padding: 12px !important;
                  letter-spacing: 0.5px;
                }
                .transcript-table tbody tr {
                  transition: all 0.2s ease;
                }
               
                .transcript-table td {
                  padding: 12px !important;
                  font-size: 0.95rem;
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
                .grade-a {
                  background-color: rgba(52, 211, 153, 0.2);
                  color: rgb(52, 211, 153);
                  border: 1px solid rgba(52, 211, 153, 0.3);
                }
                .grade-b {
                  background-color: rgba(251, 191, 36, 0.2);
                  color: rgb(251, 191, 36);
                  border: 1px solid rgba(251, 191, 36, 0.3);
                }
                .grade-c {
                  background-color: rgba(239, 68, 68, 0.2);
                  color: rgb(239, 68, 68);
                  border: 1px solid rgba(239, 68, 68, 0.3);
                }
                .grade-none {
                  background-color: rgba(156, 163, 175, 0.2);
                  color: rgb(156, 163, 175);
                  border: 1px solid rgba(156, 163, 175, 0.3);
                }
                .accordion-content {
                  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                }
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
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
              `;
              document.head.appendChild(tableStyles);

              table.classList.add("!w-full", "!border-collapse", "!border-0");
            }
          });

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
              "!text-lg",
              "!bg-white/10",
            );
            const tableContainer =
              semesterCol.querySelector(".accordion-content");

            if (headerRow && tableContainer) {
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

              headerRow.addEventListener("click", function () {
                const isExpanded = tableContainer.dataset.expanded === "true";

                if (isExpanded) {
                  tableContainer.style.maxHeight = "0px";
                  tableContainer.style.opacity = "0";
                  tableContainer.dataset.expanded = "false";

                  if (chevronDown && chevronUp) {
                    chevronDown.classList.add("hidden");
                    chevronUp.classList.remove("hidden");
                  }
                } else {
                  tableContainer.style.maxHeight = `${
                    tableContainer.scrollHeight + 30
                  }px`;
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

      const addGradeCalculator = () => {
        const semesterContainers = document.querySelectorAll(
          ".semester-container",
        );
        if (semesterContainers.length === 0) return;

        const lastSemesterContainer =
          semesterContainers[semesterContainers.length - 1];

        const spans =
          lastSemesterContainer.querySelectorAll(".pull-right span");
        const cgpaElem = spans[2];
        const sgpaElem = spans[3];

        let prevCGPA = 0;
        let crEarned = 0;

        if (semesterContainers.length > 1) {
          const secondLastSemContainer =
            semesterContainers[semesterContainers.length - 2];
          const secondLastSpans =
            secondLastSemContainer.querySelectorAll(".pull-right span");

          if (secondLastSpans.length > 1) {
            const crEarnedText = secondLastSpans[1].innerText.split(":")[1];
            crEarned = parseInt(crEarnedText) || 0;
          }

          if (secondLastSpans.length > 2) {
            const cgpaText = secondLastSpans[2].innerText.split(":")[1];
            prevCGPA = parseFloat(cgpaText) || 0;
          }
        }

        const getSelectHTML = (currGrade) => {
          return `<select class="grade-select bg-zinc-900 !border !border-white/20 rounded p-1 text-white w-full">
            <option value="-1">-</option>
            <option value="4" ${
              currGrade === "A+" || currGrade === "A" ? "selected" : ""
            }>A/A+</option>
            <option value="3.67" ${
              currGrade === "A-" ? "selected" : ""
            }>A-</option>
            <option value="3.33" ${
              currGrade === "B+" ? "selected" : ""
            }>B+</option>
            <option value="3" ${currGrade === "B" ? "selected" : ""}>B</option>
            <option value="2.67" ${
              currGrade === "B-" ? "selected" : ""
            }>B-</option>
            <option value="2.33" ${
              currGrade === "C+" ? "selected" : ""
            }>C+</option>
            <option value="2" ${currGrade === "C" ? "selected" : ""}>C</option>
            <option value="1.67" ${
              currGrade === "C-" ? "selected" : ""
            }>C-</option>
            <option value="1.33" ${
              currGrade === "D+" ? "selected" : ""
            }>D+</option>
            <option value="1" ${currGrade === "D" ? "selected" : ""}>D</option>
            <option value="0" ${currGrade === "F" ? "selected" : ""}>F</option>
          </select>`;
        };

        const getSUCreditHours = () => {
          return Array.from(document.querySelectorAll("td"))
            .filter((td) => td.innerText === "S" || td.innerText === "U")
            .reduce((total, curr) => {
              const creditHoursCell = curr.previousElementSibling;
              const creditHours = creditHoursCell
                ? parseInt(creditHoursCell.innerText) || 0
                : 0;
              return total + creditHours;
            }, 0);
        };

        const addCGPAPlannerCalculator = () => {
          const portletPlanCGPAButton = document.getElementById(
            "portletPlanCGPAButton",
          );

          const headerRow =
            lastSemesterContainer.querySelector(".semester-header");
          if (headerRow) {
            const existingPlannerButton = headerRow.querySelector(
              ".cgpa-planner-button",
            );
            if (existingPlannerButton) {
              existingPlannerButton.remove();
            }
          }

          const extractCGPAData = () => {
            const spans =
              lastSemesterContainer.querySelectorAll(".pull-right span");
            let currentCGPA = 0;
            let currentCreditHours = 0;

            if (spans.length > 2) {
              const cgpaText = spans[2].innerText.split(":")[1];
              currentCGPA = parseFloat(cgpaText) || 0;
            }

            if (spans.length > 1) {
              const crEarnedText = spans[1].innerText.split(":")[1];
              currentCreditHours = parseInt(crEarnedText) || 0;
            }

            return {
              currentCGPA,
              currentCreditHours,
            };
          };

          const createPlannerModal = () => {
            const existingModal = document.getElementById("cgpaPlannerModal");
            if (existingModal) {
              existingModal.remove();
            }

            const modalOverlay = document.createElement("div");
            modalOverlay.id = "cgpaPlannerModal";
            modalOverlay.className =
              "fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn";
            modalOverlay.style.backdropFilter = "blur(5px)";

            const { currentCGPA, currentCreditHours } = extractCGPAData();

            const modalContent = document.createElement("div");
            modalContent.className =
              "bg-zinc-900 !rounded-2xl !border !border-white/10 !shadow-xl !w-full !max-w-md !mx-4 !animate-scaleIn";

            modalContent.innerHTML = `
              <div class="border-b border-white/10 p-4 flex items-center justify-between">
                <h3 class="text-white font-bold text-xl flex items-center">
                  <svg class="w-5 h-5 mr-2 text-x" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  CGPA Planning Calculator
                </h3>
                <button class="text-gray-400 hover:text-white transition-colors focus:outline-none" id="closeModal">
                  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <div class="p-6">
                <div class="text-white/80 text-sm mb-4">
                  This calculator will help you determine the GPA you need next semester to reach your target CGPA.
                </div>
                
                <form id="cgpaPlannerForm" class="space-y-4">
                  <div class="mb-3">
                    <label class="block text-gray-400 text-sm mb-1">Current Credit Hours</label>
                    <input type="number" id="currentCreditHours" value="${currentCreditHours}" class="w-full bg-black !border !border-white/20 !rounded-lg p-2 text-white" placeholder="e.g., 60">
                  </div>
                  
                  <div class="mb-3">
                    <label class="block text-gray-400 text-sm mb-1">Current CGPA</label>
                    <input type="number" id="currentCGPA" value="${currentCGPA.toFixed(
                      2,
                    )}" class="w-full bg-black !border !border-white/20 !rounded-lg p-2 text-white" step="0.01" placeholder="e.g., 3.50">
                  </div>
                  
                  <div class="mb-3">
                    <label class="block text-gray-400 text-sm mb-1">Target CGPA</label>
                    <input type="number" id="targetCGPA" class="w-full bg-black !border !border-white/20 !rounded-lg p-2 text-white" step="0.01" placeholder="e.g., 3.70">
                  </div>
                  
                  <div class="mb-3">
                    <label class="block text-gray-400 text-sm mb-1">Next Semester Credit Hours</label>
                    <input type="number" id="nextCreditHours" class="w-full bg-black !border !border-white/20 !rounded-lg p-2 text-white" placeholder="e.g., 15">
                  </div>
                  
                  <button type="submit" class="w-full py-3 bg-x text-white rounded-lg font-medium flex items-center justify-center transition-colors">
                    <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                    Calculate Required GPA
                  </button>
                </form>
                
                <div id="plannerResult" class="mt-4 p-4 rounded bg-black/50 hidden"></div>
              </div>
            `;

            modalOverlay.appendChild(modalContent);
            document.body.appendChild(modalOverlay);

            const styleElement = document.createElement("style");
            styleElement.textContent = `
              .animate-fadeIn {
                animation: fadeIn 0.3s ease-out forwards;
              }
              .animate-scaleIn {
                animation: scaleIn 0.3s ease-out forwards;
              }
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes scaleIn {
                from { transform: scale(0.95); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
              }
              .animate-fadeOut {
                animation: fadeOut 0.2s ease-in forwards;
              }
              .animate-scaleOut {
                animation: scaleOut 0.2s ease-in forwards;
              }
              @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
              }
              @keyframes scaleOut {
                from { transform: scale(1); opacity: 1; }
                to { transform: scale(0.95); opacity: 0; }
              }
            `;
            document.head.appendChild(styleElement);

            const closeModal = () => {
              modalContent.classList.add("animate-scaleOut");
              modalOverlay.classList.add("animate-fadeOut");
              setTimeout(() => {
                modalOverlay.remove();
              }, 200);
            };

            document
              .getElementById("closeModal")
              .addEventListener("click", closeModal);
            modalOverlay.addEventListener("click", (e) => {
              if (e.target === modalOverlay) {
                closeModal();
              }
            });

            document
              .getElementById("cgpaPlannerForm")
              .addEventListener("submit", (e) => {
                e.preventDefault();

                const currentCH = parseFloat(
                  document.getElementById("currentCreditHours").value,
                );
                const currentCGPA = parseFloat(
                  document.getElementById("currentCGPA").value,
                );
                const targetCGPA = parseFloat(
                  document.getElementById("targetCGPA").value,
                );
                const nextCH = parseFloat(
                  document.getElementById("nextCreditHours").value,
                );

                const resultElement = document.getElementById("plannerResult");

                if (
                  isNaN(currentCH) ||
                  isNaN(currentCGPA) ||
                  isNaN(targetCGPA) ||
                  isNaN(nextCH) ||
                  currentCH <= 0 ||
                  nextCH <= 0 ||
                  currentCGPA < 0 ||
                  currentCGPA > 4 ||
                  targetCGPA < 0 ||
                  targetCGPA > 4
                ) {
                  resultElement.innerHTML = `
                  <div class="text-red-400 font-medium">Please enter valid values:</div>
                  <ul class="list-disc list-inside text-gray-300 text-sm mt-2">
                    <li>Credit hours must be positive numbers</li>
                    <li>CGPA values must be between 0 and 4</li>
                    <li>All fields are required</li>
                  </ul>
                `;
                  resultElement.classList.remove("hidden");
                  return;
                }

                const requiredGPA =
                  (targetCGPA * (currentCH + nextCH) -
                    currentCGPA * currentCH) /
                  nextCH;

                if (requiredGPA > 4.0) {
                  resultElement.innerHTML = `
                  <div class="flex items-start">
                    <svg class="w-5 h-5 text-amber-400 mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <div>
                      <div class="text-amber-400 font-bold text-lg">Target CGPA not achievable in one semester</div>
                      <div class="text-gray-300 mt-1">You would need a GPA of ${requiredGPA.toFixed(
                        2,
                      )} next semester, which exceeds the maximum of 4.0.</div>
                      <div class="text-gray-300 mt-2">Consider:</div>
                      <ul class="list-disc list-inside text-gray-300 text-sm mt-1">
                        <li>Setting a lower target CGPA</li>
                        <li>Spreading improvement over multiple semesters</li>
                        <li>Taking more credit hours if possible</li>
                      </ul>
                    </div>
                  </div>
                `;
                } else if (requiredGPA < 0) {
                  resultElement.innerHTML = `
                  <div class="flex items-start">
                    <svg class="w-5 h-5 text-green-400 mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                      <div class="text-green-400 font-bold text-lg">Target already achieved!</div>
                      <div class="text-gray-300 mt-1">Your current CGPA is already higher than your target.</div>
                      <div class="text-gray-300 mt-2">You need any GPA greater than ${Math.max(
                        0,
                        requiredGPA,
                      ).toFixed(2)} to maintain your target.</div>
                    </div>
                  </div>
                `;
                } else {
                  let difficultyColor = "text-green-400";
                  let difficultyText = "Easily achievable";

                  if (requiredGPA > 3.7) {
                    difficultyColor = "text-red-400";
                    difficultyText = "Challenging";
                  } else if (requiredGPA > 3.0) {
                    difficultyColor = "text-amber-400";
                    difficultyText = "Moderate";
                  }

                  resultElement.innerHTML = `
                  <div class="flex items-start">
                    <svg class="w-5 h-5 text-x mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                      <div class="text-white font-bold text-lg">Required GPA: <span class="${difficultyColor}">${requiredGPA.toFixed(
                        2,
                      )}</span></div>
                      <div class="text-gray-300 mt-1">Difficulty: <span class="${difficultyColor} font-medium">${difficultyText}</span></div>
                      <div class="text-gray-300 mt-2">To achieve a CGPA of ${targetCGPA.toFixed(
                        2,
                      )} from your current ${currentCGPA.toFixed(2)},</div> 
                      <div class="text-gray-300">you need a GPA of at least ${requiredGPA.toFixed(
                        2,
                      )} in your next ${nextCH} credit hours.</div>
                    </div>
                  </div>
                `;
                }

                resultElement.classList.remove("hidden");
              });
          };

          if (portletPlanCGPAButton) {
            portletPlanCGPAButton.addEventListener("click", createPlannerModal);
          }
        };

        setTimeout(addCGPAPlannerCalculator, 600);

        const rows = lastSemesterContainer.querySelectorAll("tbody > tr");
        rows.forEach((row) => {
          const gradeCells = row.querySelectorAll("td.text-center");
          if (gradeCells.length >= 2) {
            const gradeCell = gradeCells[1];
            const currentGrade = gradeCell.innerText.trim();

            if (currentGrade === "I" || currentGrade === "-") {
              gradeCell.innerHTML = getSelectHTML(currentGrade);
            }
          }
        });

        const handleSelectChange = () => {
          const rows = lastSemesterContainer.querySelectorAll("tbody > tr");
          let totalCreditHours = 0;
          let totalGradePoints = 0;

          rows.forEach((row) => {
            const gradeCells = row.querySelectorAll("td.text-center");
            if (gradeCells.length < 2) return;

            const gradeCell = gradeCells[1];
            const creditCell = row.querySelector("td:nth-child(4)");
            const pointsCell = row.querySelector("td:nth-child(6)");

            if (!creditCell || !pointsCell) return;

            const creditHours = parseInt(creditCell.innerText) || 0;
            if (creditHours === 0) return;

            let gradePoints = 0;
            let isGraded = false;

            const selectElement = gradeCell.querySelector(
              "select.grade-select",
            );

            if (selectElement) {
              if (selectElement.value !== "-1") {
                gradePoints = parseFloat(selectElement.value);
                isGraded = true;

                pointsCell.innerText = gradePoints;
                pointsCell.style.fontWeight = "bold";
                pointsCell.classList.add("text-x");
              }
            } else {
              const gradeText = gradeCell.textContent.trim();

              if (["S", "U", "W", "I", "-"].includes(gradeText)) {
                return;
              }

              if (gradeText === "A+" || gradeText === "A") {
                gradePoints = 4.0;
                isGraded = true;
              } else if (gradeText === "A-") {
                gradePoints = 3.67;
                isGraded = true;
              } else if (gradeText === "B+") {
                gradePoints = 3.33;
                isGraded = true;
              } else if (gradeText === "B") {
                gradePoints = 3.0;
                isGraded = true;
              } else if (gradeText === "B-") {
                gradePoints = 2.67;
                isGraded = true;
              } else if (gradeText === "C+") {
                gradePoints = 2.33;
                isGraded = true;
              } else if (gradeText === "C") {
                gradePoints = 2.0;
                isGraded = true;
              } else if (gradeText === "C-") {
                gradePoints = 1.67;
                isGraded = true;
              } else if (gradeText === "D+") {
                gradePoints = 1.33;
                isGraded = true;
              } else if (gradeText === "D") {
                gradePoints = 1.0;
                isGraded = true;
              } else if (gradeText === "F") {
                gradePoints = 0.0;
                isGraded = true;
              }

              if (!isGraded) {
                const badgeElement = gradeCell.querySelector(".grade-badge");
                if (badgeElement) {
                  const badgeText = badgeElement.textContent.trim();
                  if (badgeText === "A+" || badgeText === "A") {
                    gradePoints = 4.0;
                    isGraded = true;
                  } else if (badgeText === "A-") {
                    gradePoints = 3.67;
                    isGraded = true;
                  } else if (badgeText === "B+") {
                    gradePoints = 3.33;
                    isGraded = true;
                  } else if (badgeText === "B") {
                    gradePoints = 3.0;
                    isGraded = true;
                  } else if (badgeText === "B-") {
                    gradePoints = 2.67;
                    isGraded = true;
                  } else if (badgeText === "C+") {
                    gradePoints = 2.33;
                    isGraded = true;
                  } else if (badgeText === "C") {
                    gradePoints = 2.0;
                    isGraded = true;
                  } else if (badgeText === "C-") {
                    gradePoints = 1.67;
                    isGraded = true;
                  } else if (badgeText === "D+") {
                    gradePoints = 1.33;
                    isGraded = true;
                  } else if (badgeText === "D") {
                    gradePoints = 1.0;
                    isGraded = true;
                  } else if (badgeText === "F") {
                    gradePoints = 0.0;
                    isGraded = true;
                  }
                }
              }
            }

            if (isGraded) {
              totalCreditHours += creditHours;
              totalGradePoints += creditHours * gradePoints;
            }
          });

          if (totalCreditHours === 0) {
            cgpaElem.innerHTML = `CGPA: ${prevCGPA.toFixed(2)}`;
            sgpaElem.innerHTML = `SGPA: 0`;
            return;
          }

          const calculatedSGPA = totalGradePoints / totalCreditHours;
          const suCreditHours = getSUCreditHours();
          const actualCreditHoursEarned = crEarned - suCreditHours;
          const calculatedCGPA =
            (prevCGPA * actualCreditHoursEarned +
              calculatedSGPA * totalCreditHours) /
            (actualCreditHoursEarned + totalCreditHours);

          cgpaElem.innerHTML = `CGPA: <span class="text-x font-bold">${calculatedCGPA.toFixed(
            2,
          )}</span>`;
          sgpaElem.innerHTML = `SGPA: <span class="text-x font-bold">${calculatedSGPA.toFixed(
            2,
          )}</span>`;

          cgpaElem.classList.add("font-bold");
          sgpaElem.classList.add("font-bold");
        };

        lastSemesterContainer
          .querySelectorAll("select.grade-select")
          .forEach((select) => {
            select.addEventListener("change", handleSelectChange);
          });

        setTimeout(handleSelectChange, 100);
      };

      setTimeout(addGradeCalculator, 500);

      document.querySelectorAll("table").forEach((table) => {
        if (table.closest(".modal-body")) return;

        if (!table.classList.contains("transcript-table")) {
          table.classList.add("transcript-table");
          table.classList.remove("table-bordered");
        }

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
              "!border-white/10",
            );
          });
        }

        const tbody = table.querySelector("tbody");
        if (tbody) {
          const rows = tbody.querySelectorAll("tr");
          rows.forEach((row) => {
            row.classList.add(
              "!bg-black",
              "!hover:bg-white/5",
              "!transition-colors",
            );

            const cells = row.querySelectorAll("td");
            cells.forEach((cell) => {
              cell.classList.add(
                "!p-3",
                "!text-white/80",
                "!border-y",
                "!border-white/10",
              );

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

              if (cell.textContent.trim().match(/^[A-F][+-]?$/)) {
                const grade = cell.textContent.trim();

                const badgeElement = document.createElement("span");

                if (grade.startsWith("A")) {
                  badgeElement.className = "grade-badge grade-a";
                } else if (grade.startsWith("B") || grade === "C+") {
                  badgeElement.className = "grade-badge grade-b";
                } else if (
                  grade.startsWith("C") ||
                  grade.startsWith("D") ||
                  grade.startsWith("F")
                ) {
                  badgeElement.className = "grade-badge grade-c";
                } else {
                  badgeElement.className = "grade-badge grade-none";
                }

                badgeElement.textContent = grade;

                cell.textContent = "";
                cell.appendChild(badgeElement);
              }

              const numericMatch = cell.textContent.trim().match(/^[\d.]+$/);
              if (numericMatch) {
                const numValue = parseFloat(cell.textContent.trim());
                const originalText = cell.textContent;

                if (!isNaN(numValue)) {
                  if (numValue >= 3.5) {
                    cell.innerHTML = `<span class="font-semibold text-green-400">${originalText}</span>`;
                  } else if (numValue >= 2.5) {
                    cell.innerHTML = `<span class="font-semibold text-amber-400">${originalText}</span>`;
                  } else if (numValue > 0) {
                    cell.innerHTML = `<span class="font-semibold text-red-400">${originalText}</span>`;
                  }
                }
              }
            });
          });
        }
      });

      const headerRows = document.querySelectorAll(".semester-header");
      headerRows.forEach((headerRow) => {
        const chevronDown = headerRow.querySelector(".chevron-down");
        const chevronUp = headerRow.querySelector(".chevron-up");

        const tableContainer = headerRow
          .closest(".semester-container")
          ?.querySelector(".rounded-xl");

        if (tableContainer && chevronDown && chevronUp) {
          tableContainer.style.maxHeight = "0px";
          tableContainer.style.transition =
            "max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
          tableContainer.style.overflow = "hidden";
          tableContainer.style.opacity = "0";
          chevronDown.classList.add("hidden");
          chevronUp.classList.remove("hidden");

          headerRow.addEventListener("click", () => {
            if (tableContainer.style.maxHeight === "0px") {
              tableContainer.style.maxHeight = `${
                tableContainer.scrollHeight + 50
              }px`;
              tableContainer.style.opacity = "1";
              setTimeout(() => {
                tableContainer.style.overflow = "visible";
              }, 400);

              chevronDown.classList.remove("hidden");
              chevronDown.style.transform = "rotate(0deg)";
              chevronUp.classList.add("hidden");
            } else {
              tableContainer.style.maxHeight = "0px";
              tableContainer.style.opacity = "0";
              tableContainer.style.overflow = "hidden";

              chevronDown.classList.add("hidden");
              chevronUp.classList.remove("hidden");
              chevronUp.style.transform = "rotate(0deg)";
            }
          });
        }
      });
    };

    setTimeout(styleTranscriptTables, 300);

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

export default TranscriptPage;
