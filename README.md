# Proshore design system

`@proshore/ui`: tokens (light and dark), layout, forms, tables, charts, overlays, icons, the Proshore brand and the Google Workspace sign-in screen, for Proshore's internal apps. Product-neutral. Internal use only.

| Where | What |
| --- | --- |
| `packages/ui` | The package `@proshore/ui` (source, build, Claude skill, token export) |
| `packages/auth` | The package `@proshore/auth`: server-side Google Workspace sign-in (proshore.nl only), see [`docs/google-sign-in.md`](docs/google-sign-in.md). Verified against real Google on localhost (5 Oct 2026); staging and production hosts still need their own first test. |
| `apps/gallery` | Component gallery: foundations, components, the app shell and the sign-in screen. Also the test bench: axe in light and dark, phone width, console errors. The **API reference** page (`#/api`) lists every export with props, defaults, types, descriptions and a usage snippet, generated from the source and its JSDoc (`npm run api`; also runs on dev, build and typecheck). |
| `apps/discovery-example` | Sherpa Discovery on this package: app shell, client switcher, assistant, evidence components. The reference for building a Sherpa app. Uses real example customers, see CONTRIBUTING. |
| `docs/` | Decisions and background (see the note in `docs/README.md`) |

## Use it in a project
Needs a GitHub token with `read:packages` (a personal access token, classic). In the project:

```bash
echo "@proshore:registry=https://npm.pkg.github.com" >> .npmrc
# authenticate once on your machine: npm login --scope=@proshore --registry=https://npm.pkg.github.com
npm install @proshore/ui
npx proshore-ui-init     # adds the Claude skill and a CLAUDE.md section, so Claude uses the system correctly
```
More in [`packages/ui/README.pack.md`](packages/ui/README.pack.md). In CI of a consuming project, use a token with `read:packages` in the `NPM_TOKEN`-style secret for `.npmrc` (never commit it).

## Claude Design (optional)
Besides the package, the design system can be mirrored as a **Design System artifact in Claude Design**: a read-only reference page on claude.ai with the colours (light and dark), type, spacing, radius, logos and a few static component previews. It is meant for designers and for people who work in Claude Design, who **do not need access to this repository**: they only need access to the artifact on claude.ai.

- This repo stays the source of truth. The artifact is a generated copy and is never edited by hand.
- Developers building apps do not use it. They install `@proshore/ui` (see above) and `npx proshore-ui-init`, which is what makes Claude write correct code.
- Only maintainers update it, after a release: `npm run pack`, then `npm run export:design-system`, then publish the output in a Claude session. What it contains, its known gaps and the update steps are in [docs/claude-design-system.md](docs/claude-design-system.md).
- Publishing from CI is not verified. For now it is a manual step.

## Develop
```bash
npm install
npm run dev       # gallery (port 5180)
npm run dev:discovery   # the Discovery example (port 5181)
npm run api       # regenerates the API reference data (apps/gallery/src/generated/api.json, not committed)
npm run check     # the quality gate, same as CI
npm run pack      # builds release/proshore-ui-<version>.tgz
```
See [CONTRIBUTING.md](CONTRIBUTING.md), [CHANGELOG.md](CHANGELOG.md).
