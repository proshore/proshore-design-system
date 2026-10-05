import { expect, test, type Page } from "@playwright/test";

/**
 * Visual regression: a full-page screenshot of every page at desktop and phone width, light and dark, compared with the
 * committed baseline. A failing test means the page looks different: look at the diff in test-results, and if the change is
 * intended run `npm run test:visual:update` and review the changed images in the pull request.
 */
const routes = ["/overview", "/landscape", "/findings", "/evidence", "/decision", "/apps/fixer", "/sign-in"];
const sizes = { desktop: { width: 1280, height: 800 }, phone: { width: 390, height: 844 } } as const;
const themes = ["light", "dark"] as const;

async function open(page: Page, route: string, theme: string) {
  await page.addInitScript((t) => { localStorage.setItem("sherpa-theme", t); }, theme);
  await page.goto(`/#${route}`);
  await page.locator("h1").first().waitFor();
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
}

for (const [size, viewport] of Object.entries(sizes)) {
  for (const theme of themes) {
    for (const route of routes) {
      test(`@visual ${route} ${size} ${theme}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await open(page, route, theme);
        await expect(page).toHaveScreenshot(`${route.replace(/\W+/g, "-").replace(/^-|-$/g, "")}-${size}-${theme}.png`, { fullPage: true });
      });
    }
  }
}

for (const [size, viewport] of Object.entries(sizes)) {
  test(`@visual finding drawer ${size}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await open(page, "/findings", "light");
    await page.locator(".dt-rowbtn").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page).toHaveScreenshot(`state-finding-drawer-${size}.png`);
  });
  test(`@visual Ask Sherpa ${size}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await open(page, "/overview", "light");
    await page.getByRole("button", { name: "Ask Sherpa" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page).toHaveScreenshot(`state-ask-sherpa-${size}.png`);
  });
}
