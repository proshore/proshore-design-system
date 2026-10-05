import type { SuiteApp, SuiteProduct } from "../ui";

/**
 * The Sherpa suite as the launcher shows it. Product names and taglines come from Proshore's site copy (docs/open-decisions.md).
 * Which apps exist, and their status, is stated as this prototype knows it: nothing here means an app is built.
 */
export const suiteProducts: SuiteProduct[] = [
  { id: "discovery", name: "Discovery", tagline: "Understand before change" },
  { id: "build", name: "Build", tagline: "Backlog to reviewed code" },
  { id: "pulse", name: "Pulse", tagline: "Keep software healthy" },
];

export const suiteApps: SuiteApp[] = [
  { id: "discovery", name: "Discovery", product: "discovery", description: "The customer engagement workspace.", status: "Engagement workspace", href: "#/overview", glyph: "workspace" },
  { id: "legacy-scan", name: "Legacy scan", product: "discovery", description: "Scans repositories and reports findings.", status: "Existing MVP, not embedded", href: "#/apps/legacy-scan", glyph: "scan" },
  { id: "scenario-planner", name: "Scenario planner", product: "discovery", description: "Compares options for a landscape.", status: "Concept, later phase", href: "#/apps/scenario-planner", glyph: "scenario" },
  { id: "seeder", name: "Seeder", product: "build", description: "Build tool.", status: "Concept", href: "#/apps/seeder", glyph: "build" },
  { id: "fixer", name: "Proshore Fixer", product: "pulse", description: "Finds and fixes bugs.", status: "Concept", href: "#/apps/fixer", glyph: "fixer" },
  { id: "monitoring", name: "Monitoring", product: "pulse", description: "Pulse monitoring tools.", status: "Concept", href: "#/apps/monitoring", glyph: "monitor" },
];

/** What each placeholder page may claim. Facts come from the docs; everything else says "to be defined". */
export const appLanding: Record<string, { purpose: string; status: string; connects: string }> = {
  "legacy-scan": {
    purpose: "Scans a customer's repositories and reports findings, scan coverage and code quality. Today it exists as Babish's MVP (sherpa-legacy).",
    status: "Not embedded here. Discovery's Findings and Evidence screens use fixture data shaped after this tool's API. Known gaps are in docs/mvp-reference.md.",
    connects: "Its scans feed the findings and coverage that Discovery presents. Proposed: one client and engagement across both.",
  },
  "scenario-planner": {
    purpose: "Compare options for a landscape (maintain, modernise, replace and so on) and their trade-offs.",
    status: "Concept only. The product brief places scenario planning and simulation in a later phase; nothing is designed or built.",
    connects: "Would start from the evidence and decisions recorded in Discovery. Proposed, not decided.",
  },
  seeder: {
    purpose: "A Build tool. Its purpose and screens are still to be defined with Jeroen.",
    status: "Concept only. No design or code in this prototype.",
    connects: "Build should read the same shared Sherpa context as Discovery. Proposed, not decided.",
  },
  fixer: {
    purpose: "Proshore Fixer is the bug finder and bug fixer. The name and the Yeti icon come from Jeroen; its scope and screens are still to be defined.",
    status: "Concept only. No design or code in this prototype. Which product it belongs to (Pulse here) is an assumption to confirm.",
    connects: "Findings from Legacy scan and Discovery could become work for the Fixer. Proposed, not decided.",
  },
  monitoring: {
    purpose: "Pulse tools that keep software healthy over time. Which monitoring tools belong here is still open.",
    status: "Concept only. No design or code in this prototype.",
    connects: "Pulse should show change over time against the decisions taken in Discovery. Proposed, not decided.",
  },
};
