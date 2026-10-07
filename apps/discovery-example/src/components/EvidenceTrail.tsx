import { Card, Flex, Heading, Text } from "@proshore/ui";
import { applications, evidenceTrail } from "../fixtures/brightfield";
import type { EvidenceState, FindingRecord } from "../fixtures/brightfield";
import { EvidenceBadge } from "../ui";

export type TrailStep = { step: string; state: EvidenceState; text: string; meta: string };

/** The chain for one finding, built from its record: source, application, business capability, potential impact. Each link keeps its own state. */
export function trailOf(f: FindingRecord): TrailStep[] {
  const app = applications.find((a) => a.id === f.appId);
  const t = f.technical;
  const detail = t.pkg !== "-" ? `, package ${t.pkg} ${t.installed}${t.fixed !== "-" ? `, fixed in ${t.fixed}` : ""}` : "";
  return [
    { step: "Source finding", state: f.state, text: `${f.title}${detail}`, meta: `${f.security.tools.join(" + ")} · ${t.file}:${t.line}${f.security.corroborated ? " · corroborated (not proof of exploitability)" : ""}` },
    { step: "Application", state: app?.review.startsWith("Mapping confirmed") ? "confirmed" : "inferred", text: `${app?.name ?? f.appId}, via repository ${t.file.split("/")[0]}`, meta: app?.review ?? "Not yet mapped" },
    { step: "Business capability", state: f.business.state, text: f.business.capability, meta: f.business.state === "confirmed" ? f.reviewNote : "Proposed from generated product description · awaiting Business owner" },
    { step: "Potential impact", state: "unknown", text: f.business.meaning, meta: f.severity === "critical" || f.severity === "high" ? "Open question · needs Security officer" : "Not yet assessed" },
  ];
}

/** Source finding to application, capability and impact. Each link has state and reviewer. */
export function EvidenceTrail({ steps = evidenceTrail, bare = false, heading = true }: { steps?: TrailStep[]; bare?: boolean; /** false when a titled Section already names it, so the page does not show two headings */ heading?: boolean }) {
  const list = (
    <ol className="sherpa-trail" aria-label="Evidence trail from finding to potential impact">
      {steps.map((s) => (
        <li key={s.step} className="sherpa-trail__item" data-status={s.state} style={{ color: `var(--pr-${s.state}-fg)` }}>
          <span className="sherpa-trail__dot" aria-hidden />
          <Flex direction="column" gap="1" style={{ color: "var(--gray-12)" }}>
            <Flex gap="2" align="center" wrap="wrap"><Text size="1" weight="bold">{s.step}</Text><EvidenceBadge state={s.state} /></Flex>
            <Text size="2">{s.text}</Text>
            <Text size="1" color="gray">{s.meta}</Text>
          </Flex>
        </li>
      ))}
    </ol>
  );
  if (bare) return list;
  return (<Card>{heading && <Heading as="h3" size="2" mb="3">Evidence trail</Heading>}{list}</Card>);
}
