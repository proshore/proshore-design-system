import { resolve } from "node:path";
import { defineConfig } from "vite";

/** Library build of the CORE entry (src/entry.ts) into .pack/dist. Run through `npm run pack` (scripts/pack.mjs). */
export default defineConfig({
  build: {
    outDir: ".pack/dist",
    emptyOutDir: true,
    assetsInlineLimit: 0, // fonts stay separate files (the browser loads only the subsets it needs)
    cssCodeSplit: false,
    sourcemap: true,
    target: "es2022",
    lib: { entry: { index: resolve(import.meta.dirname, "src/entry.ts") }, formats: ["es"], cssFileName: "styles" },
    rollupOptions: {
      // Everything a consumer already needs or installs as a dependency stays external.
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^react-aria-components($|\/)/, /^@tanstack\//, /^@visx\//, /^@internationalized\//],
      output: { entryFileNames: "[name].js", chunkFileNames: "chunks/[name]-[hash].js", assetFileNames: (a) => (a.names?.[0]?.endsWith(".css") ? "[name][extname]" : "assets/[name]-[hash][extname]") },
    },
  },
});
