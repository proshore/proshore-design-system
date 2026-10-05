import { Avatar, Grid, Page, PageHeader, Panel, PrayerFlags, ProshoreIcon, ProshoreWordmark, Ridgeline, Section } from "@proshore/ui";
import * as ui from "@proshore/ui";

const icons = Object.entries(ui).filter(([k]) => k.endsWith("Icon") && k !== "ProshoreIcon") as [string, React.ComponentType<{ width?: number; height?: number }>][];

export function BrandPage() {
  return (
    <Page>
      <PageHeader eyebrow="Foundations" title="Brand and icons" description="Proshore mark, the mountain motifs, avatars and the UI icon set." />
      <Section title="Mark and motifs">
        <Grid min={280}><Panel><ProshoreIcon height={40} /> <ProshoreWordmark height={18} /></Panel><Panel><Ridgeline /></Panel><Panel><PrayerFlags /></Panel></Grid>
      </Section>
      <Section title="Avatars"><Panel><div style={{ display: "flex", gap: 12 }}><Avatar name="Alex Voorbeeld" /><Avatar name="Sam Example" proshore /></div></Panel></Section>
      <Section title="UI icons" description="Thin-line, 15px grid. Always pair an icon-only button with an aria-label.">
        <div className="g-icons">{icons.map(([name, Icon]) => <div key={name}><Icon width={20} height={20} />{name.replace(/Icon$/, "")}</div>)}</div>
      </Section>
    </Page>
  );
}
