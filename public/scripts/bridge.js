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

  let activeRequestId = null;

  document.addEventListener("superflex-ai-interrupt", (e) => {
    const { id } = e.detail;
    if (activeRequestId === id) {
      activeRequestId = null;
    }
  });

  document.addEventListener("superflex-ai-query", async (e) => {
    const { id, prompt, model } = e.detail;
    activeRequestId = id;

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
        model: model || "gpt-4o-mini",
        stream: true,
      });

      const timeoutId = setTimeout(() => {
        if (activeRequestId === id) {
           activeRequestId = null;
           document.dispatchEvent(new CustomEvent("superflex-ai-response", {
             detail: { id, error: "Request timed out after 30s" }
           }));
        }
      }, 30000);

      for await (const part of response) {
        clearTimeout(timeoutId); // Clear timeout on first byte
        if (activeRequestId !== id) {
          break;
        }

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

  document.addEventListener("superflex-check-auth", async () => {
    if (!window.puter) return;
    try {
      const isSignedIn = await window.puter.auth.isSignedIn();
      console.log("[SuperFlex Bridge] Auth check:", isSignedIn);
      document.dispatchEvent(new CustomEvent("superflex-auth-status", { detail: { isSignedIn } }));
    } catch (e) {
      console.error("Failed to check auth status:", e);
    }
  });

  document.addEventListener("superflex-get-usage", async () => {
    if (!window.puter) return;
    try {
      const usage = await window.puter.auth.getMonthlyUsage();
      console.log("[SuperFlex Bridge] Usage data fetched:", usage);
      if (usage) {
        document.dispatchEvent(new CustomEvent("superflex-usage-data", { detail: usage }));
      }
    } catch (e) {
      console.error("Failed to get monthly usage:", e);
    }
  });

  document.addEventListener("superflex-auth-logout", async () => {
    if (!window.puter) return;
    try {
      console.log("[SuperFlex Bridge] Logging out...");
      await window.puter.auth.signOut();
      document.dispatchEvent(new CustomEvent("superflex-auth-status", { detail: { isSignedIn: false } }));
    } catch (e) {
      console.error("Failed to sign out:", e);
    }
  });
})();
