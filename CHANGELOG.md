# Changelog

All notable changes to `@proshore/ui`. Versions follow semver; while 0.x, a minor version may contain breaking changes and says so here.

## Unreleased
- **Translatable built-in text (English and Dutch).** New message catalogue `src/i18n/messages.ts` (181 strings in `en` and `nl`: pagination, table toolbar, filters and states, sign-in, status pages, dialog buttons, dropzone, slide-over, header and account menu, app shell, assistant, command palette, toast, forms, chart wording). New `I18nProvider` (`locale`, partial `messages` overrides) and `useMessages()`; exported with the `messages` catalogue and the types `Messages`, `PartialMessages`, `Locale`, `MessageKey`, `Translate`. `LocaleProvider` is now the same component, so one provider sets the language of strings and the locale of dates and numbers. Without a provider everything is English and unchanged. No new dependency.
- `UserMenu` gets an optional `language` prop (a language section in the account menu; the gallery shows it when opened with `?i18n` or after a language was chosen, so its default screens and visual baselines are unchanged). `barTable` and `trendTable` take an optional translator as last argument. Props that already set text (`label`, `placeholder`, `confirmLabel`, `emptyText` ...) still win; their English defaults now come from the catalogue.
- Known: the `SEVERITY_SERIES` labels and the number format in charts (`en`) are not translated yet; `NO_RESULTS_HINT` stays the English text (the component shows the translated hint).
- Tests: `npm run test:i18n` (same keys, no empty values, same placeholders, formatter), Dutch end-to-end and axe tests in the gallery, language switch in the gallery account menu. E2E ports can be moved with `E2E_PORT` to run next to another checkout.

## 0.4.0
- **Breaking-ish (aliases kept):** design tokens renamed from `--sherpa-*` to `--pr-*` (40 tokens, for example `--sherpa-surface` is now `--pr-surface`). The old names still work through `theme/compat.css` and are removed in 0.5.0. Migrate with a search and replace of `--sherpa-` by `--pr-`. `SherpaTheme` is now `ProshoreTheme`; `SherpaTheme` stays as a deprecated alias. The CSS class names `.sherpa-theme`, `.sherpa-eyebrow` and `.sherpa-display` are unchanged for now (they will be renamed with a deprecation period).
- The mountain motif is off on `PageHeader` by default (`motif` turns it on) and stays on `PageHero`; use it on key pages such as a dashboard, not on every page.
- Fixed: the product name in the dark header (for example "Design system") was grey on navy and hard to read; it is now light.
- Sign-in screen: the Proshore icon sits centred at the top of the card and the wordmark centred at the bottom.
- Added `packages/auth` (`@proshore/auth`) see its own entry below; the UI package is unaffected.
- Charts redesigned: bar chart as soft pills on a faint track (second series a tint of the first, value at the end), smooth area trend with a halo on the latest value, stacked bar as one pill, sparkline as a smooth area. Patterns now mark partial coverage only; series are named in the legend, on the bars and in the table view. New tokens `--chart-1-tint`, `--chart-track`, `--chart-gridline`.
- Fixed: phone header (avatar on its own row, page links cut off or hidden), `SimpleTable` clipped on phones, `Pagination` lost its styles on pages without a DataTable, `Pagination` wrapped badly on phones.
- Gallery: Foundations rebuilt from the real tokens (full brand palette, interface scales, semantic and status colours, chart colours, type, spacing, radius), an Actions page, usage do and don't lists and a light/dark compare ported from Discovery's design page. Visual regression tests (`npm run test:visual`) for every page at desktop and phone width in light and dark.
- Added `packages/auth` (`@proshore/auth` 0.1.0): server-side Sign in with Google Workspace (proshore.nl only) on Web `Request`/`Response`, with PKCE, server-side ID token verification and a signed session cookie. Tested against a local fake Google only, not yet against real Google.

## 0.3.1
- Fixed: the Proshore wordmark in the dark blue header was navy on navy; it is now white there (and navy on light surfaces). The wordmark colour is the class `.pr-wordmark`, not an inline style.


## 0.3.0
- Added the app frame: `AppShell` (left bar with the apps, top bar, bottom bar on phones) and `ShellNav`, `AppIcon`, `AppTitle`, `SherpaGuide` (the suite's thin-line icons), `CommandPalette` with `useCommandShortcut`, and `AssistantPanel` (the Sherpa assistant: answer, how sure, sources, what it could not see). `WorkspaceSwitcher` (client and engagement) plugs into the shell.
- Less wasted space at the top: the page header only reserves room under a floating header (it reserved about 95px under a plain one), and inside `AppShell` it uses a 24px gap. The gallery header is one row.
- Fixed: the avatar on the dark header was nearly invisible (dark initials on a tint of the header colour) and looked lighter when the menu was open; it is now a light chip and identical in every state. Gallery header: the current page is a white underlined link, not a pill.
- Added `ModalDialog` and `ConfirmDialog`, `StatusPage` (403, 404, 500, session expired, offline), `Pagination` (DataTable uses it), `FileDropzone` and `KanbanBoard`.
- Gallery: App shell page and a Dialogs and boards page.
- Added `apps/discovery-example`: Sherpa Discovery built on the package, as a reference for Sherpa apps.

## 0.2.0
- First release from its own repository (`proshore/proshore-design-system`), published to GitHub Packages.
- Added `SignInScreen`, `GoogleSignInButton`, `GoogleMark` (Google Workspace sign-in, Proshore staff only) and `UserMenu` props `onSwitchAccount` and `onSignOut`.
- The package is now product-neutral. **Breaking:** Sherpa Discovery components were removed from the package and live in that product (evidence, coverage and severity badges, `ProcessFlow`, `AppLauncher`/`AppIcon`/`AppTitle`, `SherpaGuide`).
- Fixed: `Tabs` with many tabs widened the page on phones; the tab list now scrolls sideways.
- Fixed: `Select` showed the menu check mark inside the closed field (affected every select, including rows per page); table footer controls now share one height and centre line; the empty-state flags were squeezed to 24px; chart axes overshot (max 52 gave a 0 to 80 axis, now 0 to 60).
- Added the component gallery.

## 0.1.0
- First installable tarball (from the Sherpa Discovery repository).
