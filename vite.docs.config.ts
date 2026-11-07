import { defineConfig } from "vite";

export default defineConfig({
  root: "docs",
  base: "./",
  publicDir: false,
  plugins: [
    {
      name: "docs-typescript-development",
      apply: "serve",
      transformIndexHtml(html) {
        return html.replace(
          /<script[^>]*src="\.\/scripts\/generated\/(theme|index|docs)\.js"[^>]*><\/script>/g,
          (_tag, entry) => `<script type="module" src="./scripts/${entry}.ts"></script>`,
        );
      },
    },
  ],
  build: {
    outDir: "../dist-docs",
    emptyOutDir: true,
    rollupOptions: {
      input: { home: "docs/index.html", documentation: "docs/docs.html" },
    },
  },
});
