import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  outDir: "dist",
  outDirTemplate: "",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "SuperFlex",
    description: "A modern UI overlay and AI academic assistant for the Flex Student Portal.",
    permissions: ["storage"],
    icons: {
      16: "assets/favicon.png",
      32: "assets/favicon.png",
      48: "assets/favicon.png",
      128: "assets/favicon.png",
    },
    host_permissions: [
      "https://*.nu.edu.pk/*",
      "https://generativelanguage.googleapis.com/*",
    ],
    web_accessible_resources: [
      {
        resources: [
          "assets/favicon.png",
          "assets/favicon.svg",
          "assets/logo.svg",
          "assets/clouds/cloud-2.webp",
          "reviews.json",
          "bridge.js",
        ],
        matches: ["<all_urls>"],
      },
    ],
  },
});
