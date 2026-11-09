(function () {
  if (window.__sfearly) return;
  window.__sfearly = true;

  function place() {
    var root = document.head || document.documentElement;
    var link = null;
    if (document.getElementById("sf-css")) return true;
    if (!root) return false;
    link = document.createElement("link");
    link.id = "sf-css";
    link.rel = "stylesheet";
    link.href = "/__superflex__/content.css";
    root.appendChild(link);
    return true;
  }

  function watch() {
    if (place()) observer.disconnect();
  }

  var observer = new MutationObserver(watch);
  if (!place()) observer.observe(document, { childList: true, subtree: true });
})();
