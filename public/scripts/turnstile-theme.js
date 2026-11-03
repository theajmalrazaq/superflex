(() => {
  if (window.__superflexTurnstileThemeBridge) return;
  window.__superflexTurnstileThemeBridge = true;

  const selector = ".cf-turnstile";
  let renderTimer;
  let widgetId;

  const selectedTheme = () =>
    document.documentElement.dataset.superflexTheme === "dark" ? "dark" : "light";

  const renderWidget = () => {
    window.clearTimeout(renderTimer);

    const currentContainer = document.querySelector(selector);
    if (!currentContainer) return;

    if (!window.turnstile?.render) {
      renderTimer = window.setTimeout(renderWidget, 100);
      return;
    }

    const theme = selectedTheme();
    const sitekey = currentContainer.dataset.sitekey;
    if (!sitekey) return;

    if (widgetId) {
      window.turnstile.remove(widgetId);
      widgetId = undefined;
    }

    // A Turnstile widget cannot change theme after it has rendered. Replacing its
    // host also recovers widgets that were left half-rendered by auto discovery.
    const container = currentContainer.cloneNode(false);
    container.dataset.theme = theme;
    container.removeAttribute("data-superflex-rendered-theme");
    currentContainer.replaceWith(container);

    try {
      const options = { sitekey, theme };
      if (container.dataset.action) options.action = container.dataset.action;
      if (container.dataset.cdata) options.cData = container.dataset.cdata;

      widgetId = window.turnstile.render(container, options);
      container.dataset.superflexRenderedTheme = theme;
    } catch (error) {
      console.error("SuperFlex could not render the Turnstile widget:", error);
      renderTimer = window.setTimeout(renderWidget, 250);
    }
  };

  const scheduleRender = () => {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(() => {
      if (window.turnstile?.ready) {
        window.turnstile.ready(renderWidget);
      } else {
        renderWidget();
      }
    }, 0);
  };

  document.addEventListener("superflex-theme-mode-changed", scheduleRender);
  scheduleRender();
})();
