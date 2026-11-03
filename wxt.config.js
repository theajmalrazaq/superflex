import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  outDir: "dist",
  outDirTemplate: "",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "SuperFlex",
    description: "A modern UI overlay and AI academic assistant for the Flex Student Portal.",
    icons: {
      16: "assets/favicon.png",
      32: "assets/favicon.png",
      48: "assets/favicon.png",
      128: "assets/favicon.png",
    },
    host_permissions: [
      "https://flexstudent.nu.edu.pk/*",
      "https://*.puter.site/*",
      "https://api-gateway.umami.dev/*",
    ],
    web_accessible_resources: [
      {
        resources: [
          "assets/favicon.png",
          "assets/favicon.svg",
          "assets/logo.svg",
          "assets/logo_sec.svg",
          "assets/clouds/cloud-2.webp",
          "reviews.json",
          "scripts/umami.js",
          "scripts/puter.js",
          "scripts/polyfill.js",
          "scripts/rustls.js",
          "scripts/bridge.js",
          "scripts/turnstile-theme.js",
        ],
        matches: ["<all_urls>"],
      },
    ],
  },
});
