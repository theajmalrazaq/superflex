(function () {
  if (window.__sfmain) return;
  window.__sfmain = true;

  var root = document.head || document.documentElement || document.body;
  if (!root) return;

  var b = document.createElement("script");
  b.src = "/__superflex__/bridge.js";
  root.appendChild(b);

  var tag = document.createElement("script");
  tag.src = "/__superflex__/superflex.js";
  root.appendChild(tag);
})();
