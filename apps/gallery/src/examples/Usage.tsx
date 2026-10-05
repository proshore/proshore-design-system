import type { ReactNode } from "react";
import { Panel } from "@proshore/ui";

/** "How to use this screen": when it fits, which components it is built from, and what to keep. */
export function Usage({ when, parts, rules }: { when: string; parts: string[]; rules: string[] }): ReactNode {
  return (
    <Panel eyebrow="How to use this screen" tight>
      <div className="g-usage">
        <div><strong>Use it for:</strong> {when}</div>
        <div><strong>Built from:</strong> {parts.map((p, i) => <span key={p}>{i ? ", " : ""}<code>{p}</code></span>)}</div>
        <div><strong>Keep:</strong><ul>{rules.map((r) => <li key={r}>{r}</li>)}</ul></div>
      </div>
    </Panel>
  );
}
