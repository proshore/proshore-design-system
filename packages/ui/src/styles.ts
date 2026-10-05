/** Import once at the app root: `import "@proshore/ui/styles"`. Order matters: fonts, Radix Themes, tokens, patterns. */
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./theme/reset.css";
import "./theme/tokens.css";
import "./theme/patterns.css";
import "./theme/primitives.css";
import "./components/charts/charts.css"; // imported here too: a re-export-only module (charts/index) can be dropped from a library build together with its CSS
