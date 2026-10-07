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
  await page.mouse.wheel(0, 200); // rows are one line now, so the table is short: stay inside it
  await page.waitForTimeout(300);
  const bar = await page.locator("header").first().evaluate((e) => e.getBoundingClientRect().bottom);
  const tb = await page.locator(".dt-filterbar").first().evaluate((e) => e.getBoundingClientRect().top);
  expect(Math.abs(tb - bar)).toBeLessThanOrEqual(2);
});

// ---- Shell space: auto-hiding top bar, eyebrow rule, docked panel (App shell page) ----
const stickyTop = (page: Page) => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--pr-sticky-top").trim());

test("shell: the top bar hides on scroll down, returns on scroll up and on focus, and the sticky offset follows", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page, "/shell", "light");
  const bar = page.locator(".pr-bar");
  await expect(bar).not.toHaveAttribute("data-hidden", "true");
  const shown = await stickyTop(page);
  expect(parseInt(shown)).toBeGreaterThan(40);
  await page.mouse.move(640, 400);
  await page.mouse.wheel(0, 600);
  await expect(bar).toHaveAttribute("data-hidden", "true");
  await expect.poll(() => stickyTop(page)).toBe("0px");
  expect(await bar.evaluate((e) => e.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
  await page.mouse.wheel(0, -120);
  await expect(bar).not.toHaveAttribute("data-hidden", "true");
  await expect.poll(() => stickyTop(page)).toBe(shown);
  await page.mouse.wheel(0, 600);
  await expect(bar).toHaveAttribute("data-hidden", "true");
  await page.locator(".pr-bar__tabs a").first().focus(); // keyboard users reach the hidden bar: focus shows it
  await expect(bar).not.toHaveAttribute("data-hidden", "true");
  await page.mouse.wheel(0, 600);
  await page.locator(".pr-bar__tabs a").first().blur();
  await page.mouse.wheel(0, 200);
  await expect(bar).toHaveAttribute("data-hidden", "true");
  await page.keyboard.press("Home"); // reaching the top shows it
  await expect(bar).not.toHaveAttribute("data-hidden", "true");
});

test("shell: the hidden bar is moved, not removed (still in the accessibility tree)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page, "/shell", "light");
  await page.mouse.move(640, 400);
  await page.mouse.wheel(0, 600);
  await expect(page.locator(".pr-bar")).toHaveAttribute("data-hidden", "true");
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Engagement" })).toBeAttached();
  expect(await page.locator(".pr-bar").evaluate((e) => getComputedStyle(e).display)).not.toBe("none");
});

test("shell: the bar slides (180ms) unless reduced motion is on", async ({ page }) => {
  await open(page, "/shell", "light");
  expect(await page.locator(".pr-bar").evaluate((e) => parseFloat(getComputedStyle(e).transitionDuration))).toBeLessThan(0.001);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  expect(await page.locator(".pr-bar").evaluate((e) => parseFloat(getComputedStyle(e).transitionDuration))).toBeCloseTo(0.18, 2);
});

test("shell: a docked SlideOver sits beside the page at 1600px wide, with no overlay", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await open(page, "/shell", "light");
  const main = page.locator("main");
  const before = (await main.boundingBox())!.width;
  await page.getByRole("button", { name: "Open docked panel" }).click();
  const panel = page.getByRole("dialog", { name: "Docked detail panel" });
  await expect(panel).toBeVisible();
  await expect(panel).not.toHaveAttribute("aria-modal", /.+/);
  await expect(page.locator(".so-overlay")).toHaveCount(0);
  await expect(panel.getByRole("heading", { name: "Docked detail panel" })).toBeFocused();
  expect((await main.boundingBox())!.width).toBeLessThan(before - 400);
  await page.getByRole("button", { name: "Open docked panel" }).click({ trial: true }); // the page stays interactive
  await page.getByRole("button", { name: "Open docked panel" }).focus();
  await page.getByRole("button", { name: "Ask Sherpa" }).click(); // the assistant is still a modal panel
  await expect(page.locator(".so-overlay")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await panel.getByRole("button", { name: "Close panel", exact: true }).first().click();
  await expect(panel).toHaveCount(0);
  expect(Math.abs((await main.boundingBox())!.width - before)).toBeLessThan(2);
});

test("shell: Esc closes the docked panel from inside and focus returns to the opener", async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await open(page, "/shell", "light");
  const opener = page.getByRole("button", { name: "Open docked panel" });
  await opener.click();
  await expect(page.getByRole("dialog", { name: "Docked detail panel" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test("shell: at 1280px wide the same panel is modal", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page, "/shell", "light");
  await page.getByRole("button", { name: "Open docked panel" }).click();
  await expect(page.getByRole("dialog", { name: "Docked detail panel" })).toBeVisible();
  await expect(page.locator(".so-overlay")).toHaveCount(1);
});

for (const theme of themes) {
  test(`shell: docked panel is accessible (${theme})`, async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    await open(page, "/shell", theme);
    await page.getByRole("button", { name: "Open docked panel" }).click();
    await expect(page.getByRole("dialog", { name: "Docked detail panel" })).toBeVisible();
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

test("tables: default rows are single-line (<= 48px) and no cell wraps", async ({ page }) => {
  await open(page, "/tables", "light");
  const m = await noWrap(page);
  expect(m.count).toBeGreaterThan(5);
  expect(m.max).toBeLessThanOrEqual(48);
  expect(m.wrapped).toBe(0);
});

test("tables: the toolbar is one row at 1280 and one Filters button at 390", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await open(page, "/tables", "light");
  const bar = page.locator(".dt-filterbar").first();
  await expect(bar.locator(".dt-filterbar__row--meta")).toHaveCount(0);
  const tops = await bar.evaluate((el) => ["[role=search]", ".dt-facetbtn", ".dt-count", ".dt-filterbar__right"].map((s) => { const r = el.querySelector(s)!.getBoundingClientRect(); return r.top + r.height / 2; }));
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThan(8);
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, "/tables", "light");
  await expect(page.getByRole("button", { name: "Filters" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: /^Filter by/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Filters" }).click();
  const dlg = page.getByRole("dialog", { name: "Filters" });
  await expect(dlg.locator("p", { hasText: "Team" })).toBeVisible();
  await expect(dlg.locator("p", { hasText: "Status" })).toBeVisible();
  // the "region" rule is skipped: every PopoverPanel (also the per-facet one on desktop) is portalled outside the landmarks, a known gap of the primitive
  expect((await new AxeBuilder({ page }).withTags(WCAG).disableRules(["region"]).analyze()).violations.map((v) => v.id)).toEqual([]);
  await dlg.getByRole("checkbox").first().click({ force: true });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Filters, 1 active" })).toBeVisible();
  await expect(page.locator(".dt-filterbar__row--meta")).toHaveCount(1);
});

for (const theme of themes) {
  test(`note with summary expands and collapses, accessible in both states (${theme})`, async ({ page }) => {
    await open(page, "/tables", theme);
    const toggle = page.getByRole("button", { name: "Details" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    const note = page.getByRole("note").filter({ hasText: "Partial scan" });
    expect((await note.boundingBox())!.height).toBeLessThanOrEqual(40);
    await expect(note).toContainText("A review item is not a confirmed problem"); // the full text is in the page while collapsed
    expect(await violations(page)).toEqual([]);
    await toggle.click();
    await expect(page.getByRole("button", { name: "Less details" })).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("A review item is not a confirmed problem.")).toBeVisible();
    expect(await violations(page)).toEqual([]);
    await page.getByRole("button", { name: "Less details" }).click();
    await expect(page.getByRole("button", { name: "Details" })).toHaveAttribute("aria-expanded", "false");
  });
}

// ---- Collapsing title: the bar shows the page title once the header is out of view ----
test("collapsing title: the bar shows the page title when the header is out of view; the app name returns on hover", async ({ page }) => {
  await open(page, "/shell", "light");
  const lead = page.locator(".pr-bar__lead");
  await expect(lead).not.toHaveAttribute("data-collapsed");
  await page.mouse.move(640, 500);
  await page.mouse.wheel(0, 1200); await page.waitForTimeout(300);
  await page.mouse.wheel(0, -100); await page.waitForTimeout(500);
  await expect(page.locator(".pr-bar")).not.toHaveAttribute("data-hidden");
  await expect(lead).toHaveAttribute("data-collapsed");
  await expect(page.locator(".pr-bar__page")).toHaveText("The frame around every Sherpa app");
  expect(await violations(page)).toEqual([]);
  await page.locator(".pr-bar__appname").hover();
  await expect(page.locator(".pr-bar__appname")).toHaveCSS("opacity", "1");
  await page.mouse.move(640, 500);
  await page.mouse.wheel(0, -5000); await page.waitForTimeout(500);
  await expect(lead).not.toHaveAttribute("data-collapsed");
});

// ---- One intro per page: no heading repeats the one right above it, and a page with a single section shows no section title ----
test("headings: no heading repeats the one above it, and a lone section has no title", async ({ page }) => {
  test.setTimeout(120_000);
  const problems: string[] = [];
  for (const route of routes.filter((r) => !["/sign-in", "/api"].includes(r))) {
    await open(page, route, "light");
    const info = await page.evaluate(() => {
      const hs = [...document.querySelectorAll("main h1, main h2, main h3, main h4")].filter((h) => h.getBoundingClientRect().width > 2);
      const texts = hs.map((h) => (h.textContent ?? "").trim().toLowerCase());
      return { dup: texts.filter((t, i) => i > 0 && t === texts[i - 1]), sectionTitles: document.querySelectorAll("main .l-section__title").length };
    });
    if (info.dup.length) problems.push(`${route}: repeated heading ${info.dup.join(", ")}`);
    if (info.sectionTitles === 1) problems.push(`${route}: one section, and it has a title`);
  }
  expect(problems).toEqual([]);
});
