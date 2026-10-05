## User interface: Proshore design system

All UI in this project uses `@proshore/ui`. Before writing or changing any UI, read the project skill `.claude/skills/proshore-ui/SKILL.md` and the files in its `reference/` folder.

- Build screens from `Page`, `PageHeader`, `Section`, `Grid`, `Panel`, `DataTable` and the other exported components. No custom margins, no hard-coded colours, sizes or radii: use the tokens.
- Calm colour: neutral surfaces and one blue accent, status shown with words and shapes first. Light and dark must both work (dark = standard dark grey).
- Accessibility bar is WCAG 2.2 AA. Test every screen in light and dark with axe, at 1440px and 390px, and report what you checked and what you did not.
- Do not add other UI libraries, icon sets or colour palettes. If a component is missing, compose it from the existing ones and tell the user it is a candidate for the design system.
