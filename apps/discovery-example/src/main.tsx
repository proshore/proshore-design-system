import "@proshore/ui/styles";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

/** Dev-only test hook: `await __axe()` in the console scans the current page with axe-core (WCAG 2.2 AA + best practice). */
if (import.meta.env.DEV) {
  (window as unknown as { __axe: () => Promise<unknown> }).__axe = async () => {
    const axe = (await import("axe-core")).default;
    const r = await axe.run(document.body, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"] } });
    return { violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help, sample: v.nodes.slice(0, 2).map((n) => n.target.join(" ")) })), passes: r.passes.length, incomplete: r.incomplete.map((i) => i.id) };
  };
}
