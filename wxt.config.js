import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  outDir: "dist",
  outDirTemplate: "",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "SuperFlex",
    description: "A modern UI overlay and AI academic assistant for the Flex Student Portal.",
    permissions: ["tabs", "storage"],
    icons: {
      16: "assets/favicon.png",
      32: "assets/favicon.png",
      48: "assets/favicon.png",
      128: "assets/favicon.png",
    },
    host_permissions: [
      "https://flexstudent.nu.edu.pk/*",
      "https://khi.nu.edu.pk/*",
      "https://lhr.nu.edu.pk/*",
      "https://isb.nu.edu.pk/*",
      "https://cfd.nu.edu.pk/*",
      "https://mtn.nu.edu.pk/*",
      "https://pwr.nu.edu.pk/*",
      "https://generativelanguage.googleapis.com/*",
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
          "scripts/bridge.js",
        ],
        matches: ["<all_urls>"],
      },
    ],
  },
});
