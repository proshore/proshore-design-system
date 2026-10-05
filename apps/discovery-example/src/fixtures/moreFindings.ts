import { findings } from "./brightfield";
import type { FindingRecord, Severity, EvidenceState, ReviewState } from "./brightfield";

/**
 * DEMO DATA. Deterministic generated findings so tables can show sorting, search, filters and pagination.
 * Same shape as FindingRecord (mirrors the sherpa-legacy Finding payload). Nothing here is real.
 */
const pkgs = ["lodash", "express", "jsonwebtoken", "axios", "moment", "minimist", "handlebars", "log4j-core", "spring-web", "guzzlehttp/guzzle", "symfony/http-kernel", "openssl"];
const cats = ["Dependency", "Dependency", "Dependency", "Lifecycle", "Secret (hotspot)", "Code pattern", "Configuration"];
const sevs: Severity[] = ["critical", "high", "high", "medium", "medium", "medium", "low", "review"];
// No findings are attributed to Billing: its scan failed, so there is no evidence (unknown, not zero).
const apps = ["ordering", "ordering", "inventory", "ordering", "inventory"];
const caps = ["Browse catalogue", "Place order", "Confirm payment", "Reserve stock"];
const states: EvidenceState[] = ["observed", "observed", "observed", "inferred", "confirmed"];
const reviews: ReviewState[] = ["needs-review", "unreviewed", "unreviewed", "confirmed", "needs-review", "disputed"];
const notes: Record<ReviewState, string> = {
  "needs-review": "Needs Security officer", unreviewed: "Not yet reviewed", confirmed: "Confirmed by Technical lead", disputed: "Disputed by customer",
};

function make(i: number): FindingRecord {
  const pkg = pkgs[i % pkgs.length]; const sev = sevs[(i * 3) % sevs.length]; const cat = cats[(i * 5) % cats.length];
  const appId = apps[(i * 7) % apps.length]; const review = reviews[(i * 11) % reviews.length];
  const tool = cat.startsWith("Secret") ? ["gitleaks"] : cat === "Code pattern" ? ["semgrep"] : i % 2 ? ["trivy", "osv-scanner"] : ["osv-scanner"];
  return {
    id: `F-${2400 + i}`, title: cat === "Dependency" ? `Known vulnerability in ${pkg}` : cat === "Lifecycle" ? `${pkg} version is end of life` : cat.startsWith("Secret") ? `Possible secret in ${pkg} config` : cat === "Code pattern" ? `Unsafe pattern near ${pkg} call` : `Insecure default in ${pkg} settings`,
    severity: sev, category: cat, appId, capability: caps[i % caps.length], state: states[(i * 2) % states.length], reviewState: review, reviewNote: notes[review],
    business: { meaning: "Demo text: possible effect on this step of the order journey. Not assessed.", capability: `Place an order: ${caps[i % caps.length]}`, state: "inferred" },
    security: { cwe: `CWE-${200 + (i * 13) % 800} (demo)`, tools: tool, corroborated: tool.length > 1, disposition: review === "confirmed" ? "Accepted for now" : "Not yet reviewed", note: "Demo record generated for the table preview." },
    technical: { file: `${appId}-service/src/mod${i % 9}/file${i % 5}.ts`, line: 10 + ((i * 17) % 400), pkg, installed: `1.${i % 9}.${i % 4}`, fixed: `1.${(i % 9) + 1}.0`, fingerprint: `fp-${(i * 2654435761 >>> 0).toString(16).slice(0, 4)}…demo`, scan: "S-104", revision: "Not recorded (scan has no commit SHA)" },
  };
}

export const allFindings: FindingRecord[] = [...findings, ...Array.from({ length: 36 }, (_, i) => make(i))];

/** Scan trend (demo): findings observed per scan. Counts are "at least": coverage changed between scans. */
export const scanTrend = [
  { scan: "S-101", date: "2026-08-18", critical: 3, high: 12, medium: 21, low: 9, coverage: "partial" as const },
  { scan: "S-102", date: "2026-08-25", critical: 3, high: 11, medium: 22, low: 9, coverage: "partial" as const },
  { scan: "S-103", date: "2026-09-08", critical: 2, high: 14, medium: 24, low: 11, coverage: "complete" as const },
  { scan: "S-104", date: "2026-09-22", critical: 1, high: 11, medium: 20, low: 10, coverage: "partial" as const },
];
export const severityByApp = [
  { app: "Ordering", critical: 1, high: 7, medium: 9, low: 4, review: 2 },
  { app: "Inventory", critical: 0, high: 3, medium: 8, low: 5, review: 1 },
  { app: "Billing", critical: 0, high: 0, medium: 0, low: 0, review: 0, noEvidence: true },
];
