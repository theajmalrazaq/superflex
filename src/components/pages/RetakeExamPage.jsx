import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";

function RetakeExamPage() {
  const [elemContent, setElemContent] = useState(null);

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

  const applyCustomStyling = (element) => {
    
    const addedStyles = [];

    
    const errorDiv = element.querySelector("#DataErrormsgdiv");
    if (errorDiv) {
      errorDiv.remove();
    }

    
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
            
            .grade-badge {
                display: inline-block;
                padding: 2px 8px;
                border-radius: 4px;
                font-weight: 600;
            }
            
            #ExamRetakeRemarksDetail {
                 height: 100%;
                backdrop-filter: blur(20px);
            }            
        `;
    
    styleElement.setAttribute("data-custom-style", "true");
    document.head.appendChild(styleElement);
    addedStyles.push(styleElement);

    
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
        "!mb-6",
      );

      
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
          "!justify-center",
        );

        
        const createSvgIcon = (path) => {
          const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg",
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
            "path",
          );
          pathElement.setAttribute("d", path);
          svg.appendChild(pathElement);

          return svg;
        };

        
        let iconPath = "";
        if (alertElement.classList.contains("alert-danger")) {
          iconPath =
            "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z";
        } else {
          iconPath = "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z";
        }

        iconElement.innerHTML = "";
        iconElement.appendChild(createSvgIcon(iconPath));
      }

      
      const closeButton = alertElement.querySelector("button.close");
      if (closeButton) {
        
        closeButton.style.cssText = "content: none !important;";

        const style = document.createElement("style");
        style.textContent =
          'button.close[data-dismiss="alert"]::before, button.close[data-dismiss="modal"]::before { display: none !important; content: none !important; }';
        
        style.setAttribute("data-custom-style", "true");
        document.head.appendChild(style);
        addedStyles.push(style);

        
        const listItemStyle = document.createElement("style");
        listItemStyle.textContent = `
          li[style*="font-size: large"] {
            font-size: medium !important;
          }
        `;
        
        listItemStyle.setAttribute("data-custom-style", "true");
        document.head.appendChild(listItemStyle);
        addedStyles.push(listItemStyle);

        closeButton.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/70">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                `;
        closeButton.classList.add("!focus:outline-none");
      }
    });

    
    const portlet = element.querySelector(".m-portlet");
    if (portlet) {
      portlet.classList.add(
        "!bg-black",
        "!border-none",
        "!rounded-3xl",
        "!p-4",
        "!shadow-lg",
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
        headingText.innerHTML = "Retake Exam Requests";
      }

      
      const semesterForm = element.querySelector(
        'form[action="/Student/RetakeRequest"]',
      );
      if (semesterForm) {
        
        const formClone = semesterForm.cloneNode(true);
        
        semesterForm.remove();
        
        portletHead.appendChild(formClone);
        formClone.classList.add(
          "!flex",
          "!items-center",
          "!gap-4",
          "ml-4",
          "flex-1",
        );

        
        const formSelects = formClone.querySelectorAll("select");
        formSelects.forEach((select) => {
          select.classList.add(
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

          
          select.classList.remove(
            "m-dropdown__toggle",
            "btn",
            "btn-brand",
            "dropdown-toggle",
          );
        });

        
        const rowDiv = formClone.querySelector(".row");
        if (rowDiv) {
          const colDiv = rowDiv.querySelector(".col-md-12");
          if (colDiv) {
            
            const children = [...colDiv.childNodes];
            
            children.forEach((child) => formClone.appendChild(child));
            
            rowDiv.remove();
          }
        }
      }
    }

    
    const portletBody = element.querySelector(".m-portlet__body");
    if (portletBody) {
      portletBody.classList.add(
        "!bg-black",
        "!rounded-b-3xl",
        "!p-0",
        "!border",
        "!border-white/10",
        "!shadow-lg",
        "!text-white",
        "!h-[330px]",
        "!overflow-y-auto",
        "custom-scrollbar",
      );
    }

    
    const retakeReasonSection = element.querySelector(".m-section");
    if (retakeReasonSection) {
      retakeReasonSection.classList.add(
        "!rounded-xl",
        "!p-0",
        "!border-none",
        "!mb-6",
      );

      const retakeReasonLabel = retakeReasonSection.querySelector("label");
      if (retakeReasonLabel) {
        retakeReasonLabel.classList.add(
          "!text-white",
          "!font-medium",
          "!mb-2",
          "!block",
        );
        retakeReasonLabel.style.textDecoration = "none";
      }

      const retakeReasonSelect = retakeReasonSection.querySelector(
        "#DrpDwnRetakeReason",
      );
      if (retakeReasonSelect) {
        retakeReasonSelect.classList.add(
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
          "!w-full",
          "!max-w-md",
        );

        
        retakeReasonSelect.classList.remove(
          "m-dropdown__toggle",
          "btn",
          "btn-brand",
          "dropdown-toggle",
        );
        retakeReasonSelect.style.textAlign = "left";
      }

      
      const retakeRequestBtn = element.querySelector(
        "#btnModalExamRetakRequest",
      );
      const downloadBtn = element.querySelector("#btnDownloadExamRetakForm");

      
      const selectWithButtonsContainer = document.createElement("div");
      selectWithButtonsContainer.className = "flex items-center gap-3";

      
      const selectParent = retakeReasonSelect?.parentElement;

      if (selectParent && retakeRequestBtn && downloadBtn) {
        
        const selectClone = retakeReasonSelect.cloneNode(true);

        
        selectWithButtonsContainer.appendChild(selectClone);

        
        retakeRequestBtn.innerHTML = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                `;
        retakeRequestBtn.classList.add(
          "!w-10",
          "!h-10",
          "!p-0",
          "!flex",
          "!items-center",
          "!justify-center",
        );
        retakeRequestBtn.title = "Initiate Exam Retake Request";

        downloadBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
                        <path d="M12 17V3"></path>
                        <path d="m6 11 6 6 6-6"></path>
                        <path d="M19 21H5"></path>
                    </svg>
                `;
        downloadBtn.classList.add(
          "!w-10",
          "!h-10",
          "!p-0",
          "!flex",
          "!items-center",
          "!justify-center",
        );
        downloadBtn.title = "Download Exam Retake Form";

        
        selectWithButtonsContainer.appendChild(retakeRequestBtn);
        selectWithButtonsContainer.appendChild(downloadBtn);

        
        selectParent.replaceChild(
          selectWithButtonsContainer,
          retakeReasonSelect,
        );
      }
    }

    
    const table = element.querySelector(".table");
    if (table) {
      table.querySelectorAll(".table td, .table th").forEach((el) => {
        el.classList.add("!border-none");
      });
      
      const tableContainer = document.createElement("div");
      tableContainer.className = "overflow-hidden mb-6";
      table.parentNode.insertBefore(tableContainer, table);
      tableContainer.appendChild(table);

      
      table.classList.add("!w-full", "!border-collapse", "!border-0");
      table.classList.remove("table-bordered", "table-responsive");

      
      const thead = table.querySelector("thead");
      if (thead) {
        thead.classList.add("!bg-zinc-900", "!sticky", "!top-0", "!z-10");

        const headers = thead.querySelectorAll("th");
        headers.forEach((header) => {
          header.classList.add(
            "!bg-transparent",
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
        tbody.classList.add("!divide-y", "!divide-white/10");

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

            
            const checkbox = cell.querySelector('input[type="checkbox"]');
            if (checkbox) {
              
              checkbox.classList.add("cursor-pointer");
            }
          });
        });
      }
    }

    document.querySelector("#btnModalRetakeExamDetail").classList.add("!mt-2");
    document.querySelectorAll(".modal-dialog").forEach((modal) => {
      modal.classList.add(
        "!border",
        "!border-white/10",
        "!rounded-2xl",
        "!shadow-lg",
        "!bg-black",
        "!p-4",
      );
    });
    document.querySelector("#DataErrormsgdiv_RetakeModalReason").remove();

    
    const buttons = element.querySelectorAll(".btn");
    buttons.forEach((button) => {
      if (
        !button.closest(".modal-footer") &&
        !button.classList.contains("close")
      ) {
        button.classList.add(
          "!bg-x",
          "hover:!bg-x/80",
          "!text-white",
          "!font-medium",
          "!py-2",
          "!px-4",
          "h-12",
          "w-fit",
          "!rounded-xl",
          "!transition-colors",
          "!flex",
          "!items-center",
          "!gap-2",
          "!border-0",
          "!mt-0",
        );

        
        button.classList.remove("btn-primary", "btn-sm", "glow-button");
      }
    });

    
    const modals = element.querySelectorAll(".modal-content");
    modals.forEach((modal) => {
      modal.classList.add(
        "!bg-black",
        "!rounded-2xl",
        "!border-2",
        "!border-white/10",
        "!p-5",
        "!shadow-none",
      );

      
      const modalHeader = modal.querySelector(".modal-header");
      if (modalHeader) {
        modalHeader.classList.add(
          "!bg-black",
          "!border-b",
          "!border-white/10",
          "!p-4",
          "!flex",
          "!flex-col",
          "justify-between",
          "!gap-4",
        );

        
        if (modalHeader.hasAttribute("style")) {
          modalHeader.removeAttribute("style");
        }

        const modalTitle = modalHeader.querySelector(".modal-title");
        if (modalTitle) {
          modalTitle.classList.add("!text-white", "!font-bold", "!text-xl");
        }

        
        const existingCloseBtn = modalHeader.querySelector(".close");
        if (existingCloseBtn) {
          
          const newCloseBtn = document.createElement("button");
          newCloseBtn.type = "button";
          newCloseBtn.className =
            "modal-close-btn absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none";
          newCloseBtn.setAttribute("data-dismiss", "modal");
          newCloseBtn.setAttribute("aria-label", "Close");

          
          newCloseBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                 class="text-white/70 hover:text-white transition-colors">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          `;

          
          if (existingCloseBtn.onclick) {
            newCloseBtn.onclick = existingCloseBtn.onclick;
          }

          
          existingCloseBtn.parentNode.replaceChild(
            newCloseBtn,
            existingCloseBtn,
          );

          
          modalHeader.style.position = "relative";
          modalHeader.style.paddingRight = "48px";
        }

        
        const headerAlert = modalHeader.querySelector(".m-alert");
        if (headerAlert) {
          
          const feeNotice = document.createElement("div");
          feeNotice.className = "text-amber-400 text-sm mt-2 flex items-center";
          feeNotice.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        Fee will be charged upon submit request: Rs. 2000 per paper
                    `;

          
          headerAlert.parentNode.replaceChild(feeNotice, headerAlert);
        }

        const closeBtn = modalHeader.querySelector(".close");
        if (closeBtn) {
          closeBtn.innerHTML = `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/70">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    `;
        }
      }

      
      const modalBody = modal.querySelector(".modal-body");
      if (modalBody) {
        modalBody.classList.add(
          "!bg-black",
          "!text-white",
          "!p-6",
          "h-[500px]",
          "!overflow-y-auto",
          "custom-scrollbar",
        );

        
        const modalCheckboxes = modalBody.querySelectorAll(
          'input[type="checkbox"]',
        );
        modalCheckboxes.forEach((checkbox) => {
          checkbox.remove();
        });

        
        const errorDiv = modalBody.querySelector(
          "#DataErrormsgdiv_RetakeModalReason",
        );
        if (errorDiv) {
          errorDiv.style.display = "none";
        }

        
        const formRows = modalBody.querySelectorAll(".row");
        formRows.forEach((row) => {
          row.classList.add("mb-4");

          
          const formColumns = row.querySelectorAll(".col-md-11, .col-sm-11");
          formColumns.forEach((col) => {
            col.className = "w-full";
          });
        });

        
        const fileInputs = modalBody.querySelectorAll('input[type="file"]');
        fileInputs.forEach((input) => {
          const label = input.previousElementSibling;
          if (label && label.tagName === "LABEL") {
            label.classList.add(
              "!text-white",
              "!font-medium",
              "!mb-2",
              "!block",
            );
            
            if (label.hasAttribute("style")) {
              label.removeAttribute("style");
            }
          }

          
          const container = document.createElement("div");
          container.className =
            "mt-1 flex justify-center px-6 pt-5 pb-6 !border !border-white/10 !rounded-xl bg-black/50 hover:bg-black/70 transition-colors cursor-pointer";

          const wrapper = document.createElement("div");
          wrapper.className = "space-y-1 text-center";

          const uploadIcon = document.createElement("div");
          uploadIcon.innerHTML = `
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" class="mx-auto h-12 w-12 text-x/30" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-upload-icon lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    `;

          const text = document.createElement("div");
          text.className = "flex justify-center text-sm text-white/60";
          text.innerHTML = `
                        <p class="pl-1">Click to upload a PDF file (max 3MB)</p>
                    `;

          wrapper.appendChild(uploadIcon);
          wrapper.appendChild(text);

          
          const newInput = input.cloneNode(true);
          newInput.className =
            "absolute inset-0 w-full h-full opacity-0 cursor-pointer";

          
          if (newInput.hasAttribute("style")) {
            newInput.removeAttribute("style");
          }

          
          const inputContainer = document.createElement("div");
          inputContainer.className = "relative";

          
          wrapper.appendChild(inputContainer);
          inputContainer.appendChild(newInput);

          container.appendChild(wrapper);

          
          const parentContainer = input.closest(".mt-1") || input.parentNode;
          if (parentContainer) {
            parentContainer.parentNode.replaceChild(container, parentContainer);
          } else {
            input.parentNode.insertBefore(container, input);
            input.remove();
          }
        });

        
        const textareas = modalBody.querySelectorAll("textarea");
        textareas.forEach((textarea) => {
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
            "!h-24",
          );

          const label = textarea.previousElementSibling;
          if (label && label.tagName === "LABEL") {
            label.classList.add(
              "!text-white",
              "!font-medium",
              "!mb-2",
              "!block",
            );
            
            if (label.hasAttribute("style")) {
              label.removeAttribute("style");
            }
          }
        });

        
        const brTags = modalBody.querySelectorAll("br");
        brTags.forEach((br) => br.remove());
      }

      
      const modalFooter = modal.querySelector(".modal-footer");
      if (modalFooter) {
        modalFooter.classList.add(
          "!bg-black",
          "!border-t",
          "!border-white/10",
          "!p-4",
          "!flex",
          "!justify-end",
          "!gap-3",
        );

        
        const primaryBtn = modalFooter.querySelector(
          'input[type="button"], .btn-primary',
        );
        if (primaryBtn) {
          primaryBtn.classList.add(
            "!bg-x",
            "hover:!bg-x/80",
            "!text-white",
            "!font-medium",
            "!h-12",
            "!py-3",
            "!px-8",
            "!rounded-xl",
            "!transition-colors",
            "!border-0",
            "!cursor-pointer",
          );

          
          if (primaryBtn.hasAttribute("style")) {
            primaryBtn.removeAttribute("style");
          }
        }

        
        const existingFooterCloseBtn =
          modalFooter.querySelector(".btn-default");
        if (existingFooterCloseBtn) {
          
          const newFooterCloseBtn = document.createElement("button");
          newFooterCloseBtn.type = "button";
          newFooterCloseBtn.className =
            "modal-footer-close-btn !bg-white/10 hover:!bg-white/20 !text-white !font-medium !py-3 !px-8 !rounded-xl !transition-colors !border-0";
          newFooterCloseBtn.setAttribute("data-dismiss", "modal");
          newFooterCloseBtn.textContent =
            existingFooterCloseBtn.textContent || "Cancel";

          
          if (existingFooterCloseBtn.onclick) {
            newFooterCloseBtn.onclick = existingFooterCloseBtn.onclick;
          }

          
          existingFooterCloseBtn.parentNode.replaceChild(
            newFooterCloseBtn,
            existingFooterCloseBtn,
          );
        }
      }
    });

    
    const setupModalListeners = () => {
      
      const modalElements = document.querySelectorAll(".modal");

      modalElements.forEach((modal) => {
        
        const remarksDetailElement = modal.querySelector(
          "#ExamRetakeRemarksDetail",
        );
        if (remarksDetailElement) {
          
          remarksDetailElement.style.height = "100%";
          remarksDetailElement.style.backdropFilter = "blur(10px)";

          
          modal.addEventListener("shown.bs.modal", () => {
            remarksDetailElement.style.display = "flex";
            remarksDetailElement.style.justifyContent = "center";
            remarksDetailElement.style.alignItems = "center";
          });

          
          modal.addEventListener("hidden.bs.modal", () => {
            remarksDetailElement.style.display = "none";
          });
        }
      });
    };

    
    setTimeout(setupModalListeners, 500);
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

export default RetakeExamPage;
