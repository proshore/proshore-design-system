# Claude design system mirror

## What it is
Claude has a "Design System" artifact type: a read-only, browsable reference that Claude Design reads when it builds something for Proshore. It shows our tokens in light and dark, the type scale, spacing and radius, the logos, a README, and static previews of components.

This repository generates the files for that reference. **The repository stays the source of truth.** The mirror is a copy that can go stale; never edit it by hand, change the source and regenerate.

What is mirrored, and from where:

| In the mirror | Comes from |
| --- | --- |
| Colour, spacing, radius, shadow and text-size tokens | `packages/ui/src/theme/*.css`, resolved per theme |
| One sentence of usage per token | `packages/ui/design-system-notes.json` (reviewed by hand) |
| Component stylesheet, fonts, previews | the packed library (`npm run pack`), previews listed in `packages/ui/design-system-previews.mjs` |
| README, logo README, cover | `packages/ui/design-system/` (hand-written, reviewed) |
| Logos | `packages/ui/src/assets/` (XML prolog and editor comment removed so the store accepts them; artwork unchanged) |

## Regenerate
```bash
npm run pack                  # builds the library the previews are rendered from
npm run export:design-system  # writes packages/ui/.design-system/project/
```
The output folder is git-ignored. The script prints token counts per category, the file count and size, and how many tokens were skipped; the full list of skipped tokens with the reason is in `packages/ui/.design-system/report.json`. If the packed build is missing it stops with a message. If a token has no usage note it stops and names the token. If a preview contains a script, an iframe or a comment, or a logo or file breaks a cap of the artifact type, it stops.

`npm run test:export` (part of `npm run check`) packs, runs the export in memory and checks the result: the light and dark cascade for known tokens, no `var()` or `color-mix` in the tokens, a note on every token, clean previews, file caps and valid logos. It needs no network.

When you add or rename a token: add or adjust a note in `design-system-notes.json`. When you add a component worth showing: add an entry to `design-system-previews.mjs`.

## Publish (manual step, not automated)
Nothing publishes by itself. After regenerating, ask Claude in a session:

> Update the Proshore design system artifact from packages/ui/.design-system

or use the Artifact tool with `url` set to the existing artifact and `files`/`root` pointing at `packages/ui/.design-system/project`. Two things the publishing session has to do, because the script cannot:

- Upload the two logo SVGs as artifact assets and put their blob ids in the index (`design-system.json` is generated with empty `blob` values). On an update, keep the asset records the live index already has and only re-upload a logo if it changed.
- Write `design-system.json` last, keeping the keys of the live index, as the artifact type requires.

Publishing from CI is **unverified**: nobody has tried it, and the type says a pipeline that republishes may overwrite edits people made in the artifact. Do not add it without a decision.

## Known gaps
- **No interactive components.** Previews are static markup rendered with `react-dom/server`: no focus states, popovers, validation or sorting. The type can run a bundle, but we do not build one.
- **React 19 is needed to render the previews** (React Aria Components). The earlier spike used an older React and `DataTable` and `Select` failed to render; with React 19.3 they render.
- **The wordmark is navy**, so it is invisible on the dark theme; the logo README says to use the icon there.
- **Latin fonts only.** The package ships Cyrillic and Vietnamese subsets; the mirror carries the Latin subset.
- **Line heights are not in the source tokens**, so text styles carry size and weight only. Font weight 600 for steps 6 to 9 is our reading of the headings, not a token.
- **Skipped on purpose:** layout sizes, easing curves, the demo border, `transparent` values, component-internal and media-query variables, and the `[data-surface="inverse"]` overrides (they change values inside the header and hero, not the theme).
- **The cascade is simple.** It understands `:root` and `:root[data-theme]` only, with specificity and source order. A new kind of theme selector is reported as skipped, not guessed.
- **The cover keeps its derivation comment**, because the type requires it on the cover. All other previews must have no comment besides the first line.
- Shadow values are exported as `{light, dark}` strings. The type's page may or may not draw them; this is unchecked.

## Reviewer checklist
- [ ] `npm run check` is green; the skipped-token list in `report.json` has no surprise (a token you expected is not there).
- [ ] Usage notes read true for the tokens that changed. They are written by hand from the source comments and component CSS; some tokens (for example `pr-hero-*`, `accent-surface`, the `sev-*` scale) are not used by the library itself, so their notes describe intent.
- [ ] `design-system/README.md` and `logos-README.md` still match the product: principles, theme description, which components are not shown. Dark values in the README are filled in from the tokens, the prose is not.
- [ ] The cover still shows the brand colours (it uses `pr-*` tokens, so it follows them) and its derivation comment is still accurate.
- [ ] Previews open without script or comment problems (the export enforces this).
- [ ] After a manual publish: open the artifact, check light and dark, that the logos show, and that the token list matches `report.json`. How claude.ai renders the page is not tested by this repository.
