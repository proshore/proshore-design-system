import { Button, Flex, Text } from "@proshore/ui";
import { ArrowRightIcon } from "@proshore/ui";

/** Action hierarchy: one primary per view, secondary for alternatives, quiet for low-emphasis. */
export function Actions() {
  return (
    <Flex direction="column" gap="2">
      <Flex gap="3" wrap="wrap" align="center">
        <Button variant="solid">Confirm mapping <ArrowRightIcon aria-hidden /></Button>
        <Button variant="outline">Add context</Button>
        <Button variant="ghost">Dismiss</Button>
        <Button variant="solid" disabled>Publish to customer</Button>
      </Flex>
      <Text size="1" color="gray">Primary (solid) · Secondary (outline) · Quiet (ghost) · Disabled. Publishing is disabled until coverage is reviewed.</Text>
    </Flex>
  );
}
