import { Grid, Heading, Page, PageHeader, Panel, Section, Stack, Text } from "@proshore/ui";

const colours = ["gray-2", "gray-4", "gray-6", "gray-9", "gray-11", "gray-12", "sherpa-accent-mark", "sherpa-accent-text", "sev-critical", "sev-high", "sev-medium", "sev-low", "chart-1", "chart-2", "chart-3", "chart-4"];
const spaces = [1, 2, 3, 4, 5, 6];

export function Foundations() {
  return (
    <Page>
      <PageHeader eyebrow="Design system" title="Foundations" description="Tokens are CSS variables, so any framework can use them. Switch light and dark in the account menu." />
      <Section title="Colour tokens" description="Use the token, never the hex value. Text on a token background must keep 4.5:1 contrast; the e2e suite checks this in light and dark.">
        <div className="g-swatches">{colours.map((c) => <div key={c} className="g-swatch"><i style={{ background: `var(--${c})` }} /><span>{c}</span></div>)}</div>
      </Section>
      <Section title="Type">
        <Panel><Stack gap={2}><Heading as="h3" size="7">Heading 7</Heading><Heading as="h3" size="5">Heading 5</Heading><Text size="3">Body text, size 3. Geist Variable.</Text><Text size="2" color="gray">Secondary text, size 2.</Text><Text size="2" mono>Mono: INV-1042</Text></Stack></Panel>
      </Section>
      <Section title="Spacing">
        <Grid min={160}>{spaces.map((s) => <Panel key={s} tight><div style={{ height: 12, width: `var(--space-${s})`, background: "var(--sherpa-accent-mark)", borderRadius: 2 }} /><Text size="1" color="gray">--space-{s}</Text></Panel>)}</Grid>
      </Section>
    </Page>
  );
}
