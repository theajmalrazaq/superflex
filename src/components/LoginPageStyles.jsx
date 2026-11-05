import { useEffect, useState } from "react";
import "../styles/login.css";
import { getExtensionUrl, getExtensionVersion } from "../utils/extensionApi";
import { LoginSkeleton } from "./ui/Skeleton";

function LoginPageStyles() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    localStorage.removeItem("superflex_ai_messages");

    // Keep the reference palette while giving sign-in a product-specific layout.
    document.body.classList.add("superflex-login-page");
    document.body.classList.add("!min-h-screen", "!overflow-x-hidden");
    document.body.style.color = "#101010";

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

    // Let the login shell manage its own full-height spacing.
    const mainContainer = document.querySelector(".m-stack__item.m-stack__item--fluid");
    if (mainContainer) {
      mainContainer.classList.add(
        "!flex",
        "!flex-col",
        "!items-center",
        "!justify-start",
        "!min-h-screen",
        "!w-full",
        "!bg-transparent",
        "!relative",
        "!z-[50]",
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
      );
    });

    // Form inputs spacing & layout
    document
      .querySelectorAll(".m-login__signin .form-group, .m-login__form .form-group")
      .forEach((group) => {
        group.classList.add("!w-full", "!p-0");
      });

    document
      .querySelectorAll(".input-group.m-input-group.m-input-group--square, .input-group")
      .forEach((element) => {
        element.classList.add("!flex", "!flex-col", "!gap-1.5", "!w-full");
      });

    document
      .querySelectorAll(
        ".input-group label, .m-form__label, .form-group label, .input-group h5, h5",
      )
      .forEach((label) => {
        label.classList.add(
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
        "!placeholder:font-normal",
        "!placeholder:text-sm",
        "!h-[52px]",
        "!px-6",
        "!w-full",
        "!text-sm",
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
      formActions.classList.add("!p-0", "!w-full", "!flex", "!flex-col", "!items-center");
    }

    // Primary action: colors live in login.css so dark mode can switch to a white pill.
    const loginButtonObservers = [];
    document.querySelectorAll(".btn-primary").forEach((button) => {
      button.classList.add(
        "login-primary-btn",
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

      const isLoginSubmit = button.closest(".m-login__signin") !== null;
      const originalContent = button.innerHTML;
      const loginForm = isLoginSubmit ? button.closest("form") : null;
      let isSubmitting = false;
      let loadingStartedAt = 0;
      let resetTimer;

      const updateLoginButtonState = () => {
        if (!isLoginSubmit || isSubmitting) return;
        const username = loginForm?.querySelector('input[name="username"], #m_inputmask_4');
        const password = loginForm?.querySelector('input[name="password"], #pass');
        const canSubmit = Boolean(username?.value.trim() && password?.value.trim());
        button.disabled = !canSubmit;
        button.setAttribute("aria-disabled", String(!canSubmit));
      };

      if (isLoginSubmit) {
        loginForm?.addEventListener("input", updateLoginButtonState);
        loginForm?.addEventListener("change", updateLoginButtonState);
        loginForm?.addEventListener("keyup", updateLoginButtonState);
        updateLoginButtonState();
        setTimeout(updateLoginButtonState, 0);
        setTimeout(updateLoginButtonState, 500);
      }

      const resetLoginButton = () => {
        clearTimeout(resetTimer);
        isSubmitting = false;
        button.innerHTML = originalContent;
        button.classList.remove("superflex-login-submitting");
        updateLoginButtonState();
      };

      const scheduleLoginButtonReset = () => {
        clearTimeout(resetTimer);
        const remaining = Math.max(0, 800 - (performance.now() - loadingStartedAt));
        resetTimer = setTimeout(() => {
          if (isSubmitting && !button.classList.contains("m-loader") && !button.disabled) {
            resetLoginButton();
          }
        }, remaining);
      };

      if (isLoginSubmit) {
        const loginButtonObserver = new MutationObserver(() => {
          if (isSubmitting && !button.classList.contains("m-loader") && !button.disabled) {
            scheduleLoginButtonReset();
          }
        });
        loginButtonObserver.observe(button, {
          attributes: true,
          attributeFilter: ["class", "disabled"],
        });
        loginButtonObservers.push(loginButtonObserver);
      }

      button.addEventListener(
        "click",
        () => {
          if (!isLoginSubmit || button.disabled || isSubmitting) return;
          isSubmitting = true;
          loadingStartedAt = performance.now();
          button.innerHTML = `
            <div class="flex items-center justify-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <span>Logging in...</span>
            </div>
          `;
          button.classList.add("superflex-login-submitting");
        },
        { capture: true },
      );
    });

    const signInIcon = document.querySelector(".la-sign-in");
    if (signInIcon) signInIcon.remove();

    const logintitle = document.querySelector(".m-login__title");
    if (logintitle) {
      logintitle.style.display = "none";
    }

    // Centered white login card over the sky-to-white page background.
    const bglogin = document.querySelector(".m-login__signin");
    if (bglogin) {
      bglogin.classList.add(
        "!shadow-none",
        "!border-none",
        "!flex",
        "!flex-col",
        "!w-full",
        "!relative",
        "!z-[50]",
        "!text-slate-900",
        "!transition-all",
        "!duration-300",
      );
      bglogin.setAttribute("id", "login-popup");
      bglogin.style.setProperty("background", "var(--login-card-bg)", "important");
      bglogin.style.setProperty("border-radius", "32px", "important");
      bglogin.style.setProperty(
        "padding",
        "clamp(14px, 3dvh, 28px) clamp(20px, 3vw, 32px)",
        "important",
      );
      bglogin.style.setProperty("width", "min(480px, calc(100% - 32px))", "important");
      bglogin.style.setProperty("max-width", "480px", "important");
      bglogin.style.setProperty("height", "auto", "important");
      bglogin.style.setProperty("min-height", "0", "important");

      const existingHeader = bglogin.querySelector(".login-header");
      if (existingHeader) existingHeader.remove();

      // Card header: use the same black and purple mark as the extension favicon.
      const header = document.createElement("div");
      header.className = "login-header w-full text-left mb-6";
      header.innerHTML = `
        <!-- Superflex favicon: black squircle with a purple lightning bolt -->
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 select-none">
          <svg class="login-mark" viewBox="0 0 432 432" aria-hidden="true" focusable="false">
            <path d="M247.227 185.616L282.286 69L133 216L186.861 231.146L133 363L298 208.65L247.227 185.616Z" />
          </svg>
        </div>

        <!-- Headline & Subtitle -->
        <h1 class="text-[30px] sm:text-[34px] font-black text-slate-900 tracking-tight leading-[1.14] mb-2.5">
          Superflex
        </h1>
        <p class="text-slate-500 text-xs sm:text-[13px] font-normal leading-relaxed">
         Aaja bhai, trauma tera wait kar raha hai 😭
        </p>
      `;
      bglogin.insertBefore(header, bglogin.firstChild);
    }

    // Reset uses the same card shell and header positions as sign-in.
    const forgotPasswordSection = document.querySelector(".m-login__forget-password");
    if (forgotPasswordSection) {
      forgotPasswordSection.classList.add(
        "!border-none",
        "!shadow-none",
        "!flex",
        "!flex-col",
        "!w-full",
        "!hidden",
        "!relative",
        "!z-[50]",
        "!text-slate-900",
        "!transition-all",
        "!duration-300",
      );
      forgotPasswordSection.setAttribute("id", "forgot-password-popup");
      forgotPasswordSection.style.setProperty("background", "var(--login-card-bg)", "important");
      forgotPasswordSection.style.setProperty("border-radius", "32px", "important");
      forgotPasswordSection.style.setProperty(
        "padding",
        "clamp(14px, 3dvh, 28px) clamp(20px, 3vw, 32px)",
        "important",
      );
      forgotPasswordSection.style.setProperty(
        "width",
        "min(480px, calc(100% - 32px))",
        "important",
      );
      forgotPasswordSection.style.setProperty("max-width", "480px", "important");
      forgotPasswordSection.style.setProperty(
        "height",
        "var(--login-card-height, auto)",
        "important",
      );

      const forgotHead = forgotPasswordSection.querySelector(".m-login__head");
      if (forgotHead) {
        forgotHead.classList.add("!w-full");
        forgotHead.querySelector(".forgot-badge")?.remove();
      }

      const forgotTitle = forgotPasswordSection.querySelector(".m-login__title");
      if (forgotTitle) {
        forgotTitle.style.display = "block";
        forgotTitle.textContent = "Forgot your password?";
        if (!forgotPasswordSection.querySelector(".forgot-password-mark")) {
          const mark = document.createElement("div");
          mark.className = "forgot-password-mark";
          mark.setAttribute("aria-hidden", "true");
          mark.innerHTML = `
            <svg viewBox="0 0 432 432" focusable="false">
              <path d="M247.227 185.616L282.286 69L133 216L186.861 231.146L133 363L298 208.65L247.227 185.616Z" />
            </svg>
          `;
          forgotTitle.parentNode.insertBefore(mark, forgotTitle);
        }
      }

      const forgotDesc = forgotPasswordSection.querySelector(".m-login__desc");
      if (forgotDesc) {
        forgotDesc.textContent =
          "Enter the email linked to your FLEX account to receive reset instructions.";
      }

      const forgotForm = forgotPasswordSection.querySelector(".m-login__form");
      if (forgotForm) {
        forgotForm.classList.add("!flex", "!flex-col", "!w-full");
      }

      const emailInputGroup = forgotPasswordSection.querySelector(".m-input-icon");
      if (emailInputGroup) {
        emailInputGroup.classList.add("!w-full");
        const emailInput = emailInputGroup.querySelector("input");
        if (emailInput && !forgotForm?.querySelector("label")) {
          if (!emailInput.id) emailInput.id = "superflex-reset-email";
          const emailLabel = document.createElement("label");
          emailLabel.className = "forgot-email-label";
          emailLabel.htmlFor = emailInput.id;
          emailLabel.textContent = "FLEX email";
          emailInputGroup.parentNode.insertBefore(emailLabel, emailInputGroup);
        }
      }

      const forgotFormAction = forgotPasswordSection.querySelector(".m-login__form-action");
      if (forgotFormAction) {
        forgotFormAction.classList.add("!flex", "!flex-col", "!w-full");
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
        cancelButton.type = "button";
        cancelButton.className = "forgot-back-button";
        cancelButton.removeAttribute("style");
        cancelButton.setAttribute("aria-label", "Back to sign in");
        cancelButton.title = "Back to sign in";
        cancelButton.innerHTML = `
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M5 12h14" />
          </svg>
        `;
        const forgotHead = forgotPasswordSection.querySelector(".m-login__head");
        forgotHead?.insertBefore(cancelButton, forgotHead.firstChild);
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
          "login-primary-btn",
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

    // Remove the previous all-screen decorative background when navigating back to login.
    const rightImage = document.getElementById("login-background-image");
    if (rightImage) rightImage.remove();

    // Real cloud sprites in the sky half of the page (behind the card, non-interactive).
    document.getElementById("login-clouds")?.remove();
    const cloudLayer = document.createElement("div");
    cloudLayer.id = "login-clouds";
    cloudLayer.className = "login-clouds";
    cloudLayer.setAttribute("aria-hidden", "true");
    cloudLayer.innerHTML = `
      <img class="login-cloud-right" src="${getExtensionUrl("assets/clouds/cloud-2.webp")}" alt="" decoding="async" />
      <img class="login-cloud-left" src="${getExtensionUrl("assets/clouds/cloud-2.webp")}" alt="" decoding="async" />
    `;
    document.body.prepend(cloudLayer);

    const CURRENT_VERSION = getExtensionVersion("6.0.0");

    // Keep only the useful links below the card.
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
      <a href="https://github.com/theajmalrazaq/superflex" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-sm border border-white/20 text-[11px] font-semibold text-white transition-all shadow-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12 2 3.09 6.26 6.91 1.01-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/>
        </svg>
        Star on GitHub
      </a>
      <button type="button" class="login-theme-toggle" aria-label="Switch to dark mode" title="Switch to dark mode">
        <span class="login-theme-icon" aria-hidden="true"></span>
        <span class="login-theme-label">Dark mode</span>
      </button>
    `;

    const themeToggle = footerWrapper.querySelector(".login-theme-toggle");
    const applyLoginTheme = (mode) => {
      const isDark = mode === "dark";
      document.documentElement.dataset.superflexTheme = isDark ? "dark" : "light";
      document.body.classList.toggle("superflex-login-dark", isDark);
      document.documentElement.classList.toggle("dark", isDark);
      document
        .querySelectorAll(
          "#login-popup label, #login-popup h5, #forgot-password-popup label, #forgot-password-popup h5",
        )
        .forEach((label) => {
          if (isDark) {
            label.style.setProperty("color", "#fff", "important");
          } else {
            label.style.removeProperty("color");
          }
        });
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
      themeToggle.title = `Switch to ${isDark ? "light" : "dark"} mode`;
      themeToggle.querySelector(".login-theme-label").textContent = isDark
        ? "Dark mode"
        : "Light mode";
      themeToggle.querySelector(".login-theme-icon").innerHTML = isDark
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.985 12.486A9 9 0 1 1 11.514 3.015a7 7 0 0 0 9.471 9.471Z"/></svg>`;
      document.dispatchEvent(new CustomEvent("superflex-theme-mode-changed", { detail: mode }));
    };
    applyLoginTheme(localStorage.getItem("superflex-theme-mode") || "light");
    themeToggle.addEventListener("click", () => {
      const nextMode = document.body.classList.contains("superflex-login-dark") ? "light" : "dark";
      localStorage.setItem("superflex-theme-mode", nextMode);
      applyLoginTheme(nextMode);
    });

    const versionPill = document.createElement("a");
    versionPill.className = "login-version-pill";
    versionPill.href = "https://theajmalrazaq.github.io/superflex";
    versionPill.target = "_blank";
    versionPill.rel = "noopener noreferrer";
    const versionChip = document.createElement("span");
    versionChip.className = "login-version-chip";
    versionChip.innerHTML = `
      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#a098ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    `;
    versionChip.append(`v${CURRENT_VERSION}`);
    const versionStatus = document.createElement("span");
    versionStatus.className = "login-version-status";
    versionStatus.textContent = "SuperFlex Active";
    versionPill.append(versionChip, versionStatus);

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
            versionStatus.textContent = `New Update Available: v${latestVer}`;
            versionPill.classList.add("has-update");
            versionPill.href =
              data.html_url || "https://github.com/theajmalrazaq/superflex/releases/latest";
          }
        }
      } catch (error) {
        console.error("Error checking for updates:", error);
      }
    };

    const cardWrapper = bglogin?.parentNode;
    if (cardWrapper) {
      const wrapper = cardWrapper;

      const existingOuterHeader = wrapper.querySelector(".login-outer-header");
      if (existingOuterHeader) existingOuterHeader.remove();

      const existingOuterFooter = wrapper.querySelector(".login-outer-footer");
      if (existingOuterFooter) existingOuterFooter.remove();

      const existingVersionPill = wrapper.querySelector(".login-version-pill");
      if (existingVersionPill) existingVersionPill.remove();

      const existingUpdateNotice = wrapper.querySelector(".login-update-notice");
      if (existingUpdateNotice) existingUpdateNotice.remove();

      const existingHero = wrapper.querySelector(".hero-section-injected");
      if (existingHero) existingHero.remove();

      wrapper.insertBefore(versionPill, bglogin);
      wrapper.appendChild(footerWrapper);
    }

    checkForUpdates();

    const loginHeader = bglogin?.querySelector(".login-header");
    const syncCardMeasurements = () => {
      if (!cardWrapper || !bglogin || bglogin.classList.contains("!hidden")) return;
      const cardRect = bglogin.getBoundingClientRect();
      const cardHeight = cardRect.height;
      const headerHeight = loginHeader?.getBoundingClientRect().height || 0;
      if (cardHeight > 0) cardWrapper.style.setProperty("--login-card-height", `${cardHeight}px`);
      if (headerHeight > 0)
        cardWrapper.style.setProperty("--login-header-height", `${headerHeight}px`);
      const signInButton = bglogin.querySelector(".btn-primary");
      if (signInButton) {
        const bottomPadding = Number.parseFloat(getComputedStyle(bglogin).paddingBottom) || 0;
        const trailingSpace = Math.max(
          0,
          cardRect.bottom - signInButton.getBoundingClientRect().bottom - bottomPadding,
        );
        cardWrapper.style.setProperty("--login-action-trailing-space", `${trailingSpace}px`);
      }
    };
    syncCardMeasurements();
    const cardResizeObserver = new ResizeObserver(syncCardMeasurements);
    if (bglogin) cardResizeObserver.observe(bglogin);
    if (loginHeader) cardResizeObserver.observe(loginHeader);

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
      input.classList.add("login-password-input");

      const toggleButton = document.createElement("button");
      toggleButton.type = "button";
      toggleButton.className = "login-password-toggle";
      toggleButton.setAttribute("aria-label", "Show password");
      toggleButton.setAttribute("aria-pressed", "false");

      const icon = document.createElement("span");
      const eyeIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>`;
      const eyeOffIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m3 3 18 18"/>
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
          <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c7 0 10 7 10 7a16 16 0 0 1-4.1 4.9"/>
          <path d="M6.2 6.2C3.5 8 2 12 2 12s3 7 10 7a10 10 0 0 0 3-.5"/>
        </svg>`;
      icon.innerHTML = input.type === "password" ? eyeOffIcon : eyeIcon;
      toggleButton.appendChild(icon);

      const inputGroup = input.closest(".input-group") || input.parentElement;
      if (inputGroup) {
        inputGroup.style.position = "relative";
        inputGroup.appendChild(toggleButton);

        toggleButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const type = input.getAttribute("type") === "password" ? "text" : "password";
          input.setAttribute("type", type);
          const isVisible = type === "text";
          toggleButton.setAttribute("aria-label", isVisible ? "Hide password" : "Show password");
          toggleButton.setAttribute("aria-pressed", String(isVisible));

          icon.innerHTML = isVisible ? eyeIcon : eyeOffIcon;
        });
      }
    });

    const readyFrame = requestAnimationFrame(() => setReady(true));

    return () => {
      cancelAnimationFrame(readyFrame);
      loginButtonObservers.forEach((observer) => observer.disconnect());
      cardResizeObserver.disconnect();
      cloudLayer.remove();
      cardWrapper?.style.removeProperty("--login-card-height");
      cardWrapper?.style.removeProperty("--login-header-height");
      cardWrapper?.style.removeProperty("--login-action-trailing-space");
      document.body.classList.remove("superflex-login-page");
      document.body.classList.remove("superflex-login-dark");
      delete document.documentElement.dataset.superflexTheme;
      document.body.classList.remove("!min-h-screen", "!overflow-x-hidden");
      document.body.style.background = "";
      document.body.style.color = "";
      if (rightImage && rightImage.parentNode) {
        rightImage.remove();
      }
      if (footerWrapper && footerWrapper.parentNode) {
        footerWrapper.remove();
      }
      versionPill.remove();
    };
  }, []);

  return ready ? null : <LoginSkeleton />;
}

export default LoginPageStyles;
