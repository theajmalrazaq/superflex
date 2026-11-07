import { defineUnlistedScript } from "wxt/utils/define-unlisted-script";

export default defineUnlistedScript(() => {
  (function () {
    if (window.jQuery && window.jQuery.fn && window.jQuery.fn.mCustomScrollbar) {
      const originalMCustomScrollbar = window.jQuery.fn.mCustomScrollbar;
      window.jQuery.fn.mCustomScrollbar = function (...args) {
        try {
          return originalMCustomScrollbar.apply(this, args);
        } catch (e) {
          console.warn("Suppressed mCustomScrollbar error:", e);
          return this;
        }
      };
    }
  })();
});
