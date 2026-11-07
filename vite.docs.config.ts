import { defineConfig } from "vite";

export default defineConfig({
  root: "docs",
  base: "./",
  publicDir: false,
  build: {
    outDir: "../dist-docs",
    emptyOutDir: true,
    rollupOptions: {
      input: { home: "docs/index.html", documentation: "docs/docs.html" },
    },
  },
});
