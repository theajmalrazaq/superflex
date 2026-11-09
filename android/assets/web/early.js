(function () {
  if (window.__sfearly) return;
  window.__sfearly = true;

  // 1. Polyfill Chrome Extension runtime and storage for Android WebView
  if (!window.chrome) window.chrome = {};
  if (!window.chrome.runtime) {
    window.chrome.runtime = {
      id: "superflex-native",
      getURL: function (path) {
        return "/__superflex__/" + path;
      },
      getManifest: function () {
        return { version: "7.0.0" };
      },
      sendMessage: function (msg, cb) {
        if (cb) setTimeout(function () { cb({ success: true, reset: false }); }, 0);
      },
      onMessage: {
        addListener: function () {},
        removeListener: function () {},
        hasListener: function () { return false; }
      },
      connect: function () {
        return {
          onMessage: { addListener: function () {} },
          onDisconnect: { addListener: function () {} },
          postMessage: function () {},
          disconnect: function () {}
        };
      }
    };
  }
  if (!window.chrome.storage) {
    window.chrome.storage = {
      local: {
        get: function (keys, cb) {
          var res = {};
          try {
            if (Array.isArray(keys)) {
              for (var i = 0; i < keys.length; i++) {
                var v = localStorage.getItem("sf_" + keys[i]);
                if (v !== null) try { res[keys[i]] = JSON.parse(v); } catch (e) { res[keys[i]] = v; }
              }
            } else if (typeof keys === "string") {
              var v = localStorage.getItem("sf_" + keys);
              if (v !== null) try { res[keys] = JSON.parse(v); } catch (e) { res[keys] = v; }
            } else if (typeof keys === "object" && keys !== null) {
              for (var k in keys) {
                var v = localStorage.getItem("sf_" + k);
                res[k] = v !== null ? JSON.parse(v) : keys[k];
              }
            }
          } catch (e) {}
          if (cb) setTimeout(function () { cb(res); }, 0);
        },
        set: function (items, cb) {
          try {
            for (var k in items) {
              localStorage.setItem("sf_" + k, JSON.stringify(items[k]));
            }
          } catch (e) {}
          if (cb) setTimeout(cb, 0);
        },
        remove: function (keys, cb) {
          try {
            var arr = Array.isArray(keys) ? keys : [keys];
            for (var i = 0; i < arr.length; i++) {
              localStorage.removeItem("sf_" + arr[i]);
            }
          } catch (e) {}
          if (cb) setTimeout(cb, 0);
        },
        clear: function (cb) {
          try {
            var toRemove = [];
            for (var i = 0; i < localStorage.length; i++) {
              var k = localStorage.key(i);
              if (k && k.indexOf("sf_") === 0) toRemove.push(k);
            }
            for (var i = 0; i < toRemove.length; i++) localStorage.removeItem(toRemove[i]);
          } catch (e) {}
          if (cb) setTimeout(cb, 0);
        }
      }
    };
  }

  // 2. CSS Injector
  function place() {
    var root = document.head || document.documentElement;
    if (document.getElementById("sf-css")) return true;
    if (!root) return false;
    var link = document.createElement("link");
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
  if (!place() && document.documentElement) {
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // 3. Failsafe visibility: only trigger as fallback if React mount times out
  setTimeout(function () {
    if (document.body && !document.body.classList.contains("!visible")) {
      document.body.classList.add("!visible");
      document.body.style.setProperty("visibility", "visible", "important");
      try {
        if (window.SFNative && window.SFNative.ready) window.SFNative.ready();
      } catch (e) {}
    }
  }, 3500);
})();
