import React, { useEffect, useState } from "react";
import PageLayout from "../components/layouts/PageLayout";
import NotificationBanner from "../components/ui/NotificationBanner";
import Skeleton from "../components/ui/Skeleton";

const ChangePasswordSkeleton = () => (
  <main className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col gap-7 px-4 py-6 font-sans sm:px-6 lg:px-8 lg:py-8" role="status" aria-label="Loading security settings">
    <header className="space-y-2"><Skeleton className="h-3 w-20" /><Skeleton className="h-9 w-64" /><Skeleton className="h-4 w-80 max-w-full" /></header>
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]"><div className="space-y-5 rounded-[24px] bg-white p-6 dark:bg-black sm:p-8"><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-72 max-w-full" />{[0, 1, 2].map((item) => <div key={item} className="space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-12 w-full rounded-full" /></div>)}<Skeleton className="h-12 w-full rounded-full" /></div><div className="space-y-4 rounded-[24px] bg-white p-6 dark:bg-black sm:p-8"><Skeleton className="h-5 w-48" />{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-4 w-full" />)}<Skeleton className="mt-6 h-28 w-full rounded-2xl" /></div></div>
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
          alertList.push({ type, message });
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
        "!border",
        "!border-black/[0.06]",
        "dark:!border-white/[0.14]",
        "!rounded-[24px]",
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
      portlet.style.setProperty("max-width", "1120px", "important");
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

    const legacyButtons = element.querySelectorAll("#success, #error");
    legacyButtons.forEach((btn) => btn.remove());

    const form = element.querySelector("#ChangePassword");
    if (form) {
      const isDarkMode = document.documentElement.classList.contains("dark");
      const gridContainer = document.createElement("div");
      gridContainer.className = "grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,.85fr)] lg:gap-8";
      gridContainer.style.setProperty("grid-template-columns", "minmax(0, 1fr) minmax(280px, .85fr)", "important");

      const formColumn = document.createElement("div");
      formColumn.className = "w-full max-w-[416px] space-y-5";
      formColumn.style.setProperty("width", "100%", "important");
      formColumn.style.setProperty("max-width", "416px", "important");

      const headerDiv = document.createElement("div");
      headerDiv.className = "space-y-1.5";
      headerDiv.innerHTML = `
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div class="h-10 w-10 rounded-[36%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              Update Password
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">Choose a strong password you don’t use elsewhere.</p>
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
              "!text-[17px]",
              "!font-medium",
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
            clonedInput.style.setProperty("font-size", "17px", "important");
            clonedInput.style.setProperty("font-weight", "500", "important");
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

      const infoColumn = document.createElement("div");
      infoColumn.className = "flex flex-col gap-4";
      infoColumn.innerHTML = `
      <div class="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.05] space-y-4">
            <h4 class="text-slate-900 dark:text-white font-bold flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                Password Requirements
            </h4>
            <ul class="space-y-3">
                <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div class="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#230052] dark:bg-white shrink-0"></div>
                    Minimum 8 characters long
                </li>
                 <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div class="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#230052] dark:bg-white shrink-0"></div>
                    At least one Cap letter
                </li>
                 <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div class="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#230052] dark:bg-white shrink-0"></div>
                    At least one number
                </li>
                 <li class="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div class="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#230052] dark:bg-white shrink-0"></div>
                    At least one special character
                </li>
            </ul>
        </div>

         <div class="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.05] space-y-3">
            <h4 class="text-slate-900 dark:text-white font-bold flex items-center gap-2 text-sm Cap">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                Security Tip
            </h4>
            <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Regularly updating your password helps protect your academic records and personal information from unauthorized access.
            </p>
        </div>
      `;
      gridContainer.appendChild(infoColumn);

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
      <main className="relative z-10 mx-auto flex w-full max-w-[1680px] flex-col gap-7 px-4 py-6 font-sans sm:px-6 lg:px-8 lg:py-8">
        <header className="space-y-1"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80">Settings</p><h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Change password</h1><p className="text-sm text-white/80">Update your FLEX account password and review security guidance.</p></header>
        {alerts.length > 0 && <NotificationBanner alerts={alerts} />}
        {elemContent ? (
          <div
            className="mx-auto w-full max-w-[1080px] animate-in fade-in duration-500"
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
