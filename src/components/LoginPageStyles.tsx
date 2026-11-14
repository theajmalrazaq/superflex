import { usePreferencesStore } from "../stores/preferencesStore";
import { useEffect, useState } from "react";
import "../styles/login.css";
import { getExtensionUrl, getExtensionVersion } from "../utils/extensionApi";
import { LoginSkeleton } from "./ui/Skeleton";
import {
  getDecryptedCredentials,
  saveCredentials,
  clearSavedCredentials,
  clearPendingLogin,
  getCredentialMetadata,
} from "../utils/credentialStorage";

function LoginPageStyles() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.body.classList.add("superflex-login-page");
    document.body.classList.add("!min-h-screen", "!overflow-x-hidden");
    document.body.style.color = "#101010";

    document
      .querySelectorAll<HTMLElement>(
        ".m-grid.m-grid--hor:not(.m-grid--desktop):not(.m-grid--desktop-and-tablet):not(.m-grid--tablet):not(.m-grid--tablet-and-mobile):not(.m-grid--mobile) > .m-grid__item.m-grid__item--fluid",
      )
      .forEach((element) => {
        element.classList.add("!justify-center", "!w-full");
      });

    document
      .querySelectorAll<HTMLElement>(
        ".m-grid.m-grid--ver-desktop.m-grid--desktop > .m-grid__item.m-grid__item--fluid",
      )
      .forEach((element) => {
        element.classList.add("!hidden", "!w-full");
      });

    document.querySelectorAll<HTMLElement>(".m-login__form-sub").forEach((element) => {
      element.remove();
    });

    const aside = document.querySelector<HTMLElement>(
      ".m-grid__item.m-grid__item--order-tablet-and-mobile-2.m-login__aside",
    );
    if (aside) {
      aside.classList.add("!w-full", "!p-0");
    }

    const mainContainer = document.querySelector<HTMLElement>(
      ".m-stack__item.m-stack__item--fluid",
    );
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

    document.querySelectorAll<HTMLElement>(".m-login__wrapper").forEach((element) => {
      element.classList.add("!flex", "!flex-col", "!items-center", "!w-full", "!max-w-full");
      element.classList.remove("!justify-center");
    });

    document
      .querySelectorAll<HTMLElement>(".m-login__signin .form-group, .m-login__form .form-group")
      .forEach((group) => {
        group.classList.add("!w-full", "!p-0");
      });

    document
      .querySelectorAll<HTMLElement>(
        ".input-group.m-input-group.m-input-group--square, .input-group",
      )
      .forEach((element) => {
        element.classList.add("!flex", "!flex-col", "!gap-1.5", "!w-full");
      });

    document
      .querySelectorAll<HTMLElement>(
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

    document.querySelectorAll<HTMLElement>(".input-group-addon").forEach((element) => {
      element.remove();
    });

    document.querySelectorAll<HTMLInputElement>(".form-control.m-input").forEach((element) => {
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

    const formHelp = document.querySelector<HTMLElement>(".m-form__help");
    if (formHelp) formHelp.classList.add("!text-slate-400", "!text-xs", "!ml-4");

    const errorFeedback = document.querySelector<HTMLElement>("#m_inputmask_4-error");
    if (errorFeedback) {
      errorFeedback.classList.add("!text-rose-500", "!text-xs", "!font-medium", "!ml-4", "!mt-1");
    }

    document.querySelectorAll<HTMLElement>(".m-login.m-login--1").forEach((element) => {
      element.classList.add("!bg-transparent", "!text-slate-900");
    });

    const oldLogo = document.querySelector<HTMLElement>(".m-login__logo");
    if (oldLogo) oldLogo.remove();

    const formActions = document.querySelector<HTMLElement>(".m-form__actions");
    if (formActions) {
      formActions.classList.add("!p-0", "!w-full", "!flex", "!flex-col", "!items-center");
    }

    const loginButtonObservers = [];
    document.querySelectorAll<HTMLButtonElement>(".btn-primary").forEach((button) => {
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
      let hasSavedVault = false;

      if (
        isLoginSubmit &&
        button.parentElement &&
        !document.getElementById("superflex-remember-me-container")
      ) {
        const rememberContainer = document.createElement("div");
        rememberContainer.id = "superflex-remember-me-container";
        rememberContainer.className = "w-full select-none";
        rememberContainer.innerHTML = `
          <div class="login-remember-row">
            <label class="login-remember-label" for="superflex-remember-me-checkbox">
              <span class="login-checkbox-wrap">
                <input
                  type="checkbox"
                  id="superflex-remember-me-checkbox"
                  class="login-remember-input"
                />
                <span class="login-checkbox-control" aria-hidden="true">
                  <svg class="login-checkbox-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </span>
              <span class="login-remember-text">Remember Me</span>
            </label>
            <span class="login-encrypted-pill" title="Credentials encrypted via AES-GCM 256-bit on this device">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Encrypted</span>
            </span>
          </div>
        `;
        button.parentElement.insertBefore(rememberContainer, button);

        const rememberCheckbox = rememberContainer.querySelector<HTMLInputElement>(
          "#superflex-remember-me-checkbox",
        );

        rememberCheckbox?.addEventListener("change", () => {
          if (!rememberCheckbox.checked) {
            if (hasSavedVault) {
              clearSavedCredentials();
              hasSavedVault = false;
              document.getElementById("superflex-autofill-prompt-card")?.remove();
            }
          }
        });
      }

      const updateLoginButtonState = () => {
        if (!isLoginSubmit || isSubmitting) return;
        const username = loginForm?.querySelector<HTMLInputElement>(
          'input[name="username"], #m_inputmask_4',
        );
        const password = loginForm?.querySelector<HTMLInputElement>(
          'input[name="password"], #pass',
        );
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

        getCredentialMetadata().then((metadata) => {
          const rememberCheckbox = document.getElementById(
            "superflex-remember-me-checkbox",
          ) as HTMLInputElement | null;

          if (metadata.hasCredentials) {
            hasSavedVault = true;
            if (rememberCheckbox) rememberCheckbox.checked = true;

            const usernameInput = loginForm?.querySelector<HTMLInputElement>(
              'input[name="username"], #m_inputmask_4',
            );
            const passwordInput = loginForm?.querySelector<HTMLInputElement>(
              'input[name="password"], #pass',
            );

            const showAutoFillCard = (creds) => {
              if (
                !creds ||
                !loginForm ||
                document.getElementById("superflex-autofill-prompt-card")
              ) {
                return;
              }
              const promptCard = document.createElement("div");
              promptCard.id = "superflex-autofill-prompt-card";
              promptCard.className =
                "w-full rounded-2xl bg-[#230052]/5 dark:bg-white/[0.08] border border-[#230052]/15 dark:border-white/15 p-3 flex items-center justify-between mb-4 transition-all";

              promptCard.innerHTML = `
                <div class="flex min-w-0 items-center gap-2.5">
                  <div class="h-8 w-8 rounded-[28%] bg-[#230052] text-white dark:bg-white dark:text-[#0a192f] flex items-center justify-center shrink-0 shadow-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>
                  </div>
                  <div class="min-w-0 text-left">
                    <p class="truncate text-xs font-bold text-slate-800 dark:text-white">Saved login ready</p>
                    <p class="truncate text-[11px] text-slate-500 dark:text-slate-400">${creds.maskedUsername || creds.username}</p>
                  </div>
                </div>
                <button type="button" id="superflex-autofill-trigger-btn" class="ml-3 min-h-9 shrink-0 rounded-full bg-[#230052] px-4 text-xs font-bold text-white transition-all hover:bg-[#370c72] active:scale-[0.98] dark:bg-white dark:text-[#0a192f] cursor-pointer">Auto-Fill</button>`;

              loginForm.insertBefore(promptCard, loginForm.firstChild);

              const fillBtn = promptCard.querySelector<HTMLElement>(
                "#superflex-autofill-trigger-btn",
              );
              fillBtn?.addEventListener("click", (e) => {
                if (!e.isTrusted) return;
                e.preventDefault();
                e.stopPropagation();
                if (creds && usernameInput && passwordInput) {
                  usernameInput.value = creds.username;
                  passwordInput.value = creds.password;

                  usernameInput.dispatchEvent(new Event("input", { bubbles: true }));
                  usernameInput.dispatchEvent(new Event("change", { bubbles: true }));
                  usernameInput.dispatchEvent(new Event("keyup", { bubbles: true }));

                  passwordInput.dispatchEvent(new Event("input", { bubbles: true }));
                  passwordInput.dispatchEvent(new Event("change", { bubbles: true }));
                  passwordInput.dispatchEvent(new Event("keyup", { bubbles: true }));

                  if (rememberCheckbox) rememberCheckbox.checked = true;
                  updateLoginButtonState();
                  setTimeout(updateLoginButtonState, 100);

                  promptCard.innerHTML = `
                    <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold py-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span>Saved credentials auto-filled</span>
                    </div>
                  `;
                  promptCard.className =
                    "w-full rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 flex items-center justify-center mb-4 transition-all";
                }
              });
            };

            getDecryptedCredentials().then((creds) => {
              if (creds) {
                showAutoFillCard(creds);
              }
            });
          } else {
            hasSavedVault = false;
            if (rememberCheckbox) rememberCheckbox.checked = false;
          }
        });
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
        async (event) => {
          if (!isLoginSubmit || button.disabled || isSubmitting) return;

          const username = loginForm
            ?.querySelector<HTMLInputElement>('input[name="username"], #m_inputmask_4')
            ?.value?.trim();
          const password = loginForm?.querySelector<HTMLInputElement>(
            'input[name="password"], #pass',
          )?.value;
          const rememberCheckbox = document.getElementById(
            "superflex-remember-me-checkbox",
          ) as HTMLInputElement | null;
          const isRemember = rememberCheckbox?.checked ?? false;

          if (username && password && isRemember && !hasSavedVault) {
            event.preventDefault();
            event.stopImmediatePropagation();
            isSubmitting = true;
            button.disabled = true;
            button.innerHTML = `
              <div class="flex items-center justify-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <span>Securing login...</span>
              </div>`;

            const saved = await saveCredentials(username, password);
            if (!saved) {
              isSubmitting = false;
              button.disabled = false;
              button.innerHTML = originalContent;
              updateLoginButtonState();
              return;
            }

            hasSavedVault = true;
            clearPendingLogin();
            isSubmitting = false;
            button.disabled = false;
            button.innerHTML = originalContent;
            button.click();
            return;
          }

          if (!isRemember) {
            clearSavedCredentials();
            clearPendingLogin();
            hasSavedVault = false;
          }

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

    const signInIcon = document.querySelector<HTMLElement>(".la-sign-in");
    if (signInIcon) signInIcon.remove();

    const logintitle = document.querySelector<HTMLElement>(".m-login__title");
    if (logintitle) {
      logintitle.style.display = "none";
    }

    const bglogin = document.querySelector<HTMLElement>(".m-login__signin");
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
      bglogin.style.setProperty("height", "auto", "important");
      bglogin.style.setProperty("min-height", "0", "important");

      const existingHeader = bglogin.querySelector<HTMLElement>(".login-header");
      if (existingHeader) existingHeader.remove();

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
        <span class="login-credit">
          designed and built by
          <a href="https://github.com/theajmalrazaq" target="_blank" rel="noopener noreferrer">ajmal</a>
        </span>
        <p class="text-slate-500 text-xs sm:text-[13px] font-normal leading-relaxed">
         Aaja bhai, trauma tera wait kar raha hai 😭
        </p>
      `;
      bglogin.insertBefore(header, bglogin.firstChild);
    }

    const forgotPasswordSection = document.querySelector<HTMLElement>(".m-login__forget-password");
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
      forgotPasswordSection.style.setProperty(
        "height",
        "var(--login-card-height, auto)",
        "important",
      );

      const forgotHead = forgotPasswordSection.querySelector<HTMLElement>(".m-login__head");
      if (forgotHead) {
        forgotHead.classList.add("!w-full");
        forgotHead.querySelector<HTMLElement>(".forgot-badge")?.remove();
      }

      const forgotTitle = forgotPasswordSection.querySelector<HTMLElement>(".m-login__title");
      if (forgotTitle) {
        forgotTitle.style.display = "block";
        forgotTitle.textContent = "Forgot your password?";
        if (!forgotPasswordSection.querySelector<HTMLElement>(".forgot-password-mark")) {
          const mark = document.createElement("div");
          mark.className = "forgot-password-mark";
          mark.setAttribute("aria-hidden", "true");
          mark.innerHTML = `
            <svg viewBox="0 0 432 432" focusable="false">
              <path d="M247.227 185.616L282.286 69L133 216L186.861 231.146L133 363L298 208.65L247.227 185.616Z" />
            </svg>
          `;
          forgotTitle.parentElement.insertBefore(mark, forgotTitle);
        }
      }

      const forgotDesc = forgotPasswordSection.querySelector<HTMLElement>(".m-login__desc");
      if (forgotDesc) {
        forgotDesc.textContent =
          "Enter the email linked to your FLEX account to receive reset instructions.";
      }

      const forgotForm = forgotPasswordSection.querySelector<HTMLElement>(".m-login__form");
      if (forgotForm) {
        forgotForm.classList.add("!flex", "!flex-col", "!w-full");
      }

      const emailInputGroup = forgotPasswordSection.querySelector<HTMLElement>(".m-input-icon");
      if (emailInputGroup) {
        emailInputGroup.classList.add("!w-full");
        const emailInput = emailInputGroup.querySelector<HTMLInputElement>("input");
        if (emailInput && !forgotForm?.querySelector<HTMLElement>("label")) {
          if (!emailInput.id) emailInput.id = "superflex-reset-email";
          const emailLabel = document.createElement("label");
          emailLabel.className = "forgot-email-label";
          emailLabel.htmlFor = emailInput.id;
          emailLabel.textContent = "FLEX email";
          emailInputGroup.parentElement.insertBefore(emailLabel, emailInputGroup);
        }
      }

      const forgotFormAction =
        forgotPasswordSection.querySelector<HTMLElement>(".m-login__form-action");
      if (forgotFormAction) {
        forgotFormAction.classList.add("!flex", "!flex-col", "!w-full");
      }
    }

    let forgotPasswordLink = document.querySelector<HTMLAnchorElement>('a[href*="ForgotPassword"]');
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

      const loginFormAction = document.querySelector<HTMLElement>(
        ".m-login__signin .m-form__actions",
      );
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

      const cancelButton = forgotPasswordSection.querySelector<HTMLButtonElement>(
        "#m_login_forget_password_cancel",
      );
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
        const forgotHead = forgotPasswordSection.querySelector<HTMLElement>(".m-login__head");
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
        forgotPasswordSection.querySelector<HTMLElement>("#m_login_forget_password_submit") ||
        forgotPasswordSection.querySelector<HTMLElement>("button[type='submit']");
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
            forgotPasswordSection.querySelector<HTMLInputElement>("input[type='email']") ||
            forgotPasswordSection.querySelector<HTMLInputElement>("input[name='Email']");
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

    const rightImage = document.getElementById("login-background-image");
    if (rightImage) rightImage.remove();

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

    const CURRENT_VERSION = getExtensionVersion("7.0.0");

    const footerWrapper = document.createElement("div");
    footerWrapper.className =
      "login-outer-footer flex items-center justify-center gap-3 text-center w-full mt-7 relative z-10 flex-wrap select-none";
    footerWrapper.innerHTML = `
      <a href="https://github.com/theajmalrazaq/superflex/issues/new" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-sm border border-white/20 text-[11px] font-semibold text-white transition-all shadow-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
        </svg>
        Raise Issue
      </a>
      <button type="button" class="login-theme-toggle" aria-label="Switch to dark mode" title="Switch to dark mode">
        <span class="login-theme-icon" aria-hidden="true"></span>
        <span class="login-theme-label">Dark mode</span>
      </button>
    `;

    const themeToggle = footerWrapper.querySelector<HTMLElement>(".login-theme-toggle");
    const applyLoginTheme = (mode) => {
      const isDark = mode === "dark";
      document.documentElement.dataset.superflexTheme = isDark ? "dark" : "light";
      document.body.classList.toggle("superflex-login-dark", isDark);
      document.documentElement.classList.toggle("dark", isDark);
      document
        .querySelectorAll<HTMLElement>(
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
      themeToggle.querySelector<HTMLElement>(".login-theme-label").textContent = isDark
        ? "Dark mode"
        : "Light mode";
      themeToggle.querySelector<HTMLElement>(".login-theme-icon").innerHTML = isDark
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.985 12.486A9 9 0 1 1 11.514 3.015a7 7 0 0 0 9.471 9.471Z"/></svg>`;
      document.dispatchEvent(new CustomEvent("superflex-theme-mode-changed", { detail: mode }));
    };
    applyLoginTheme(usePreferencesStore.getState().themeMode);
    themeToggle.addEventListener("click", () => {
      const nextMode = document.body.classList.contains("superflex-login-dark") ? "light" : "dark";
      usePreferencesStore.getState().setThemeMode(nextMode);
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
    versionStatus.textContent = "SuperFlex";
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

    const cardWrapper = bglogin?.parentElement;
    if (cardWrapper) {
      const wrapper = cardWrapper;

      const existingOuterHeader = wrapper.querySelector<HTMLElement>(".login-outer-header");
      if (existingOuterHeader) existingOuterHeader.remove();

      const existingOuterFooter = wrapper.querySelector<HTMLElement>(".login-outer-footer");
      if (existingOuterFooter) existingOuterFooter.remove();

      const existingVersionPill = wrapper.querySelector<HTMLElement>(".login-version-pill");
      if (existingVersionPill) existingVersionPill.remove();

      const existingUpdateNotice = wrapper.querySelector<HTMLElement>(".login-update-notice");
      if (existingUpdateNotice) existingUpdateNotice.remove();

      const existingHero = wrapper.querySelector<HTMLElement>(".hero-section-injected");
      if (existingHero) existingHero.remove();

      wrapper.insertBefore(versionPill, bglogin);
      wrapper.appendChild(footerWrapper);
    }

    checkForUpdates();

    const loginHeader = bglogin?.querySelector<HTMLElement>(".login-header");
    const syncCardMeasurements = () => {
      if (!cardWrapper || !bglogin || bglogin.classList.contains("!hidden")) return;
      const cardRect = bglogin.getBoundingClientRect();
      const cardHeight = cardRect.height;
      const headerHeight = loginHeader?.getBoundingClientRect().height || 0;
      if (cardHeight > 0) cardWrapper.style.setProperty("--login-card-height", `${cardHeight}px`);
      if (headerHeight > 0)
        cardWrapper.style.setProperty("--login-header-height", `${headerHeight}px`);
      const signInButton = bglogin.querySelector<HTMLElement>(".btn-primary");
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
        "fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/60 p-3 backdrop-blur-md transition-opacity duration-200";
      termsModal.setAttribute("role", "dialog");
      termsModal.setAttribute("aria-modal", "true");
      termsModal.setAttribute("aria-labelledby", "terms-modal-title");
      termsModal.setAttribute("aria-describedby", "terms-modal-description");

      termsModal.innerHTML = `
        <div class="terms-sheet flex max-h-[76dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[34px] bg-white text-slate-900 shadow-[0_18px_60px_rgba(35,0,82,.24)] animate-in slide-in-from-bottom-8 duration-300">
          <div class="flex shrink-0 justify-center pt-3" aria-hidden="true">
            <span class="terms-sheet-handle h-1.5 w-14 rounded-full bg-[#ded9e5]"></span>
          </div>

          <!-- Header -->
          <header class="flex shrink-0 flex-col items-center px-6 pb-3 pt-3 text-center sm:px-8">
            <div class="terms-brand-icon mb-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-[28%] bg-[#230052] text-white select-none">
              <svg viewBox="0 0 432 432" width="28" height="28" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M247.227 185.616L282.286 69L133 216L186.861 231.146L133 363L298 208.65L247.227 185.616Z" />
              </svg>
            </div>
            <p class="terms-eyebrow text-[10px] font-bold uppercase tracking-[0.16em] text-[#230052]/65">Welcome to SuperFlex</p>
            <h2 id="terms-modal-title" class="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Terms & Privacy</h2>
            <p id="terms-modal-description" class="mt-1 max-w-md text-sm text-slate-500">A quick overview before you start using SuperFlex.</p>
          </header>

          <!-- Content -->
          <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-1 sm:px-8">
            <div class="terms-sections overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/70">
              <!-- Card 1: Independent Project -->
              <section class="terms-section flex gap-3 px-4 py-3.5">
                <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[28%] bg-[#230052]/10 text-[#230052]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                </span>
                <div class="min-w-0">
                  <h3 class="text-sm font-bold text-slate-900">Independent open-source project</h3>
                  <p class="mt-1 text-xs leading-relaxed text-slate-500">SuperFlex modernizes the Flex student portal, but is <strong class="font-semibold text-slate-700">not affiliated with, endorsed by, or sponsored by</strong> FAST-NUCES.</p>
                </div>
              </section>

              <!-- Card 2: Security & Privacy (100% Local, Zero Analytics) -->
              <section class="terms-section flex gap-3 border-t border-slate-200/80 px-4 py-3.5">
                <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[28%] bg-emerald-500/10 text-emerald-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                </span>
                <div class="min-w-0">
                  <h3 class="text-sm font-bold text-slate-900">Local and privacy-first</h3>
                  <p class="mt-1 text-xs leading-relaxed text-slate-500">Your grades, attendance, and credentials stay inside your browser. SuperFlex is <strong class="font-semibold text-slate-700">client-side with zero telemetry and zero analytics</strong>.</p>
                </div>
              </section>

              <!-- Card 3: User Responsibility -->
              <section class="terms-section flex gap-3 border-t border-slate-200/80 px-4 py-3.5">
                <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[28%] bg-amber-500/10 text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                </span>
                <div class="min-w-0">
                  <h3 class="text-sm font-bold text-slate-900">Official records still apply</h3>
                  <p class="mt-1 text-xs leading-relaxed text-slate-500">Use SuperFlex voluntarily as a UI enhancement. Official grades, notices, fee challans, and academic standing remain governed by the university's records.</p>
                </div>
              </section>
            </div>

            <!-- Bottom notice -->
            <div class="terms-consent mt-3 rounded-2xl bg-[#230052]/[0.05] px-4 py-3">
              <p class="text-xs leading-relaxed text-slate-600">
                By continuing, you acknowledge that you are using this client-side UI overlay at your own discretion.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <footer class="terms-footer shrink-0 border-t border-slate-100 bg-white/95 px-5 pb-3 pt-2.5 sm:px-8">
            <button id="terms-accept-btn" class="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-none bg-[#230052] px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-[#320075] active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#230052]">
              <span>Accept & Continue</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </footer>
        </div>
      `;

      document.body.appendChild(termsModal);

      const termsAcceptButton = document.getElementById("terms-accept-btn");
      termsAcceptButton.focus();
      termsAcceptButton.addEventListener("click", () => {
        localStorage.setItem("superflex_terms_accepted", "true");
        termsModal.classList.add("opacity-0", "scale-95");
        setTimeout(() => termsModal.remove(), 200);
      });
    }

    const passwordInputs = document.querySelectorAll<HTMLInputElement>(
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

      const inputGroup = input.closest<HTMLElement>(".input-group") || input.parentElement;
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
      if (rightImage && rightImage.parentElement) {
        rightImage.remove();
      }
      if (footerWrapper && footerWrapper.parentElement) {
        footerWrapper.remove();
      }
      versionPill.remove();
    };
  }, []);

  return ready ? null : <LoginSkeleton />;
}

export default LoginPageStyles;
