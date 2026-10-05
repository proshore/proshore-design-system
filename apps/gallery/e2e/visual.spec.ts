import { expect, test, type Page } from "@playwright/test";

/**
 * Visual regression: a full-page screenshot of every page at desktop and phone width, light and dark, compared with the
 * committed baseline. A failing test means the page looks different: look at the diff in test-results, and if the change is
 * intended run `npm run test:visual:update` and review the changed images in the pull request.
 */
const routes = ["/foundations", "/layout", "/forms", "/tables", "/charts", "/actions", "/overlays", "/dialogs", "/brand", "/examples", "/shell", "/sign-in"];
const sizes = { desktop: { width: 1280, height: 800 }, phone: { width: 390, height: 844 } } as const;
const themes = ["light", "dark"] as const;

async function open(page: Page, route: string, theme: string) {
  await page.addInitScript((t) => { localStorage.setItem("proshore-theme", t); }, theme);
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

/** States that only exist after an interaction: the ones people use on a phone. */
for (const [size, viewport] of Object.entries(sizes)) {
  test(`@visual account menu open ${size}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await open(page, "/foundations", "light");
    await page.getByRole("button", { name: /account menu/i }).click();
    await expect(page.getByRole("menuitem", { name: /sign out/i })).toBeVisible();
    await expect(page).toHaveScreenshot(`state-account-menu-${size}.png`);
  });
  test(`@visual confirm dialog ${size}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await open(page, "/dialogs", "light");
    await page.getByRole("button", { name: "Confirm (cannot be undone)" }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await expect(page).toHaveScreenshot(`state-confirm-dialog-${size}.png`);
  });
  test(`@visual slide-over ${size}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await open(page, "/examples", "light");
    await page.getByRole("row", { name: /alex voorbeeld/i }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page).toHaveScreenshot(`state-slide-over-${size}.png`);
  });
  test(`@visual command palette ${size}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await open(page, "/shell", "light");
    await page.getByRole("button", { name: /opens command palette/i }).click();
    await expect(page.getByRole("combobox", { name: /jump to/i })).toBeVisible();
    await expect(page).toHaveScreenshot(`state-command-palette-${size}.png`);
  });
}
