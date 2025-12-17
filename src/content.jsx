import { createRoot } from "react-dom/client";
import LoadingOverlay from "./components/LoadingOverlay";
import LoginPageStyles from "./components/LoginPageStyles";
import PathRouter from "./components/PathRouter";
import "./styles/tailwind.css";

(() => {
  const script = document.createElement("script");
  
  script.src = chrome.runtime.getURL("umami.js");
  script.defer = true;
  script.dataset.websiteId = "17490ccf-0b15-4d8a-a908-5e774ad648de";
  document.head.appendChild(script);
})();

const container = document.createElement("div");
container.id = "react-chrome-app";
document.body.insertBefore(container, document.body.firstChild);

const root = createRoot(container);


const isLoginPage = window.location.href.includes("Login");













if (document.getElementById("overlay23")) {
  document.getElementById("overlay23").remove(); 
}

let favicon = document.querySelector("link[rel~='icon']");
if (!favicon) {
  favicon = document.createElement("link");
  favicon.rel = "icon";
  document.head.appendChild(favicon);
}

favicon.href = `${chrome.runtime.getURL("public/favicon.svg")}`;
if (document.querySelector(".m-grid__item.m-footer")) {
  document.querySelector(".m-grid__item.m-footer").remove(); 
}


document.body.style.fontFamily = "'Google Sans Flex', sans-serif";
document.querySelectorAll("input").forEach((input) => {
  input.style.fontFamily = "'Google Sans Flex', sans-serif";
});
document.querySelectorAll("button").forEach((button) => {
  button.style.fontFamily = "'Google Sans Flex', sans-serif";
});


document.documentElement.classList.add("dark");
document.body.style.backgroundColor = "black";

document.body.style.backgroundImage = `url("${chrome.runtime.getURL(
  "public/overlay.png",
)}")`;
document.body.style.backgroundRepeat = "no-repeat";

root.render(
  <>
    <LoadingOverlay />
    {isLoginPage ? <LoginPageStyles /> : <PathRouter />}
  </>,
);

setTimeout(() => {
  document.body.classList.add("!visible");
  document.body.classList.add("!overflow-auto");
}, 500);
