/** Import once at the app root: `import "@proshore/ui/styles"`. Order matters: fonts, Radix Themes, tokens, patterns. */
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./theme/reset.css";
import "./theme/tokens.css";
import "./theme/patterns.css";
import "./theme/primitives.css";
import "./components/charts/charts.css"; // imported here too: a re-export-only module (charts/index) can be dropped from a library build together with its CSS
import "./shell/shell.css";
import "./components/dialogs.css";
import "./components/table/table.css"; // also here: EmptyState and friends are used without a DataTable
import "./theme/compat.css"; // old --sherpa-* token names, removed in 0.5.0
