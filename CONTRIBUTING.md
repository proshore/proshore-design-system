# Contributing

Owners: Jeroen van der Horst and Babish (see `.github/CODEOWNERS`). Internal Proshore use only (see `LICENSE`).

## Rules for the design system
- **Product-neutral.** `packages/ui` and `apps/gallery` contain no customer names, logos or data, and nothing that belongs to one product (for example Sherpa Discovery's evidence badges). Product-specific components live in the product (see `apps/discovery-example/src/ui`).
  The one exception to the customer rule is `apps/discovery-example` (see below). `npm run pack` fails if known product CSS leaks in.
- **Follow standards and what most apps do.** Prefer established patterns and React Aria behaviour over house inventions.
- **Accessible by default.** WCAG 2.2 AA, keyboard use, visible focus, light and dark. Colour is never the only signal.
- **Tokens, not hex values.** Use CSS variables from `packages/ui/src/theme`. The one exception is the Google sign-in button, which must follow Google's branding.
- **Every component appears in the gallery** (`apps/gallery`) with its states.

## Working
```bash
npm install
npm run dev        # gallery at http://localhost:5180
npm run check      # typecheck, build, unused code, e2e (axe light/dark, phone width, console errors)
```
Local Chrome is used for e2e; CI uses Playwright's Chromium.

1. Branch from `main`, make the change, update `CHANGELOG.md`.
2. Open a pull request. CI must pass and an owner must approve. `main` is protected.
3. Mark breaking changes in the changelog and the PR title.

## Releasing
Bump `version` in `packages/ui/package.json`, update `CHANGELOG.md`, merge, then tag `vX.Y.Z` on `main`. The release workflow packs and publishes `@proshore/ui` to GitHub Packages and attaches the tarball to the GitHub release.

## Using the package in a project
See `packages/ui/README.pack.md` (shipped as the package README).

## The Discovery example
`apps/discovery-example` is Sherpa Discovery built on this package: a full product with the app shell, client switcher, tables, charts, drawers, sign-in, the assistant and evidence components. It is the reference for people building Sherpa apps. It uses De Heus and Ekoplaza as example customers with their logos (Jeroen's decision, 5 Oct 2026). Keep this repository private, do not publish that app, and never copy its customer assets or data into `packages/ui` or the gallery. It is a snapshot: the product's own repository is where Discovery changes first; sync the example when the package changes.
