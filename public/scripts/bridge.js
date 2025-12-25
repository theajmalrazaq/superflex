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

  document.addEventListener("superflex-ai-query", async (e) => {
    const { id, prompt } = e.detail;

    if (!window.puter) {
      document.dispatchEvent(
        new CustomEvent("superflex-ai-response", {
          detail: { id, error: "Puter.js library not found in Main World" },
        }),
      );
      return;
    }

    try {
      const isSignedIn = await window.puter.auth.isSignedIn();
      if (!isSignedIn) {
        document.dispatchEvent(
          new CustomEvent("superflex-ai-response", {
            detail: { id, error: "auth_required" },
          }),
        );
        return;
      }

      const response = await window.puter.ai.chat(prompt, {
        model: "gemini-2.0-flash",
        stream: true,
      });

      for await (const part of response) {
        if (part?.text) {
          document.dispatchEvent(
            new CustomEvent("superflex-ai-response", {
              detail: { id, text: part.text, done: false },
            }),
          );
        }
      }

      document.dispatchEvent(
        new CustomEvent("superflex-ai-response", {
          detail: { id, done: true },
        }),
      );
    } catch (err) {
      console.error("SuperFlex Bridge Error:", err);
      let errorMsg = err.message || "Unknown error";
      if (err.code === "auth_canceled") errorMsg = "auth_canceled";

      document.dispatchEvent(
        new CustomEvent("superflex-ai-response", {
          detail: { id, error: errorMsg },
        }),
      );
    }
  });

  document.addEventListener("superflex-auth-trigger", async () => {
    if (window.puter) {
      try {
        await window.puter.auth.signIn();
        document.dispatchEvent(
          new CustomEvent("superflex-auth-status", {
            detail: { success: true },
          }),
        );
      } catch (e) {
        document.dispatchEvent(
          new CustomEvent("superflex-auth-status", {
            detail: { error: e.message },
          }),
        );
      }
    }
  });
})();
