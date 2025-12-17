import { useEffect } from "react";

function LoginPageStyles() {
  useEffect(() => {
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

    document
      .querySelector(
        ".m-grid__item.m-grid__item--order-tablet-and-mobile-2.m-login__aside",
      )
      .classList.add("!w-full", "!p-0");
    const mainContainer = document.querySelector(
      ".m-stack__item.m-stack__item--fluid",
    ); 
    if (mainContainer) {
      mainContainer.classList.add(
        "!flex",
        "!justify-center",
        "!h-screen",
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
        "!w-fit",
        "!p-0",
      );
    });

    document
      .querySelector(".m-form__actions.text-center")
      .classList.add("!p-0");

    const formHelp = document.querySelector(".m-form__help");
    if (formHelp) formHelp.classList.add("!text-white", "!text-xs");

    document
      .querySelectorAll(".input-group.m-input-group.m-input-group--square")
      .forEach((element) => {
        element.classList.add("!gap-1.5", "!flex-col", "!w-full");
      });

    // Style labels to be white
    document.querySelectorAll(".input-group label, .m-form__label, label, .input-group h5, h5").forEach((label) => {
      label.classList.add("!text-white", "!font-medium");
    });

    document.querySelectorAll(".input-group-addon").forEach((element) => {
      element.remove();
    });

    document.querySelectorAll(".form-control.m-input").forEach((element) => {
      element.classList.add(
        "!rounded-lg",
        "!bg-transparent",
        "!border",
        "!border-white/10",
        "!text-white",
        "!placeholder:text-white/50",
        "!placeholder:opacity-100",
        "!h-[40px]",
        "!px-3",
        "!w-full",
      );
      element.style.fontFamily = "'Google Sans Flex', sans-serif";
    });

    document.querySelectorAll(".m-login.m-login--1").forEach((element) => {
      element.classList.add("!bg-transparent", "!text-white");
    });

    const oldLogo = document.querySelector(".m-login__logo");
    if (oldLogo) oldLogo.remove();

    document.querySelectorAll(".btn-primary").forEach((button) => {
      button.classList.add(
        "!bg-[#a098ff]",
        "!text-white",
        "!font-bold",
        "!border-none",
        "!rounded-xl",
        "!w-full",
        "!mb-5",
        "!h-[44px]",
        "!px-3",
        "!py-2",
        "!text-center",
        "!flex",
        "justify-center",
        "items-center",
        "hover:!bg-[#8f86ff]",
        "!transition-all",
        "!duration-200",
      );
      button.style.fontFamily = "'Google Sans Flex', sans-serif";
    });

    const signInIcon = document.querySelector(".la-sign-in");
    if (signInIcon) signInIcon.remove();

    let logintitle = document.querySelector(".m-login__title");
    if (logintitle) {
      logintitle.style.display = "none";
    }

    let bglogin = document.querySelector(".m-login__signin");
    if (bglogin) {
      bglogin.classList.add(
        "!bg-black/10",
        "backdrop-blur-xl",
        "!p-10",
        "!rounded-[24px]",
        "!border",
        "!border-white/10",
        "!flex",
        "!flex-col",
        "!items-center",
        "!justify-center",
        "!w-[420px]",
        "!hidden", // Initially hidden
        "!fixed",
        "!top-1/2",
        "!left-1/2",
        "!-translate-x-1/2",
        "!-translate-y-1/2",
        "!z-[999]",
        "!opacity-0",
        "!transition-all",
        "!duration-300",
      );
      bglogin.setAttribute("id", "login-popup");
    }

    // Hide and style the Forgot Password section
    const forgotPasswordSection = document.querySelector(".m-login__forget-password");
    if (forgotPasswordSection) {
      forgotPasswordSection.classList.add(
        "!bg-black/10",
        "backdrop-blur-xl",
        "!p-8",
        "!rounded-[24px]",
        "!border",
        "!border-white/10",
        "!flex",
        "!flex-col",
        "!gap-6",
        "!w-[420px]",
        "!hidden", // Initially hidden
        "!fixed",
        "!top-1/2",
        "!left-1/2",
        "!-translate-x-1/2",
        "!-translate-y-1/2",
        "!z-[999]",
        "!opacity-0",
        "!transition-all",
        "!duration-300",
      );
      forgotPasswordSection.setAttribute("id", "forgot-password-popup");

      // Style the forgot password head container
      const forgotHead = forgotPasswordSection.querySelector(".m-login__head");
      if (forgotHead) {
        forgotHead.classList.add("!flex", "!flex-col", "!gap-3", "!w-full");
      }

      // Style the forgot password title
      const forgotTitle = forgotPasswordSection.querySelector(".m-login__title");
      if (forgotTitle) {
        forgotTitle.style.display = "block";
        forgotTitle.classList.add("!text-white", "!text-2xl", "!font-bold", "!mb-0");
      }

      // Style the description
      const forgotDesc = forgotPasswordSection.querySelector(".m-login__desc");
      if (forgotDesc) {
        forgotDesc.classList.add("!text-white/70", "!text-sm", "!leading-relaxed", "!mb-0");
      }

      // Style the form container
      const forgotForm = forgotPasswordSection.querySelector(".m-login__form");
      if (forgotForm) {
        forgotForm.classList.add("!flex", "!flex-col", "!gap-4", "!w-full");
      }

      // Style the email input container
      const emailInputGroup = forgotPasswordSection.querySelector(".m-input-icon");
      if (emailInputGroup) {
        emailInputGroup.classList.add("!w-full");
      }

      // Style the form actions container
      const forgotFormAction = forgotPasswordSection.querySelector(".m-login__form-action");
      if (forgotFormAction) {
        forgotFormAction.classList.add("!flex", "!flex-col", "!gap-3", "!w-full", "!mt-2");
      }

      // Append forgot password section to body
      document.body.appendChild(forgotPasswordSection);
    }

    // Find or create the "Forgot Password" link
    let forgotPasswordLink = document.querySelector('a[href*="ForgotPassword"]');
    if (!forgotPasswordLink) {
      // Create a forgot password link if it doesn't exist
      forgotPasswordLink = document.createElement("a");
      forgotPasswordLink.href = "#";
      forgotPasswordLink.textContent = "Forgot Password?";
      forgotPasswordLink.classList.add(
        "!text-[#a098ff]",
        "hover:!text-[#8f86ff]",
        "!text-sm",
        "!cursor-pointer",
        "!transition-all",
        "!duration-200",
      );
      
      // Insert it in the login form
      const loginFormAction = document.querySelector(".m-login__signin .m-form__actions");
      if (loginFormAction) {
        loginFormAction.appendChild(forgotPasswordLink);
      }
    } else {
      forgotPasswordLink.classList.add(
        "!text-[#a098ff]",
        "hover:!text-[#8f86ff]",
        "!text-sm",
        "!mt-4",
        "!cursor-pointer",
        "!transition-all",
        "!duration-200",
      );
    }

    // Add click handler for forgot password link
    if (forgotPasswordLink && forgotPasswordSection) {
      forgotPasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Hide login popup
        if (bglogin) {
          bglogin.classList.add("!hidden", "!opacity-0");
        }

        // Show forgot password popup
        forgotPasswordSection.classList.remove("!hidden");
        setTimeout(() => {
          forgotPasswordSection.classList.remove("!opacity-0");
          forgotPasswordSection.classList.add("!opacity-100");
        }, 10);
      });

      // Add handler for cancel button in forgot password form
      const cancelButton = forgotPasswordSection.querySelector("#m_login_forget_password_cancel");
      if (cancelButton) {
        cancelButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          // Hide forgot password popup
          forgotPasswordSection.classList.remove("!opacity-100");
          forgotPasswordSection.classList.add("!opacity-0");
          
          setTimeout(() => {
            forgotPasswordSection.classList.add("!hidden");
            
            // Show login popup again
            if (bglogin) {
              bglogin.classList.remove("!hidden");
              setTimeout(() => {
                bglogin.classList.remove("!opacity-0");
                bglogin.classList.add("!opacity-100");
              }, 10);
            }
          }, 300);
        });
      }
    }

    // Create the Sign In button
    const signInButton = document.createElement("button");
    signInButton.id = "show-login-btn";
    signInButton.className = `
      !bg-[#a098ff] 
      !text-white 
      !font-semibold 
      !border-none 
      !rounded-2xl 
      !px-7 
      !py-3.5 
      !cursor-pointer
      !transition-all 
      !duration-300
      !flex
      !items-center
      !gap-3
      !z-[50]
    `;
    signInButton.style.fontFamily = "'Google Sans Flex', sans-serif";
    signInButton.innerHTML = `
      <span class="font-light">Sign In</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
        <polyline points="10 17 15 12 10 7"/>
        <line x1="15" y1="12" x2="3" y2="12"/>
      </svg>
    `;

    // Create the Give Suggestion button
    const suggestionButton = document.createElement("a");
    suggestionButton.href = "https://github.com/theajmalrazaq/superflex/issues/new";
    suggestionButton.target = "_blank";
    suggestionButton.className = "group relative bg-white/10 backdrop-blur-sm px-7 py-3.5 rounded-xl font-semibold text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300 flex items-center gap-3";
    suggestionButton.style.fontFamily = "'Google Sans Flex', sans-serif";
    suggestionButton.innerHTML = `
      <span class="font-light">Give Suggestion</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    `;

    // Create backdrop overlay
    const backdrop = document.createElement("div");
    backdrop.id = "login-backdrop";
    backdrop.className = `
      !fixed
      !inset-0
      !bg-black/50
      backdrop-blur-sm
      !z-[99]
      !hidden
      !opacity-0
      !transition-all
      !duration-300
      !cursor-pointer
    `;

    // Add click handlers
    signInButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Show backdrop
      backdrop.classList.remove("!hidden");
      setTimeout(() => {
        backdrop.classList.remove("!opacity-0");
        backdrop.classList.add("!opacity-100");
      }, 10);

      // Show login popup
      bglogin.classList.remove("!hidden");
      setTimeout(() => {
        bglogin.classList.remove("!opacity-0");
        bglogin.classList.add("!opacity-100", "!scale-100");
      }, 10);
    });

    backdrop.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Hide login popup if visible
      if (bglogin && !bglogin.classList.contains("!hidden")) {
        bglogin.classList.remove("!opacity-100", "!scale-100");
        bglogin.classList.add("!opacity-0");
      }
      
      // Hide forgot password popup if visible
      if (forgotPasswordSection && !forgotPasswordSection.classList.contains("!hidden")) {
        forgotPasswordSection.classList.remove("!opacity-100");
        forgotPasswordSection.classList.add("!opacity-0");
      }
      
      // Hide backdrop
      backdrop.classList.remove("!opacity-100");
      backdrop.classList.add("!opacity-0");
      
      setTimeout(() => {
        if (bglogin) bglogin.classList.add("!hidden");
        if (forgotPasswordSection) forgotPasswordSection.classList.add("!hidden");
        backdrop.classList.add("!hidden");
      }, 300);
    });

    let rightImage = document.getElementById("login-background-image");
    if (!rightImage) {
      rightImage = document.createElement("div");
      rightImage.id = "login-background-image";
      rightImage.classList.add("fixed", "inset-0", "w-full", "h-full", "z-0");

      const img = document.createElement("img");
      img.src = "https://theajmalrazaq.github.io/superflex/res/intro.svg";
      img.classList.add("w-full", "h-full", "object-cover");
      rightImage.appendChild(img);

      const blackMask = document.createElement("div");
      blackMask.className = "absolute inset-0 bg-black/60 z-10";
      rightImage.appendChild(blackMask);
      document.body.appendChild(rightImage);
    }

    const heroDiv = document.createElement("div");
    heroDiv.className =
      "flex flex-col pt-7 justify-center text-center w-full mb-6";

    const bgUrl = chrome.runtime.getURL("public/bg.png");
    const logoUrl = chrome.runtime.getURL("public/logo.svg");

    heroDiv.innerHTML = `
    <!-- GitHub Star Button -->
    <a href="https://github.com/theajmalrazaq/superflex" target="_blank" class="mt-4 md:mt-0 mb-6">
        <button class="group relative dark:bg-neutral-800 bg-neutral-200 rounded-full p-px overflow-hidden cursor-pointer transition-all duration-200 ease-in-out hover:scale-105">
          <span class="flex items-center justify-center gap-1 relative z-[1] dark:bg-neutral-950/90 bg-neutral-50/90 rounded-full py-2 px-4 pl-2 w-full">
            <span class="relative group-hover:scale-105 transition-transform group-hover:rotate-[360deg] duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-950 dark:text-neutral-50">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span class="rounded-full size-11 absolute opacity-0 dark:opacity-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-lg" style="animation: 14s ease-in-out 0s infinite alternate none running star-shine; background: #a098ff;"></span>
            </span>
            <span class="bg-gradient-to-b ml-1.5 dark:from-white dark:to-white/50 from-neutral-950 to-neutral-950/50 bg-clip-text text-xs text-transparent group-hover:scale-105 transition transform-gpu">
              Star SuperFlex on Github (<span id="starCount" class="text-neutral-950 dark:text-neutral-50 text-xs"></span>)
            </span>
          </span>
        </button>
    </a>

    <!-- Logo & Text Section -->
    <div class="flex flex-col gap-4 justify-center items-center text-center">
        <div class="h-20 w-20 bg-black border-7 border-white/5 bg-cover rounded-[29px] flex items-center justify-center" style="background-image: url('${bgUrl}');">
             <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="84" height="84" fill="none">
                <style>@keyframes splash{0%{transform:scale(.2);opacity:.8}80%{transform:scale(1.2);opacity:0}to{transform:scale(2.2);opacity:0}}</style>
                <path fill="#a098ff" d="M13.295 10.769l2.552-5.787-7.979 7.28 3.254.225-3.353 6.362 8.485-7.388-2.959-.692z" style="animation:splash 1.5s cubic-bezier(.165,.84,.44,1) infinite both;transform-origin:center center"/>
             </svg>
        </div>
        
        <img src="https://theajmalrazaq.github.io/superflex/res/logo.svg" alt="SuperFlex" class="w-80 hero-logo" />
        
        <p class="font-mono text-white">Flex Portal Sucks? Not Anymore. Time to Flex on 'Em</p>

        <p class="text-white">
          By <a href="https://github.com/theajmalrazaq" target="_blank" class="text-[#a098ff]">Ajmal Razaq Bhatti</a>
        </p>
    </div>

    <!-- Buttons Container -->
    <div id="login-buttons-container" class="flex flex-row gap-4 justify-center mt-8 hero-buttons">
    </div>

    <!-- Feature Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl w-full px-6 feature-grid mt-8">
        <div class="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-5 hover:shadow-lg hover:shadow-[#a098ff]/10 transition duration-300 group">
          <div class="flex items-center gap-3 mb-3">
            <div class="bg-[#a098ff] p-2.5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
                <line x1="8" x2="16" y1="6" y2="6"/>
                <line x1="8" x2="16" y1="10" y2="10"/>
                <line x1="8" x2="16" y1="14" y2="14"/>
                <line x1="8" x2="16" y1="18" y2="18"/>
              </svg>
            </div>
            <h3 class="text-base font-semibold">Advanced GPA Tools</h3>
          </div>
          <p class="text-white/80 text-sm leading-relaxed">
            Calculate semester GPA, plan target CGPA, and track your academic progress with ease.
          </p>
        </div>

        <div class="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-5 hover:shadow-lg hover:shadow-[#a098ff]/10 transition duration-300 group">
          <div class="flex items-center gap-3 mb-3">
            <div class="bg-[#a098ff] p-2.5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                <path d="M3 3v18h18"/>
                <path d="m19 9-5 5-4-4-3 3"/>
              </svg>
            </div>
            <h3 class="text-base font-semibold">Statistical Insights</h3>
          </div>
          <p class="text-white/80 text-sm leading-relaxed">
            View grand total, sessional averages, min/max scores and complete performance analytics.
          </p>
        </div>

        <div class="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl p-5 hover:shadow-lg hover:shadow-[#a098ff]/10 transition duration-300 group">
          <div class="flex items-center gap-3 mb-3">
            <div class="bg-[#a098ff] p-2.5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                <rect width="7" height="9" x="3" y="3" rx="1"/>
                <rect width="7" height="5" x="14" y="3" rx="1"/>
                <rect width="7" height="9" x="14" y="12" rx="1"/>
                <rect width="7" height="5" x="3" y="16" rx="1"/>
              </svg>
            </div>
            <h3 class="text-base font-semibold">Modern UI/UX</h3>
          </div>
          <p class="text-white/80 text-sm leading-relaxed">
            Sleek interface with dark mode, customizable themes and intuitive navigation controls.
          </p>
        </div>
    </div>
    `;

    fetch("https://api.github.com/repos/theajmalrazaq/superflex")
      .then((res) => res.json())
      .then((data) => {
        const el = document.getElementById("starCount");
        if (el && data.stargazers_count !== undefined) {
          el.innerText = data.stargazers_count;
        }
      })
      .catch((err) => console.error("Failed to fetch stars", err));

    if (bglogin && bglogin.parentNode) {
      const wrapper = bglogin.parentNode;

      const existingHero = wrapper.querySelector(".hero-section-injected");
      if (existingHero) {
        existingHero.remove();
      }

      const internalHero = bglogin.querySelector(".hero-section-injected");
      if (internalHero) {
        internalHero.remove();
      }

      heroDiv.classList.add("hero-section-injected");
      wrapper.insertBefore(heroDiv, bglogin);
      
      // Add buttons to the buttons container
      const buttonsContainer = heroDiv.querySelector("#login-buttons-container");
      if (buttonsContainer) {
        buttonsContainer.appendChild(signInButton);
        buttonsContainer.appendChild(suggestionButton);
      }
    }
    
    // Append backdrop and form to body (form must come after backdrop in DOM)
    document.body.appendChild(backdrop);
    if (bglogin) {
      document.body.appendChild(bglogin);
    }

    const passwordInputs = document.querySelectorAll(
      '.m-input-icon--right input[type="password"]',
    );
    passwordInputs.forEach((input) => {
      const toggleButton = document.createElement("button");
      toggleButton.type = "button";

      const icon = document.createElement("span");
      icon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      `;
      toggleButton.appendChild(icon);

      toggleButton.classList.add(
        "absolute",
        "right-3",
        "top-1/2",
        "transform",
        "-translate-y-1/2",
        "text-white/50",
        "hover:text-white",
        "focus:outline-none",
        "z-10",
      );

      const inputGroup = input.closest(".input-group");
      if (inputGroup) {
        inputGroup.style.position = "relative";
        inputGroup.appendChild(toggleButton);

        toggleButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const type =
            input.getAttribute("type") === "password" ? "text" : "password";
          input.setAttribute("type", type);

          icon.innerHTML =
            type === "password"
              ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>`
              : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>`;
        });
      }
    });

    document.body.classList.add("!h-screen", "!overflow-hidden");
  }, []);

  return null;
}

export default LoginPageStyles;
