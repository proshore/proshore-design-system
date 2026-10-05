# Changelog

All notable changes to `@proshore/ui`. Versions follow semver; while 0.x, a minor version may contain breaking changes and says so here.

## 0.2.0
- First release from its own repository (`proshore/proshore-design-system`), published to GitHub Packages.
- Added `SignInScreen`, `GoogleSignInButton`, `GoogleMark` (Google Workspace sign-in, Proshore staff only) and `UserMenu` props `onSwitchAccount` and `onSignOut`.
- The package is now product-neutral. **Breaking:** Sherpa Discovery components were removed from the package and live in that product (evidence, coverage and severity badges, `ProcessFlow`, `AppLauncher`/`AppIcon`/`AppTitle`, `SherpaGuide`).
- Fixed: `Tabs` with many tabs widened the page on phones; the tab list now scrolls sideways.
- Fixed: `Select` showed the menu check mark inside the closed field (affected every select, including rows per page); table footer controls now share one height and centre line; the empty-state flags were squeezed to 24px; chart axes overshot (max 52 gave a 0 to 80 axis, now 0 to 60).
- Added the component gallery with example screens (user management, kanban board, card board, bug reporting).

## 0.1.0
- First installable tarball (from the Sherpa Discovery repository).
