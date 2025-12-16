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
    const mainContainer = document.querySelector(".m-stack__item.m-stack__item--fluid");
    if (mainContainer) {
        mainContainer.classList.add(
            "!flex",
            "!justify-center",
            "!items-center",
            "!h-screen",
            "!w-full",
            "!bg-transparent", 
            "!relative",
            "!z-[50]" 
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
    if(formHelp) formHelp.classList.add("!text-white", "!text-xs");

    document
      .querySelectorAll(".input-group.m-input-group.m-input-group--square")
      .forEach((element) => {
        element.classList.add("!gap-1.5", "!flex-col", "!w-full");
      });

    document.querySelectorAll(".input-group-addon").forEach((element) => {
      element.remove();
    });

    // Inputs Styling
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
        "!w-full"
      );
      element.style.fontFamily = "'Google Sans Flex', sans-serif";
    });

    document.querySelectorAll(".m-login.m-login--1").forEach((element) => {
      element.classList.add("!bg-transparent", "!text-white");
    });

    const oldLogo = document.querySelector(".m-login__logo");
    if(oldLogo) oldLogo.remove();

    // Button Styling
    document.querySelectorAll(".btn-primary").forEach((button) => {
      button.classList.add(
        "!bg-[#a098ff]",
        "!text-white",
        "!font-bold",
        "!border-none",
        "!rounded-xl",
        "!w-full",
        "!h-[44px]", // Slightly taller
        "!px-3",
        "!py-2",
        "!text-center",
        "!flex",
        "justify-center",
        "items-center",
        "hover:!bg-[#8f86ff]",
        "!transition-all",
        "!duration-200"
      );
      button.style.fontFamily = "'Google Sans Flex', sans-serif";
    });

    const signInIcon = document.querySelector(".la-sign-in");
    if(signInIcon) signInIcon.remove();

    // Title Logic - Keeping it hidden as requested
    let logintitle = document.querySelector(".m-login__title");
    if(logintitle) {
        logintitle.style.display = "none";
    }

    // Card Styling (The "Old Card")
    let bglogin = document.querySelector(".m-login__signin");
    if(bglogin) {
        // Remove old inline styles if any and apply new card classes
        // Note: We use !important classes to override defaults
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
          "!min-w-[380px]"
        );
    }

    // 4. BACKGROUND IMAGE INJECTION
    let rightImage = document.getElementById("login-background-image");
    if (!rightImage) {
        rightImage = document.createElement("div");
        rightImage.id = "login-background-image";
        rightImage.classList.add(
            "fixed",
            "inset-0",
            "w-full",
            "h-full",
            "z-0"
        );

        // Image
        const img = document.createElement("img");
        img.src = "https://theajmalrazaq.github.io/superflex/res/intro.svg";
        img.classList.add(
            "w-full",
            "h-full",
            "object-cover"
        );
        rightImage.appendChild(img);

        // Add Black Mask 
        const blackMask = document.createElement("div");
        blackMask.className = "absolute inset-0 bg-black/60 z-10"; // Increased opacity for better text contrast
        rightImage.appendChild(blackMask);
        document.body.appendChild(rightImage);
    }

    // --- HERO SECTION INJECTION ---
    const heroDiv = document.createElement("div");
    heroDiv.className = "flex flex-col items-center justify-center text-center w-full mb-6";
    
    const bgUrl = chrome.runtime.getURL("public/bg.png");
    const logoUrl = chrome.runtime.getURL("public/logo.svg");

    heroDiv.innerHTML = `
    <!-- Logo & Text Section -->
    <div class="flex flex-col gap-4 justify-center items-center text-center">
        <div class="h-24 w-24 bg-black border-[6px] border-white/5 bg-cover rounded-[2rem] flex items-center justify-center  relative overflow-hidden" style="background-image: url('${bgUrl}');">
             <div class="absolute inset-0 bg-black/20"></div>
             <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="none" class="relative z-10">
                <style>@keyframes splash{0%{transform:scale(.2);opacity:.8}80%{transform:scale(1.2);opacity:0}to{transform:scale(2.2);opacity:0}}</style>
                <path fill="#a098ff" d="M13.295 10.769l2.552-5.787-7.979 7.28 3.254.225-3.353 6.362 8.485-7.388-2.959-.692z" style="animation:splash 1.5s cubic-bezier(.165,.84,.44,1) infinite both;transform-origin:center center"/>
             </svg>
        </div>
        
        <img src="https://theajmalrazaq.github.io/superflex/res/logo.svg" alt="SuperFlex" class="w-84 opacity-90 filter mt-4" />
        
        <div class="space-y-2 mt-2">
            <p class="!font-mono text-white text-sm tracking-wide">Flex Portal Sucks? Not Anymore. Time to Flex on 'Em</p>
         
        </div>
    </div>
    `;

    // Fetch Star Count
    fetch('https://api.github.com/repos/theajmalrazaq/superflex')
        .then(res => res.json())
        .then(data => {
            const el = document.getElementById('starCount');
            if(el && data.stargazers_count !== undefined) {
                el.innerText = data.stargazers_count;
            }
        })
        .catch(err => console.error("Failed to fetch stars", err));

    if(bglogin && bglogin.parentNode) {
        // We want to insert heroDiv BEFORE bglogin in its parent container
        // This makes the hero section appear ABOVE the card, outside of the border/background of the card itself.
        const wrapper = bglogin.parentNode;
        
        // Remove any previously injected hero sections to avoid duplicates
        const existingHero = wrapper.querySelector('.hero-section-injected');
        if (existingHero) {
            existingHero.remove();
        }
        
        // Also check inside bglogin just in case it was there from before
        const internalHero = bglogin.querySelector('.hero-section-injected');
        if (internalHero) {
            internalHero.remove();
        }

        heroDiv.classList.add('hero-section-injected');
        wrapper.insertBefore(heroDiv, bglogin);
    }

    // Apply Tailwind classes instead of inline styles
    bglogin.classList.add(
      "!bg-zinc-900/40", // Updated card background
      "!p-6",
      "!rounded-[32px]",
      "!border",
      "!border-white/10",
      "!flex",
      "!flex-col",
      "!items-center",
      "!justify-center",
    );

    // Update password toggle functionality
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
