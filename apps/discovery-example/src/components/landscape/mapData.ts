import { dependencies } from "../../fixtures/brightfield";
import type { EvidenceState, Severity } from "../../fixtures/brightfield";
import { allFindings, applicationsWithStats, awaitingReview, journeyWithStats } from "../../fixtures/derived";

const rank: Severity[] = ["critical", "high", "medium", "low", "review"];
const worst = (list: { severity: Severity }[]): Severity | null => rank.find((s) => list.some((f) => f.severity === s)) ?? null;

export const stateLabel: Record<EvidenceState, string> = { observed: "Observed", inferred: "Inferred, unconfirmed", confirmed: "Confirmed", unknown: "Unknown" };

/** The landscape as the concepts draw it: applications, the journey steps each one carries, and the findings on each step. One dataset, same as the rest of the prototype. */
export const mapApps = applicationsWithStats.map((a) => {
  const steps = journeyWithStats.filter((j) => j.appId === a.id).map((j) => {
    const fs = allFindings.filter((f) => f.capability === j.name);
    return { ...j, number: journeyWithStats.findIndex((x) => x.id === j.id) + 1, findings: fs, top: worst(fs), toReview: fs.filter(awaitingReview).length };
  });
  return { ...a, steps, calls: dependencies.filter((d) => d.from === a.name).map((d) => ({ to: d.to, label: d.label })) };
});

/** The step Proshore's recommendation is about. Demo assessment. */
export const recommendedStepId = "pay";
