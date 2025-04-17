import React, { useEffect, useState } from "react";
import PageLayout from "../layouts/PageLayout";

function ChangePasswordPage() {
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
                "m-portlet--bordered",
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
                "!text-white"
            );
        }

        // Style the form
        const form = element.querySelector("#ChangePassword");
        if (form) {
            // Create a new container for inputs
            const inputsContainer = document.createElement("div");
            inputsContainer.classList.add("flex", "flex-col", "gap-4", "w-full", "mb-6");

            // Find all inputs and extract them
            const formRows = form.querySelectorAll(".form-group.m-form__group.row");
            const extractedInputs = [];

            formRows.forEach((row) => {
                const inputContainer = row.querySelector(".m-input-icon");
                if (inputContainer) {
                    // Remove the icon spans
                    const iconSpans = inputContainer.querySelectorAll(".m-input-icon__icon");
                    iconSpans.forEach(span => span.remove());

                    // Get the input
                    const input = inputContainer.querySelector("input");
                    if (input) {
                        // Clone the input to preserve its attributes
                        const clonedInput = input.cloneNode(true);

                        clonedInput.classList.add(
                            "!bg-black",
                            "!text-white",
                            "!border",
                            "!border-white/20",
                            "!rounded-xl",
                            "!p-3",
                            "!transition-colors",
                            "!focus:border-x",
                            "!focus:outline-none",
                            "!w-full"
                        );

                        // Remove default styling
                        clonedInput.classList.remove(
                            "m-input--pill",
                            "m-input--air"
                        );

                        // Remove inline styles
                        if (clonedInput.hasAttribute("style")) {
                            clonedInput.removeAttribute("style");
                        }

                        // Create wrapper for input with icon
                        const inputWrapper = document.createElement("div");
                        inputWrapper.classList.add("relative", "w-full");

                        // Add lock icon using SVG
                        const lockIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        lockIcon.setAttribute("width", "18");
                        lockIcon.setAttribute("height", "18");
                        lockIcon.setAttribute("viewBox", "0 0 24 24");
                        lockIcon.setAttribute("fill", "none");
                        lockIcon.setAttribute("stroke", "currentColor");
                        lockIcon.setAttribute("stroke-width", "2");
                        lockIcon.setAttribute("stroke-linecap", "round");
                        lockIcon.setAttribute("stroke-linejoin", "round");
                        lockIcon.classList.add("absolute", "left-3", "top-3.5", "text-white/40");

                        const lockPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        lockPath.setAttribute("d", "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z");
                        lockIcon.appendChild(lockPath);

                        const lockRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                        lockRect.setAttribute("x", "7");
                        lockRect.setAttribute("y", "11");
                        lockRect.setAttribute("width", "10");
                        lockRect.setAttribute("height", "10");
                        lockRect.setAttribute("rx", "2");
                        lockRect.setAttribute("ry", "2");
                        lockIcon.appendChild(lockRect);

                        const lockLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        lockLine.setAttribute("d", "M8 11V7a4 4 0 018 0v4");
                        lockIcon.appendChild(lockLine);

                        // Add padding to input to accommodate icon
                        clonedInput.classList.add("!pl-10");

                        // Add input and icon to wrapper
                        inputWrapper.appendChild(lockIcon);
                        inputWrapper.appendChild(clonedInput);

                        // Save the error message if it exists
                        const errorMsg = row.querySelector(".matcherror");
                        if (errorMsg) {
                            const errorMsgClone = errorMsg.cloneNode(true);
                            errorMsgClone.classList.add("!text-red-400", "!mt-1", "!text-sm");
                            inputWrapper.appendChild(errorMsgClone);
                        }

                        extractedInputs.push(inputWrapper);
                    }
                }

                // Mark this row for removal
                row.dataset.toRemove = "true";
            });

            // Add all extracted inputs to the container
            extractedInputs.forEach(inputElem => {
                inputsContainer.appendChild(inputElem);
            });

            // Remove original rows
            form.querySelectorAll('[data-to-remove="true"]').forEach(row => row.remove());

            // Insert the new container at the beginning of the form
            if (form.firstChild) {
                form.insertBefore(inputsContainer, form.firstChild);
            } else {
                form.appendChild(inputsContainer);
            }

            // Style the submit button container
            const buttonRow = form.querySelector(".row:not(.form-group)");
            if (buttonRow) {
                buttonRow.classList.add("!mt-8");

                // Style the submit button
                const submitButton = buttonRow.querySelector("button#submit");
                if (submitButton) {
                    // Clear existing content
                    submitButton.innerHTML = "";

                    // Create save icon SVG
                    const saveIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    saveIcon.setAttribute("width", "20");
                    saveIcon.setAttribute("height", "20");
                    saveIcon.setAttribute("viewBox", "0 0 24 24");
                    saveIcon.setAttribute("fill", "none");
                    saveIcon.setAttribute("stroke", "currentColor");
                    saveIcon.setAttribute("stroke-width", "2");
                    saveIcon.setAttribute("stroke-linecap", "round");
                    saveIcon.setAttribute("stroke-linejoin", "round");
                    saveIcon.classList.add("mr-2");

                    const savePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    savePath.setAttribute("d", "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z");
                    saveIcon.appendChild(savePath);

                    const saveLine1 = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
                    saveLine1.setAttribute("points", "17 21 17 13 7 13 7 21");
                    saveIcon.appendChild(saveLine1);

                    const saveLine2 = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
                    saveLine2.setAttribute("points", "7 3 7 8 15 8");
                    saveIcon.appendChild(saveLine2);

                    // Create container for icon and text
                    const buttonContent = document.createElement("span");
                    buttonContent.className = "flex items-center";
                    buttonContent.appendChild(saveIcon);
                    buttonContent.appendChild(document.createTextNode("Update Password"));

                    // Add content to button
                    submitButton.appendChild(buttonContent);

                    // Add modern styling
                    submitButton.classList.add(
                        "!bg-x",
                        "hover:!bg-x/80",
                        "!text-white",
                        "!font-medium",
                        "!py-3",
                        "!px-8",
                        "!rounded-xl",
                        "!transition-colors",
                        "!border-0",
                        "!shadow-lg"
                    );

                    // Remove default styling
                    submitButton.classList.remove(
                        "btn-brand",
                        "m-btn",
                        "m-btn--icon",
                        "m-btn--pill",
                        "m-btn--air"
                    );


                }
            }

            // Style form feedback messages
            const feedbackElements = form.querySelectorAll(".matcherror");
            feedbackElements.forEach(element => {
                element.classList.add("!text-red-400", "!mt-1", "!text-sm");
            });
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

export default ChangePasswordPage;
