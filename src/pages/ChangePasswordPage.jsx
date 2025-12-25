import React, { useEffect, useState } from "react";
import PageLayout from "../components/layouts/PageLayout";
import NotificationBanner from "../components/ui/NotificationBanner";
import PageHeader from "../components/ui/PageHeader";
import {
  ShieldCheck,
  Check,
  KeyRound,
  Lock,
  AlertTriangle,
} from "lucide-react";

function ChangePasswordPage() {
  const [elemContent, setElemContent] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const parse = () => {
      const targetElement = document.querySelector(
        ".m-grid.m-grid--hor.m-grid--root.m-page",
      );

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
          .querySelectorAll(
            ".m-alert__close, button, a, strong, .m-alert__icon",
          )
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
        "!bg-zinc-900/40",
        "!backdrop-blur-2xl",
        "!border",
        "!border-white/5",
        "!rounded-[2.5rem]",
        "!p-8",
      );

      portlet.classList.remove(
        "m-portlet--primary",
        "m-portlet--head-solid-bg",
        "m-portlet--bordered",
        "m-portlet--head-sm",
        "m-portlet",
      );
    }

    const portletHead = element.querySelector(".m-portlet__head");
    if (portletHead) {
      portletHead.style.display = "none";
    }

    const portletBody = element.querySelector(".m-portlet__body");
    if (portletBody) {
      portletBody.classList.add("!p-0", "!text-zinc-300", "bg-transparent");
    }

    const legacyButtons = element.querySelectorAll("#success, #error");
    legacyButtons.forEach((btn) => btn.remove());

    const form = element.querySelector("#ChangePassword");
    if (form) {
      const gridContainer = document.createElement("div");
      gridContainer.className =
        "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24";

      const formColumn = document.createElement("div");
      formColumn.className = "space-y-8";

      const headerDiv = document.createElement("div");
      headerDiv.className = "space-y-2";
      headerDiv.innerHTML = `
          <h3 class="text-xl font-bold text-white flex items-center gap-3">
              <div class="p-2 rounded-lg bg-[#a098ff]/10 text-[#a098ff]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              Update Password
          </h3>
          <p class="text-sm text-zinc-400">Ensure your account is using a strong, unique password.</p>
      `;
      formColumn.appendChild(headerDiv);

      const inputsContainer = document.createElement("div");
      inputsContainer.classList.add("flex", "flex-col", "gap-5", "w-full");

      const formRows = form.querySelectorAll(".form-group.m-form__group.row");
      const extractedInputs = [];

      formRows.forEach((row) => {
        const inputContainer = row.querySelector(".m-input-icon");
        const label = row.querySelector("label");

        if (inputContainer) {
          const iconSpans = inputContainer.querySelectorAll(
            ".m-input-icon__icon",
          );
          iconSpans.forEach((span) => span.remove());

          const input = inputContainer.querySelector("input");
          if (input) {
            const clonedInput = input.cloneNode(true);

            clonedInput.classList.add(
              "!bg-white/5",
              "!text-white",
              "!border",
              "!border-white/10",
              "!rounded-xl",
              "!p-4",
              "!px-4",
              "!transition-all",
              "!duration-300",
              "!focus:border-[#a098ff]/50",
              "!focus:ring-4",
              "!focus:ring-[#a098ff]/10",
              "!focus:outline-none",
              "!w-full",
              "!h-[50px]",
              "!font-medium",
              "!placeholder-white/20",
            );

            clonedInput.classList.remove(
              "m-input--pill",
              "m-input--air",
              "form-control",
              "m-input",
            );
            if (clonedInput.hasAttribute("style"))
              clonedInput.removeAttribute("style");

            const inputWrapper = document.createElement("div");
            inputWrapper.classList.add("relative", "w-full", "group");

            const labelText = label ? label.textContent.trim() : "Input";
            const labelElem = document.createElement("label");
            labelElem.textContent = labelText;
            labelElem.classList.add(
              "text-xs",
              "font-bold",
              "text-zinc-400",
              "mb-2",
              "uppercase",
              "tracking-wider",
              "ml-1",
              "block",
            );

            inputWrapper.appendChild(labelElem);
            inputWrapper.appendChild(clonedInput);

            const errorMsg = row.querySelector(".matcherror");
            if (errorMsg) {
              const errorMsgClone = errorMsg.cloneNode(true);
              errorMsgClone.classList.add(
                "!text-rose-400",
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
        clonedBtnRow
          .querySelectorAll(".col-lg-12")
          .forEach((col) => (col.className = "w-full"));

        const submitButton = clonedBtnRow.querySelector("button#submit");
        if (submitButton) {
          submitButton.innerHTML = "";

          const iconStr = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;

          const buttonContent = document.createElement("span");
          buttonContent.className = "flex items-center justify-center";
          buttonContent.innerHTML = iconStr + "Update Password";

          submitButton.appendChild(buttonContent);

          submitButton.classList.add(
            "!bg-[#a098ff]",
            "hover:!bg-[#8f86ff]",
            "!text-white",
            "!font-bold",
            "!py-4",
            "!px-8",
            "!rounded-xl",
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

      form
        .querySelectorAll('[data-to-remove="true"]')
        .forEach((row) => row.remove());

      gridContainer.appendChild(formColumn);

      const infoColumn = document.createElement("div");
      infoColumn.className = "flex flex-col gap-6";
      infoColumn.innerHTML = `
        <div class="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4">
            <h4 class="text-white font-bold flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                Password Requirements
            </h4>
            <ul class="space-y-3">
                <li class="flex items-start gap-3 text-sm text-zinc-400">
                    <div class="mt-1 w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0"></div>
                    Minimum 8 characters long
                </li>
                 <li class="flex items-start gap-3 text-sm text-zinc-400">
                    <div class="mt-1 w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0"></div>
                    At least one uppercase letter
                </li>
                 <li class="flex items-start gap-3 text-sm text-zinc-400">
                    <div class="mt-1 w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0"></div>
                    At least one number
                </li>
                 <li class="flex items-start gap-3 text-sm text-zinc-400">
                    <div class="mt-1 w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0"></div>
                    At least one special character
                </li>
            </ul>
        </div>

         <div class="p-6 rounded-2xl bg-[#a098ff]/5 border border-[#a098ff]/10 space-y-3">
            <h4 class="text-[#a098ff] font-bold flex items-center gap-2 text-sm uppercase tracking-wide">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                Security Tip
            </h4>
            <p class="text-sm text-zinc-400 leading-relaxed">
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
        element.classList.add(
          "!text-rose-400",
          "!mt-2",
          "!text-xs",
          "!font-medium",
        );
      });
    }
  };

  return (
    <PageLayout currentPage={window.location.pathname}>
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#a098ff]/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none z-0"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none z-0"></div>

      <div className="w-full p-4 md:p-8 space-y-10 relative z-10">
        <PageHeader
          title="Security Settings"
          subtitle="Manage your account password and authentication"
        />
        <NotificationBanner alerts={alerts} />
        {elemContent ? (
          <div
            className="m-grid m-grid--hor m-grid--root m-page animate-in fade-in duration-500"
            dangerouslySetInnerHTML={{ __html: elemContent }}
          />
        ) : (
          <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#a098ff]"></div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default ChangePasswordPage;
