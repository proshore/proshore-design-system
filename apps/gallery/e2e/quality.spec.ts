import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const routes = ["/foundations", "/layout", "/forms", "/tables", "/charts", "/actions", "/overlays", "/dialogs", "/brand", "/shell", "/sign-in", "/api"];
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
      if (route === "/api") test.slow(); // about 180 generated cards: axe needs far longer than on the other pages, more so with parallel workers
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
  test(`slide-over and account menu are accessible (${theme})`, async ({ page }) => {
    await open(page, "/overlays", theme);
    await page.getByRole("button", { name: "Open slide-over" }).click();
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
  await open(page, "/dialogs", "light");
  await page.getByRole("button", { name: /move review access list/i }).click();
  await page.getByRole("option", { name: "Done" }).click();
  await expect(page.getByRole("region", { name: /^done/i }).getByText("Review access list", { exact: true })).toBeVisible();
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

test("api reference: searching shows a card with its props table", async ({ page }) => {
  await open(page, "/api", "light");
  await page.getByRole("searchbox", { name: "Search the API" }).fill("Pagination");
  const card = page.getByRole("article", { name: "Pagination" });
  await expect(card).toBeVisible();
  const props = card.getByRole("table", { name: "Pagination props" });
  await expect(props.getByRole("rowheader", { name: /^page\b/ })).toBeVisible();
  await expect(props.getByRole("rowheader", { name: /^pageCount\b/ })).toBeVisible();
  await expect(card.getByRole("link", { name: /demo/i })).toHaveAttribute("href", "#/dialogs");
  await expect(card.getByText("<Pagination page={page}")).toBeVisible();
  expect(await violations(page)).toEqual([]);
});

// Language: the built-in text of the design system in Dutch (the gallery's own page copy stays English).
async function openIn(page: Page, route: string, lang: "en" | "nl", theme: (typeof themes)[number] = "light") {
  await page.addInitScript((l) => { localStorage.setItem("proshore-lang", l); }, lang);
  await open(page, route, theme);
}

for (const route of routes) {
  test(`accessibility in Dutch: ${route}`, async ({ page }) => {
    await openIn(page, route, "nl");
    expect(await page.evaluate(() => document.documentElement.lang)).toBe("nl");
    expect(await violations(page)).toEqual([]);
  });
}

test("language switch in the account menu changes built-in text and is remembered", async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem("proshore-theme", "light"); });
  await page.goto("/?i18n#/foundations");
  await page.locator("h1").first().waitFor();
  await page.getByRole("button", { name: /account menu/i }).click();
  await page.getByRole("menuitemradio", { name: "Nederlands" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "nl");
  await page.getByRole("button", { name: /accountmenu van/i }).click();
  await expect(page.getByRole("menuitem", { name: "Uitloggen" })).toBeVisible();
  expect(await violations(page)).toEqual([]);
  await page.reload();
  await page.getByRole("button", { name: /accountmenu van/i }).click();
  await page.getByRole("menuitemradio", { name: "English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("button", { name: /^account menu for/i })).toBeVisible();
});

test("Dutch: pagination, dialog buttons and status page", async ({ page }) => {
  await openIn(page, "/dialogs", "nl");
  const nav = page.getByRole("navigation", { name: "Paginering" });
  await expect(nav.getByText("Pagina 1 van 8")).toBeVisible();
  await expect(nav.getByText("1-10 van 80")).toBeVisible();
  await expect(nav.getByRole("button", { name: "Vorige pagina" })).toHaveAttribute("aria-disabled", "true");
  await nav.getByRole("button", { name: "Volgende pagina" }).click();
  await expect(nav.getByText("Pagina 2 van 8")).toBeVisible();
  await page.getByRole("button", { name: "Confirm (cannot be undone)" }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog.getByRole("button", { name: "Annuleren" })).toBeVisible();
  expect(await violations(page)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("heading", { level: 1, name: "Je hebt geen toegang tot deze pagina" })).toBeVisible();
  await page.getByRole("button", { name: "Not found (404)" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Deze pagina bestaat niet" })).toBeVisible();
  await expect(page.getByText("Referentie:")).toBeVisible();
  await expect(page.getByText("Sleep bestanden hierheen, of")).toBeVisible();
  await expect(page.getByRole("button", { name: "Kies bestanden" })).toBeVisible();
});

test("Dutch: sign-in screen and sign out", async ({ page }) => {
  await openIn(page, "/sign-in", "nl");
  await expect(page.getByRole("heading", { name: "Inloggen bij Design system" })).toBeVisible();
  await expect(page.getByText("Gebruik je Proshore Google Workspace-account.")).toBeVisible();
  await page.getByRole("button", { name: "Inloggen met Google" }).click();
  await expect(page.getByRole("heading", { name: "Foundations" })).toBeVisible();
  await page.getByRole("button", { name: /accountmenu van/i }).click();
  await page.getByRole("menuitem", { name: "Account wisselen" }).click();
  await expect(page.getByRole("region", { name: "Meldingen" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Melding sluiten" })).toBeVisible();
});

test("Dutch: data table toolbar, filters and pager", async ({ page }) => {
  await openIn(page, "/tables", "nl");
  await expect(page.getByRole("button", { name: "Exporteer CSV" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Compacte rijen" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Kolommen tonen of verbergen" }).first()).toBeVisible();
  await expect(page.getByText("Rijen per pagina").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Volgende pagina" }).first()).toBeVisible();
});

test("Dutch: charts have a Dutch table view and summary", async ({ page }) => {
  await openIn(page, "/charts", "nl");
  await page.getByRole("button", { name: "Bekijk als tabel" }).first().click();
  await expect(page.getByRole("columnheader", { name: "Categorie" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Dekking" }).first()).toBeVisible();
  await expect(page.getByText("Bron: Requests, demo data").first()).toBeVisible();
});

test("English stays the default and the Dutch strings do not leak into it", async ({ page }) => {
  await open(page, "/dialogs", "light");
  await expect(page.getByRole("navigation", { name: "Example pagination" }).getByText("1-10 of 80")).toBeVisible();
  await expect(page.getByText("Reference:")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.lang)).toBe("en");
});

test("page header: a long description is one line with a More button that shows the rest", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/layout", "light");
  const more = page.getByRole("button", { name: "More" });
  await expect(more).toBeVisible();
  await expect(more).toHaveAttribute("aria-expanded", "false");
  await more.click();
  await expect(page.getByRole("button", { name: "Less" })).toHaveAttribute("aria-expanded", "true");
  expect(await violations(page)).toEqual([]);
});

test("table toolbar stays right under the top bar while the table scrolls", async ({ page }) => {
  await open(page, "/tables", "light");
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(300);
  const bar = await page.locator("header").first().evaluate((e) => e.getBoundingClientRect().bottom);
  const tb = await page.locator(".dt-filterbar").first().evaluate((e) => e.getBoundingClientRect().top);
  expect(Math.abs(tb - bar)).toBeLessThanOrEqual(2);
});
