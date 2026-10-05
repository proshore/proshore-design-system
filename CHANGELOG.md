# Changelog

All notable changes to `@proshore/ui`. Versions follow semver; while 0.x, a minor version may contain breaking changes and says so here.

## 0.6.0
- **Breaking:** the deprecated names are removed, as announced in 0.5.0. The old `--sherpa-*` design tokens (40, via `theme/compat.css`), the `.sherpa-*` CSS classes (`.sherpa-theme`, `.sherpa-eyebrow`, `.sherpa-eyebrow--chip`, `.sherpa-display`, `.sherpa-mark`, `.sherpa-demo-tag`, `.sherpa-grid-2`) and `SherpaTheme` no longer exist. Migrate: replace `--sherpa-` with `--pr-`, `.sherpa-x` with `.pr-x`, and `SherpaTheme` with `ProshoreTheme`. Checked: Discovery, the gallery, the Discovery example and Billing have no remaining uses.

## 0.5.0
- **Deprecation window extended:** the old `--sherpa-*` token names and `SherpaTheme` still work in 0.5.x and are now removed in **0.6.0** (the 0.4.0 notes said 0.5.0; nobody outside Discovery had migrated yet). Migrate by replacing `--sherpa-` with `--pr-` and `SherpaTheme` with `ProshoreTheme`.
- CSS class names renamed from `.sherpa-*` to `.pr-*` for the shared classes: `.pr-theme`, `.pr-eyebrow` (and `.pr-eyebrow--chip`), `.pr-display`, `.pr-mark`, `.pr-demo-tag`, `.pr-grid-2`. The old class names keep working in the stylesheet (selectors match both) and are removed in 0.6.0 together with the old token names. Components now render the new names. Product-specific classes in apps (for example Discovery's `.sherpa-trail`) are not part of the package and are unchanged.
- Summary of this release: Dutch and English for the built-in text (`I18nProvider`, `useMessages`), the generated API reference page in the gallery, the `export:design-system` script for the Claude Design System mirror, and the `README` section about it. Details below.
- Added `npm run export:design-system` (after `npm run pack`): generates a mirror of the tokens, logos, component stylesheet and static component previews in the file layout of Claude's "Design System" artifact type, into `packages/ui/.design-system/` (git-ignored). Usage notes for tokens are in `packages/ui/design-system-notes.json`, previews in `packages/ui/design-system-previews.mjs`. Publishing is a manual step; see `docs/claude-design-system.md`. New `npm run test:export` is part of `npm run check`. No change to the library or its visuals.
- Gallery: new **API reference** page (`#/api`), generated from the real source with the TypeScript compiler API (`packages/ui/scripts/gen-api.mjs`, `npm run api`): every export with kind, description (first JSDoc paragraph), props with types, required flag, defaults (from destructuring) and descriptions, source file, a usage snippet and a link to the demo page. Searchable, works at phone width, light and dark. The data file is generated on dev, build and typecheck and is not committed.
- Added `@example` JSDoc to the main components (Button, TextField, Select, DataTable, SlideOver, ModalDialog, ConfirmDialog, AppShell, CommandPalette, AssistantPanel, SignInScreen, StatusPage, Pagination, KanbanBoard, FileDropzone, BarChart, TrendLine, Stepper, toast) and descriptions to 17 components that had none. No behaviour or visual change in the package.
- Dev dependency `typescript5` (an alias of TypeScript 5.9 in `packages/ui`) is used only by the generator: the main `typescript` is 7.x, which has no stable JavaScript compiler API yet.
- Tests: the new page is covered by the axe (light and dark), phone overflow and console error checks, a search test, and visual baselines for a fixed search result. The wide header baselines were regenerated (darwin) because the nav has one more link.
- **Translatable built-in text (English and Dutch).** New message catalogue `src/i18n/messages.ts` (181 strings in `en` and `nl`: pagination, table toolbar, filters and states, sign-in, status pages, dialog buttons, dropzone, slide-over, header and account menu, app shell, assistant, command palette, toast, forms, chart wording). New `I18nProvider` (`locale`, partial `messages` overrides) and `useMessages()`; exported with the `messages` catalogue and the types `Messages`, `PartialMessages`, `Locale`, `MessageKey`, `Translate`. `LocaleProvider` is now the same component, so one provider sets the language of strings and the locale of dates and numbers. Without a provider everything is English and unchanged. No new dependency.
- `UserMenu` gets an optional `language` prop (a language section in the account menu; the gallery shows it when opened with `?i18n` or after a language was chosen, so its default screens and visual baselines are unchanged). `barTable` and `trendTable` take an optional translator as last argument. Props that already set text (`label`, `placeholder`, `confirmLabel`, `emptyText` ...) still win; their English defaults now come from the catalogue.
- Known: the `SEVERITY_SERIES` labels and the number format in charts (`en`) are not translated yet; `NO_RESULTS_HINT` stays the English text (the component shows the translated hint).
- Tests: `npm run test:i18n` (same keys, no empty values, same placeholders, formatter), Dutch end-to-end and axe tests in the gallery, language switch in the gallery account menu. E2E ports can be moved with `E2E_PORT` to run next to another checkout.

## 0.4.0
- **Breaking-ish (aliases kept):** design tokens renamed from `--sherpa-*` to `--pr-*` (40 tokens, for example `--sherpa-surface` is now `--pr-surface`). The old names still work through `theme/compat.css` and are removed in 0.5.0 (see 0.5.0: extended to 0.6.0). Migrate with a search and replace of `--sherpa-` by `--pr-`. `SherpaTheme` is now `ProshoreTheme`; `SherpaTheme` stays as a deprecated alias. The CSS class names `.sherpa-theme`, `.sherpa-eyebrow` and `.sherpa-display` are unchanged for now (they will be renamed with a deprecation period).
- The mountain motif is off on `PageHeader` by default (`motif` turns it on) and stays on `PageHero`; use it on key pages such as a dashboard, not on every page.
- Fixed: the product name in the dark header (for example "Design system") was grey on navy and hard to read; it is now light.
- Sign-in screen: the Proshore icon sits centred at the top of the card and the wordmark centred at the bottom.
- Charts redesigned: bar chart as soft pills on a faint track (second series a tint of the first, value at the end), smooth area trend with a halo on the latest value, stacked bar as one pill, sparkline as a smooth area. Patterns now mark partial coverage only; series are named in the legend, on the bars and in the table view. New tokens `--chart-1-tint`, `--chart-track`, `--chart-gridline`.
- Fixed: phone header (avatar on its own row, page links cut off or hidden), `SimpleTable` clipped on phones, `Pagination` lost its styles on pages without a DataTable, `Pagination` wrapped badly on phones.
- Gallery: Foundations rebuilt from the real tokens (full brand palette, interface scales, semantic and status colours, chart colours, type, spacing, radius), an Actions page, usage do and don't lists and a light/dark compare ported from Discovery's design page. Visual regression tests (`npm run test:visual`) for every page at desktop and phone width in light and dark.
- Added `packages/auth` (`@proshore/auth` 0.1.0, a separate package; the UI package does not depend on it): server-side Sign in with Google Workspace (proshore.nl only) on Web `Request`/`Response`, with PKCE, server-side ID token verification and a signed session cookie. Tested against a local fake Google (50 tests) and verified against real Google on localhost on 5 Oct 2026: sign-in with a proshore.nl account, rejection of a non-proshore.nl account, switch account, session and logout. Staging and production hosts are not verified yet.

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
