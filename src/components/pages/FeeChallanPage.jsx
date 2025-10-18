import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";

function FeeChallanPage() {
  const [elemContent, setElemContent] = useState(null);

  useEffect(() => {
    const targetElement = document.querySelector(
      ".m-grid.m-grid--hor.m-grid--root.m-page",
    );

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
        "!shadow-lg",
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
        "!mb-4",
      );

      // Find and style the heading
      const headingText = portletHead.querySelector(".m-portlet__head-text");
      if (headingText) {
        headingText.classList.add("!text-white", "!text-xl", "!font-bold");
        headingText.innerHTML = "Fee Challan Details";
      }
    }

    // Style the table container
    const tableContainer = element.querySelector(".m-section__content");
    if (tableContainer) {
      tableContainer.classList.add("!p-0");
    }

    // Style the tables and make them responsive
    const tables = element.querySelectorAll("table");
    tables.forEach((table) => {
      table.classList.add(
        "!border-collapse",
        "!w-full",
        "!text-white",
        "!rounded-xl",
      );
    });

    // Style the main challan table
    const challanTable = element.querySelector("table table");
    if (challanTable) {
      // Create a style element for custom scrolling
      const tableStyle = document.createElement("style");
      tableStyle.innerHTML = `
                .challan-table {
                    width: 100% !important;
                    table-layout: fixed !important;
                    margin-bottom: 1rem !important;
                }
                .challan-table tbody {
                    display: block !important;
                    width: 100% !important;
                    max-height: 400px !important;
                    overflow-y: auto !important;
                }
                .challan-table thead, .challan-table tbody tr {
                    display: table !important;
                    width: 100% !important;
                    table-layout: fixed !important;
                }
                .challan-table th, .challan-table td {
                    vertical-align: middle !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                }
                
                .challan-table th {
                    color: white !important;
                    font-weight: 600 !important;
                }
            `;
      document.head.appendChild(tableStyle);

      challanTable.classList.add("challan-table", "custom-scrollbar");

      element.querySelectorAll(".table td, .table th").forEach((el) => {
        el.classList.add("!border-none");
      });
      element.querySelectorAll(".table td").forEach((el) => {
        el.style.cssText = "padding: inherit !important";
      });

      // Style table headers
      const headers = challanTable.querySelectorAll("th");
      headers.forEach((header) => {
        header.classList.add(
          "!bg-white/10",
          "!text-gray-400",
          "!font-medium",
          "!border-b",
          "!border-white/10",
        );
      });

      // Remove the last th element from each tr in thead (only action column)
      const headerRows = challanTable.querySelectorAll("thead tr");
      headerRows.forEach((row) => {
        const headerCells = row.querySelectorAll("th");
        if (headerCells.length >= 2) {
          headerCells[headerCells.length - 1].remove();
          headerCells[headerCells.length - 2].remove();
        }
      });

      // Style the print button
      const printButtons = challanTable.querySelectorAll(".btn-primary");
      printButtons.forEach((button) => {
        button.classList.remove("btn-primary");
        button.classList.add(
          "!bg-x",
          "!text-white",
          "!px-4",
          "!py-2",
          "!rounded-lg",
          "!hover:bg-x/80",
          "!transition",
          "!duration-200",
        );
      });

      // Remove border-top from all table cells and headers
      challanTable.querySelectorAll("td", "th").forEach((element) => {
        element.classList.add("!border-none");
      });

      const rows = challanTable.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        // DO NOT remove the second cell as it might contain amount information
        // Instead, identify which cell contains the amount and style it appropriately

        row.classList.add(
          "!bg-black",
          "!hover:bg-white/5",
          "!transition-colors",
          "!p-3",
        );

        const cells = row.querySelectorAll("td");
        cells.forEach((cell) => {
          cell.classList.add(
            "!p-3",
            "!text-white/80",
            "!border-y",
            "!border-white/0",
          );

          // Check if cell contains amount information (typically contains currency symbol or numbers)
          if (
            cell.textContent.trim().match(/^\$|PKR|Rs\.|\d+\.\d{2}|\d+,\d+/)
          ) {
            cell.classList.add("!font-semibold", "!text-emerald-400");
          }
        });

        // Status is typically in the 5th column
        const statusCell = row.querySelector("td:nth-child(5)");
        if (statusCell && statusCell.textContent.trim() === "Paid") {
          statusCell.innerHTML = `
                        <span class="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-md font-medium">
                            Paid
                        </span>
                    `;
        } else if (statusCell) {
          statusCell.innerHTML = `
                        <span class="bg-rose-500/20 text-rose-400 px-3 py-1 rounded-md font-medium">
                            ${statusCell.textContent.trim()}
                        </span>
                    `;
        }

        // Style date cells - these are typically the 3rd and 4th columns
        const dateCells = [
          row.querySelector("td:nth-child(3)"),
          row.querySelector("td:nth-child(4)"),
        ];
        dateCells.forEach((cell) => {
          if (cell) {
            cell.classList.add("!text-blue-400");
          }
        });
      });

      // Style the payment instructions panel
      const infoPanel = element.querySelector(
        "td[style*='border-right:solid 1px']",
      );
      if (infoPanel) {
        infoPanel.classList.add(
          "!bg-white/10",
          "!rounded-xl",
          "!p-4",
          "!border",
          "!border-white/10",
        );
        infoPanel.removeAttribute("style");

        // Style the headings in info panel
        const infoHeadings = infoPanel.querySelectorAll("strong");
        infoHeadings.forEach((heading) => {
          heading.classList.add("!text-x", "!font-medium");
        });

        // Style the links in info panel
        const links = infoPanel.querySelectorAll("a");
        links.forEach((link) => {
          link.classList.add(
            "!text-blue-400",
            "!underline",
            "!hover:text-blue-300",
          );
        });

        // Style paragraphs in info panel
        const paragraphs = infoPanel.querySelectorAll("p");
        paragraphs.forEach((p) => {
          p.classList.add("!text-white/70");
        });
      }

      // Insert the summary card at the top of the portlet body
      const portletBody = element.querySelector(".m-portlet__body");
      if (portletBody) {
        // Target the payment instructions cell using its specific attributes
        const paymentInstructionsCell = element.querySelector(
          "td[style*='border-right:solid 1px']",
        );
        if (paymentInstructionsCell) {
          paymentInstructionsCell.remove();
        } else {
          // Fallback approach - find by content
          const allTds = element.querySelectorAll("td");
          for (const td of allTds) {
            if (
              td.textContent.includes(
                "Fee can be paid using any one of the following methods",
              )
            ) {
              td.remove();
              break;
            }
          }
        }

        // Add additional styling to portlet body
        portletBody.classList.add(
          "!bg-black",
          "!rounded-b-3xl",
          "!p-0",
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
    }
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

export default FeeChallanPage;
