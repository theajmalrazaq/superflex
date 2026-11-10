(function () {
  var tag = null;
  if (window.__sfmain) return;
  window.__sfmain = true;
  tag = document.createElement("script");
  tag.src = "/__superflex__/superflex.js";
  (document.head || document.documentElement).appendChild(tag);
})();
