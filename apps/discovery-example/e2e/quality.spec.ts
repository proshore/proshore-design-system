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

// ---- Shell space: auto-hiding top bar, eyebrow rule, docked panel (Discovery) ----
test("eyebrow is left out when it repeats the active tab, and shown otherwise", async ({ page }) => {
  await open(page, "/landscape", "light"); // eyebrow "Landscape", active tab "Landscape"
  await expect(page.locator(".pr-hero .pr-eyebrow")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await open(page, "/evidence", "light"); // eyebrow "Evidence and coverage" differs from the tab "Evidence"
  await expect(page.locator(".pr-hero .pr-eyebrow", { hasText: "Evidence and coverage" })).toBeVisible();
});

test("top bar hides on scroll down and returns on scroll up (Findings)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page, "/findings", "light");
  const bar = page.locator(".pr-bar");
  const sticky = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--pr-sticky-top").trim());
  const shown = await sticky();
  await page.mouse.move(640, 400);
  await page.mouse.wheel(0, 600);
  await expect(bar).toHaveAttribute("data-hidden", "true");
  await expect.poll(sticky).toBe("0px");
  await page.mouse.wheel(0, -120);
  await expect(bar).not.toHaveAttribute("data-hidden", "true");
  await expect.poll(sticky).toBe(shown);
});

test("phone: the top bar hides too, the bottom app bar stays", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/findings", "light");
  await page.mouse.move(195, 400);
  await page.mouse.wheel(0, 600);
  await expect(page.locator(".pr-bar")).toHaveAttribute("data-hidden", "true");
  await expect(page.getByRole("complementary", { name: "Sherpa apps" })).toBeInViewport();
});

test("1600px: a finding docks beside the table (no overlay, table stays usable, main narrows)", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await open(page, "/findings", "light");
  const main = page.locator("main");
  const before = (await main.boundingBox())!.width;
  const row = page.locator(".dt-rowbtn").first();
  await row.click();
  const panel = page.getByRole("dialog");
  await expect(panel).toBeVisible();
  await expect(page.locator(".so-overlay")).toHaveCount(0);
  await expect(panel.getByRole("heading", { level: 2 })).toBeFocused();
  expect((await main.boundingBox())!.width).toBeLessThan(before - 400);
  await page.locator(".dt-rowbtn").nth(2).click({ trial: true }); // the list is still usable: nothing covers it
  expect(await violations(page)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".dt-rowbtn").first()).toBeFocused();
});

test("1280px: a finding still opens as a modal panel; Ask Sherpa is modal at 1600px", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page, "/findings", "light");
  await page.locator(".dt-rowbtn").first().click();
  await expect(page.locator(".so-overlay")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.getByRole("button", { name: "Ask Sherpa" }).click();
  await expect(page.locator(".so-overlay")).toHaveCount(1);
});

for (const theme of themes) {
  test(`docked finding panel is accessible (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await open(page, "/findings", theme);
    await page.locator(".dt-rowbtn").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await violations(page)).toEqual([]);
  });
}

/** Dense tables: single-line rows, one-row toolbar, Note with summary (added with the density change). */
const noWrap = (page: Page) => page.evaluate(() => {
  const rows = [...document.querySelectorAll<HTMLElement>(".dt-table tbody tr")];
  const heights = rows.map((r) => r.getBoundingClientRect().height);
  const wrapped = [...document.querySelectorAll<HTMLElement>(".dt-table tbody .dt-td")].filter((td) => {
    const r = document.createRange(); r.selectNodeContents(td);
    const rects = [...r.getClientRects()]; if (!rects.length) return false;
    return Math.max(...rects.map((x) => x.bottom)) - Math.min(...rects.map((x) => x.top)) > parseFloat(getComputedStyle(td).lineHeight || "24") * 1.6 + 8;
  }).length;
  return { max: Math.max(...heights), wrapped, count: rows.length };
});

test("findings: default rows are single-line (<= 48px), no cell wraps, a cut cell has its full text as tooltip", async ({ page }) => {
  await open(page, "/findings", "light");
  const m = await noWrap(page);
  expect(m.max).toBeLessThanOrEqual(48);
  expect(m.wrapped).toBe(0);
  await page.setViewportSize({ width: 1100, height: 800 }); // narrow enough that the finding cell is cut
  await page.waitForTimeout(200);
  const cells = page.locator(".dt-table tbody .dt-td", { has: page.locator(".dt-sub") });
  const idx = await cells.evaluateAll((els) => els.findIndex((e) => { const b = e.querySelector(".dt-rowbtn") ?? e; return b.scrollWidth > b.clientWidth + 1; }));
  expect(idx).toBeGreaterThanOrEqual(0);
  const cut = cells.nth(idx);
  await cut.hover();
  await expect(cut).toHaveAttribute("title", /F-\d+/);
});

test("findings: comfortable density stacks the secondary text again, and back", async ({ page }) => {
  await open(page, "/findings", "light");
  const toggle = page.getByRole("button", { name: "Compact rows" });
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  const stacked = await page.evaluate(() => { const t = document.querySelector(".dt-td .dt-title")!.getBoundingClientRect(); const s = document.querySelector(".dt-td .dt-sub")!.getBoundingClientRect(); return s.top >= t.bottom - 1; });
  expect(stacked).toBe(true);
  expect((await page.locator(".dt-table tbody tr").first().boundingBox())!.height).toBeGreaterThan(55);
  await toggle.click();
  expect((await page.locator(".dt-table tbody tr").first().boundingBox())!.height).toBeLessThanOrEqual(48);
});

test("findings: toolbar is one row at 1280 and one Filters button at 390", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page, "/findings", "light");
  const bar = page.locator(".dt-filterbar");
  await expect(bar.locator(".dt-filterbar__row--meta")).toHaveCount(0);
  const tops = await bar.evaluate((el) => ["[role=search]", ".dt-facetbtn", ".dt-count", ".dt-filterbar__right button"].map((s) => { const r = el.querySelector(s)!.getBoundingClientRect(); return r.top + r.height / 2; }));
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(8);
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/findings", "light");
  await expect(page.getByRole("button", { name: "Filters" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: /^Filter by/ })).toHaveCount(0);
});

for (const theme of themes) {
  test(`findings: partial notice expands and collapses, accessible in both states (${theme})`, async ({ page }) => {
    await open(page, "/findings", theme);
    const toggle = page.getByRole("button", { name: "Details" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("note")).toContainText("a review item is not a confirmed vulnerability");
    expect(await violations(page)).toEqual([]);
    await toggle.click();
    await expect(page.getByRole("button", { name: "Less details" })).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText(/a review item is not a confirmed vulnerability/)).toBeVisible();
    expect(await violations(page)).toEqual([]);
  });
}
