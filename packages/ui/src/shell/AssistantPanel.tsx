import { useState, type ReactNode } from "react";
import { SlideGroup, SlideOver } from "../components/SlideOver";
import { Note } from "../components/Note";
import { Button } from "../primitives/Button";
import { TextArea } from "../primitives/forms";
import { Text } from "../primitives/Text";
import { PaperPlaneIcon } from "../icons";
import { SherpaGuide } from "./AppIcons";

/** How sure the answer is: the label is always shown, the meter is a visual aid only. */
export type AssistantAnswer = {
  text: ReactNode;
  confidence?: { level: 1 | 2 | 3; label: string };
  /** Where the answer comes from. A source with `onOpen` is a button. */
  sources?: { label: string; onOpen?: () => void }[];
  /** What the answer could not see. Shown as a note; leave out only if there are no known gaps. */
  gaps?: ReactNode;
};
type Turn = { q: string; answer: AssistantAnswer | null };

/**
 * AssistantPanel: the Sherpa assistant as a slide-over. The panel owns the conversation view and the answer shape
 * (answer, how sure, sources, what it could not see); the app supplies `onAsk`, which returns an answer or null when it has
 * no grounded answer, and the panel then says so instead of inventing one. `badge` marks demo or canned answers.
 *
 * @example
 * <AssistantPanel open={open} onOpenChange={setOpen} title="Ask about this scan" context="Scan of 12 repositories"
 *   onAsk={(q) => ({ text: "Three applications use the legacy login.", confidence: { level: 2, label: "Likely" }, gaps: "Two repositories were not scanned." })} />
 */
export function AssistantPanel({ open, onOpenChange, name = "Ask Sherpa", title, context, starters = [], onAsk, badge, disclaimer, placeholder = "Ask a question", noAnswer }: {
  open: boolean; onOpenChange: (o: boolean) => void; name?: string; title: ReactNode; context: string;
  starters?: string[]; onAsk: (question: string) => AssistantAnswer | null;
  badge?: ReactNode; disclaimer?: ReactNode; placeholder?: string; noAnswer?: ReactNode;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const ask = (q: string) => { const text = q.trim(); if (!text) return; setTurns((t) => [...t, { q: text, answer: onAsk(text) }]); setDraft(""); };
  return (
    <SlideOver open={open} onOpenChange={onOpenChange}
      eyebrow={<span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><SherpaGuide size={26} framed />{name}</span>} title={title}
      chips={<><span className="pr-assist__source">Context: {context}</span>{badge}</>}
      footer={
        <form style={{ display: "flex", gap: "var(--space-3)", width: "100%", alignItems: "flex-end" }} onSubmit={(e) => { e.preventDefault(); ask(draft); }}>
          <div style={{ flex: 1 }}>
            <TextArea label="Your question" rows={2} value={draft} placeholder={placeholder} onChange={setDraft}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(draft); } }} />
          </div>
          <Button type="submit" disabled={!draft.trim()}><PaperPlaneIcon aria-hidden /> Send</Button>
        </form>
      }
    >
      {turns.length === 0 && starters.length > 0 && (
        <SlideGroup title="Suggested questions">
          <div className="pr-assist__starters">
            {starters.map((q) => (<button key={q} type="button" className="pr-assist__starter" onClick={() => ask(q)}><SherpaGuide size={22} className="pr-assist__mini" /><span>{q}</span></button>))}
          </div>
          {disclaimer && <Text size="1" color="gray">{disclaimer}</Text>}
        </SlideGroup>
      )}
      <div role="log" aria-live="polite" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {turns.map((t, i) => (
          <div key={i} className="pr-assist__msg">
            <div className="pr-assist__q">{t.q}</div>
            <div className="pr-assist__a">
              <div className="pr-assist__who"><SherpaGuide size={34} framed /><strong>Sherpa</strong>{badge && t.answer && <span>demo answer</span>}</div>
              {t.answer ? (
                <>
                  <Text size="3">{t.answer.text}</Text>
                  {t.answer.confidence && (
                    <div><Text size="1" color="gray">How sure</Text>
                      <div className="pr-assist__meter" data-level={t.answer.confidence.level} aria-hidden><span /><span /><span /></div>
                      <Text size="2">{t.answer.confidence.label}</Text></div>
                  )}
                  {t.answer.sources && t.answer.sources.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                      <Text size="1" color="gray">Sources</Text>
                      {t.answer.sources.map((s) => s.onOpen ? <button key={s.label} type="button" className="pr-assist__source" onClick={s.onOpen}>{s.label}</button> : <span key={s.label} className="pr-assist__source">{s.label}</span>)}
                    </div>
                  )}
                  {t.answer.gaps && <Note tone="info">What this answer cannot see: {t.answer.gaps}</Note>}
                </>
              ) : (
                <>
                  <Text size="2">{noAnswer ?? "I do not have a grounded answer to that. In the real product I would say what I would need to see."}</Text>
                  {starters.length > 0 && <Button variant="soft" size="1" style={{ alignSelf: "flex-start" }} onClick={() => setTurns([])}>Show suggestions</Button>}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </SlideOver>
  );
}
