import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { messages } from "../src/i18n/messages.ts";
import { formatMessage, placeholders } from "../src/i18n/format.ts";

const flat = (o: Record<string, unknown>, prefix = ""): Record<string, string> =>
  Object.fromEntries(Object.entries(o).flatMap(([k, v]) => (typeof v === "string" ? [[`${prefix}${k}`, v]] : Object.entries(flat(v as Record<string, unknown>, `${prefix}${k}.`)))));

const en = flat(messages.en);

describe("message catalogue", () => {
  for (const [lang, catalogue] of Object.entries(messages)) {
    const other = flat(catalogue);
    test(`${lang}: same keys as en`, () => {
      assert.deepEqual(Object.keys(other).sort(), Object.keys(en).sort());
    });
    test(`${lang}: no empty values`, () => {
      for (const [key, value] of Object.entries(other)) assert.ok(value.trim().length > 0, `${lang}.${key} is empty`);
    });
    test(`${lang}: placeholders match en`, () => {
      for (const [key, value] of Object.entries(other)) assert.deepEqual(placeholders(value), placeholders(en[key]), `${lang}.${key}: ${value}`);
    });
  }
  test("nl is actually translated, not a copy of en", () => {
    const nl = flat(messages.nl);
    const same = Object.keys(en).filter((k) => nl[k] === en[k]);
    // Identical on purpose: names and words that are the same in both languages.
    const allowed = new Set(["header.account", "shell.apps", "assistant.sherpa", "command.esc", "table.defaultNoun", "table.facetCount", "table.sortPart", "table.openRow", "charts.stackedHead", "charts.stackedSegment", "charts.stackedEnd", "charts.pointCaption", "charts.pointLabel", "assistant.context"]);
    assert.deepEqual(same.filter((k) => !allowed.has(k)), []);
  });
});

describe("formatMessage", () => {
  test("replaces placeholders", () => assert.equal(formatMessage("Page {page} of {pageCount}", { page: 1, pageCount: 4 }), "Page 1 of 4"));
  test("keeps unknown placeholders visible", () => assert.equal(formatMessage("Hi {name}"), "Hi {name}"));
  test("plural with exact match, one and other", () => {
    const m = "{count, plural, =0 {No items} one {# item} other {# items}}";
    assert.equal(formatMessage(m, { count: 0 }, "en"), "No items");
    assert.equal(formatMessage(m, { count: 1 }, "en"), "1 item");
    assert.equal(formatMessage(m, { count: 1234 }, "en"), "1,234 items");
  });
  test("plural may contain placeholders", () => assert.equal(formatMessage("{n, plural, one {{who} has # file} other {{who} has # files}}", { n: 2, who: "Sam" }, "en"), "Sam has 2 files"));
  test("placeholders() sees names inside plurals", () => assert.deepEqual(placeholders("{n, plural, one {{who} has # file} other {{who} has # files}}"), ["n", "who"]));
});
