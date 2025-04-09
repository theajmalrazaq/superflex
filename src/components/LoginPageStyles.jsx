import { useEffect } from 'react';

function LoginPageStyles() {
  useEffect(() => {
    document.querySelectorAll(".m-grid.m-grid--hor:not(.m-grid--desktop):not(.m-grid--desktop-and-tablet):not(.m-grid--tablet):not(.m-grid--tablet-and-mobile):not(.m-grid--mobile) > .m-grid__item.m-grid__item--fluid")
      .forEach(element => {
        element.classList.add("!justify-center", "!w-full");
      });

    document.querySelectorAll(".m-grid.m-grid--ver-desktop.m-grid--desktop > .m-grid__item.m-grid__item--fluid")
      .forEach(element => {
        element.classList.add("!hidden", "!w-full");
      });

    document.querySelectorAll(".m-login__form-sub").forEach(element => {
      element.remove();
    });

    document.querySelector(".m-grid__item.m-grid__item--order-tablet-and-mobile-2.m-login__aside")
      .classList.add("!w-full", "!p-0");

    document.querySelector(".m-stack__item.m-stack__item--fluid")
      .classList.add("!flex", "!justify-center", "!h-screen", "!items-center");


    document.querySelectorAll(".m-login__wrapper").forEach(element => {
      element.classList.add("!flex", "!flex-col", "!items-center", "!w-fit", "!p-0");
    });

    document.querySelector(".m-form__actions.text-center").classList.add("!p-0");

    const formHelp = document.querySelector(".m-form__help");
    formHelp.classList.add("!text-white", "!text-xs");


    document.querySelectorAll(".input-group.m-input-group.m-input-group--square").forEach(element => {
      element.classList.add("!gap-1.5", "!flex-col", "!w-full");
    });

    document.querySelectorAll(".input-group-addon").forEach(element => {
      element.remove();
    });

    document.querySelectorAll(".form-control.m-input").forEach(element => {
      element.classList.add("!rounded-lg", "!bg-transparent", "!border", "!border-white/10", "!text-white", "!placeholder:text-white/50", "!placeholder:opacity-100", "!h-[40px]", "!px-3", "!w-full");
    });

    document.querySelectorAll(".m-login.m-login--1").forEach(element => {
      element.classList.add("!bg-transparent", "!text-white");
    });

    let logodiv = document.createElement("div");
    // eslint-disable-next-line no-undef
    logodiv.innerHTML = `<img src="${chrome.runtime.getURL('public/logo.svg')}" class="logo" alt="Logo" />`;
    logodiv.classList.add("!pb-4", "!border-b", "!border-white/10", "!w-fit");

    document.querySelector(".m-login__logo").remove();

    document.querySelectorAll(".btn-primary").forEach(button => {
      button.classList.add("!bg-primary", "!border-white/10", "!text-white", "!rounded-2xl", "!w-full", "!h-[40px]", "!px-3", "!py-2", "!text-center", "!flex", "justify-center", "items-center", "!shadow-none", "hover:shadow-none");
      button.style.fontFamily = "'Product Sans', sans-serif";
    });

    document.querySelector(".la-sign-in").remove();
    let logintitle = document.querySelector(".m-login__title");

    // Replace inline styles with Tailwind classes
    logintitle.innerHTML = "<h1 class='!text-2xl !font-black'>Welcome Back!</h1> <br/> <p class='!text-base'>Enter Your Login Details</p>";
    logintitle.classList.add("!text-center");
    logintitle.style.lineHeight = "0.7"; // Keep this as it's specific

    let bglogin = document.querySelector(".m-login__signin");
    bglogin.prepend(logodiv);

    // Apply Tailwind classes instead of inline styles
    bglogin.classList.add("!bg-black", "!p-8", "!rounded-[32px]", "!border", "!border-white/10", "!shadow-lg", "!flex", "!flex-col", "!items-center", "!justify-center");

    document.body.classList.add("!h-screen", "!overflow-hidden");
  }, []);

  return null;
}

export default LoginPageStyles;