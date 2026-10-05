import { defineConfig } from "@playwright/test";

/**
 * Runs against the production build served by `vite preview` (run `npm run build` first; `npm run check` does both).
 * Locally uses the Chrome installed on the machine; on CI it uses Playwright's Chromium (`npx playwright install chromium`).
 */
/** Set E2E_PORT to run next to another checkout's preview server (gallery uses it, discovery-example the next port). */
const port = Number(process.env.E2E_PORT ?? 4180);

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  // Visual baselines are per platform (macOS and Linux render text slightly differently). Linux ones are made by the "Visual baselines" workflow.
  snapshotPathTemplate: "{testDir}/visual-baselines/{platform}/{arg}{ext}",
  expect: { toHaveScreenshot: { maxDiffPixels: 20, threshold: 0.02, animations: "disabled", caret: "hide" } },
  use: { baseURL: `http://localhost:${port}`, channel: process.env.CI ? undefined : "chrome", viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" },
  webServer: { command: `npm run preview -- --port ${port} --strictPort`, url: `http://localhost:${port}`, reuseExistingServer: true, timeout: 60_000 },
});
