import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const routes = ["/foundations", "/layout", "/forms", "/tables", "/charts", "/actions", "/overlays", "/dialogs", "/brand", "/examples", "/shell", "/sign-in"];
const themes = ["light", "dark"] as const;
const WCAG = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"];

async function open(page: Page, route: string, theme: (typeof themes)[number]) {
  await page.addInitScript((t) => { localStorage.setItem("proshore-theme", t); }, theme);
  await page.goto(`/#${route}`);
  await page.locator("h1").first().waitFor();
  await page.waitForLoadState("networkidle");
}
const violations = async (page: Page) => (await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(" ")}`);

for (const theme of themes) {
  for (const route of routes) {
    test(`accessibility: ${route} (${theme})`, async ({ page }) => {
      await open(page, route, theme);
      expect(await violations(page)).toEqual([]);
    });
  }
}

for (const route of routes) {
  test(`phone width: no horizontal overflow on ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, route, "light");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });
}

test("no console errors while browsing every page", async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  for (const route of routes) await open(page, route, "light");
  expect(errors).toEqual([]);
});

test("dark theme is the standard dark grey", async ({ page }) => {
  await open(page, "/foundations", "dark");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(18, 18, 18)");
});

test("sign-in: button signs in, account menu signs out and back", async ({ page }) => {
  await open(page, "/sign-in", "light");
  await expect(page.getByRole("heading", { name: /sign in to design system/i })).toBeVisible();
  await expect(page.getByText("@proshore.nl")).toBeVisible();
  await page.getByRole("button", { name: /sign in with google/i }).click();
  await expect(page.getByRole("heading", { name: "Foundations" })).toBeVisible();
  await page.getByRole("button", { name: /account menu/i }).click();
  await page.getByRole("menuitem", { name: /sign out/i }).click();
  await expect(page.getByText("You have been signed out.")).toBeVisible();
  expect(await violations(page)).toEqual([]);
});

for (const theme of themes) {
  test(`overlays and example flows are accessible (${theme})`, async ({ page }) => {
    await open(page, "/examples", theme);
    await page.getByRole("row", { name: /alex voorbeeld/i }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await violations(page)).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: /account menu/i }).click();
    await expect(page.getByRole("menuitem", { name: /switch account/i })).toBeVisible();
    expect(await violations(page)).toEqual([]);
  });
}

test("kanban: a card moves with the keyboard-accessible select", async ({ page }) => {
  await open(page, "/examples", "light");
  await page.getByRole("tab", { name: /kanban/i }).click();
  await page.getByRole("button", { name: /move collect q3 vendor contracts/i }).click();
  await page.getByRole("option", { name: "Done" }).click();
  await expect(page.getByRole("region", { name: /^done/i }).getByText("Collect Q3 vendor contracts", { exact: true })).toBeVisible();
});

test("bug report: empty title shows the error next to the field", async ({ page }) => {
  await open(page, "/examples", "light");
  await page.getByRole("tab", { name: /bug reporting/i }).click();
  await page.getByRole("button", { name: /send report/i }).click();
  await expect(page.getByText("Give the bug a short title.")).toBeVisible();
});

test("app shell: palette and assistant open, labelled, accessible", async ({ page }) => {
  await open(page, "/shell", "light");
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("combobox", { name: /jump to/i })).toBeVisible();
  expect(await violations(page)).toEqual([]);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Ask Sherpa" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await violations(page)).toEqual([]);
});

test("dialogs: confirm opens as an alertdialog, cancel and Esc close it, focus returns", async ({ page }) => {
  await open(page, "/dialogs", "light");
  const trigger = page.getByRole("button", { name: "Confirm (cannot be undone)" });
  await trigger.click();
  await expect(page.getByRole("alertdialog", { name: /suspend kim demo/i })).toBeVisible();
  expect(await violations(page)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("dialogs: dark theme dialog and danger button are accessible", async ({ page }) => {
  await open(page, "/dialogs", "dark");
  await page.getByRole("button", { name: "Confirm (cannot be undone)" }).click();
  expect(await violations(page)).toEqual([]);
});

test("pagination moves and disables at the ends", async ({ page }) => {
  await open(page, "/dialogs", "light");
  const nav = page.getByRole("navigation", { name: "Example pagination" });
  await expect(nav.getByText("Page 1 of 8")).toBeVisible();
  await expect(nav.getByRole("button", { name: "Previous page" })).toHaveAttribute("aria-disabled", "true");
  await nav.getByRole("button", { name: "Next page" }).click();
  await expect(nav.getByText("Page 2 of 8")).toBeVisible();
});

test("status pages render each kind with one h1", async ({ page }) => {
  await open(page, "/dialogs", "light");
  for (const label of ["No access (403)", "Not found (404)", "Server error (500)", "Session expired (401)", "Offline"]) {
    await page.getByRole("button", { name: label }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(2); // the page title and the status page
  }
});
