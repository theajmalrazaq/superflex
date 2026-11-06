import React, { useEffect, useState } from "react";
import PageLayout from "../components/layouts/PageLayout";
import NotificationBanner from "../components/ui/NotificationBanner";
import Skeleton from "../components/ui/Skeleton";

const ChangePasswordSkeleton = () => (
  <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1680px] flex-col justify-center gap-7 px-4 py-6 font-sans sm:px-6 lg:px-8 lg:py-8" role="status" aria-label="Loading security settings">
    <div className="mx-auto w-full max-w-[480px] space-y-5 rounded-[32px] bg-white p-6 dark:bg-black sm:p-8"><Skeleton className="h-12 w-12 rounded-2xl" /><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-72 max-w-full" />{[0, 1, 2].map((item) => <div key={item} className="space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-12 w-full rounded-full" /></div>)}<Skeleton className="h-12 w-full rounded-full" /></div>
  </main>
);

function ChangePasswordPage() {
  const [elemContent, setElemContent] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const parse = () => {
      const targetElement = document.querySelector(".m-grid.m-grid--hor.m-grid--root.m-page");

      if (!targetElement) {
        setTimeout(parse, 100);
        return;
      }

      const alertList = [];
      targetElement.querySelectorAll(".m-alert, .alert").forEach((alert) => {
        if (
          alert.style.display === "none" ||
          alert.id === "DataErrormsgdiv" ||
          alert.closest(".modal")
        )
          return;

        const textContainer = alert.querySelector(".m-alert__text") || alert;
        const clone = textContainer.cloneNode(true);

        clone
          .querySelectorAll(".m-alert__close, button, a, strong, .m-alert__icon")
          .forEach((el) => el.remove());

        let message = clone.textContent
          .replace(/Alert!/gi, "")
          .replace(/Close/gi, "")
          .replace(/&nbsp;/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        if (message && message.length > 3) {
          const type =
            alert.classList.contains("alert-danger") ||
            alert.classList.contains("m-alert--outline-danger")
              ? "error"
              : "info";
          const displayMessage =
            type !== "error" && /password.*(success|updated|changed)/i.test(message)
              ? "Password updated. Now if only GPA worked like that."
              : message;
          alertList.push({ type, message: displayMessage });
        }
      });
      setAlerts(alertList);

      applyCustomStyling(targetElement);

      setElemContent(targetElement.innerHTML);
      targetElement.remove();
    };

    parse();
  }, []);

  const applyCustomStyling = (element) => {
    const portlet = element.querySelector(".m-portlet");
    if (portlet) {
      portlet.classList.add(
        "!bg-white",
        "dark:!bg-black",
        "!border-0",
        "dark:!border",
        "dark:!border-white/[0.14]",
        "!rounded-[32px]",
        "!p-0",
        "!text-[#101010]",
        "dark:!text-[#f5f6fb]",
      );

      portlet.classList.remove(
        "m-portlet--primary",
        "m-portlet--head-solid-bg",
        "m-portlet--bordered",
        "m-portlet--head-sm",
        "m-portlet",
      );
      portlet.style.setProperty("width", "100%", "important");
      portlet.style.setProperty("max-width", "480px", "important");
      portlet.style.setProperty("margin-inline", "auto", "important");
    }

    const portletHead = element.querySelector(".m-portlet__head");
    if (portletHead) {
      portletHead.style.display = "none";
    }

    const portletBody = element.querySelector(".m-portlet__body");
    if (portletBody) {
      portletBody.classList.add("!p-5", "sm:!p-8", "!text-[#101010]", "dark:!text-[#f5f6fb]", "!bg-transparent");
    }

    const portalStatusButtons = element.querySelectorAll("#success, #error");
    portalStatusButtons.forEach((btn) => btn.remove());

    const form = element.querySelector("#ChangePassword");
    if (form) {
      const isDarkMode = document.documentElement.classList.contains("dark");
      const gridContainer = document.createElement("div");
      gridContainer.className = "flex w-full flex-col items-center gap-6";

      const formColumn = document.createElement("div");
      formColumn.className = "w-full max-w-[416px] space-y-5";
      formColumn.style.setProperty("width", "100%", "important");
      formColumn.style.setProperty("max-width", "416px", "important");

      const headerDiv = document.createElement("div");
      headerDiv.className = "space-y-1.5 text-center";
      headerDiv.innerHTML = `
          <h3 class="text-xl font-bold text-slate-900 dark:text-white flex flex-col items-center gap-3">
              <div class="h-12 w-12 rounded-2xl bg-black flex items-center justify-center dark:bg-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 432 432" fill="#a098ff"><path d="M247.227 185.616L282.286 69L133 216L186.861 231.146L133 363L298 208.65L247.227 185.616Z"/></svg>
              </div>
              Change Password
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">At least you can change this. GPA nahi toh password hi change kar le bhai.</p>
      `;
      formColumn.appendChild(headerDiv);

      const inputsContainer = document.createElement("div");
      inputsContainer.classList.add("flex", "flex-col", "gap-4", "w-full");

      const formRows = form.querySelectorAll(".form-group.m-form__group.row");
      const extractedInputs = [];

      formRows.forEach((row) => {
        const inputContainer = row.querySelector(".m-input-icon");
        const label = row.querySelector("label");

        if (inputContainer) {
          const iconSpans = inputContainer.querySelectorAll(".m-input-icon__icon");
          iconSpans.forEach((span) => span.remove());

          const input = inputContainer.querySelector("input");
          if (input) {
            const clonedInput = input.cloneNode(true);

            clonedInput.classList.add(
              "!bg-white",
              "dark:!bg-white/[0.04]",
              "!text-[#111]",
              "dark:!text-[#f9f9f9]",
              "!border-2",
              "!border-[#e0e0e0]",
              "dark:!border-white/[0.12]",
              "!rounded-full",
              "!px-5",
              "!transition-all",
              "!duration-300",
              "focus:!border-[#230052]",
              "dark:focus:!border-white",
              "focus:!ring-0",
              "focus:!outline-none",
              "!w-full",
              "!h-[46px]",
              "!min-h-[46px]",
              "!text-[14px]",
              "!font-normal",
              "placeholder:!text-slate-400",
              "dark:placeholder:!text-white/60",
            );

            clonedInput.classList.remove(
              "m-input--pill",
              "m-input--air",
              "form-control",
              "m-input",
            );
            clonedInput.classList.add("superflex-password-input");
            if (clonedInput.hasAttribute("style")) clonedInput.removeAttribute("style");
            clonedInput.style.setProperty("box-sizing", "border-box", "important");
            clonedInput.style.setProperty("width", "100%", "important");
            clonedInput.style.setProperty("height", "50px", "important");
            clonedInput.style.setProperty("min-height", "50px", "important");
            clonedInput.style.setProperty("padding", "0 22px", "important");
            clonedInput.style.setProperty("border-radius", "999px", "important");
            clonedInput.style.setProperty("font-size", "14px", "important");
            clonedInput.style.setProperty("font-weight", "400", "important");
            clonedInput.style.setProperty("font-family", "'Google Sans Flex', sans-serif", "important");
            clonedInput.style.setProperty("line-height", "normal", "important");
            clonedInput.style.setProperty("background-color", isDarkMode ? "rgb(217 217 217 / 4%)" : "#fff", "important");
            clonedInput.style.setProperty("border", isDarkMode ? "2px solid rgba(255,255,255,.12)" : "2px solid #e0e0e0", "important");
            clonedInput.style.setProperty("color", isDarkMode ? "#f9f9f9" : "#111", "important");
            clonedInput.addEventListener("focus", () => clonedInput.style.setProperty("border-color", isDarkMode ? "#fff" : "#230052", "important"));
            clonedInput.addEventListener("blur", () => clonedInput.style.setProperty("border-color", isDarkMode ? "rgba(255,255,255,.12)" : "#e0e0e0", "important"));

            const inputWrapper = document.createElement("div");
            inputWrapper.classList.add("relative", "w-full", "group");

            const labelText = label ? label.textContent.trim() : "Input";
            const labelElem = document.createElement("label");
            labelElem.textContent = labelText;
            labelElem.classList.add(
              "text-xs",
              "font-bold",
              "text-slate-600",
              "dark:text-slate-300",
              "mb-2",
              "uppercase",
              "ml-1",
              "block",
            );
            labelElem.style.setProperty("margin-left", "4px", "important");
            labelElem.style.setProperty("font-size", "12px", "important");
            labelElem.style.setProperty("font-weight", "600", "important");
            labelElem.style.setProperty("letter-spacing", "0.03em", "important");

            inputWrapper.appendChild(labelElem);
            inputWrapper.appendChild(clonedInput);

            const errorMsg = row.querySelector(".matcherror");
            if (errorMsg) {
              const errorMsgClone = errorMsg.cloneNode(true);
              errorMsgClone.classList.add(
                "!text-rose-600",
                "dark:!text-rose-300",
                "!mt-2",
                "!text-xs",
                "!font-medium",
                "!flex",
                "!items-center",
                "!gap-1",
              );
              inputWrapper.appendChild(errorMsgClone);
            }

            extractedInputs.push(inputWrapper);
          }
        }
        row.dataset.toRemove = "true";
      });

      extractedInputs.forEach((inputElem) => {
        inputsContainer.appendChild(inputElem);
      });

      formColumn.appendChild(inputsContainer);

      const buttonRow = form.querySelector(".row:not(.form-group)");
      if (buttonRow) {
        const clonedBtnRow = buttonRow.cloneNode(true);
        buttonRow.remove();

        clonedBtnRow.classList.add("!mt-8", "flex");
        clonedBtnRow.querySelectorAll(".col-lg-12").forEach((col) => (col.className = "w-full"));

        const submitButton = clonedBtnRow.querySelector("button#submit");
        if (submitButton) {
          submitButton.innerHTML = "";

          const iconStr = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;

          const buttonContent = document.createElement("span");
          buttonContent.className = "flex items-center justify-center";
          buttonContent.innerHTML = iconStr + "Update Password";

          submitButton.appendChild(buttonContent);

          submitButton.classList.add(
            "!bg-[#230052]",
            "hover:!bg-[#370c72]",
            "!text-white",
            "dark:!bg-white",
            "dark:hover:!bg-white/85",
            "dark:!text-[#0a192f]",
            "!font-bold",
            "!py-3",
            "!px-6",
            "!rounded-full",
            "!transition-all",
            "!border-0",
            "!w-full",
            "!flex",
            "!items-center",
            "!justify-center",
          );

          submitButton.classList.remove(
            "btn-brand",
            "m-btn",
            "m-btn--icon",
            "m-btn--pill",
            "m-btn--air",
            "btn",
            "btn-focus",
          );
        }
        formColumn.appendChild(clonedBtnRow);
      }

      form.querySelectorAll('[data-to-remove="true"]').forEach((row) => row.remove());

      gridContainer.appendChild(formColumn);

      if (form.firstChild) {
        form.insertBefore(gridContainer, form.firstChild);
      } else {
        form.appendChild(gridContainer);
      }

      const feedbackElements = form.querySelectorAll(".matcherror");
      feedbackElements.forEach((element) => {
        element.classList.add("!text-rose-400", "!mt-2", "!text-xs", "!font-medium");
      });
    }
  };

  return (
    <PageLayout currentPage={window.location.pathname} fullWidth>
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1680px] flex-col justify-center gap-7 px-4 py-6 font-sans sm:px-6 lg:px-8 lg:py-8">
        {alerts.length > 0 && <NotificationBanner alerts={alerts} />}
        {elemContent ? (
          <div
            className="mx-auto w-full max-w-[480px] animate-in fade-in duration-500"
            dangerouslySetInnerHTML={{ __html: elemContent }}
          />
        ) : (
          <ChangePasswordSkeleton />
        )}
      </main>
    </PageLayout>
  );
}

export default ChangePasswordPage;
