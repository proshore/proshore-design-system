# Proshore design system

`@proshore/ui`: tokens (light and dark), layout, forms, tables, charts, overlays, icons, the Proshore brand and the Google Workspace sign-in screen, for Proshore's internal apps. Product-neutral. Internal use only.

| Where | What |
| --- | --- |
| `packages/ui` | The package `@proshore/ui` (source, build, Claude skill, token export) |
| `packages/auth` | The package `@proshore/auth`: server-side Google Workspace sign-in (proshore.nl only), see [`docs/google-sign-in.md`](docs/google-sign-in.md). Not yet verified against real Google. |
| `apps/gallery` | Component gallery and example screens (foundations, components, user management, kanban, card board, bug reporting, sign-in). Also the test bench: axe in light and dark, phone width, console errors. |
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

## Develop
```bash
npm install
npm run dev       # gallery (port 5180)
npm run dev:discovery   # the Discovery example (port 5181)
npm run check     # the quality gate, same as CI
npm run pack      # builds release/proshore-ui-<version>.tgz
```
See [CONTRIBUTING.md](CONTRIBUTING.md), [CHANGELOG.md](CHANGELOG.md).
