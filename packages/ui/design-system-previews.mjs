// Fixed list of component previews for the Claude design system mirror. Rendered to static HTML with react-dom/server from the
// PACKED library (scripts/export-design-system.mjs). Each node is { c: component name or html tag, p: props, k: children }.
// Static only: no focus, no popovers, no scripts. Add a component by adding an entry; the export fails if it cannot render.
const n = (c, p, ...k) => ({ c, p, k });
const row = (...k) => n("Cluster", { gap: 3 }, ...k);

export default [
  {
    name: "Button", group: "Actions", height: 120,
    readme: `Buttons trigger actions; links navigate. Solid is the one primary action per view, outline the alternative, soft and ghost for quiet actions. Pill shape, sentence case, verbs.

The consumer provides the label and \`onClick\` (or \`href\` for a real link). Icon-only buttons need an \`aria-label\`.

- Do: say what happens ("Confirm mapping").
- Don't: two solid buttons in one view; colour alone to mark a destructive action.`,
    tree: row(
      n("Button", { variant: "solid" }, "Confirm mapping"), n("Button", { variant: "outline" }, "Add context"), n("Button", { variant: "soft" }, "Save draft"),
      n("Button", { variant: "ghost" }, "Dismiss"), n("Button", { variant: "solid", disabled: true }, "Disabled"), n("Button", { size: "1" }, "Small"), n("Button", { size: "3" }, "Large"),
    ),
  },
  {
    name: "Note", group: "Feedback", height: 260,
    readme: `Note is an inline message that stays on the page; tone is info, warning, success or danger. Icon and words always accompany the colour. Use a toast for events that pass.

Tone maps to the semantic status tokens, so contrast holds in light and dark.`,
    tree: n("Stack", { gap: 3 }, ...["info", "warning", "success", "danger"].map((t) => n("Note", { tone: t }, `${t[0].toUpperCase() + t.slice(1)}: a message that stays on the page, with icon and words.`))),
  },
  {
    name: "Panel", group: "Layout", height: 260,
    readme: `Panel and StatCard hold one thing each: a titled card, or a number with a caveat. Never nest cards in cards.

The consumer provides children; StatCard takes \`label\`, \`value\` and an optional \`caveat\`.`,
    tree: n("Cluster", { gap: 4 },
      n("div", { style: { width: 300 } }, n("Panel", { eyebrow: "Overview", title: "Panel title" }, "A card holds one thing. Do not nest cards.")),
      n("div", { style: { width: 220 } }, n("StatCard", { label: "Open items", value: "12", caveat: "Sample number, illustrative" })),
    ),
  },
  {
    name: "Forms", group: "Forms", height: 340,
    readme: `Form fields (TextField, Checkbox, Switch, and Select, RadioGroup, DateRangePicker not shown) are React Aria components with a visible label, an optional description, and an error shown as text with an icon.

This preview is static markup rendered from the real library; focus, validation and popovers need the React runtime.`,
    tree: n("Stack", { gap: 4 },
      n("TextField", { label: "Name", description: "Visible label, optional description.", placeholder: "Type here" }),
      n("TextField", { label: "Email", error: "Enter a valid email address.", defaultValue: "nope" }),
      n("Checkbox", { defaultSelected: true }, "Checkbox"), n("Switch", { defaultSelected: true }, "Switch"),
    ),
  },
  {
    name: "Tabs", group: "Navigation", height: 180,
    readme: `Tabs switch between views of the same item. Use links to move to a different item. Arrow keys move and select (React Aria; static here).`,
    tree: n("Tabs", { label: "Example", defaultValue: "a", items: [{ id: "a", label: "Overview", content: "First view of the same record." }, { id: "b", label: "Activity", content: "Second view." }] }),
  },
  {
    name: "SimpleTable", group: "Data", height: 220,
    readme: `SimpleTable is the small read-only table: caption, left-aligned text, right-aligned numbers. For search, sort, filters and paging use DataTable.`,
    tree: n("SimpleTable", {
      caption: "Sample", getRowId: (r) => r.a,
      columns: [{ id: "a", header: "Name", cell: (r) => r.a }, { id: "b", header: "Status", cell: (r) => r.b }],
      rows: [{ a: "Alpha", b: "Ready" }, { a: "Beta", b: "Draft" }],
    }),
  },
  {
    name: "DataTable", group: "Data", height: 300,
    readme: `DataTable is the full data table: caption, optional search, sorting, filters and paging on top of TanStack Table. Use it for lists people scan and filter; use SimpleTable for a few static rows.

The consumer provides \`rows\`, \`columns\` (id, header, accessor), \`getRowId\` and a caption. This preview is static markup rendered with React 19; sorting and search need the React runtime.`,
    tree: n("DataTable", {
      caption: "Sample", getRowId: (r) => r.id, features: { search: true },
      columns: [{ id: "n", header: "Name", accessor: (r) => r.n }], rows: [{ id: "1", n: "Alpha" }, { id: "2", n: "Beta" }],
    }),
  },
  {
    name: "Select", group: "Forms", height: 140,
    readme: `Select picks one option from a list, with a visible label (React Aria). Closed state only here; the popover needs the React runtime.

The consumer provides \`label\`, \`options\` ({ value, label }) and optionally a \`placeholder\`.`,
    tree: n("Select", { label: "Choice", options: [{ value: "a", label: "A" }], placeholder: "Pick" }),
  },
];
