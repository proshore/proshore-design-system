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
  // Visual baselines are per platform (macOS and Linux render text slightly differently). Linux ones are made by the "Visual baselines" workflow.
  snapshotPathTemplate: "{testDir}/visual-baselines/{platform}/{arg}{ext}",
  expect: { toHaveScreenshot: { maxDiffPixels: 20, animations: "disabled", caret: "hide" } },
  use: { baseURL: "http://localhost:4181", channel: process.env.CI ? undefined : "chrome", viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" },
  webServer: { command: "npm run preview -- --port 4181 --strictPort", url: "http://localhost:4181", reuseExistingServer: true, timeout: 60_000 },
});
