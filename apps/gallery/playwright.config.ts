import { defineConfig } from "@playwright/test";

/**
 * Runs against the production build served by `vite preview` (run `npm run build` first; `npm run check` does both).
 * Locally uses the Chrome installed on the machine; on CI it uses Playwright's Chromium (`npx playwright install chromium`).
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  // Visual baselines are per platform (macOS and Linux render text slightly differently). Linux ones are made by the "Visual baselines" workflow.
  snapshotPathTemplate: "{testDir}/visual-baselines/{platform}/{arg}{ext}",
  expect: { toHaveScreenshot: { maxDiffPixels: 20, animations: "disabled", caret: "hide" } },
  use: { baseURL: "http://localhost:4180", channel: process.env.CI ? undefined : "chrome", viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" },
  webServer: { command: "npm run preview -- --port 4180 --strictPort", url: "http://localhost:4180", reuseExistingServer: true, timeout: 60_000 },
});
