function themeflag() {
  return document.documentElement.classList.contains("dark");
}

function pushtheme() {
  if (window.SFNative) window.SFNative.theme(themeflag());
}

function revealnow() {
  if (window.SFNative) window.SFNative.ready();
  pushtheme();
}

new MutationObserver(pushtheme).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"],
});
setTimeout(revealnow, 700);
