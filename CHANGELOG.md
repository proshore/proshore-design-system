# Changelog

All notable changes to `@proshore/ui`. Versions follow semver; while 0.x, a minor version may contain breaking changes and says so here.

## 0.3.0
- Added the app frame: `AppShell` (left bar with the apps, top bar, bottom bar on phones) and `ShellNav`, `AppIcon`, `AppTitle`, `SherpaGuide` (the suite's thin-line icons), `CommandPalette` with `useCommandShortcut`, and `AssistantPanel` (the Sherpa assistant: answer, how sure, sources, what it could not see). `WorkspaceSwitcher` (client and engagement) plugs into the shell.
- Less wasted space at the top: the page header only reserves room under a floating header (it reserved about 95px under a plain one), and inside `AppShell` it uses a 24px gap. The gallery header is one row.
- Gallery: App shell page.
- Added `apps/discovery-example`: Sherpa Discovery built on the package, as a reference for Sherpa apps.

## 0.2.0
- First release from its own repository (`proshore/proshore-design-system`), published to GitHub Packages.
- Added `SignInScreen`, `GoogleSignInButton`, `GoogleMark` (Google Workspace sign-in, Proshore staff only) and `UserMenu` props `onSwitchAccount` and `onSignOut`.
- The package is now product-neutral. **Breaking:** Sherpa Discovery components were removed from the package and live in that product (evidence, coverage and severity badges, `ProcessFlow`, `AppLauncher`/`AppIcon`/`AppTitle`, `SherpaGuide`).
- Fixed: `Tabs` with many tabs widened the page on phones; the tab list now scrolls sideways.
- Fixed: `Select` showed the menu check mark inside the closed field (affected every select, including rows per page); table footer controls now share one height and centre line; the empty-state flags were squeezed to 24px; chart axes overshot (max 52 gave a 0 to 80 axis, now 0 to 60).
- Added the component gallery with example screens (user management, kanban board, card board, bug reporting).

## 0.1.0
- First installable tarball (from the Sherpa Discovery repository).
