import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";

function CourseWithdrawPage() {
  const [elemContent, setElemContent] = useState(null);

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

  const applyCustomStyling = (element) => {
    // Keep track of style elements we add
    const addedStyles = [];

    // Remove DataErrormsgdiv element if it exists
    const errorDiv = element.querySelector("#DataErrormsgdiv");
    if (errorDiv) {
      errorDiv.remove(); // Remove the element completely instead of just hiding it
    }

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
            
            .file-upload-container {
                margin-top: 1rem;
                display: flex;
                flex-direction: column;
            }
            
            .file-upload-input {
                opacity: 0;
                position: absolute;
                width: 100%;
                height: 100%;
                cursor: pointer;
            }
            
            .file-upload-box {
                border: 2px dashed rgba(255, 255, 255, 0.2);
                border-radius: 1rem;
                padding: 2rem;
                text-align: center;
                transition: all 0.3s;
                background-color: rgba(0, 0, 0, 0.2);
            }
            
            .file-upload-box:hover {
                border-color: rgba(255, 255, 255, 0.5);
                background-color: rgba(0, 0, 0, 0.4);
            }
        `;
    // Mark as our custom style
    styleElement.setAttribute("data-custom-style", "true");
    document.head.appendChild(styleElement);
    addedStyles.push(styleElement);

    // Style alert messages
    const alertElements = element.querySelectorAll(".m-alert");
    alertElements.forEach((alertElement) => {
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
        "!mb-6"
      );

      // Style alert icon
      const iconElement = alertElement.querySelector(".m-alert__icon");
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

        // Replace icon with SVG
        const createSvgIcon = (path) => {
          const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
          );
          svg.setAttribute("width", "24");
          svg.setAttribute("height", "24");
          svg.setAttribute("viewBox", "0 0 24 24");
          svg.setAttribute("fill", "none");
          svg.setAttribute("stroke", "currentColor");
          svg.setAttribute("stroke-width", "2");
          svg.setAttribute("stroke-linecap", "round");
          svg.setAttribute("stroke-linejoin", "round");
          svg.classList.add("w-6", "h-6", "text-white");

          const pathElement = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );
          pathElement.setAttribute("d", path);
          svg.appendChild(pathElement);

          return svg;
        };

        // Different icon paths based on alert type
        let iconPath = "";
        if (alertElement.classList.contains("alert-danger")) {
          iconPath =
            "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z";
        } else if (alertElement.classList.contains("alert-info")) {
          iconPath = "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
        } else {
          iconPath = "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
        }

        iconElement.innerHTML = "";
        iconElement.appendChild(createSvgIcon(iconPath));
      }

      // Style close button
      const closeButton = alertElement.querySelector("button.close");
      if (closeButton) {
        closeButton.style.cssText = "content: none !important;";

        const style = document.createElement("style");
        style.textContent =
          'button.close[data-dismiss="alert"]::before, button.close[data-dismiss="modal"]::before { display: none !important; content: none !important; }';
        style.setAttribute("data-custom-style", "true");
        document.head.appendChild(style);
        addedStyles.push(style);

        closeButton.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/70">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                `;
        closeButton.classList.add("!focus:outline-none");
      }

      // Special styling for info alert with link
      if (alertElement.classList.contains("alert-info")) {
        const linkElement = alertElement.querySelector("a");
        if (linkElement) {
          linkElement.classList.add(
            "!text-x",
            "!font-bold",
            "!underline",
            "hover:!text-white",
            "!transition-colors"
          );
        }
      }
    });

    // Style semester selection form
    const semesterForm = element.querySelector("#Formwithdraw");
    if (semesterForm) {
      semesterForm.classList.add("!ml-4");

      const semesterSelect = semesterForm.querySelector("#SemId");
      if (semesterSelect) {
        semesterSelect.classList.add(
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
          "!w-64"
        );

        // Remove bootstrap classes
        semesterSelect.classList.remove(
          "m-dropdown__toggle",
          "btn",
          "btn-brand",
          "dropdown-toggle"
        );
      }

      // Remove the <br> tag
      const brTag = semesterForm.querySelector("br");
      if (brTag) {
        brTag.remove();
      }
    }

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
        "m-portlet--primary",
        "m-portlet--head-solid-bg",
        "m-portlet--border-bottom-info",
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

      // Find and style the heading
      const headingText = portletHead.querySelector(".m-portlet__head-text");
      if (headingText) {
        headingText.classList.add("!text-white", "!text-xl", "!font-bold");
      }

      // Style the portlet head caption
      const headCaption = portletHead.querySelector(".m-portlet__head-caption");
      if (headCaption) {
        headCaption.classList.add("!flex", "!justify-center", "!items-center");
      }

      // Find and move the semester selection form to the portlet head
      const semesterForm = element.querySelector("#Formwithdraw");
      if (semesterForm) {
        // Apply any styling before moving

        // Create container for form to help with positioning in header
        const formContainer = document.createElement("div");
        formContainer.appendChild(semesterForm);

        // Insert the form after the heading
        if (headingText && headingText.parentElement) {
          headingText.parentElement.after(formContainer);
        } else {
          portletHead.appendChild(formContainer);
        }
      }

      // Create a container for the buttons in the header
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "portlet-head-buttons flex gap-2";

      // Find the buttons in the table cell
      const lastRow = element.querySelector("tbody tr:last-child");
      if (lastRow) {
        const buttonCell = lastRow.querySelector("td:last-child");
        if (buttonCell) {
          // Get the buttons
          const buttons = buttonCell.querySelectorAll(".btn");

          // Create icon-only buttons for the header
          if (buttons.length >= 1) {
            // First button - Initiate Withdraw Request
            const initiateButton = document.createElement("a");
            initiateButton.href = "#";
            initiateButton.className =
              "btn btn-primary btn-sm !bg-x hover:!bg-x/80 !text-white !text-sm !w-10 !h-10 !p-0 !flex !justify-center !items-center !rounded-xl !border-0";
            initiateButton.setAttribute("data-toggle", "modal");
            initiateButton.setAttribute("data-target", "#RemarksDetail");

            // Only add the icon SVG, no text
            initiateButton.innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            `;
            buttonContainer.appendChild(initiateButton);
          }

          if (buttons.length >= 2) {
            // Second button - Download CourseWithdraw Form
            const downloadButton = document.createElement("a");
            downloadButton.href = "#";
            downloadButton.className =
              "btn btn-primary btn-sm !bg-x hover:!bg-x/80 !text-white !text-sm !w-10 !h-10 !p-0 !flex !justify-center !items-center !rounded-xl !border-0";
            downloadButton.setAttribute(
              "onclick",
              "ftn_PrintCourseWithdrawForm();"
            );

            // Only add the icon SVG, no text
            downloadButton.innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 17V3"></path>
                  <path d="m6 11 6 6 6-6"></path>
                  <path d="M19 21H5"></path>
              </svg>
            `;
            buttonContainer.appendChild(downloadButton);
          }

          // Add buttons to portlet head
          portletHead.appendChild(buttonContainer);

          // Remove or hide the original buttons cell
          buttonCell.style.display = "none";
        }
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

      // Style section content
      const sectionContent = portletBody.querySelector(".m-section__content");
      if (sectionContent) {
        sectionContent.style.marginBottom = "0";
      }
    }

    // Style the table
    const table = element.querySelector(".table");
    if (table) {
      // Create a container for the table with modern styling
      const tableContainer = document.createElement("div");
      tableContainer.className =
        "rounded-xl overflow-hidden !border !border-white/10 mb-6";
      table.parentNode.insertBefore(tableContainer, table);
      tableContainer.appendChild(table);

      // Style the table
      table.classList.add("!w-full", "!border-collapse", "!border-0");
      table.classList.remove(
        "m-table",
        "m-table--head-bg-metal",
        "table-responsive"
      );

      // Style the table headers
      const thead = table.querySelector("thead");
      if (thead) {
        thead.classList.add("!bg-zinc-900", "!sticky", "!top-0", "!z-10");

        // Remove the checkbox column header
        const checkboxHeader = thead.querySelector("#Checkallhide_Show");
        if (checkboxHeader) {
          checkboxHeader.innerHTML = "Select";
        }

        const headers = thead.querySelectorAll("th");
        headers.forEach((header) => {
          header.classList.add(
            "!bg-transparent",
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

        const rows = tbody.querySelectorAll("tr");
        rows.forEach((row) => {
          row.classList.add(
            "!bg-black",
            "!hover:bg-white/5",
            "!transition-colors"
          );

          const cells = row.querySelectorAll("td");
          cells.forEach((cell) => {
            cell.classList.add(
              "!p-3",
              "!text-white/80",
              "!border-y",
              "!border-white/10"
            );

            // Style checkboxes
            const checkbox = cell.querySelector('input[type="checkbox"]');
            if (checkbox) {
              checkbox.classList.add(
                "cursor-pointer",
                "w-4",
                "h-4",
                "accent-x"
              );
            }
          });
        });

        // Style the buttons in the last row
        const lastRow = tbody.querySelector("tr:last-child");
        if (lastRow) {
          const buttonCell = lastRow.querySelector("td:last-child");
          if (buttonCell) {
            const buttons = buttonCell.querySelectorAll(".btn");
            buttons.forEach((button) => {
              button.classList.add(
                "!bg-x",
                "hover:!bg-x/80",
                "!text-white",
                "!font-medium",
                "!py-2",
                "!px-4",
                "!h-10",
                "!w-fit",
                "!rounded-xl",
                "!transition-colors",
                "!flex",
                "!items-center",
                "!inline-flex",
                "!gap-2",
                "!border-0",
                "!mt-0",
                "!mr-2"
              );

              // Remove unnecessary styles
              button.style.marginTop = "0";

              // Remove bootstrap classes
              button.classList.remove("btn-primary", "btn-sm");
            });

            // First button - add icon
            const initiateButton = buttonCell.querySelector(".btn:first-child");
            if (initiateButton) {
              initiateButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              `;
            }

            // Second button - add icon
            const downloadButton = buttonCell.querySelector(".btn:last-child");
            if (downloadButton) {
              downloadButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 17V3"></path>
                    <path d="m6 11 6 6 6-6"></path>
                    <path d="M19 21H5"></path>
                </svg>
              `;
            }
          }
        }
      }
    }

    // Style the modals
    const modals = element.querySelectorAll(".modal-content");
    modals.forEach((modal) => {
      modal.classList.add(
        "!bg-black",
        "!rounded-2xl",
        "!border-2",
        "!border-white/10",
        "!p-5",
        "!shadow-none"
      );

      // Style modal header
      const modalHeader = modal.querySelector(".modal-header");
      if (modalHeader) {
        modalHeader.classList.add(
          "!bg-black",
          "!border-b",
          "!border-white/10",
          "!p-4",
          "!flex",
          "!items-center",
          "!justify-between"
        );

        // Remove inline styles
        if (modalHeader.hasAttribute("style")) {
          modalHeader.removeAttribute("style");
        }

        const modalTitle = modalHeader.querySelector(".modal-title");
        if (modalTitle) {
          modalTitle.classList.add("!text-white", "!font-bold", "!text-xl");
          modalTitle.textContent = "Course Withdraw Details";
        }

        // Style close button
        const closeBtn = modalHeader.querySelector(".close");
        if (closeBtn) {
          closeBtn.innerHTML = `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/70">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    `;

          // Remove inline styles
          if (closeBtn.hasAttribute("style")) {
            closeBtn.removeAttribute("style");
          }

          closeBtn.classList.add("!focus:outline-none");
        }
      }

      // Style modal body
      const modalBody = modal.querySelector(".modal-body");
      if (modalBody) {
        modalBody.classList.add(
          "!bg-black",
          "!text-white",
          "!p-6",
          "!max-h-[500px]",
          "!overflow-y-auto",
          "custom-scrollbar"
        );

        // Enhance file upload fields
        const fileInputContainers = modalBody.querySelectorAll(".form-group");
        fileInputContainers.forEach((container) => {
          const label = container.querySelector("label");
          const fileInput = container.querySelector('input[type="file"]');

          if (label && fileInput) {
            // Style label
            label.classList.add(
              "!text-white",
              "!font-medium",
              "!mb-2",
              "!block"
            );
            label.style.fontWeight = "normal";

            // Get the label text (without the colon and parentheses part)
            const labelText = label.textContent.split(":")[0];

            // Create a modern file upload component
            const uploadContainer = document.createElement("div");
            uploadContainer.className = "file-upload-container relative";

            const uploadBox = document.createElement("div");
            uploadBox.className = "file-upload-box";

            uploadBox.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" 
                                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" 
                                 stroke-linejoin="round" class="mx-auto mb-4 text-white/30">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            <p class="text-sm text-white/60 mb-1">Click to upload ${labelText}</p>
                            <p class="text-xs text-white/40">Image must be less than 650 KB</p>
                        `;

            // Clone the file input and remove any inline styles
            const newFileInput = fileInput.cloneNode(true);
            newFileInput.className = "file-upload-input";
            if (newFileInput.hasAttribute("style")) {
              newFileInput.removeAttribute("style");
            }

            // Add the new elements to the container
            uploadContainer.appendChild(uploadBox);
            uploadContainer.appendChild(newFileInput);

            // Replace the old file input with our new container
            fileInput.parentNode.replaceChild(uploadContainer, fileInput);
          }
        });

        // Style textarea
        const textareaGroup = modalBody.querySelector(".form-group:last-child");
        if (textareaGroup) {
          const textarea = textareaGroup.querySelector("textarea");
          if (textarea) {
            textarea.classList.add(
              "!w-full",
              "!bg-black",
              "!border",
              "!border-white/20",
              "!rounded-lg",
              "!p-3",
              "!text-white",
              "!mt-2",
              "!transition-colors",
              "!focus:border-x",
              "!focus:outline-none",
              "!resize-none",
              "!h-24"
            );
          }

          const label = textareaGroup.querySelector("label");
          if (label) {
            label.classList.add(
              "!text-white",
              "!font-medium",
              "!mb-2",
              "!block"
            );
            label.style.fontWeight = "normal";
          }
        }

        // Remove unnecessary <br> tags
        const brTags = modalBody.querySelectorAll("br");
        brTags.forEach((br) => br.remove());
      }

      // Style modal footer
      const modalFooter = modal.querySelector(".modal-footer");
      if (modalFooter) {
        modalFooter.classList.add(
          "!bg-black",
          "!border-t",
          "!border-white/10",
          "!p-4",
          "!flex",
          "!justify-end",
          "!gap-3"
        );

        // Style primary action button (submit button)
        const submitBtn = modalFooter.querySelector('input[type="button"]');
        if (submitBtn) {
          submitBtn.classList.add(
            "!bg-x",
            "hover:!bg-x/80",
            "!text-white",
            "!font-medium",
            "!h-10",
            "!py-2",
            "!px-6",
            "!rounded-xl",
            "!transition-colors",
            "!border-0",
            "!cursor-pointer"
          );

          // Remove inline styles
          if (submitBtn.hasAttribute("style")) {
            submitBtn.removeAttribute("style");
          }
        }

        // Style close/cancel button
        const closeBtn = modalFooter.querySelector(".btn-default");
        if (closeBtn) {
          closeBtn.classList.add(
            "!bg-white/10",
            "hover:!bg-white/20",
            "!text-white",
            "!font-medium",
            "!py-2",
            "!px-6",
            "!h-10",
            "!rounded-xl",
            "!transition-colors",
            "!border-0"
          );

          // Remove inline styles
          if (closeBtn.hasAttribute("style")) {
            closeBtn.removeAttribute("style");
          }
        }
      }
    });
  };

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

export default CourseWithdrawPage;
