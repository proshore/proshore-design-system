import { defineConfig } from "@playwright/test";

/**
 * Runs against the production build served by `vite preview` (run `npm run build` first; `npm run check` does both).
 * Uses the Chrome that is installed on the machine, so no browser download is needed.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:4181", channel: process.env.CI ? undefined : "chrome", viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" },
  webServer: { command: "npm run preview -- --port 4181 --strictPort", url: "http://localhost:4181", reuseExistingServer: true, timeout: 60_000 },
});
