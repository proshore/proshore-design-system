import { Button, DemoTag, Grid, Note, Page, PageHero, Panel, Text } from "@proshore/ui";
import { AppTitle } from "@proshore/ui";
import { appLanding, suiteApps, suiteProducts } from "../fixtures/suite";

/** Placeholder landing page for a suite app that is not part of this prototype. It says plainly what exists and what does not. */
export function AppLanding({ id }: { id: string }) {
  const app = suiteApps.find((a) => a.id === id);
  const info = appLanding[id];
  if (!app || !info) return <Page><PageHero><h1 className="sherpa-display">App not found</h1><Button href="#/overview">Back to Discovery</Button></PageHero></Page>;
  const product = suiteProducts.find((p) => p.id === app.product);
  return (
    <Page>
      <PageHero eyebrow={<>{product?.name} · {product?.tagline} <DemoTag /></>} size="md">
        <AppTitle glyph={app.glyph}>
          <h1 className="sherpa-display" style={{ margin: 0 }}>{app.name}</h1>
          <p className="pr-hero__desc" style={{ marginTop: 8 }}>{app.status}</p>
        </AppTitle>
      </PageHero>
      <Note tone="info">This is a placeholder page in a design prototype. It shows where {app.name} would sit in the suite; it does not run anything.</Note>
      <Grid min={300}>
        <Panel eyebrow="What it is"><Text as="p" size="3" style={{ margin: 0 }}>{info.purpose}</Text></Panel>
        <Panel eyebrow="Status in this prototype"><Text as="p" size="3" style={{ margin: 0 }}>{info.status}</Text></Panel>
        <Panel eyebrow="How it connects to Discovery (proposed)"><Text as="p" size="3" style={{ margin: 0 }}>{info.connects}</Text></Panel>
      </Grid>
      <div><Button href="#/overview" variant="outline">Back to Discovery</Button></div>
    </Page>
  );
}
