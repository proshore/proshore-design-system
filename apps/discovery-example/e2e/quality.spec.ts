import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/** Every screen a pilot user can reach. Staff-only screens are reachable as the default (Proshore) persona. */
const routes = ["/overview", "/sign-in", "/landscape", "/findings", "/evidence", "/decision", "/setup", "/design", "/lab/charts", "/lab/table", "/lab/icons", "/apps/legacy-scan", "/apps/scenario-planner", "/apps/seeder", "/apps/fixer", "/apps/monitoring"];
const themes = ["light", "dark"] as const;
const WCAG = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"];

async function open(page: Page, route: string, theme: (typeof themes)[number]) {
  await page.addInitScript((t) => { localStorage.setItem("sherpa-theme", t); }, theme);
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

test("no console errors while browsing every screen", async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", (e) => errors.push(String(e)));
  for (const route of routes) await open(page, route, "light");
  expect(errors).toEqual([]);
});

test("dark theme is the standard dark grey, not black or navy", async ({ page }) => {
  await open(page, "/overview", "dark");
  expect(await page.evaluate(() => getComputedStyle(document.querySelector(".app")!).backgroundColor)).toBe("rgb(18, 18, 18)");
});

for (const theme of themes) {
  test(`overlays are accessible: finding drawer, command palette, Ask Sherpa (${theme})`, async ({ page }) => {
    await open(page, "/findings", theme);
    await page.locator(".dt-rowbtn").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await violations(page)).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await page.keyboard.press("Control+k");
    await expect(page.getByRole("combobox", { name: /jump to/i })).toBeVisible();
    expect(await violations(page)).toEqual([]);
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "Ask Sherpa" }).click();
    await expect(page.getByRole("dialog", { name: /ask about/i })).toBeVisible();
    expect(await violations(page)).toEqual([]);
  });
}

test("the drawer closes when navigating to another page", async ({ page }) => {
  await open(page, "/findings", "light");
  await page.locator(".dt-rowbtn").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.evaluate(() => { location.hash = "#/decision"; });
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("app rail switches apps and marks the current one", async ({ page }) => {
  await open(page, "/overview", "light");
  const rail = page.getByRole("complementary", { name: "Sherpa apps" });
  await expect(rail.locator('a[aria-current="page"]')).toHaveCount(1);
  await rail.getByRole("link", { name: /Seeder/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Seeder" })).toBeVisible();
  await expect(rail.getByRole("link", { name: /Seeder/ })).toHaveAttribute("aria-current", "page");
});

test("saved dark theme is applied before the app code runs (no light flash)", async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem("sherpa-theme", "dark"); });
  await page.route("**/assets/index-*.js", (r) => r.abort()); // the app never starts; only index.html and the CSS load
  await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(18, 18, 18)");
});

test("sign-in demo: sign out from the account menu, notice shown, sign in returns to the app", async ({ page }) => {
  await open(page, "/overview", "light");
  await page.getByRole("button", { name: /account menu/i }).click();
  await expect(page.getByRole("menuitem", { name: /switch account/i })).toBeVisible();
  await page.getByRole("menuitem", { name: /sign out/i }).click();
  await expect(page.getByRole("heading", { name: /sign in to sherpa discovery/i })).toBeVisible();
  await expect(page.getByText("You have been signed out.")).toBeVisible();
  expect(await violations(page)).toEqual([]);
  await page.getByRole("button", { name: /sign in with google/i }).click();
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /account menu/i })).toBeVisible();
});
