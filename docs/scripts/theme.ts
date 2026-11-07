document.documentElement.classList.toggle(
  "dark",
  localStorage.getItem("superflex-theme-mode") === "dark",
);

export {};
