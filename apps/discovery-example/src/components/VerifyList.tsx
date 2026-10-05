import { EvidenceBadge } from "../ui";
import type { insights } from "../fixtures/brightfield";

type Insight = (typeof insights)[number];

/** Items to verify as plain rows: state, statement, and one line for source and reviewer. No boxes. */
export function VerifyList({ items }: { items: Insight[] }) {
  return (
    <ul className="verify">
      {items.map((i) => (
        <li key={i.title} className="verify__row">
          <span className="verify__state"><EvidenceBadge state={i.state} /></span>
          <div className="verify__main"><strong>{i.title}</strong><span>{i.body}</span></div>
          <span className="verify__meta">{i.source}<br />{i.reviewer}</span>
        </li>
      ))}
    </ul>
  );
}
