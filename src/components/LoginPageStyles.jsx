import { useEffect } from "react";

function LoginPageStyles() {
  useEffect(() => {
    localStorage.removeItem("superflex_ai_messages");

    // Full screen clean sky-blue vertical gradient background matching screenshot aesthetic
    document.body.classList.add("!min-h-screen", "!overflow-x-hidden");
    document.body.style.background =
      "linear-gradient(180deg, #3b8fe6 0%, #6cb3ed 32%, #a8d5f6 68%, #dceefb 100%)";
    document.body.style.color = "#ffffff";

    document
      .querySelectorAll(
        ".m-grid.m-grid--hor:not(.m-grid--desktop):not(.m-grid--desktop-and-tablet):not(.m-grid--tablet):not(.m-grid--tablet-and-mobile):not(.m-grid--mobile) > .m-grid__item.m-grid__item--fluid",
      )
      .forEach((element) => {
        element.classList.add("!justify-center", "!w-full");
      });

    document
      .querySelectorAll(
        ".m-grid.m-grid--ver-desktop.m-grid--desktop > .m-grid__item.m-grid__item--fluid",
      )
      .forEach((element) => {
        element.classList.add("!hidden", "!w-full");
      });

    document.querySelectorAll(".m-login__form-sub").forEach((element) => {
      element.remove();
    });

    const aside = document.querySelector(
      ".m-grid__item.m-grid__item--order-tablet-and-mobile-2.m-login__aside",
    );
    if (aside) {
      aside.classList.add("!w-full", "!p-0");
    }

    // Main viewport container: perfectly centered with generous atmospheric breathing room
    const mainContainer = document.querySelector(".m-stack__item.m-stack__item--fluid");
    if (mainContainer) {
      mainContainer.classList.add(
        "!flex",
        "!flex-col",
        "!items-center",
        "!justify-center",
        "!min-h-screen",
        "!w-full",
        "!bg-transparent",
        "!relative",
        "!z-[50]",
        "!py-8",
        "!px-4",
      );
    }

    document.querySelectorAll(".m-login__wrapper").forEach((element) => {
      element.classList.add(
        "!flex",
        "!flex-col",
        "!items-center",
        "!justify-center",
        "!w-full",
        "!max-w-full",
        "!p-0",
      );
    });

    // Form inputs spacing & layout
    document
      .querySelectorAll(".m-login__signin .form-group, .m-login__form .form-group")
      .forEach((group) => {
        group.classList.add("!mb-4", "!w-full", "!p-0");
      });

    document
      .querySelectorAll(".input-group.m-input-group.m-input-group--square, .input-group")
      .forEach((element) => {
        element.classList.add("!flex", "!flex-col", "!gap-1.5", "!w-full", "!mb-4");
      });

    document
      .querySelectorAll(
        ".input-group label, .m-form__label, .form-group label, .input-group h5, h5",
      )
      .forEach((label) => {
        label.classList.add(
          "!text-slate-700",
          "!font-bold",
          "!text-[11px]",
          "!tracking-wider",
          "!uppercase",
          "!ml-4",
          "!mb-1",
        );
      });

    document.querySelectorAll(".input-group-addon").forEach((element) => {
      element.remove();
    });

    // Pill Inputs: Clean, flat, border-focused pills without glow rings or shadows
    document.querySelectorAll(".form-control.m-input").forEach((element) => {
      element.classList.add(
        "!rounded-full",
        "!bg-[#f8f9fa]",
        "!border",
        "!border-slate-200",
        "!text-slate-900",
        "!placeholder:text-slate-400",
        "!placeholder:font-normal",
        "!placeholder:text-sm",
        "!h-[52px]",
        "!px-6",
        "!w-full",
        "!text-sm",
        "focus:!border-[#1e0838]",
        "focus:!bg-white",
        "focus:!outline-none",
        "focus:!ring-0",
        "!transition-colors",
        "!duration-200",
        "!shadow-none",
      );
      element.style.fontFamily = "'Google Sans Flex', sans-serif";
    });

    const formHelp = document.querySelector(".m-form__help");
    if (formHelp) formHelp.classList.add("!text-slate-400", "!text-xs", "!ml-4");

    const errorFeedback = document.querySelector("#m_inputmask_4-error");
    if (errorFeedback) {
      errorFeedback.classList.add("!text-rose-500", "!text-xs", "!font-medium", "!ml-4", "!mt-1");
    }

    document.querySelectorAll(".m-login.m-login--1").forEach((element) => {
      element.classList.add("!bg-transparent", "!text-slate-900");
    });

    const oldLogo = document.querySelector(".m-login__logo");
    if (oldLogo) oldLogo.remove();

    // Form actions container
    const formActions = document.querySelector(".m-form__actions");
    if (formActions) {
      formActions.classList.add("!p-0", "!mt-5", "!w-full", "!flex", "!flex-col", "!items-center");
    }

    // Primary action submit button: Deep midnight purple pill with white arrow, flat with no shadow
    document.querySelectorAll(".btn-primary").forEach((button) => {
      button.classList.add(
        "!bg-[#1e0838]",
        "hover:!bg-[#2a0c4f]",
        "!text-white",
        "!cursor-pointer",
        "!border-none",
        "!rounded-full",
        "!w-full",
        "!h-[52px]",
        "!px-7",
        "!py-3",
        "!text-center",
        "!flex",
        "justify-center",
        "items-center",
        "!gap-3",
        "!font-bold",
        "!text-sm",
        "!shadow-none",
        "active:!scale-[0.98]",
        "!transition-all",
        "!duration-200",
      );
      button.style.fontFamily = "'Google Sans Flex', sans-serif";

      // Render the white right arrow icon matching reference image
      button.innerHTML = `
        <span>Sign In</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform group-hover:translate-x-0.5">
          <path d="M5 12h14"/>
          <path d="m12 5 7 7-7 7"/>
        </svg>
      `;

      button.addEventListener("click", () => {
        if (!button.querySelector(".animate-spin")) {
          const originalContent = button.innerHTML;
          button.innerHTML = `
            <div class="flex items-center justify-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <span>Please wait...</span>
            </div>
          `;
          button.classList.add("!opacity-80", "!pointer-events-none");

          setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove("!opacity-80", "!pointer-events-none");
          }, 3000);
        }
      });
    });

    const signInIcon = document.querySelector(".la-sign-in");
    if (signInIcon) signInIcon.remove();

    const logintitle = document.querySelector(".m-login__title");
    if (logintitle) {
      logintitle.style.display = "none";
    }

    // Direct Login Card: Crisp solid white card directly visible in center, completely flat with no shadow or glow
    const bglogin = document.querySelector(".m-login__signin");
    if (bglogin) {
      bglogin.classList.add(
        "!bg-white",
        "!p-8",
        "sm:!p-10",
        "!rounded-[32px]",
        "sm:!rounded-[36px]",
        "!shadow-none",
        "!border-none",
        "!flex",
        "!flex-col",
        "!w-full",
        "!max-w-[420px]",
        "!relative",
        "!z-[50]",
        "!text-slate-900",
        "!transition-all",
        "!duration-300",
      );
      bglogin.setAttribute("id", "login-popup");

      const existingHeader = bglogin.querySelector(".login-header");
      if (existingHeader) existingHeader.remove();

      // Card Header: Pastel lilac squircle logo badge + typography with critical spacing
      const header = document.createElement("div");
      header.className = "login-header w-full text-left mb-6";
      header.innerHTML = `
        <!-- Pastel Lavender Squircle Logo Badge with SuperFlex Favicon Logo (Flat, No Shadow) -->
        <div class="w-12 h-12 rounded-2xl bg-[#e9ddff] flex items-center justify-center mb-5 select-none">
          <svg viewBox="0 0 432 432" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M247.227 185.616L282.286 69L133 216L186.861 231.146L133 363L298 208.65L247.227 185.616Z" fill="#1e0838" />
          </svg>
        </div>

        <!-- Headline & Subtitle -->
        <h1 class="text-[30px] sm:text-[34px] font-black text-slate-900 tracking-tight leading-[1.14] mb-2.5">
          Your portal moves with you.
        </h1>
        <p class="text-slate-500 text-xs sm:text-[13px] font-normal leading-relaxed">
          A modern, intelligent overlay for Flex. Fast, clean, and built for Fastians.
        </p>
      `;
      bglogin.insertBefore(header, bglogin.firstChild);
    }

    // Forgot Password Card: Solid flat white card, no shadow, no glow
    const forgotPasswordSection = document.querySelector(".m-login__forget-password");
    if (forgotPasswordSection) {
      forgotPasswordSection.classList.add(
        "!bg-white",
        "!p-8",
        "sm:!p-10",
        "!rounded-[32px]",
        "sm:!rounded-[36px]",
        "!border-none",
        "!shadow-none",
        "!flex",
        "!flex-col",
        "!gap-5",
        "!w-full",
        "!max-w-[420px]",
        "!hidden",
        "!relative",
        "!z-[50]",
        "!text-slate-900",
        "!transition-all",
        "!duration-300",
      );
      forgotPasswordSection.setAttribute("id", "forgot-password-popup");

      const forgotHead = forgotPasswordSection.querySelector(".m-login__head");
      if (forgotHead) {
        forgotHead.classList.add("!flex", "!flex-col", "!gap-2", "!w-full");

        const existingForgotHeader = forgotHead.querySelector(".forgot-badge");
        if (!existingForgotHeader) {
          const forgotBadge = document.createElement("div");
          forgotBadge.className =
            "forgot-badge w-12 h-12 rounded-2xl bg-[#e9ddff] flex items-center justify-center mb-4 select-none";
          forgotBadge.innerHTML = `
            <svg viewBox="0 0 432 432" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M247.227 185.616L282.286 69L133 216L186.861 231.146L133 363L298 208.65L247.227 185.616Z" fill="#1e0838" />
            </svg>
          `;
          forgotHead.insertBefore(forgotBadge, forgotHead.firstChild);
        }
      }

      const forgotTitle = forgotPasswordSection.querySelector(".m-login__title");
      if (forgotTitle) {
        forgotTitle.style.display = "block";
        forgotTitle.classList.add(
          "!text-slate-900",
          "!text-2xl",
          "!font-black",
          "!tracking-tight",
          "!mb-0",
        );
        forgotTitle.textContent = "Forgot your password?";
      }

      const forgotDesc = forgotPasswordSection.querySelector(".m-login__desc");
      if (forgotDesc) {
        forgotDesc.classList.add("!text-slate-500", "!text-xs", "!leading-relaxed", "!mb-0");
        forgotDesc.textContent =
          "Enter your university email to receive password reset instructions.";
      }

      const forgotForm = forgotPasswordSection.querySelector(".m-login__form");
      if (forgotForm) {
        forgotForm.classList.add("!flex", "!flex-col", "!gap-4", "!w-full");
      }

      const emailInputGroup = forgotPasswordSection.querySelector(".m-input-icon");
      if (emailInputGroup) {
        emailInputGroup.classList.add("!w-full");
      }

      const forgotFormAction = forgotPasswordSection.querySelector(".m-login__form-action");
      if (forgotFormAction) {
        forgotFormAction.classList.add("!flex", "!flex-col", "!gap-3", "!w-full", "!mt-3");
      }
    }

    let forgotPasswordLink = document.querySelector('a[href*="ForgotPassword"]');
    if (!forgotPasswordLink) {
      forgotPasswordLink = document.createElement("a");
      forgotPasswordLink.href = "#";
      forgotPasswordLink.textContent = "Forgot Password?";
      forgotPasswordLink.classList.add(
        "!text-slate-400",
        "hover:!text-slate-700",
        "!text-xs",
        "!font-semibold",
        "!cursor-pointer",
        "!transition-colors",
        "!duration-200",
        "!mt-3.5",
        "!text-center",
        "!block",
      );

      const loginFormAction = document.querySelector(".m-login__signin .m-form__actions");
      if (loginFormAction) {
        loginFormAction.appendChild(forgotPasswordLink);
      }
    } else {
      forgotPasswordLink.classList.add(
        "!text-slate-400",
        "hover:!text-slate-700",
        "!text-xs",
        "!font-semibold",
        "!mt-3.5",
        "!text-center",
        "!block",
        "!cursor-pointer",
        "!transition-colors",
        "!duration-200",
      );
    }

    if (forgotPasswordLink && forgotPasswordSection) {
      forgotPasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (bglogin) {
          bglogin.classList.add("!hidden");
        }

        forgotPasswordSection.classList.remove("!hidden");
      });

      const cancelButton = forgotPasswordSection.querySelector("#m_login_forget_password_cancel");
      if (cancelButton) {
        cancelButton.classList.add(
          "!bg-[#e9ddff]",
          "hover:!bg-[#dfc8fc]",
          "!text-[#1e0838]",
          "!cursor-pointer",
          "!border-none",
          "!rounded-full",
          "!py-3",
          "!px-6",
          "!font-bold",
          "!text-xs",
          "!shadow-none",
          "!transition-all",
          "!w-full",
          "!h-[48px]",
        );
        cancelButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          forgotPasswordSection.classList.add("!hidden");
          if (bglogin) {
            bglogin.classList.remove("!hidden");
          }
        });
      }

      const requestButton =
        forgotPasswordSection.querySelector("#m_login_forget_password_submit") ||
        forgotPasswordSection.querySelector("button[type='submit']");
      if (requestButton) {
        requestButton.classList.add(
          "!bg-[#1e0838]",
          "hover:!bg-[#2a0c4f]",
          "!text-white",
          "!font-bold",
          "!text-sm",
          "cursor-pointer",
          "!rounded-full",
          "!py-3.5",
          "!px-7",
          "!shadow-none",
          "!transition-all",
          "!border-none",
          "!w-full",
          "!h-[52px]",
          "!flex",
          "!items-center",
          "!justify-center",
          "!gap-2",
        );
        requestButton.innerHTML = `
          <span>Request Reset Link</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/>
            <path d="m12 5 7 7-7 7"/>
          </svg>
        `;
      }

      const showToast = (message, type = "success") => {
        const toast = document.createElement("div");
        toast.className =
          "fixed bottom-10 left-1/2 -translate-x-1/2 z-[99999] px-6 py-3.5 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-bottom-10 duration-300 ease-out transition-all shadow-none";

        if (type === "success") {
          toast.classList.add("bg-white", "border-slate-200", "text-slate-900");
          toast.innerHTML = `
            <div class="p-1 rounded-full bg-emerald-50 text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <span class="text-xs font-semibold">${message}</span>
          `;
        } else {
          toast.classList.add("bg-white", "border-rose-200", "text-slate-900");
          toast.innerHTML = `
            <div class="p-1 rounded-full bg-rose-50 text-rose-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <span class="text-xs font-semibold">${message}</span>
          `;
        }

        document.body.appendChild(toast);

        setTimeout(() => {
          toast.classList.add("opacity-0", "translate-y-2");
          setTimeout(() => toast.remove(), 400);
        }, 4000);
      };

      if (requestButton) {
        requestButton.addEventListener("click", () => {
          const emailInput =
            forgotPasswordSection.querySelector("input[type='email']") ||
            forgotPasswordSection.querySelector("input[name='Email']");
          if (emailInput && emailInput.value.trim().length > 0) {
            const originalContent = requestButton.innerHTML;
            requestButton.innerHTML = `
              <div class="flex items-center justify-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <span>Sending...</span>
              </div>
            `;
            requestButton.classList.add("!opacity-80", "!pointer-events-none");

            setTimeout(() => {
              showToast("Password reset link sent to your email!");
              setTimeout(() => {
                if (cancelButton) cancelButton.click();

                requestButton.innerHTML = originalContent;
                requestButton.classList.remove("!opacity-80", "!pointer-events-none");
              }, 1500);
            }, 1000);
          }
        });
      }
    }

    // Atmospheric sky background container with photorealistic floating clouds
    let rightImage = document.getElementById("login-background-image");
    if (!rightImage) {
      rightImage = document.createElement("div");
      rightImage.id = "login-background-image";
      rightImage.className =
        "fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden select-none";
      rightImage.style.background =
        "linear-gradient(180deg, #3b8fe6 0%, #6cb3ed 32%, #a8d5f6 68%, #dceefb 100%)";

      // Atmospheric Cumulus Cloud Layers
      rightImage.innerHTML = `
        <!-- Top-Right Fluffy Cumulus Cloud Billow -->
        <svg viewBox="0 0 520 320" class="absolute -top-12 -right-14 w-[340px] sm:w-[500px] pointer-events-none select-none opacity-90" fill="none">
          <defs>
            <radialGradient id="cloud-puff-tr-1" cx="50%" cy="35%" r="55%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98" />
              <stop offset="65%" stop-color="#ffffff" stop-opacity="0.85" />
              <stop offset="90%" stop-color="#eaf4fd" stop-opacity="0.4" />
              <stop offset="100%" stop-color="#d9ebf9" stop-opacity="0" />
            </radialGradient>
            <radialGradient id="cloud-puff-tr-2" cx="45%" cy="30%" r="50%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
              <stop offset="70%" stop-color="#ffffff" stop-opacity="0.75" />
              <stop offset="100%" stop-color="#d9ebf9" stop-opacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="400" cy="110" rx="120" ry="85" fill="url(#cloud-puff-tr-1)" />
          <ellipse cx="300" cy="130" rx="95" ry="75" fill="url(#cloud-puff-tr-1)" />
          <ellipse cx="340" cy="85" rx="85" ry="65" fill="url(#cloud-puff-tr-1)" />
          <ellipse cx="230" cy="150" rx="80" ry="60" fill="url(#cloud-puff-tr-2)" />
          <ellipse cx="450" cy="165" rx="95" ry="70" fill="url(#cloud-puff-tr-1)" />
          <ellipse cx="350" cy="170" rx="130" ry="65" fill="url(#cloud-puff-tr-1)" />
          <ellipse cx="170" cy="170" rx="65" ry="45" fill="url(#cloud-puff-tr-2)" />
          <path d="M160 180 C 160 135, 210 120, 240 145 C 265 100, 325 90, 355 115 C 385 70, 460 80, 485 125 C 515 135, 530 170, 515 205 C 495 225, 170 225, 160 180 Z" fill="#ffffff" fill-opacity="0.75" />
        </svg>

        <!-- Mid-Left Floating Cumulus Cloud -->
        <svg viewBox="0 0 340 190" class="absolute top-20 sm:top-24 left-3 sm:left-12 w-[160px] sm:w-[240px] pointer-events-none select-none opacity-85" fill="none">
          <defs>
            <radialGradient id="cloud-puff-ml-1" cx="45%" cy="35%" r="55%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.96" />
              <stop offset="70%" stop-color="#ffffff" stop-opacity="0.75" />
              <stop offset="100%" stop-color="#ddedf9" stop-opacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="170" cy="100" rx="80" ry="48" fill="url(#cloud-puff-ml-1)" />
          <ellipse cx="125" cy="95" rx="60" ry="42" fill="url(#cloud-puff-ml-1)" />
          <ellipse cx="205" cy="90" rx="55" ry="40" fill="url(#cloud-puff-ml-1)" />
          <ellipse cx="160" cy="72" rx="48" ry="36" fill="url(#cloud-puff-ml-1)" />
          <ellipse cx="90" cy="110" rx="38" ry="28" fill="url(#cloud-puff-ml-1)" />
          <ellipse cx="240" cy="105" rx="42" ry="28" fill="url(#cloud-puff-ml-1)" />
          <path d="M85 115 C 85 90, 115 80, 135 90 C 150 65, 185 65, 200 80 C 220 75, 245 90, 245 110 C 245 130, 85 130, 85 115 Z" fill="#ffffff" fill-opacity="0.65" />
        </svg>
      `;
      document.body.appendChild(rightImage);
    }

    const CURRENT_VERSION = "6.0.0";

    // Clean, flat top badge styled identically to "USD 1 = PKR 275.12 Today" rate capsule
    const headerWrapper = document.createElement("div");
    headerWrapper.className =
      "login-outer-header flex flex-col items-center justify-center text-center w-full mb-6 relative z-10";
    headerWrapper.innerHTML = `
      <a href="https://theajmalrazaq.github.io/superflex" target="_blank" class="inline-block select-none">
        <div class="inline-flex items-center gap-2.5 p-1.5 pr-4 rounded-full bg-white/30 hover:bg-white/40 backdrop-blur-md border border-white/25 transition-all duration-200 cursor-pointer text-white shadow-none">
          <span class="bg-white text-[#1e0838] font-black text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-none">
            v${CURRENT_VERSION}
          </span>
          <span id="version-text" class="text-xs font-bold tracking-wide">
            SuperFlex Active
          </span>
        </div>
      </a>
    `;

    // Clean, flat bottom links matching reference UI secondary pills
    const footerWrapper = document.createElement("div");
    footerWrapper.className =
      "login-outer-footer flex items-center justify-center gap-3 text-center w-full mt-7 relative z-10 flex-wrap select-none";
    footerWrapper.innerHTML = `
      <a href="https://theajmalrazaq.github.io/superflex/docs.html?page=privacy" target="_blank" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-sm border border-white/20 text-[11px] font-semibold text-white transition-all shadow-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        Privacy Policy
      </a>
      <span class="text-white/40 text-xs">•</span>
      <a href="https://instagram.com/superflex.fr" target="_blank" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-sm border border-white/20 text-[11px] font-semibold text-white transition-all shadow-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
        Follow on Instagram
      </a>
    `;

    const checkForUpdates = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/repos/theajmalrazaq/superflex/releases/latest",
        );
        const data = await response.json();

        if (data.tag_name) {
          const latestVer = data.tag_name.replace(/^v/, "");

          const latestParts = latestVer.split(".").map(Number);
          const currentParts = CURRENT_VERSION.split(".").map(Number);
          let isNewer = false;

          for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
            const latestPart = latestParts[i] || 0;
            const currentPart = currentParts[i] || 0;
            if (latestPart > currentPart) {
              isNewer = true;
              break;
            }
            if (latestPart < currentPart) break;
          }

          if (isNewer) {
            const versionText = document.getElementById("version-text");
            if (versionText) {
              versionText.innerHTML = `New Update Available: v${latestVer}`;
            }
          }
        }
      } catch (error) {
        console.error("Error checking for updates:", error);
      }
    };

    checkForUpdates();

    if (bglogin && bglogin.parentNode) {
      const wrapper = bglogin.parentNode;

      const existingOuterHeader = wrapper.querySelector(".login-outer-header");
      if (existingOuterHeader) existingOuterHeader.remove();

      const existingOuterFooter = wrapper.querySelector(".login-outer-footer");
      if (existingOuterFooter) existingOuterFooter.remove();

      const existingHero = wrapper.querySelector(".hero-section-injected");
      if (existingHero) existingHero.remove();

      wrapper.insertBefore(headerWrapper, bglogin);
      wrapper.appendChild(footerWrapper);
    }

    const hasAcceptedTerms = localStorage.getItem("superflex_terms_accepted");

    if (!hasAcceptedTerms) {
      const termsModal = document.createElement("div");
      termsModal.id = "terms-modal";
      termsModal.className =
        "fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40";

      termsModal.innerHTML = `
        <div class="bg-white rounded-[32px] w-full max-w-lg max-h-[82vh] overflow-hidden flex flex-col text-slate-900 animate-in zoom-in-95 duration-200 shadow-none border-none">
          <!-- Header -->
          <div class="p-6 border-b border-slate-100 bg-slate-50/50">
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-2xl bg-[#e9ddff] flex items-center justify-center text-[#1e0838] select-none">
                <svg viewBox="0 0 432 432" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M247.227 185.616L282.286 69L133 216L186.861 231.146L133 363L298 208.65L247.227 185.616Z" fill="#1e0838" />
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-black text-slate-900">Terms & Conditions</h2>
                <p class="text-[10px] text-purple-700 font-bold uppercase tracking-wider">First Time Setup</p>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-3.5">
            <div class="space-y-3">
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 class="text-xs font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  Independent Project
                </h3>
                <p class="text-[11px] text-slate-600 leading-relaxed font-medium">
                  SuperFlex is an independent project that redesigns the Flex portal of NUCES university. This extension is <strong class="text-slate-900 font-bold">not affiliated with, endorsed by, or sponsored by</strong> NUCES university.
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 class="text-xs font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Security & Privacy
                </h3>
                <p class="text-[11px] text-slate-600 leading-relaxed font-medium">
                  This is a personal project intended to enhance the learning experience. SuperFlex <strong class="text-slate-900 font-bold">only applies cosmetic changes</strong> to the user interface without compromising any security measures or accessing unauthorized data. No hacking involved.
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 class="text-xs font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  User Responsibility
                </h3>
                <p class="text-[11px] text-slate-600 leading-relaxed font-medium">
                  You are using this extension at <strong class="text-slate-900 font-bold">your own consent and responsibility</strong>. The creator of SuperFlex is not responsible for any issues that may arise, including but not limited to academic discrepancies, data inaccuracies, or system incompatibilities.
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-[#f2ecfc]">
                <h3 class="text-xs font-bold text-[#1e0838] mb-1 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3h18v18H3zM21 9H3M9 21V9"/>
                  </svg>
                  Analytics
                </h3>
                <p class="text-[11px] text-slate-600 leading-relaxed font-medium">
                  We use <strong class="text-[#1e0838] font-bold">Umami Analytics</strong> to track usage patterns and improve the extension. No personal information, grades, or attendance data is collected. Only anonymous usage statistics.
                </p>
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p class="text-[11px] text-slate-600 leading-relaxed font-medium">
                By clicking <strong class="text-slate-900 font-bold">"Accept & Continue"</strong>, you acknowledge that you are using a third-party modification to the university's official system and do so at your own risk.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-6 border-t border-slate-100 bg-slate-50/50">
            <button id="terms-accept-btn" class="w-full bg-[#1e0838] hover:bg-[#2a0c4f] active:scale-[0.98] text-white border-none rounded-full py-3.5 px-6 font-bold text-sm transition-all cursor-pointer shadow-none">
              Accept & Continue
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(termsModal);

      document.getElementById("terms-accept-btn").addEventListener("click", () => {
        localStorage.setItem("superflex_terms_accepted", "true");
        termsModal.classList.add("opacity-0", "scale-95");
        setTimeout(() => termsModal.remove(), 200);
      });
    }

    const passwordInputs = document.querySelectorAll(
      '.m-input-icon--right input[type="password"], input[type="password"]',
    );
    passwordInputs.forEach((input) => {
      input.classList.add("!pr-14");

      const toggleButton = document.createElement("button");
      toggleButton.type = "button";

      const icon = document.createElement("span");
      icon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      `;
      toggleButton.appendChild(icon);

      toggleButton.classList.add(
        "absolute",
        "right-4",
        "top-1/2",
        "transform",
        "-translate-y-1/2",
        "text-slate-400",
        "hover:text-slate-700",
        "focus:outline-none",
        "z-10",
        "p-1",
        "flex",
        "items-center",
        "justify-center",
        "cursor-pointer",
      );

      const inputGroup = input.closest(".input-group") || input.parentElement;
      if (inputGroup) {
        inputGroup.style.position = "relative";
        inputGroup.appendChild(toggleButton);

        toggleButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const type = input.getAttribute("type") === "password" ? "text" : "password";
          input.setAttribute("type", type);

          icon.innerHTML =
            type === "password"
              ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>`
              : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="23" x2="23" y2="23"/>
              </svg>`;
        });
      }
    });

    return () => {
      document.body.classList.remove("!min-h-screen", "!overflow-x-hidden");
      document.body.style.background = "";
      document.body.style.color = "";
      if (rightImage && rightImage.parentNode) {
        rightImage.remove();
      }
      if (headerWrapper && headerWrapper.parentNode) {
        headerWrapper.remove();
      }
      if (footerWrapper && footerWrapper.parentNode) {
        footerWrapper.remove();
      }
    };
  }, []);

  return null;
}

export default LoginPageStyles;
