(function () {
  if (location.origin !== "https://flexstudent.nu.edu.pk") return;
  if (window.__sfearly) return;
  window.__sfearly = true;

  var wait = window.__sfwait || 5000;
  var tried = false;

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

  function load(suffix) {
    var tag = document.createElement("script");
    tag.src = "/__superflex__/superflex.js" + suffix;
    (document.head || document.documentElement).appendChild(tag);
  }

  function ready() {
    if (window.SFNative) window.SFNative.ready();
  }

  function giveup() {
    var link = document.getElementById("sf-css");
    if (link) link.remove();
    if (document.body) document.body.style.setProperty("visibility", "visible", "important");
    ready();
  }

  function broken() {
    if (!window.__superflex) return true;
    if (!document.body || !document.body.classList.contains("!visible")) return true;
    return false;
  }

  function last() {
    if (broken()) giveup();
  }

  function first() {
    if (!window.__superflex && !tried) {
      tried = true;
      load("?retry=1");
    }
    setTimeout(last, wait);
  }

  function launch() {
    if (window.__sfmain) return;
    window.__sfmain = true;
    load("");
    setTimeout(first, wait);
  }

  var observer = new MutationObserver(watch);
  if (!place()) observer.observe(document, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", launch);
  } else {
    launch();
  }
})();
