import { Page, PageHeader, Panel } from "@proshore/ui";
import { AppIcon, SherpaGuide, type AppGlyph } from "@proshore/ui";

const glyphs: { g: AppGlyph; name: string }[] = [
  { g: "workspace", name: "Discovery" }, { g: "scan", name: "Legacy scan" }, { g: "scenario", name: "Scenario planner" }, { g: "build", name: "Seeder (Build)" }, { g: "fixer", name: "Proshore Fixer" }, { g: "monitor", name: "Monitoring" },
];

/** Specimen of the app icons at every size they are used, for design review. */
export function IconsLab() {
  return (
    <Page>
      <PageHeader eyebrow="Design system / lab" title="App icons" description="The app icons at the sizes they are used: 24 (inline), 44 (rail), 72 (landing page), 160 (review)." />
      <Panel>
        <div style={{ display: "grid", gap: 32 }}>
          {glyphs.map(({ g, name }) => (
            <div key={g} style={{ display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
              <strong style={{ width: 150 }}>{name}</strong>
              <AppIcon glyph={g} size={24} />
              <AppIcon glyph={g} size={44} />
              <AppIcon glyph={g} size={44} active />
              <AppIcon glyph={g} size={72} framed active />
              <AppIcon glyph={g} size={160} />
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
            <strong style={{ width: 150 }}>Sherpa (assistant)</strong>
            <SherpaGuide size={20} /><SherpaGuide size={28} framed /><SherpaGuide size={44} framed /><SherpaGuide size={160} />
          </div>
        </div>
      </Panel>
    </Page>
  );
}
