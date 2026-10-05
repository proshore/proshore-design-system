import { Badge, Button, Card, Flex, Heading, Text } from "@proshore/ui";
import type { applications } from "../fixtures/brightfield";
import { CoverageBadge } from "../ui";

type App = (typeof applications)[number];

/** An application is NOT a repository: repos are listed as its evidence sources. */
export function ApplicationCard({ app, onOpen }: { app: App; onOpen?: () => void }) {
  return (
    <Card as="article" aria-labelledby={`app-${app.id}`}>
      <>
        <Flex direction="column" gap="2">
          <Flex justify="between" align="start" gap="2" wrap="wrap">
            <Heading as="h3" size="3" id={`app-${app.id}`}>{app.name}</Heading>
            <CoverageBadge state={app.coverage} />
          </Flex>
          <Text size="2" color="gray">{app.role}</Text>
          <Text size="1" color="gray">{app.coverageNote}</Text>
          <ul aria-label="Repositories" style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1)", listStyle: "none", margin: 0, padding: 0 }}>
            {app.repos.map((r) => <li key={r}><Badge variant="soft" color="gray">{r}</Badge></li>)}
          </ul>
          <Text size="1">{app.stack} · {app.review}</Text>
          <Text size="1" color="gray">
            {app.coverage === "complete" ? "" : "At least "}{app.observedItems} observed items · {app.needsReview} awaiting review
          </Text>
          <Flex><Button variant="soft" size="1" onClick={onOpen}>Open {app.name}</Button></Flex>
        </Flex>
      </>
    </Card>
  );
}
