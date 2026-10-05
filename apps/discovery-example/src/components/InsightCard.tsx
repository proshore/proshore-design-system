import { Card, Flex, Text } from "@proshore/ui";
import type { insights } from "../fixtures/brightfield";
import { EvidenceBadge } from "../ui";

type Insight = (typeof insights)[number];

/** Every insight carries its state, its source and its reviewer status. */
export function InsightCard({ insight }: { insight: Insight }) {
  return (
    <Card style={insight.state === "unknown" ? { border: "1px dashed var(--gray-9)" } : undefined}>
      <Flex direction="column" gap="2">
        <EvidenceBadge state={insight.state} />
        <Text as="p" weight="medium" size="3">{insight.title}</Text>
        <Text as="p" size="2" color="gray">{insight.body}</Text>
        <Text size="1" color="gray">Source: {insight.source}</Text>
        <Text size="1" color="gray">Review: {insight.reviewer}</Text>
      </Flex>
    </Card>
  );
}
