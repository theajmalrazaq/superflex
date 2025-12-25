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
        "!w-full",
        "!max-w-full",
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

    document
      .querySelectorAll(
        ".input-group label, .m-form__label, label, .input-group h5, h5",
      )
      .forEach((label) => {
        label.classList.add("!text-white", "!font-medium");
      });

    document.querySelectorAll(".input-group-addon").forEach((element) => {
      element.remove();
    });

    document.querySelectorAll(".form-control.m-input").forEach((element) => {
      element.classList.add(
        "!rounded-2xl",
        "!bg-white/5",
        "!border",
        "!border-white/5",
        "!text-white",
        "!placeholder:text-white/40",
        "!placeholder:font-medium",
        "!placeholder:text-xs",
        "!h-[48px]",
        "!px-5",
        "!w-full",
        "focus:!border-[#a098ff]/30",
        "focus:!bg-white/[0.08]",
        "!transition-all",
        "!duration-300",
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
        "!uppercase",
        "!border-none",
        "!rounded-2xl",
        "!w-full",
        "!mb-6",
        "!h-[50px]",
        "!px-6",
        "!py-3",
        "!text-center",
        "!flex",
        "justify-center",
        "items-center",
        "hover:!bg-[#8f86ff]",
        "!transition-all",
        "!duration-300",
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
        "!bg-zinc-900/90",
        "backdrop-blur-2xl",
        "!p-6",
        "sm:!p-10",
        "!rounded-[2.5rem]",
        "!border",
        "!border-white/10",
        "!flex",
        "!flex-col",
        "!items-center",
        "!justify-center",
        "!w-[90vw]",
        "!max-w-[355px]",
        "!hidden",
        "!fixed",
        "!top-1/2",
        "!left-1/2",
        "!-translate-x-1/2",
        "!-translate-y-1/2",
        "!z-[999]",
        "!opacity-0",
        "!scale-95",
        "!transition-all",
        "!duration-500",
        "!ease-out",
      );
      bglogin.setAttribute("id", "login-popup");

      if (!bglogin.querySelector(".login-header")) {
        const header = document.createElement("div");
        header.className = "login-header w-full text-left mb-8 space-y-1";
        header.innerHTML = `
          <h2 class="text-2xl font-black text-white tracking-tight">Welcome Back</h2>
          <p class="text-[#a098ff] text-[10px] font-black uppercase tracking-widest">Access your portal with style</p>
        `;
        bglogin.insertBefore(header, bglogin.firstChild);
      }
    }

    const forgotPasswordSection = document.querySelector(
      ".m-login__forget-password",
    );
    if (forgotPasswordSection) {
      forgotPasswordSection.classList.add(
        "!bg-zinc-900/95",
        "backdrop-blur-2xl",
        "!p-6",
        "sm:!p-10",
        "!rounded-[2.5rem]",
        "!border",
        "!border-white/10",
        "!flex",
        "!flex-col",
        "!gap-8",
        "!w-[90vw]",
        "!max-w-[356px]",
        "!hidden",
        "!fixed",
        "!top-1/2",
        "!left-1/2",
        "!-translate-x-1/2",
        "!-translate-y-1/2",
        "!z-[999]",
        "!opacity-0",
        "!scale-95",
        "!transition-all",
        "!duration-500",
        "!ease-out",
      );
      forgotPasswordSection.setAttribute("id", "forgot-password-popup");

      const forgotHead = forgotPasswordSection.querySelector(".m-login__head");
      if (forgotHead) {
        forgotHead.classList.add("!flex", "!flex-col", "!gap-3", "!w-full");
      }

      const forgotTitle =
        forgotPasswordSection.querySelector(".m-login__title");
      if (forgotTitle) {
        forgotTitle.style.display = "block";
        forgotTitle.classList.add(
          "!text-white",
          "!text-2xl",
          "!font-bold",
          "!mb-0",
        );
      }

      const forgotDesc = forgotPasswordSection.querySelector(".m-login__desc");
      if (forgotDesc) {
        forgotDesc.classList.add(
          "!text-white/70",
          "!text-sm",
          "!leading-relaxed",
          "!mb-0",
        );
      }

      const forgotForm = forgotPasswordSection.querySelector(".m-login__form");
      if (forgotForm) {
        forgotForm.classList.add("!flex", "!flex-col", "!gap-4", "!w-full");
      }

      const emailInputGroup =
        forgotPasswordSection.querySelector(".m-input-icon");
      if (emailInputGroup) {
        emailInputGroup.classList.add("!w-full");
      }

      const forgotFormAction = forgotPasswordSection.querySelector(
        ".m-login__form-action",
      );
      if (forgotFormAction) {
        forgotFormAction.classList.add(
          "!flex",
          "!flex-col",
          "!gap-3",
          "!w-full",
          "!mt-2",
        );
      }

      document.body.appendChild(forgotPasswordSection);
    }

    let forgotPasswordLink = document.querySelector(
      'a[href*="ForgotPassword"]',
    );
    if (!forgotPasswordLink) {
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

      const loginFormAction = document.querySelector(
        ".m-login__signin .m-form__actions",
      );
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

    if (forgotPasswordLink && forgotPasswordSection) {
      forgotPasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (bglogin) {
          bglogin.classList.add("!hidden", "!opacity-0");
        }

        forgotPasswordSection.classList.remove("!hidden");
        setTimeout(() => {
          forgotPasswordSection.classList.remove("!opacity-0");
          forgotPasswordSection.classList.add("!opacity-100");
        }, 10);
      });

      const cancelButton = forgotPasswordSection.querySelector(
        "#m_login_forget_password_cancel",
      );
      if (cancelButton) {
        cancelButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          forgotPasswordSection.classList.remove("!opacity-100");
          forgotPasswordSection.classList.add("!opacity-0");

          setTimeout(() => {
            forgotPasswordSection.classList.add("!hidden");

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

    const signInButton = document.createElement("button");
    signInButton.id = "show-login-btn";
    signInButton.className = `
      !bg-[#a098ff] 
      !text-white
      !border-none 
      !rounded-2xl 
      !px-8
      !py-3.5 
      !cursor-pointer
      !transition-all 
      !duration-300
      !flex
      !items-center
      !justify-center
      !gap-3
      !z-[50]
      !w-full
      !sm:w-auto
      !whitespace-nowrap
      !h-[52px]
    `;
    signInButton.style.fontFamily = "'Google Sans Flex', sans-serif";
    signInButton.innerHTML = `<span class="text-sm font-medium">Sign In</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
        <polyline points="10 17 15 12 10 7"/>
        <line x1="15" y1="12" x2="3" y2="12"/>
      </svg>
    `;

    const suggestionButton = document.createElement("a");
    suggestionButton.href = "https://github.com/theajmalrazaq/superflex";
    suggestionButton.target = "_blank";
    suggestionButton.className =
      "group relative bg-white/10 backdrop-blur-sm px-8 py-3.5 rounded-2xl text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto whitespace-nowrap h-[52px]";
    suggestionButton.style.fontFamily = "'Google Sans Flex', sans-serif";
    suggestionButton.innerHTML = `
      <span class="text-sm font-medium">Star on Github (<span id="starCount">...</span>)</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-[#a098ff]">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    `;

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

    signInButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      backdrop.classList.remove("!hidden");
      setTimeout(() => {
        backdrop.classList.remove("!opacity-0");
        backdrop.classList.add("!opacity-100");
      }, 10);

      bglogin.classList.remove("!hidden");
      setTimeout(() => {
        bglogin.classList.remove("!opacity-0");
        bglogin.classList.add("!opacity-100", "!scale-100");
      }, 10);
    });

    backdrop.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (bglogin && !bglogin.classList.contains("!hidden")) {
        bglogin.classList.remove("!opacity-100", "!scale-100");
        bglogin.classList.add("!opacity-0");
      }

      if (
        forgotPasswordSection &&
        !forgotPasswordSection.classList.contains("!hidden")
      ) {
        forgotPasswordSection.classList.remove("!opacity-100");
        forgotPasswordSection.classList.add("!opacity-0");
      }

      backdrop.classList.remove("!opacity-100");
      backdrop.classList.add("!opacity-0");

      setTimeout(() => {
        if (bglogin) bglogin.classList.add("!hidden");
        if (forgotPasswordSection)
          forgotPasswordSection.classList.add("!hidden");
        backdrop.classList.add("!hidden");
      }, 300);
    });

    let rightImage = document.getElementById("login-background-image");
    if (!rightImage) {
      rightImage = document.createElement("div");
      rightImage.id = "login-background-image";
      rightImage.classList.add(
        "fixed",
        "inset-0",
        "w-full",
        "h-full",
        "z-0",
        "overflow-hidden",
      );

      const glow1 = document.createElement("div");
      glow1.className =
        "fixed top-0 right-0 w-[800px] h-[800px] bg-[#a098ff]/10 blur-[150px] rounded-full -mr-96 -mt-96 pointer-events-none z-10 animate-pulse";
      glow1.style.animationDuration = "10s";

      const glow2 = document.createElement("div");
      glow2.className =
        "fixed bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full -ml-96 -mb-96 pointer-events-none z-10 animate-pulse";
      glow2.style.animationDuration = "15s";

      const img = document.createElement("img");
      img.src = "https://theajmalrazaq.github.io/superflex/res/intro.svg";
      img.classList.add(
        "w-full",
        "h-full",
        "object-cover",
        "opacity-20",
        "mix-blend-luminosity",
      );

      const blackMask = document.createElement("div");
      blackMask.className =
        "absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black z-10";

      rightImage.appendChild(glow1);
      rightImage.appendChild(glow2);
      rightImage.appendChild(img);
      rightImage.appendChild(blackMask);
      document.body.appendChild(rightImage);
    }

    const heroDiv = document.createElement("div");
    heroDiv.className =
      "flex flex-col pt-7 justify-center items-center text-center w-full px-4 sm:px-6 mb-6 relative z-10";

    const bgUrl = chrome.runtime.getURL("assets/bg.png");
    const logoUrl = chrome.runtime.getURL("assets/logo.svg");

    const styleId = "feature-marquee-styles";
    let styleElement = document.getElementById(styleId);
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = `
        @keyframes featureMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .feature-marquee-container {
          overflow: hidden;
          width: 100vw;
          margin-left: calc(-50vw + 50%);
          position: relative;
          padding: 40px 0;
          -webkit-mask-image: linear-gradient(to right, transparent, #fff 15%, #fff 85%, transparent);
          mask-image: linear-gradient(to right, transparent, #fff 15%, #fff 85%, transparent);
        }
        .marquee-overlay {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 20%;
          z-index: 30;
          pointer-events: none;
        }
        .marquee-overlay-left {
          left: 0;
          background: linear-gradient(to right, black 0%, rgba(0,0,0,0.9) 20%, transparent 100%);
        }
        .marquee-overlay-right {
          right: 0;
          background: linear-gradient(to left, black 0%, rgba(0,0,0,0.9) 20%, transparent 100%);
        }
        .feature-marquee-track {
          display: flex;
          gap: 24px;
          width: max-content;
          animation: featureMarquee 80s linear infinite;
          position: relative;
          z-index: 10;
        }
        .review-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          gap: 12px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 20px 24px;
          border-radius: 24px;
          width: 280px;
          white-space: normal;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: default;
        }
        .review-card:hover {
          background: rgba(160, 152, 255, 0.08);
          border-color: rgba(160, 152, 255, 0.3);
          transform: translateY(-6px) scale(1.02);
        }
        .review-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          width: 100%;
        }
        .review-user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .review-name {
          color: white;
          font-weight: 700;
          font-size: 13px;
        }
        .review-verified {
          color: #a098ff;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .review-comment {
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          line-height: 1.6;
          font-weight: 500;
          text-align: left;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .feature-marquee-track:hover {
          animation-play-state: paused;
        }
        .hero-logo.filter {
          filter: brightness(0) invert(1);
        }
      `;

    const generateReviewCards = (items) => {
      return items
        .map(
          (item) => `
        <div class="review-card">
            <div class="review-header">
                <div class="review-user-info">
                    <span class="review-name">${item.name}</span>
                    <span class="review-verified">Student Verified</span>
                </div>
            </div>
            <p class="review-comment">"${item.comment}"</p>
        </div>
      `,
        )
        .join("");
    };

    const reviewsUrl = chrome.runtime.getURL("reviews.json");

    fetch(reviewsUrl)
      .then((res) => {
        if (!res.ok) return fetch(chrome.runtime.getURL("reviews.json"));
        return res;
      })
      .then((res) => res.json())
      .then((reviews) => {
        const track = document.getElementById("review-track");
        if (track) {
          const subset = reviews.slice(0, 20);
          track.innerHTML =
            generateReviewCards(subset) + generateReviewCards(subset);
        }
      })
      .catch((err) => console.error("Failed to load reviews:", err));

    const CURRENT_VERSION = "0.0.9";

    heroDiv.innerHTML = `
    <!-- Version Display Button -->
    <a href="https://theajmalrazaq.github.io/superflex" target="_blank" class="mt-4 md:mt-0 mb-6">
        <button class="group relative bg-neutral-800 rounded-full p-px overflow-hidden cursor-pointer transition-all duration-200 ease-in-out">
          <span class="flex items-center justify-center gap-1 relative z-[1] bg-neutral-950/90 rounded-full py-2 px-4 pl-2 w-full">
            <span class="relative transition-transform duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a098ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
              </svg>
              <span class="rounded-full size-11 absolute opacity-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-lg" style="animation: 14s ease-in-out 0s infinite alternate none running star-shine; background: #a098ff;"></span>
            </span>
            <span id="version-text" class="bg-gradient-to-b ml-1.5 from-white to-white/50 bg-clip-text text-xs text-transparent uppercase font-bold">
              SuperFlex v${CURRENT_VERSION}
            </span>
          </span>
        </button>
    </a>

    <!-- Logo & Text Section -->
    <div class="flex flex-col gap-6 justify-center items-center text-center relative z-10">
        <div class="group relative">
          <div class="absolute -inset-4 bg-[#a098ff]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition duration-700"></div>
          <div class="h-24 w-24 bg-black border-8 border-white/5 bg-cover rounded-[32px] flex items-center justify-center relative z-10 " style="background-image: url('${bgUrl}');">
               <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="96" height="96" fill="none">
                  <style>@keyframes splash{0%{transform:scale(.2);opacity:.8}80%{transform:scale(1.2);opacity:0}to{transform:scale(2.2);opacity:0}}</style>
                  <path fill="#a098ff" d="M13.295 10.769l2.552-5.787-7.979 7.28 3.254.225-3.353 6.362 8.485-7.388-2.959-.692z" style="animation:splash 1.5s cubic-bezier(.165,.84,.44,1) infinite both;transform-origin:center center"/>
               </svg>
          </div>
        </div>
        
        <div class="space-y-4 flex items-center flex-col gap-2 w-full px-4 sm:px-6">
          <img src="https://theajmalrazaq.github.io/superflex/res/logo.svg" alt="SuperFlex" class="w-full max-w-[280px] sm:max-w-md hero-logo filter" />
          <div class="flex items-center justify-center gap-3 w-full">
            <span class="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent to-white/20"></span>
            <span class="font-black text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.4em] text-[#a098ff]/80 text-center">Flex Portal Sucks? Not Anymore. Time to Flex on 'Em</span>
            <span class="w-8 sm:w-12 h-px bg-gradient-to-l from-transparent to-white/20"></span>
          </div>
        </div>
        
        <p class="text-zinc-400 text-sm font-medium">
          Crafted with obsession by <a href="https://github.com/theajmalrazaq" target="_blank" class="text-white hover:text-[#a098ff] transition-colors decoration-[#a098ff]/30 underline-offset-4 underline">Ajmal Razaq Bhatti</a>
        </p>
    </div>

    <!-- Buttons Container -->
    <div id="login-buttons-container" class="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 hero-buttons px-4 sm:px-6 w-full sm:w-auto">
    </div>

    <!-- Review Marquee -->
    <div class="feature-marquee-container mt-12 mb-12 relative z-10">
        <div class="marquee-overlay marquee-overlay-left"></div>
        <div class="marquee-overlay marquee-overlay-right"></div>
        <div id="review-track" class="feature-marquee-track">
            <!-- Dynamically populated -->
        </div>
    </div>





    </div>
    `;
    const checkForUpdates = async () => {
      try {
        const today = new Date().toDateString();

        const response = await fetch(
          "https://api.github.com/repos/theajmalrazaq/superflex/releases/latest",
        );
        const data = await response.json();

        if (data.tag_name) {
          const latestVer = data.tag_name.replace(/^v/, "");

          const latestParts = latestVer.split(".").map(Number);
          const currentParts = CURRENT_VERSION.split(".").map(Number);
          let isNewer = false;

          for (
            let i = 0;
            i < Math.max(latestParts.length, currentParts.length);
            i++
          ) {
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

      const buttonsContainer = heroDiv.querySelector(
        "#login-buttons-container",
      );
      if (buttonsContainer) {
        buttonsContainer.appendChild(signInButton);
        buttonsContainer.appendChild(suggestionButton);
      }
    }

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
