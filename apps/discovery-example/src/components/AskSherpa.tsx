import { AssistantPanel, DemoTag } from "@proshore/ui";
import type { AssistantAnswer } from "@proshore/ui";
import { askAnswers } from "../fixtures/brightfield";

const level = (s: string): 1 | 2 | 3 => (/^high/i.test(s) ? 3 : /^medium/i.test(s) ? 2 : 1);

/** Pick the canned answer for a question: exact match first, then a shared keyword. */
function answerFor(text: string, onOpenFinding?: (id: string) => void): AssistantAnswer | null {
  const hit = askAnswers.find((a) => a.q === text) ?? askAnswers.find((a) => a.q.toLowerCase().split(/\W+/).filter((w) => w.length > 4).some((w) => text.toLowerCase().includes(w)));
  if (!hit) return null;
  return {
    text: hit.a,
    confidence: { level: level(hit.sure), label: hit.sure },
    sources: hit.cites.map((c) => (/^F-\d+/.test(c) && onOpenFinding ? { label: c, onOpen: () => onOpenFinding(c) } : { label: c })),
    gaps: hit.missing,
  };
}

/**
 * Ask Sherpa for Discovery. DEMO: canned answers matched by keyword, no live model. The panel itself is the shared
 * AssistantPanel; this file only holds Discovery's answers. A question with no grounded answer says so.
 */
export function AskSherpa({ open, onOpenChange, context, onOpenFinding }: {
  open: boolean; onOpenChange: (o: boolean) => void; context: string; onOpenFinding?: (id: string) => void;
}) {
  return (
    <AssistantPanel open={open} onOpenChange={onOpenChange} title="Ask about this engagement" context={context} badge={<DemoTag>Demo answers</DemoTag>}
      starters={askAnswers.map((a) => a.q)} placeholder="Ask about the evidence, a finding, or what was not seen"
      disclaimer="Answers are written for this demo and are not generated live. In the real product every answer keeps this shape: answer, confidence, sources, and what it could not see. Not a reviewed Proshore conclusion: a consultant confirms advice on the Decision page."
      noAnswer="I do not have a grounded answer to that in this demo. Try one of the suggested questions. In the real product I would say what I would need to see."
      onAsk={(q) => answerFor(q, onOpenFinding)} />
  );
}
