import { useState } from "react";
import { Checkbox, Cluster, Heading, Page, PageHeader, Panel, Section, Stack, Text } from "@proshore/ui";
import { Demo, Swatch } from "../doc/Doc";

const steps = ["darkest", "darker", "dark", "", "light", "lighter", "lightest"];
const families = [
  { id: "lapis", name: "Lapis Blue", use: "Text and the dark header. Lapis Blue Darker is the ink colour." },
  { id: "clear-blue", name: "Clear Blue", use: "The accent: buttons, links, focus, charts." },
  { id: "terai", name: "Terai Green", use: "Success and the third chart colour." },
  { id: "marigold", name: "Marigold", use: "Warnings and caution." },
  { id: "saffron", name: "Saffron Orange", use: "The Proshore mark only. Never for UI state or text." },
  { id: "neutral", name: "Neutral", use: "Lines, disabled states, quiet surfaces." },
];
const token = (f: string, s: string) => `--pr-${f}${s ? `-${s}` : ""}`;
const nums = Array.from({ length: 12 }, (_, i) => i + 1);

function Scale({ prefix }: { prefix: string }) {
  return <div className="g-scale">{nums.map((n) => <div key={n}><span style={{ background: `var(--${prefix}-${n})` }} /><small>{n}</small></div>)}</div>;
}
const semantic = ["--sherpa-canvas", "--sherpa-surface", "--sherpa-surface-muted", "--sherpa-line", "--sherpa-accent-mark", "--sherpa-accent-text", "--sherpa-on-mark", "--focus-8"];
const status = [["Observed", "observed"], ["Inferred", "inferred"], ["Confirmed", "confirmed"], ["Unknown", "unknown"], ["Danger", "danger"]] as const;
const charts = ["--chart-1", "--chart-1-tint", "--chart-2", "--chart-3", "--chart-4", "--chart-5", "--chart-6", "--chart-track"];
const severity = ["--chart-sev-critical", "--chart-sev-high", "--chart-sev-medium", "--chart-sev-low", "--chart-sev-review"];
const sizes = [[9, "Display"], [8, "Large heading"], [7, "Page title"], [6, "Section"], [5, "Panel title"], [4, "Lead text"], [3, "Body"], [2, "Secondary"], [1, "Caption"]] as const;

export function Foundations() {
  const [compare, setCompare] = useState(false);
  return (
    <Page>
      <PageHeader eyebrow="Design system" title="Foundations" description="Tokens, not values. Components read semantic tokens, so a brand change happens in one file. Every value shown is read from the live CSS in the current theme."
        actions={<Checkbox isSelected={compare} onChange={setCompare}>Compare light and dark</Checkbox>} />

      <Demo id="brand" compare={compare} title="Brand palette" use="Proshore's brand colours, seven steps each (Relume variables from proshore.nl). Use the semantic tokens below in components, not these directly."
        dos={["Use Lapis Blue Darker for text and Clear Blue for the accent.", "Use Saffron Orange only for the Proshore mark."]} donts={["Do not use a brand step directly in a component; use a semantic token.", "Do not use Saffron Orange for warnings or errors."]}>
        <Stack gap={5}>
          {families.map((f) => (
            <div key={f.id} className="g-family">
              <Heading as="h3" size="4">{f.name}</Heading><Text size="2" color="gray">{f.use}</Text>
              <div className="g-family__row">{steps.map((s) => <Swatch key={s} token={token(f.id, s)} label={s || "base"} />)}</div>
            </div>
          ))}
          <div className="g-family"><Heading as="h3" size="4">White</Heading><div className="g-family__row"><Swatch token="--pr-white" label="white" /></div></div>
        </Stack>
      </Demo>

      <Demo id="scales" compare={compare} title="Interface scales" use="Twelve steps of neutral and accent. 1 to 2 are backgrounds, 3 to 5 hover and selected, 6 to 8 borders, 9 to 10 solid fills, 11 to 12 text."
        dos={["Pick by role: text on a background needs 4.5:1; check in light and dark.", "Use gray-11 for secondary text, gray-12 for primary."]} donts={["Do not pick a step by how it looks in one theme only."]}>
        <Stack gap={3}><Text size="2" weight="medium">Neutral (--gray-1 to 12)</Text><Scale prefix="gray" /><Text size="2" weight="medium">Accent (--accent-1 to 12)</Text><Scale prefix="accent" /></Stack>
      </Demo>

      <Demo id="semantic" compare={compare} title="Semantic colours" use="What components actually use. Canvas is the page, surface is a card on it, line is a border."
        dos={["Use accent-mark for filled accent areas and accent-text for accent text; they are different on purpose.", "Use on-mark for text on a filled accent area."]} donts={["Do not put text on accent-mark in any colour except on-mark."]}>
        <div className="g-family__row">{semantic.map((t) => <Swatch key={t} token={t} />)}</div>
      </Demo>

      <Demo id="status" compare={compare} title="Status colours" use="Provenance and state: each has a background, a foreground and a border, so state is never colour alone (always add an icon and a word)."
        dos={["Pair every status colour with an icon and a label."]} donts={["Do not use a status colour as decoration."]}>
        <Stack gap={3}>{status.map(([n, k]) => <Cluster key={k} gap={3}><Text size="2" weight="medium" style={{ width: 80 }}>{n}</Text>{["bg", "fg", "border"].map((p) => <Swatch key={p} token={`--sherpa-${k}-${p}`} label={p} />)}</Cluster>)}</Stack>
      </Demo>

      <Demo id="charts" compare={compare} title="Chart colours" use="Series are blue, a tint of the same blue, then teal, green, amber. Severity has its own set. Colour is never the only cue: values are printed on the bars and every chart has a table view."
        dos={["Use at most four series; fold the rest into Other.", "Use the tint for the second part of a total (open next to done)."]} donts={["Do not cycle the colours.", "Do not use severity colours for ordinary categories."]}>
        <Stack gap={3}><div className="g-family__row">{charts.map((t) => <Swatch key={t} token={t} />)}</div><div className="g-family__row">{severity.map((t) => <Swatch key={t} token={t} />)}</div></Stack>
      </Demo>

      <Section id="type" title="Type" description="Geist for text, Geist Mono for labels, codes and numbers that must align. Sizes are a fixed scale; never set a pixel size in a screen.">
        <Panel>
          <div className="g-type">
            {sizes.map(([n, name]) => (<><code key={`c${n}`}>--font-size-{n}</code><Text key={`t${n}`} size={String(n) as "1"} weight={n >= 5 ? "bold" : "regular"}>{name}: plain language first, technical detail on demand</Text></>))}
            <code>mono</code><Text size="2" mono>INV-1042 · 2026-10-05 · 12,480</Text>
          </div>
        </Panel>
        <Text size="2" color="gray">Eyebrow: <span className="sherpa-eyebrow">Geist Mono, uppercase, small</span></Text>
      </Section>

      <Section id="space" title="Spacing and radius" description="Spacing is a 4px-based scale. Radius: 8 for cards and inputs, pill for buttons, larger for panels.">
        <Panel>
          <Cluster gap={4}>{[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (<div key={n} style={{ textAlign: "center" }}><div style={{ width: `var(--space-${n})`, height: `var(--space-${n})`, background: "var(--accent-9)", margin: "0 auto 4px", borderRadius: 2 }} /><Text size="1" color="gray">space-{n}</Text></div>))}</Cluster>
        </Panel>
        <Panel><Cluster gap={4}>{[1, 2, 3, 4, 5, 6].map((n) => <div key={n} className="g-radius" style={{ borderRadius: `var(--radius-${n})` }}>radius-{n}</div>)}<div className="g-radius" style={{ borderRadius: 999 }}>pill</div></Cluster></Panel>
      </Section>

      <Section id="motion" title="Motion" description="Short and quiet: 150 to 300 ms, ease-out. Everything respects the reduced-motion setting, and nothing moves that is not responding to the person.">
        <Panel><Text size="2" mono>--ease-out · --ease-spring</Text></Panel>
      </Section>
    </Page>
  );
}
