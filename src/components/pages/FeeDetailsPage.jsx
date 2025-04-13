import React, { useEffect, useState } from 'react';
import PageLayout from '../layouts/PageLayout';

function FeeDetailsPage() {
    const [elemContent, setElemContent] = useState(null);

    useEffect(() => {
        const targetElement = document.querySelector(".m-grid.m-grid--hor.m-grid--root.m-page");

        if (targetElement) {
            // Apply styling and DOM modifications before removing the element
            applyCustomStyling(targetElement);

            setElemContent(targetElement.innerHTML);
            targetElement.remove();
        }
    }, []);

    const applyCustomStyling = (element) => {
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
                headingText.classList.add(
                    "!text-white",
                    "!text-xl",
                    "!font-bold"
                );
                headingText.innerHTML = 'Fee Collection Details';
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
        `;
        document.head.appendChild(styleElement);

        // Style the semester header sections
        const semesterHeaders = element.querySelectorAll("[id^='rowStdDetailHeader_']");
        semesterHeaders.forEach(header => {
            const row = header.querySelector('.row');
            if (row) {
                row.classList.add(
                    "!bg-zinc-900/50",
                    "!rounded-xl",
                    "!p-4",
                    "!border",
                    "!border-white/10",
                    "!mb-4",
                    "!flex",
                    "!items-center"
                );
            }

            // Style the expand/collapse buttons
            const expandBtn = header.querySelector("[id^='BtnhideshowInternal']");
            if (expandBtn) {
                expandBtn.classList.remove(
                    "btn-brand",
                    "m-btn",
                    "m-btn--custom",
                    "m-btn--icon",
                    "m-btn--pill",
                    "m-btn--air"
                );
                expandBtn.classList.add(
                    "!bg-x",
                    "!rounded-full",
                    "!w-8",
                    "!h-8",
                    "!flex",
                    "!items-center",
                    "!justify-center",
                    "!mr-2",
                    "!border-none",
                    "!shadow-lg",
                    "!transition-all",
                    "!duration-300"
                );

                // Add animation for rotation on click
                expandBtn.addEventListener('click', function () {
                    const icon = this.querySelector('i');
                    const targetId = this.getAttribute('onclick').match(/ftn_ShowHideDivandData\((\d+)/)[1];
                    const targetDiv = document.getElementById(`rowStdDetail_${targetId}`);

                    if (targetDiv.style.display === 'none') {
                        icon.classList.remove('fa-angle-right');
                        icon.classList.add('fa-angle-down');
                    } else {
                        icon.classList.remove('fa-angle-down');
                        icon.classList.add('fa-angle-right');
                    }
                });
            }

            // Style semester labels
            const semesterLabel = header.querySelector('label');
            if (semesterLabel) {
                semesterLabel.classList.add(
                    "!text-white",
                    "!font-medium",
                    "!text-lg"
                );
            }

            // Style the amount text cells
            const amountCells = header.querySelectorAll("p.text-center");
            amountCells.forEach((cell, index) => {
                cell.classList.add(
                    "!text-white/80",
                    "!font-medium"
                );

                // Style based on content
                const amount = parseFloat(cell.textContent.replace(/[(),%]/g, ''));
                if (!isNaN(amount)) {
                    // Highlight collection amount (typically the 5th column)
                    if (index === 4) {
                        cell.classList.add("!text-emerald-400", "!font-bold");
                    }

                    // Highlight balance (typically the 6th column)
                    if (index === 5) {
                        if (amount < 0) {
                            cell.classList.add("!text-rose-400");
                        } else if (amount > 0) {
                            cell.classList.add("!text-amber-400");
                        }
                    }

                    // Highlight arrears (typically the 1st column)
                    if (index === 0 && amount < 0) {
                        cell.classList.add("!text-rose-400");
                    }
                }
            });
        });

        // Style the semester detail sections
        const semesterDetails = element.querySelectorAll("[id^='rowStdDetail_']");
        semesterDetails.forEach(detail => {
            detail.classList.add(
                "!mt-2",
                "!mb-6",
                "!rounded-xl",
                "!overflow-hidden"
            );

            // Create a modern grid layout for the Fee In Semester and Registration Log sections
            const feeAndRegSections = detail.querySelectorAll(".col-lg-5, .col-lg-7");
            if (feeAndRegSections.length === 2) {
                // Convert the row layout to flex container
                const container = document.createElement('div');
                container.className = 'flex flex-col lg:flex-row gap-6 w-full';

                // Get parent element to replace children
                const parentElement = feeAndRegSections[0].parentElement;

                // Add the sections to the new container
                feeAndRegSections.forEach(section => {
                    container.appendChild(section.cloneNode(true));
                });

                // Replace original elements with the new container
                if (parentElement) {
                    while (parentElement.firstChild) {
                        parentElement.removeChild(parentElement.firstChild);
                    }
                    parentElement.appendChild(container);

                    // Style the Fee In Semester section
                    const feeSection = container.querySelector(".col-lg-5");
                    if (feeSection) {
                        feeSection.className = "w-full lg:w-5/12 flex-none";

                        // Style the heading
                        const heading = feeSection.querySelector("h4");
                        if (heading) {
                            heading.classList.add(
                                "!text-x",
                                "!text-xl",
                                "!font-bold",
                                "!mb-4"
                            );
                            // Remove the hr tag after the heading
                            const hr = heading.nextElementSibling;
                            if (hr && hr.tagName === 'HR') {
                                hr.remove();
                            }
                        }

                        // Style the main container
                        const feeContainer = feeSection.querySelector(".border.border-secondary");
                        if (feeContainer) {
                            feeContainer.classList.remove("border", "border-secondary", "col-md-12");
                            feeContainer.classList.add(
                                "!bg-zinc-900/30",
                                "!rounded-xl",
                                "!p-4",
                                "!border",
                                "!border-white/10",
                                "!shadow-lg"
                            );

                            // Create a new layout for fee items (A-G)
                            const feeItems = feeContainer.querySelectorAll("[id^='row']");
                            feeItems.forEach(item => {
                                // Get label and value elements
                                const labelElement = item.querySelector("label:first-of-type");
                                const valueElement = item.querySelector("label:last-of-type");

                                if (labelElement && valueElement) {
                                    // Create a modern card for each fee item
                                    item.classList.add(
                                        "!bg-black/20",
                                        "!rounded-lg",
                                        "!p-3",
                                        "!mb-3",
                                        "!border",
                                        "!border-white/5"
                                    );

                                    // Style the row
                                    const row = item.querySelector(".row");
                                    if (row) {
                                        row.classList.add(
                                            "!flex",
                                            "!justify-between",
                                            "!items-center",
                                            "!gap-2"
                                        );

                                        // Style columns
                                        const cols = row.querySelectorAll("[class^='col-']");
                                        cols.forEach(col => {
                                            col.className = col.classList.contains("float-right") ?
                                                "text-right" : "";
                                        });
                                    }

                                    // Style labels
                                    if (labelElement) {
                                        labelElement.classList.add("!text-white/80", "!font-medium");
                                        const boldText = labelElement.querySelector("b");
                                        if (boldText) {
                                            boldText.classList.add("!text-x", "!font-bold", "!mr-1");
                                        }
                                    }

                                    // Style values based on content
                                    if (valueElement) {
                                        valueElement.classList.add("!font-bold");

                                        // Get the numeric value
                                        const value = valueElement.textContent.trim();
                                        const numericValue = parseFloat(value.replace(/[^0-9.-]/g, ''));

                                        // Style based on the type of fee and value
                                        if (item.id.includes("Collection")) {
                                            valueElement.classList.add("!text-emerald-400");
                                        } else if (item.id.includes("Balance")) {
                                            if (numericValue < 0) {
                                                valueElement.classList.add("!text-rose-400");
                                            } else if (numericValue > 0) {
                                                valueElement.classList.add("!text-amber-400");
                                            } else {
                                                valueElement.classList.add("!text-white");
                                            }
                                        } else if (item.id.includes("Arrears") && numericValue < 0) {
                                            valueElement.classList.add("!text-rose-400");
                                        } else {
                                            valueElement.classList.add("!text-white");
                                        }
                                    }
                                }

                                // Style lists (for due in semester, discount, etc.)
                                const list = item.querySelector("ul");
                                if (list) {
                                    list.classList.add(
                                        "!mt-2",
                                        "!pl-6",
                                        "!text-white/70"
                                    );

                                    const listItems = list.querySelectorAll("li");
                                    listItems.forEach(li => {
                                        li.classList.add("!mb-1");

                                        // Style the amounts in list items
                                        const bold = li.querySelector("b");
                                        if (bold) {
                                            bold.classList.add("!text-white", "!font-medium");
                                        }
                                    });
                                }
                            });
                        }
                    }

                    // Style the Registration Log section
                    const regSection = container.querySelector(".col-lg-7");
                    if (regSection) {
                        regSection.className = "w-full lg:w-7/12 flex-none";

                        // Style the heading
                        const heading = regSection.querySelector("h4");
                        if (heading) {
                            heading.classList.add(
                                "!text-x",
                                "!text-xl",
                                "!font-bold",
                                "!mb-4"
                            );
                            // Remove the hr tag after the heading
                            const hr = heading.nextElementSibling;
                            if (hr && hr.tagName === 'HR') {
                                hr.remove();
                            }
                        }

                        // Style the main container
                        const regContainer = regSection.querySelector(".border.border-secondary");
                        if (regContainer) {
                            regContainer.classList.remove("border", "border-secondary", "col-lg-12");
                            regContainer.classList.add(
                                "!bg-zinc-900/30",
                                "!rounded-xl",
                                "!p-4",
                                "!border",
                                "!border-white/10",
                                "!shadow-lg"
                            );

                            // Create a flex container for SGPA and CGPA
                            const sgpaRow = regContainer.querySelector(".row:first-of-type");
                            const cgpaRow = regContainer.querySelector(".row:nth-of-type(2)");

                            if (sgpaRow && cgpaRow) {
                                // Create a card container for academic indicators
                                const academicCard = document.createElement('div');
                                academicCard.className = 'flex flex-col sm:flex-row gap-3 mb-4';

                                // SGPA Card
                                const sgpaLabel = sgpaRow.querySelector("label:first-of-type");
                                const sgpaValue = sgpaRow.querySelector("label:last-of-type");
                                if (sgpaLabel && sgpaValue) {
                                    const sgpaCard = document.createElement('div');
                                    sgpaCard.className = 'bg-black/20 rounded-lg p-3 flex-1 !border !border-white/5';
                                    sgpaCard.innerHTML = `
                                        <span class="block text-xs text-white/60 mb-1">${sgpaLabel.textContent}</span>
                                        <div class="flex items-center">
                                            <span class="text-lg font-bold text-blue-400">${sgpaValue.textContent}</span>
                                        </div>
                                    `;
                                    academicCard.appendChild(sgpaCard);
                                }

                                // CGPA Card
                                const cgpaLabel = cgpaRow.querySelector("label:first-of-type");
                                const cgpaValue = cgpaRow.querySelector("label:last-of-type");
                                if (cgpaLabel && cgpaValue) {
                                    const cgpaCard = document.createElement('div');
                                    cgpaCard.className = 'bg-black/20 rounded-lg p-3 flex-1 !border !border-white/5';

                                    // Get numeric CGPA for color coding
                                    const cgpaNumeric = parseFloat(cgpaValue.textContent);
                                    let cgpaColorClass = "text-blue-400"; // Default

                                    if (!isNaN(cgpaNumeric)) {
                                        if (cgpaNumeric >= 3.5) {
                                            cgpaColorClass = "text-emerald-400";
                                        } else if (cgpaNumeric >= 2.5) {
                                            cgpaColorClass = "text-blue-400";
                                        } else if (cgpaNumeric >= 2.0) {
                                            cgpaColorClass = "text-amber-400";
                                        } else {
                                            cgpaColorClass = "text-rose-400";
                                        }
                                    }

                                    cgpaCard.innerHTML = `
                                        <span class="block text-xs text-white/60 mb-1">${cgpaLabel.textContent}</span>
                                        <div class="flex items-center">
                                            <span class="text-lg font-bold ${cgpaColorClass}">${cgpaValue.textContent}</span>
                                        </div>
                                    `;
                                    academicCard.appendChild(cgpaCard);
                                }

                                // Insert before the tables
                                sgpaRow.parentNode.insertBefore(academicCard, sgpaRow);

                                // Remove original rows
                                sgpaRow.remove();
                                cgpaRow.remove();
                            }

                            // Style the registration table
                            const registerTable = regContainer.querySelector('#tblRegisteredCoursesDetail_0');
                            if (registerTable) {
                                registerTable.classList.add(
                                    "!w-full",
                                    "!border-collapse",
                                    "!rounded-lg",
                                    "!overflow-hidden",
                                    "!border",
                                    "!border-white/10",
                                    "!mb-4"
                                );

                                // Remove bootstrap classes
                                registerTable.classList.remove(
                                    "table",
                                    "table-responsive",
                                    "m-table",
                                    "m-table--border-info",
                                    "m-table--head-bg-info"
                                );

                                // Style table header
                                const thead = registerTable.querySelector('thead');
                                if (thead) {
                                    thead.classList.add("!bg-zinc-900");

                                    const headerRow = thead.querySelector('tr');
                                    if (headerRow) {
                                        headerRow.removeAttribute('style');
                                        headerRow.classList.add("!border-b", "!border-white/10");

                                        const headerCells = headerRow.querySelectorAll('th');
                                        headerCells.forEach(cell => {
                                            cell.removeAttribute('style');
                                            cell.classList.add(
                                                "!text-gray-400",
                                                "!font-medium",
                                                "!p-3",
                                                "!text-left",
                                                "!bg-transparent"
                                            );
                                        });
                                    }
                                }

                                // Style table body
                                const tbody = registerTable.querySelector('tbody');
                                if (tbody) {
                                    tbody.classList.add("!divide-y", "!divide-white/10");

                                    const rows = tbody.querySelectorAll('tr');
                                    rows.forEach(row => {
                                        row.classList.add(
                                            "!bg-black/40",
                                            "!hover:bg-white/5",
                                            "!transition-colors"
                                        );

                                        const cells = row.querySelectorAll('td');
                                        cells.forEach((cell, index) => {
                                            cell.classList.add(
                                                "!p-3",
                                                "!text-white/80",
                                                "!border-y",
                                                "!border-white/10"
                                            );

                                            // Style course title (typically the 2nd column)
                                            if (index === 1) {
                                                cell.classList.add("!font-medium", "!text-white");
                                            }

                                            // Style status column (typically the 4th column)
                                            if (index === 3) {
                                                const status = cell.textContent.trim();
                                                cell.innerHTML = `<span class="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md text-sm font-medium">${status}</span>`;
                                            }

                                            // Style date column (typically the 5th column)
                                            if (index === 4) {
                                                cell.classList.add("!text-blue-400");
                                            }
                                        });
                                    });
                                }
                            }

                            // Style the installment section
                            const installmentSection = regContainer.querySelector('#rowInstallment_0');
                            if (installmentSection) {
                                // Style the heading
                                const installmentHeading = installmentSection.querySelector('h4');
                                if (installmentHeading) {
                                    installmentHeading.classList.add(
                                        "!text-white",
                                        "!text-lg",
                                        "!font-bold",
                                        "!mt-4",
                                        "!mb-3"
                                    );
                                }

                                // Style the installment table
                                const installmentTable = installmentSection.querySelector('#tblInstallmentDetail_0');
                                if (installmentTable) {
                                    installmentTable.classList.add(
                                        "!w-full",
                                        "!border-collapse",
                                        "!rounded-lg",
                                        "!overflow-hidden",
                                        "!border",
                                        "!border-white/10"
                                    );

                                    // Remove bootstrap classes
                                    installmentTable.classList.remove(
                                        "table",
                                        "table-responsive",
                                        "m-table",
                                        "m-table--border-info",
                                        "m-table--head-bg-info"
                                    );

                                    // Style table header
                                    const thead = installmentTable.querySelector('thead');
                                    if (thead) {
                                        thead.classList.add("!bg-zinc-900");

                                        const headerCells = thead.querySelectorAll('th');
                                        headerCells.forEach(cell => {
                                            cell.classList.add(
                                                "!text-gray-400",
                                                "!font-medium",
                                                "!p-3",
                                                "!text-left",
                                                "!bg-transparent",
                                                "!border-b",
                                                "!border-white/10"
                                            );
                                        });
                                    }

                                    // Style table body
                                    const tbody = installmentTable.querySelector('tbody');
                                    if (tbody) {
                                        tbody.classList.add("!divide-y", "!divide-white/10");

                                        const rows = tbody.querySelectorAll('tr');
                                        rows.forEach(row => {
                                            row.classList.add(
                                                "!bg-black/40",
                                                "!hover:bg-white/5",
                                                "!transition-colors"
                                            );

                                            const cells = row.querySelectorAll('td');
                                            cells.forEach((cell, index) => {
                                                cell.classList.add(
                                                    "!p-3",
                                                    "!text-white/80",
                                                    "!border-y",
                                                    "!border-white/10"
                                                );

                                                // Style amount column (index 1)
                                                if (index === 1) {
                                                    cell.classList.add("!font-medium", "!text-emerald-400");
                                                }

                                                // Style status column (index 4)
                                                if (index === 4) {
                                                    const status = cell.textContent.trim();
                                                    cell.innerHTML = `<span class="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md text-sm font-medium">${status}</span>`;
                                                }

                                                // Style due date (index 3)
                                                if (index === 3) {
                                                    cell.classList.add("!text-blue-400");
                                                }
                                            });
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Style the Fee In Semester and Registration Log sections
            const sectionHeadings = detail.querySelectorAll("h4");
            sectionHeadings.forEach(heading => {
                heading.classList.add(
                    "!text-white",
                    "!font-bold",
                    "!text-lg",
                    "!mb-2"
                );
            });

            // Style border containers
            const borderContainers = detail.querySelectorAll(".border.border-secondary");
            borderContainers.forEach(container => {
                container.classList.remove("border", "border-secondary");
                container.classList.add(
                    "!border",
                    "!border-white/10",
                    "!rounded-xl",
                    "!p-4",
                    "!bg-zinc-900/30",
                    "!mb-4"
                );
            });

            // Style labels
            detail.querySelectorAll("label").forEach(label => {
                label.classList.add("!text-white/80");

                // Style the section labels (A, B, C, etc.)
                if (label.textContent.includes(")")) {
                    const boldText = label.querySelector("b");
                    if (boldText) {
                        boldText.classList.add("!text-x", "!font-bold");
                    }
                }
            });

            // Style tables inside the detail section
            const tables = detail.querySelectorAll("table");
            tables.forEach(table => {
                table.classList.add(
                    "!w-full",
                    "!border-collapse",
                    "!rounded-lg",
                    "!overflow-hidden",
                    "!border",
                    "!border-white/10",
                    "!mb-4"
                );

                // Remove bootstrap classes
                table.classList.remove(
                    "table-responsive",
                    "m-table--border-info",
                    "m-table--head-bg-info"
                );

                // Style table headers
                const thead = table.querySelector("thead");
                if (thead) {
                    thead.classList.add("!bg-zinc-900");

                    const headerRows = thead.querySelectorAll("tr");
                    headerRows.forEach(row => {
                        row.removeAttribute("style");
                        row.classList.add("!border-b", "!border-white/10");

                        const headerCells = row.querySelectorAll("th");
                        headerCells.forEach(cell => {
                            cell.removeAttribute("style");
                            cell.classList.add(
                                "!text-gray-400",
                                "!font-medium",
                                "!p-3",
                                "!text-left",
                                "!bg-transparent"
                            );
                        });
                    });
                }

                // Style table body
                const tbody = table.querySelector("tbody");
                if (tbody) {
                    tbody.classList.add("!divide-y", "!divide-white/10");

                    const rows = tbody.querySelectorAll("tr");
                    rows.forEach(row => {
                        row.classList.add(
                            "!bg-black",
                            "!hover:bg-white/5",
                            "!transition-colors"
                        );

                        const cells = row.querySelectorAll("td");
                        cells.forEach(cell => {
                            cell.classList.add(
                                "!p-3",
                                "!text-white/80",
                                "!border-y",
                                "!border-white/10"
                            );
                        });
                    });
                }
            });
        });

        // Style the main collection detail table
        const collectionTable = element.querySelector("#sample_CollectionDetail");
        if (collectionTable) {
            // Create a container for the table with modern styling
            const tableContainer = document.createElement("div");
            tableContainer.className = "rounded-xl overflow-hidden !border !border-white/10 mb-6";
            collectionTable.parentNode.insertBefore(tableContainer, collectionTable);
            tableContainer.appendChild(collectionTable);

            // Style the table
            collectionTable.classList.add(
                "!w-full",
                "!border-collapse",
                "!border-0"
            );
            collectionTable.classList.remove("table-bordered", "table-responsive");

            // Style the table headers
            const thead = collectionTable.querySelector("thead");
            if (thead) {
                thead.classList.add("!bg-zinc-900", "!sticky", "!top-0", "!z-10");

                const headers = thead.querySelectorAll("th");
                headers.forEach(header => {
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
            const tbody = collectionTable.querySelector("tbody");
            if (tbody) {
                tbody.classList.add("!divide-y", "!divide-white/10");

                const rows = tbody.querySelectorAll("tr");
                rows.forEach(row => {
                    row.classList.add(
                        "!bg-black",
                        "!hover:bg-white/5",
                        "!transition-colors"
                    );

                    const cells = row.querySelectorAll("td");
                    cells.forEach((cell, index) => {
                        cell.classList.add(
                            "!p-3",
                            "!text-white/80",
                            "!border-y",
                            "!border-white/10"
                        );

                        // Style amount column (typically the 6th column)
                        if (index === 5) {
                            cell.classList.add("!font-medium", "!text-emerald-400");
                        }

                        // Style status column (typically the 10th column)
                        if (index === 9) {
                            const status = cell.textContent.trim();
                            cell.innerHTML = `<span class="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-md font-medium">${status}</span>`;
                        }

                        // Style date columns (due date and payment date)
                        if (index === 6 || index === 7) {
                            cell.classList.add("!text-blue-400");
                        }

                        // Style the remarks link
                        if (index === 10) {
                            const link = cell.querySelector("a");
                            if (link) {
                                link.removeAttribute("style");
                                link.classList.add(
                                    "!text-x",
                                    "!font-medium",
                                    "!hover:text-x/80",
                                    "!transition-colors",
                                    "!cursor-pointer"
                                );
                            }
                        }
                    });
                });
            }
        }

        // Add a summary card at the top
        const summaryContainer = document.createElement("div");
        summaryContainer.className = "bg-zinc-900/50 rounded-2xl p-6 mb-6 !border !border-white/10 shadow-lg";

        // Calculate total paid
        let totalPaid = 0;
        const paymentAmounts = element.querySelectorAll("#sample_CollectionDetail tbody tr td:nth-child(6)");
        paymentAmounts.forEach(cell => {
            const amount = parseFloat(cell.textContent.replace(/[^0-9.-]+/g, ""));
            if (!isNaN(amount)) {
                totalPaid += amount;
            }
        });

        // Count total number of transactions
        const transactionCount = element.querySelectorAll("#sample_CollectionDetail tbody tr").length;

        // Find the latest payment
        const latestPaymentRow = element.querySelector("#sample_CollectionDetail tbody tr");
        let latestPaymentInfo = "";
        if (latestPaymentRow) {
            const semester = latestPaymentRow.querySelector("td:nth-child(2)")?.textContent || "";
            const amount = latestPaymentRow.querySelector("td:nth-child(6)")?.textContent || "";
            const date = latestPaymentRow.querySelector("td:nth-child(8)")?.textContent || "";
            const challanNo = latestPaymentRow.querySelector("td:nth-child(3)")?.textContent || "";

            latestPaymentInfo = `
                <div class="mt-4 pt-4 !border-t !border-white/10">
                    <h4 class="text-sm font-medium text-white/70 mb-2">Latest Payment</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div class="bg-black/40 rounded-xl p-3 !border !border-white/5">
                            <span class="block text-xs text-white/60 mb-1">Semester</span>
                            <span class="text-white font-medium">${semester}</span>
                        </div>
                        <div class="bg-black/40 rounded-xl p-3 !border !border-white/5">
                            <span class="block text-xs text-white/60 mb-1">Challan No.</span>
                            <span class="text-white font-medium">${challanNo}</span>
                        </div>
                        <div class="bg-black/40 rounded-xl p-3 !border !border-white/5 flex justify-between items-center">
                            <div>
                                <span class="block text-xs text-white/60 mb-1">Payment Date</span>
                                <span class="text-white font-medium">${date}</span>
                            </div>
                            <span class="text-lg font-bold text-emerald-400">${amount}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        summaryContainer.innerHTML = `
            <div class="flex flex-col md:flex-row justify-between items-start gap-4">
                <div class="flex items-start gap-4">
                    <div class="h-12 w-12 rounded-xl bg-x flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                            <line x1="2" y1="10" x2="22" y2="10"></line>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-white">Fee Payment Summary</h3>
                        <p class="text-sm text-white/70 mt-1">Showing ${transactionCount} fee transactions</p>
                    </div>
                </div>
                <div class="bg-black/40 rounded-xl px-6 py-4 !border !border-white/10 text-center w-full md:w-auto">
                    <span class="block text-xs text-white/70 mb-1">Total Paid</span>
                    <span class="text-2xl font-bold text-emerald-400">Rs. ${totalPaid.toLocaleString()}</span>
                </div>
            </div>
            ${latestPaymentInfo}
        `;

        // Insert at the top of the portlet body
        if (portletBody && portletBody.firstChild) {
            portletBody.insertBefore(summaryContainer, portletBody.firstChild);
        }

        semesterHeaders.forEach((header) => {
            const row = header.querySelector('.row');
            if (row) {
                row.classList.add(
                    "!bg-black/40",
                    "!rounded-xl",
                    "!p-4",
                    "!border",
                    "!border-white/10",
                    "!mb-4",
                    "!flex",
                    "!items-center",
                    "!gap-2",
                    "!transition-colors",
                    "!duration-300",
                    "!hover:bg-white/5"
                );
            }

            // Style the expand/collapse buttons
            const expandBtn = header.querySelector("[id^='BtnhideshowInternal']");
            if (expandBtn) {
                expandBtn.classList.remove(
                    "btn-brand",
                    "m-btn",
                    "m-btn--custom",
                    "m-btn--icon",
                    "m-btn--pill",
                    "m-btn--air"
                );
                expandBtn.classList.add(
                    "!bg-x/80",
                    "!rounded-xl",
                    "!w-8",
                    "!h-8",
                    "!flex",
                    "!items-center",
                    "!justify-center",
                    "!mr-2",
                    "!border-none",
                    "!shadow-lg",
                    "!transition-all",
                    "!duration-300",
                    "!hover:bg-x"
                );

                // Add animation for rotation on click
                expandBtn.addEventListener('click', function () {
                    const icon = this.querySelector('i');
                    const targetId = this.getAttribute('onclick').match(/ftn_ShowHideDivandData\((\d+)/)[1];
                    const targetDiv = document.getElementById(`rowStdDetail_${targetId}`);

                    if (targetDiv.style.display === 'none') {
                        icon.classList.remove('fa-angle-right');
                        icon.classList.add('fa-angle-down', 'transform', 'transition-transform', 'duration-300');
                    } else {
                        icon.classList.remove('fa-angle-down');
                        icon.classList.add('fa-angle-right', 'transform', 'transition-transform', 'duration-300');
                    }
                });
            }

            // Style semester labels
            const semesterLabel = header.querySelector('label');
            if (semesterLabel) {
                semesterLabel.classList.add(
                    "!text-white",
                    "!font-medium",
                    "!text-lg"
                );
            }

            // Create a grid layout for the financial summaries in the header
            const allColumns = header.querySelectorAll('.row > div:not(:first-child)');
            const columnContainer = document.createElement('div');
            columnContainer.className = 'flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mt-2';

            // Style the amount text cells and move them to the grid
            const columnTitles = ['Arrears', 'Due', 'Discount', 'Sponsored', 'Collection', 'Balance'];
            allColumns.forEach((column, colIndex) => {
                const title = columnTitles[colIndex];
                const value = column.querySelector('p')?.textContent.trim() || '0';
                const amount = parseFloat(value.replace(/[(),%]/g, ''));

                const card = document.createElement('div');
                card.className = 'bg-black/40 rounded-lg p-2 !border !border-white/5';

                let valueClass = '!text-white/80 !font-medium';

                // Style based on content and column type
                if (!isNaN(amount)) {
                    // Collection (index 4)
                    if (colIndex === 4) {
                        valueClass = "!text-emerald-400 !font-bold";
                    }
                    // Balance (index 5)
                    else if (colIndex === 5) {
                        valueClass = amount < 0 ? "!text-rose-400" :
                            amount > 0 ? "!text-amber-400" : "!text-white/80";
                    }
                    // Arrears (index 0)
                    else if (colIndex === 0 && amount < 0) {
                        valueClass = "!text-rose-400";
                    }
                }

                card.innerHTML = `
                    <span class="block text-xs text-white/60 mb-1">${title}</span>
                    <span class="${valueClass}">${value}</span>
                `;

                columnContainer.appendChild(card);
                column.remove(); // Remove the original column
            });

            // Add the grid container after the semester label
            const firstColumn = header.querySelector('.row > div:first-child');
            if (firstColumn) {
                firstColumn.after(columnContainer);
                firstColumn.classList.add('flex', 'items-center');
            }
        });
    };

    return (
        <PageLayout currentPage={window.location.pathname}>
            {elemContent && (
                <div className="m-grid m-grid--hor m-grid--root m-page"
                    dangerouslySetInnerHTML={{ __html: elemContent }} />
            )}
        </PageLayout>
    );
}

export default FeeDetailsPage;
