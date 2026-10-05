import { applications, journey } from "./brightfield";
import type { Severity } from "./brightfield";
import { allFindings } from "./moreFindings";

/** One dataset drives every count in the prototype, so the overview, landscape, findings and nav never disagree. */
export { allFindings };
export const awaitingReview = (f: { reviewState: string }) => f.reviewState !== "confirmed";

export const stats = (() => {
  const bySeverity: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, review: 0 };
  for (const f of allFindings) bySeverity[f.severity]++;
  return { total: allFindings.length, awaiting: allFindings.filter(awaitingReview).length, bySeverity };
})();

export const applicationsWithStats = applications.map((a) => {
  const mine = allFindings.filter((f) => f.appId === a.id);
  return { ...a, observedItems: mine.length, needsReview: mine.filter(awaitingReview).length };
});

export const journeyWithStats = journey.map((j) => ({ ...j, toReview: allFindings.filter((f) => f.capability === j.name && awaitingReview(f)).length }));
