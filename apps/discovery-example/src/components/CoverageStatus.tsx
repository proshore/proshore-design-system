import { Card, Flex, Heading, Text } from "@proshore/ui";
import { coverageChecks } from "../fixtures/brightfield";
import type { CoverageState } from "../fixtures/brightfield";
import { CoverageBadge } from "../ui";

/** Compact per-tool coverage. Never renders "no issues" for partial or failed states. */
export function CoverageStatus({ state, checks = coverageChecks }: { state: CoverageState; checks?: typeof coverageChecks }) {
  const headline = {
    complete: "All planned checks finished. Counts reflect this scan only.",
    partial: "Some checks are missing or not trusted. Counts are “at least”. Absence of results is not a clean bill.",
    failed: "The scan failed. There is no current evidence for this scope.",
  }[state];
  return (
    <Card>
      <Flex direction="column" gap="2">
        <Flex justify="between" align="center" gap="2" wrap="wrap">
          <Heading as="h3" size="2">Scan coverage</Heading>
          <CoverageBadge state={state} />
        </Flex>
        <Text size="2">{headline}</Text>
        {state !== "failed" && (
          <ul style={{ margin: 0, paddingLeft: "var(--space-4)" }}>
            {checks.map((c) => (
              <li key={c.tool}><Text size="1"><strong>{c.tool}</strong>: {c.detail} <CoverageBadge state={c.state} prefix="" /></Text></li>
            ))}
          </ul>
        )}
      </Flex>
    </Card>
  );
}
