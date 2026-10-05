/** Provenance of a statement: where it came from and whether a person checked it. */
export type EvidenceState = "observed" | "inferred" | "confirmed" | "unknown";
/** How much of the planned analysis actually ran. */
export type CoverageState = "complete" | "partial" | "failed";
