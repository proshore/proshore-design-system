import deHeusMark from "../assets/deheus-mark.svg";
import ekoplazaMark from "../assets/ekoplaza-mark.svg";

/**
 * DEMO FIXTURE. De Heus and Ekoplaza are real Proshore customers: only their names and logos are real (logos taken from their
 * websites, marks cropped for small sizes). Every application, finding, person, date and number is invented. Nothing here is a verified
 * customer fact. Finding fields mirror the sherpa-legacy Finding payload
 * (tool, rule_id, severity, category, file, start_line, cwe, package,
 * installed_version, fixed_version, corroborated, fingerprint); review,
 * capability and impact records are proposed Sherpa context, not existing API.
 */
export type EvidenceState = "observed" | "inferred" | "confirmed" | "unknown";
export type CoverageState = "complete" | "partial" | "failed";

export const workspace = {
  name: "De Heus",
  engagement: "Ordering expansion Discovery",
  question: "Can the current ordering landscape support expansion, and where should we invest first?",
  scope: "Ordering, Inventory and Billing applications (3 of an unknown number in the landscape)",
};

export const applications = [
  {
    id: "ordering", name: "Ordering", role: "Customers place and pay for orders",
    repos: ["ordering-api", "ordering-web"], stack: "Node.js, Express, React",
    coverage: "partial" as CoverageState, coverageNote: "3 of 4 checks completed. Semgrep returned no result.",
    review: "Mapping proposed, awaiting Technical lead", observedItems: 14, needsReview: 5,
  },
  {
    id: "inventory", name: "Inventory", role: "Stock levels and reservations",
    repos: ["inventory-service"], stack: "Java, Spring Boot",
    coverage: "complete" as CoverageState, coverageNote: "4 of 4 checks completed on the latest scan.",
    review: "Mapping confirmed by Technical lead", observedItems: 6, needsReview: 1,
  },
  {
    id: "billing", name: "Billing", role: "Invoices and payment reconciliation",
    repos: ["billing-legacy"], stack: "PHP",
    coverage: "failed" as CoverageState, coverageNote: "Clone failed. No current evidence for this application.",
    review: "Not yet mapped", observedItems: 0, needsReview: 0,
  },
];

export const coverageChecks = [
  { tool: "Trivy (dependencies)", state: "complete" as CoverageState, detail: "77 results" },
  { tool: "OSV-Scanner (dependencies)", state: "complete" as CoverageState, detail: "113 results" },
  { tool: "Semgrep (code patterns)", state: "partial" as CoverageState, detail: "Reported ok with 0 results; not trusted as clean" },
  { tool: "Gitleaks (secrets)", state: "failed" as CoverageState, detail: "Log shows 3 hits but 0 were recorded" },
];

export const insights = [
  { state: "observed" as EvidenceState, title: "A critical dependency issue is reported in Ordering",
    body: "Two scanners report the same known vulnerability in a payment library.", source: "Scan S-104 · trivy, osv-scanner", reviewer: "No reviewer yet" },
  { state: "inferred" as EvidenceState, title: "Checkout may be limited during peak demand",
    body: "Generated from the code index. Not measured. Load behaviour is unknown.", source: "Sherpa draft · low confidence", reviewer: "Awaiting Business owner" },
  { state: "confirmed" as EvidenceState, title: "Inventory reserves stock before payment",
    body: "Checked in the workshop and matches the code.", source: "Workshop 12 Oct", reviewer: "Confirmed by Sanne de Vries (Technical lead)" },
  { state: "unknown" as EvidenceState, title: "Is the vulnerable code path reachable?",
    body: "Nobody has checked yet. This decides how urgent the upgrade is.", source: "Open question", reviewer: "Needs Security officer" },
];

export const evidenceTrail = [
  { step: "Source finding", state: "observed" as EvidenceState, text: "Critical dependency vulnerability, package payment-lib 1.2.3, fixed in 1.4.0", meta: "Scan S-104 · trivy + osv-scanner · package-lock.json · corroborated (not proof of exploitability)" },
  { step: "Application", state: "inferred" as EvidenceState, text: "Ordering, via repository ordering-api", meta: "Proposed grouping · awaiting Technical lead" },
  { step: "Business capability", state: "inferred" as EvidenceState, text: "Place an order: Confirm payment", meta: "From generated product description · awaiting Business owner" },
  { step: "Potential impact", state: "unknown" as EvidenceState, text: "Checkout outage or data exposure during expansion. Reachability not yet checked.", meta: "Open question · needs Security officer" },
];

export const decision = {
  status: "Proshore-reviewed (demo)",
  recommendation: "Stabilise Ordering before expansion: upgrade the payment library and verify reachability first.",
  alternatives: ["Modernise Ordering now (larger change, more unknowns)", "Expand as-is (accepts an unchecked critical issue)"],
  assumptions: ["Expansion doubles order volume", "Billing scan can be completed"],
  openQuestions: ["Is the vulnerable path reachable?", "Why did Semgrep and Gitleaks results not register?"],
  reasons: [
    { text: "A critical vulnerability is reported in the payment library used at checkout.", state: "observed" as EvidenceState, evidence: [{ label: "Finding F-2291", finding: "F-2291" }, { label: "Scan S-104", href: "#/evidence" }] },
    { text: "Nobody has checked whether that code can be reached, so we cannot yet say how urgent it is.", state: "unknown" as EvidenceState, evidence: [{ label: "Open question", href: "#/evidence" }] },
    { text: "Billing was not scanned, so its risk is unknown, not low.", state: "unknown" as EvidenceState, evidence: [{ label: "Billing coverage", href: "#/evidence" }, { label: "Landscape", href: "#/landscape" }] },
  ] as { text: string; state: EvidenceState; evidence: { label: string; finding?: string; href?: string }[] }[],
  steps: [
    { label: "Drafted by Proshore", detail: "Maria Jansen", state: "done" },
    { label: "Reviewed by Proshore", detail: "Second reviewer (demo)", state: "done" },
    { label: "Customer comments", detail: "Open. Your team can comment now.", state: "current" },
    { label: "Signed off", detail: "Not yet", state: "todo" },
  ] as { label: string; detail: string; state: "done" | "current" | "todo" }[],
  owner: "Maria Jansen (Proshore consultant)", nextAction: "Re-scan Billing and hold the security review by 20 Oct", reviewedOn: "Draft, not signed off",
};

/* ---- App fixtures (demo) ---------------------------------------------------- */
export type Severity = "critical" | "high" | "medium" | "low" | "review";
export type ReviewState = "unreviewed" | "needs-review" | "confirmed" | "disputed";

export type FindingRecord = {
  id: string; title: string; severity: Severity; category: string; appId: string; capability: string;
  state: EvidenceState; reviewState: ReviewState; reviewNote: string;
  business: { meaning: string; capability: string; state: EvidenceState };
  security: { cwe: string; tools: string[]; corroborated: boolean; disposition: string; note: string };
  technical: { file: string; line: number; pkg: string; installed: string; fixed: string; fingerprint: string; scan: string; revision: string };
};
const tech = (file: string, line: number, pkg = "-", installed = "-", fixed = "-", fp = "demo") => ({
  file, line, pkg, installed, fixed, fingerprint: `fp-${fp}…demo`, scan: "S-104", revision: "Not recorded (scan has no commit SHA)",
});
export const findings: FindingRecord[] = [
  { id: "F-2291", title: "Known vulnerability in payment-lib", severity: "critical", category: "Dependency", appId: "ordering", capability: "Confirm payment",
    state: "observed", reviewState: "needs-review", reviewNote: "Needs Security officer",
    business: { meaning: "Could interrupt or expose customer payments at Confirm payment.", capability: "Place an order: Confirm payment", state: "inferred" },
    security: { cwe: "CWE-1104 (demo)", tools: ["trivy", "osv-scanner"], corroborated: true, disposition: "Needs investigation", note: "Two tools agree. That does not show it can be exploited here." },
    technical: tech("ordering-api/package-lock.json", 1842, "payment-lib", "1.2.3", "1.4.0", "7c1e") },
  { id: "F-2310", title: "Possible secret in ordering-web config", severity: "high", category: "Secret (hotspot)", appId: "ordering", capability: "Place order",
    state: "observed", reviewState: "needs-review", reviewNote: "Hotspot: a person must look",
    business: { meaning: "If real, someone outside could act as the shop's systems. Unverified.", capability: "Place order", state: "inferred" },
    security: { cwe: "CWE-798 (demo)", tools: ["gitleaks"], corroborated: false, disposition: "Not yet reviewed", note: "A pattern match, not a confirmed leak. The scan log shows hits that the scan did not record, so treat this list as incomplete." },
    technical: tech("ordering-web/.env.example", 12, "-", "-", "-", "b90a") },
  { id: "F-2315", title: "Framework version has reached end of life", severity: "medium", category: "Lifecycle", appId: "inventory", capability: "Reserve stock",
    state: "confirmed", reviewState: "confirmed", reviewNote: "Confirmed by Sanne de Vries (Technical lead)",
    business: { meaning: "No security fixes for this version. Upgrading is planned work, not urgent by itself.", capability: "Place an order: Reserve stock", state: "confirmed" },
    security: { cwe: "n/a", tools: ["trivy"], corroborated: false, disposition: "Accepted for now, revisit before expansion", note: "Lifecycle status is factual. Exposure depends on how the service is reached." },
    technical: tech("inventory-service/pom.xml", 24, "spring-boot", "2.7.18", "3.x (major upgrade)", "44d2") },
  { id: "F-2320", title: "Cart total may be computed in the browser", severity: "review", category: "Architecture concern", appId: "ordering", capability: "Place order",
    state: "inferred", reviewState: "unreviewed", reviewNote: "Generated by Sherpa, not reviewed",
    business: { meaning: "If true, prices could be altered by a customer. Needs a technical check before anyone relies on it.", capability: "Place order", state: "inferred" },
    security: { cwe: "n/a", tools: ["Sherpa code index (generated)"], corroborated: false, disposition: "Not yet reviewed", note: "Generated interpretation of the code. No scanner reported this." },
    technical: tech("ordering-web/src/cart/total.ts", 58, "-", "-", "-", "e3f7") },
];

export const journey = [
  { id: "browse", name: "Browse catalogue", appId: "ordering", state: "observed" as EvidenceState, note: "Evidence found in Ordering", findingIds: [] as string[] },
  { id: "order", name: "Place order", appId: "ordering", state: "inferred" as EvidenceState, note: "Cart logic needs a check", findingIds: ["F-2310", "F-2320"] },
  { id: "pay", name: "Confirm payment", appId: "ordering", state: "observed" as EvidenceState, note: "Critical dependency issue reported", findingIds: ["F-2291"] },
  { id: "stock", name: "Reserve stock", appId: "inventory", state: "confirmed" as EvidenceState, note: "Checked in the workshop", findingIds: ["F-2315"] },
  { id: "invoice", name: "Send invoice", appId: "billing", state: "unknown" as EvidenceState, note: "No current evidence: scan failed", findingIds: [] as string[] },
];

export const dependencies = [
  { from: "Ordering", to: "Inventory", label: "reserves stock" },
  { from: "Ordering", to: "Billing", label: "sends order for invoicing" },
];

export const askAnswers = [
  {
    q: "Is it safe to expand before we upgrade the payment library?",
    a: "Not yet known. Two scanners report a critical known vulnerability in payment-lib 1.2.3 (fixed in 1.4.0). What nobody has checked is whether Ordering calls the vulnerable code. Until that is checked, the safer plan is to upgrade before expansion.",
    sure: "Medium on the finding (two tools agree). Low on impact (not tested).",
    cites: ["F-2291", "Scan S-104", "Open question: reachability"],
    missing: "Semgrep returned nothing and Gitleaks results were not recorded, so code-level issues may be missing.",
  },
  {
    q: "Which application should we look at first?",
    a: "Ordering. It carries the payment step and most of the review items (5 awaiting review). Billing has no current evidence because its scan failed, so it is unknown, not clean.",
    sure: "Medium. Based on counts of items awaiting review, not on business importance yet.",
    cites: ["Application: Ordering", "Application: Billing (scan failed)"],
    missing: "Business importance has not been confirmed by the Business owner.",
  },
  {
    q: "What could Proshore not see?",
    a: "Billing (clone failed), code-pattern results from Semgrep, and secret results from Gitleaks. Runtime behaviour and infrastructure were not part of this scan.",
    sure: "High. This comes from the scan record itself.",
    cites: ["Evidence and coverage", "Scan S-104 log"],
    missing: "Nothing beyond the above is known to be missing, but that is what the scan itself can tell us.",
  },
];


/* ---- Setup fixtures (demo) --------------------------------------------------- */
export type RepoRow = { id: string; name: string; provider: string; branch: string; appId: string; scan: CoverageState | "none"; scanNote: string };
export const setupRepos: RepoRow[] = [
  { id: "r1", name: "deheus/ordering-api", provider: "github", branch: "main", appId: "ordering", scan: "partial", scanNote: "Semgrep returned nothing; Gitleaks hits not recorded" },
  { id: "r2", name: "deheus/ordering-web", provider: "github", branch: "main", appId: "ordering", scan: "partial", scanNote: "Same tool gaps as ordering-api" },
  { id: "r3", name: "deheus/inventory-service", provider: "github", branch: "main", appId: "inventory", scan: "complete", scanNote: "4 of 4 checks completed" },
  { id: "r4", name: "deheus/billing-legacy", provider: "github", branch: "main", appId: "billing", scan: "failed", scanNote: "Clone failed. No current evidence" },
];

export type ContextRow = { id: string; label: string; text: string; source: "confirmed" | "proshore" | "code" };
export const setupContext: ContextRow[] = [
  { id: "c1", label: "Business goal", text: "Double order volume in the next 18 months without slower checkout.", source: "confirmed" },
  { id: "c2", label: "Critical process", text: "Place and fulfil an order: browse, order, pay, reserve stock, invoice.", source: "confirmed" },
  { id: "c3", label: "Constraint", text: "No downtime during the autumn peak season.", source: "proshore" },
  { id: "c4", label: "Known architecture", text: "Ordering calls Inventory to reserve stock and Billing to invoice.", source: "code" },
];

export type Person = { id: string; name: string; org: string; role: string; start: string; access: string };
export const setupPeople: Person[] = [
  { id: "p1", name: "Maria Jansen", org: "Proshore", role: "Consultant", start: "Setup", access: "Edit and publish" },
  { id: "p2", name: "Anouk Bakker", org: "De Heus", role: "Business owner", start: "Landscape", access: "Comment and confirm" },
  { id: "p3", name: "Tim Vermeer", org: "De Heus", role: "Security officer", start: "Findings", access: "Review findings" },
  { id: "p4", name: "Sanne de Vries", org: "De Heus", role: "Technical lead", start: "Evidence", access: "Confirm mappings" },
];

/* ---- Identity fixtures (demo) ------------------------------------------------- */

/** Client logos are uploaded by Proshore during setup. These are fictional marks. */
export const clients = [
  { id: "deheus", name: "De Heus", logo: deHeusMark, engagements: [{ id: "ordering", name: "Ordering expansion Discovery" }, { id: "warehouse", name: "Warehouse Discovery" }] },
  { id: "ekoplaza", name: "Ekoplaza", logo: ekoplazaMark, engagements: [{ id: "webshop", name: "Webshop Discovery" }] },
];

/** Demo avatar image, standing in for a Google Workspace profile photo (a generated placeholder, not a photo). */
const demoPhoto = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a8a3ff"/><stop offset="1" stop-color="#5147ff"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/><circle cx="32" cy="25" r="11" fill="#fff" opacity=".9"/><path d="M10 64c2-16 12-24 22-24s20 8 22 24Z" fill="#fff" opacity=".9"/></svg>');

export type Persona = { id: string; name: string; email: string; role: string; org: string; avatar?: string; staff: boolean; entry: "landscape" | "findings" | "evidence" | null };
export const personas: Persona[] = [
  { id: "maria", name: "Maria Jansen", email: "maria.jansen@proshore.example", role: "Consultant", org: "Proshore", avatar: demoPhoto, staff: true, entry: null },
  { id: "anouk", name: "Anouk Bakker", email: "anouk.bakker@deheus.example", role: "Business owner", org: "De Heus", staff: false, entry: "landscape" },
  { id: "tim", name: "Tim Vermeer", email: "tim.vermeer@deheus.example", role: "Security officer", org: "De Heus", staff: false, entry: "findings" },
  { id: "sanne", name: "Sanne de Vries", email: "sanne.devries@deheus.example", role: "Technical lead", org: "De Heus", staff: false, entry: "evidence" },
];
