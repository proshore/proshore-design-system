import type { ReactNode } from "react";
import { Button, Page, PageHeader, Section, Text } from "@proshore/ui";

/** Temporary design spike: ways to spend less vertical space on the heading area. Mock-ups with the real tokens, same content in each. */
const Bar = ({ children, right }: { children?: ReactNode; right?: ReactNode }) => (
  <div className="g-o__bar"><span className="g-o__logo" aria-hidden /><b>Discovery</b><span className="g-o__sep">/</span><span>De Heus</span>{children}<span style={{ flex: 1 }} />{right}</div>
);
const Tabs = () => <div className="g-o__tabs"><span data-on>Overview</span><span>Landscape</span><span>Findings</span><span>Evidence</span></div>;
const Body = () => (
  <div className="g-o__body">
    <div className="g-o__stats"><div><small>EXAMINED</small><b>3</b></div><div><small>FOUND</small><b>≥ 40</b></div><div><small>NOT SEEN</small><b>1</b></div></div>
    <div className="g-o__chart"><i style={{ width: "78%" }} /><i style={{ width: "54%" }} /><i style={{ width: "36%" }} /></div>
    <div className="g-o__rows">{[0, 1, 2, 3, 4].map((n) => <span key={n} />)}</div>
  </div>
);
function Frame({ name, note, height, children }: { name: string; note: string; height: string; children: ReactNode }) {
  return (
    <section className="g-o" aria-label={name}>
      <h3 className="g-o__name">{name}</h3>
      <Text size="2" color="gray">{note}</Text>
      <div className="g-o__frame" role="img" aria-label={`${name}: ${height}`}>{children}</div>
      <p className="g-o__meas"><b>{height}</b></p>
    </section>
  );
}

export function HeaderOptions() {
  return (
    <Page>
      <PageHeader eyebrow="Design spike" title="Heading area options" description="The same page in five ways, in a frame the size of an 800px high screen. Today the content starts 200 to 240px down on desktop (25 to 30% of the screen) and 280 to 370px down on a phone." />
      <Section title="Mock-ups"><div className="g-o__grid">
        <Frame name="Today" note="Top bar, then eyebrow, title, a two line description and actions." height="Content starts at ~230px (29%)">
          <Bar right={<span className="g-o__pill">Ask Sherpa</span>} /><Tabs />
          <div className="g-o__hero"><small>FINDINGS</small><h4>Items that need a person's judgement</h4><p>What the scanning tools reported, in plain language. Open an item for the business, security and technical view of the same evidence.</p></div>
          <Body />
        </Frame>
        <Frame name="A. One-row header" note="Eyebrow, title and actions on one row. The description becomes one muted line that is shortened to fit and shown in full on hover or focus." height="Content starts at ~140px (17%): saves ~90px">
          <Bar right={<span className="g-o__pill">Ask Sherpa</span>} /><Tabs />
          <div className="g-o__row"><div><small>FINDINGS</small><h4>Items that need a person's judgement</h4></div><span className="g-o__btn">Export</span></div>
          <p className="g-o__one">What the scanning tools reported, in plain language. Open an item for the business, security and tec…</p>
          <Body />
        </Frame>
        <Frame name="B. Title in the top bar" note="The page title moves into the top bar as the last breadcrumb. Page links stay on one row under it. The description lives in the content, only where it adds something." height="Content starts at ~96px (12%): saves ~135px">
          <Bar right={<span className="g-o__pill">Ask Sherpa</span>}><span className="g-o__sep">/</span><b className="g-o__title">Findings <i>40</i></b></Bar><Tabs />
          <Body />
        </Frame>
        <Frame name="C. Collapsing title" note="The full header stays at the top of the page, then folds into the top bar as soon as you scroll. First screen is unchanged; every scrolled screen gets the space back." height="First screen ~230px, scrolled ~96px">
          <Bar right={<span className="g-o__pill">Ask Sherpa</span>}><span className="g-o__sep">/</span><b className="g-o__title">Findings <i>40</i></b></Bar><Tabs />
          <Body />
        </Frame>
        <Frame name="D. Compact density" note="Same layout as today with tighter spacing, one-line description and smaller title. A density setting (comfortable, compact) that each app or user can pick, and compact for data-heavy pages." height="Content starts at ~160px (20%): saves ~70px">
          <Bar right={<span className="g-o__pill">Ask Sherpa</span>} /><Tabs />
          <div className="g-o__hero g-o__hero--c"><small>FINDINGS</small><h4>Items that need a person's judgement</h4><p>What the scanning tools reported, in plain language.</p></div>
          <Body />
        </Frame>
      </div></Section>
      <Section title="Also, in general" description="Smaller changes that stack with any option above.">
        <ul className="g-o__list">
          <li><b>Tighter rhythm:</b> section gap 56 to 32px, panel padding 24 to 16px, stat cards one row shorter (label and value on one line).</li>
          <li><b>Sticky toolbars:</b> table search and filters stay under the bar while you scroll, so the heading never has to come back.</li>
          <li><b>Two columns on wide screens:</b> chart next to table instead of under it, using the aside layout that already exists.</li>
          <li><b>Dense tables by default</b> on data pages (the compact rows setting exists).</li>
        </ul>
        <Button variant="outline" href="#/layout">Back to the layout page</Button>
      </Section>
    </Page>
  );
}
