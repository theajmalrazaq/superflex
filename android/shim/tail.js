function themeflag() {
  return document.documentElement.classList.contains("dark");
}

function pushtheme() {
  if (window.SFNative) window.SFNative.theme(themeflag());
}

function revealnow() {
  pushtheme();
  if (
    window.SFNative &&
    document.body &&
    document.body.classList.contains("!visible")
  ) {
    window.SFNative.ready();
  }
}

new MutationObserver(pushtheme).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"],
});
pushtheme();
setTimeout(revealnow, 1500);
