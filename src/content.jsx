import React from "react";
import { createRoot } from "react-dom/client";
import LoadingOverlay from "./components/LoadingOverlay";
import LoginPageStyles from "./components/LoginPageStyles";
import PathRouter from "./components/PathRouter";
import "./styles/tailwind.css";

const container = document.createElement("div");
container.id = "react-chrome-app";
document.body.insertBefore(container, document.body.firstChild);

// Create a React root
const root = createRoot(container);

// Detect which page we're on
const isLoginPage = window.location.href.includes("Login");

// Create a style element for the @font-face declaration
const fontStyle = document.createElement("style");
fontStyle.textContent = `
  @font-face {
    font-family: 'Product Sans';
    src: url('https://fonts.gstatic.com/s/productsans/v5/HYvgU2fE2nRJvZ5JFAumwegdm0LZdjqr5-oayXSOefg.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
`;

// Add the style element to the head
document.head.appendChild(fontStyle);
if (document.getElementById("overlay23")) {
  document.getElementById("overlay23").remove(); // Remove the overlay element
}

let favicon = document.querySelector("link[rel~='icon']");
if (!favicon) {
  favicon = document.createElement("link");
  favicon.rel = "icon";
  document.head.appendChild(favicon);
}
// eslint-disable-next-line no-undef
favicon.href = `${chrome.runtime.getURL("public/favicon.svg")}`;
if (document.querySelector(".m-grid__item.m-footer")) {
  document.querySelector(".m-grid__item.m-footer").remove(); // Remove the footer element
}
// Apply the font to elements
document.body.style.fontFamily = "'Product Sans', sans-serif";
document.querySelectorAll("input").forEach((input) => {
  input.style.fontFamily = "'Product Sans', sans-serif";
});
document.querySelectorAll("button").forEach((button) => {
  button.style.fontFamily = "'Product Sans', sans-serif";
});

// Apply global Tailwind dark mode and background
document.documentElement.classList.add("dark");
document.body.style.backgroundColor = "black";
// eslint-disable-next-line no-undef
document.body.style.backgroundImage = `url("${chrome.runtime.getURL(
  "public/overlay.png"
)}")`;
document.body.style.backgroundRepeat = "no-repeat";

// Render the components


root.render(
  <>
    <LoadingOverlay />
    {isLoginPage ? <LoginPageStyles /> : <PathRouter />}
  </>
);

setTimeout(() => {
  document.body.classList.add("!visible");
}, 0);
