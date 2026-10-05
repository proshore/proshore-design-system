import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CheckCircledIcon, CrossCircledIcon, Eyebrow, Panel, SherpaTheme, Section, Text } from "@proshore/ui";

/** Do and don't lists under a component, the way a design system documents usage. */
export function Rules({ dos, donts }: { dos?: string[]; donts?: string[] }) {
  return (
    <div className="g-rules">
      {dos && <ul data-kind="do" aria-label="Do">{dos.map((d) => <li key={d}><CheckCircledIcon aria-hidden /><Text size="2">{d}</Text></li>)}</ul>}
      {donts && <ul data-kind="dont" aria-label="Don't">{donts.map((d) => <li key={d}><CrossCircledIcon aria-hidden /><Text size="2">{d}</Text></li>)}</ul>}
    </div>
  );
}

/** One documented example: what it is for, the preview (optionally light and dark side by side), do and don't. */
export function Demo({ id, title, use, dos, donts, compare = false, children }: {
  id?: string; title: string; use: string; dos?: string[]; donts?: string[]; compare?: boolean; children: ReactNode;
}) {
  return (
    <Section id={id} title={title} description={use}>
      {compare ? (
        <div className="g-compare">
          {(["light", "dark"] as const).map((a) => (
            <SherpaTheme key={a} appearance={a} root={false}><div className="g-frame"><Eyebrow>{a}</Eyebrow>{children}</div></SherpaTheme>
          ))}
        </div>
      ) : <Panel><div className="g-preview">{children}</div></Panel>}
      {(dos || donts) && <Rules dos={dos} donts={donts} />}
    </Section>
  );
}

const hex = (rgb: string) => {
  const srgb = rgb.match(/color\(srgb ([^)]+)\)/);
  const m = srgb ?? rgb.match(/rgba?\(([^)]+)\)/); if (!m) return rgb;
  const nums = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  const [r, g, b, a] = srgb ? [nums[0] * 255, nums[1] * 255, nums[2] * 255, nums[3]] : nums;
  const h = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}${a !== undefined && a < 1 ? ` · ${Math.round(a * 100)}%` : ""}`.toUpperCase();
};

/** A colour chip for a token. The value shown is the real computed value in the current theme, so it can never drift from the CSS. */
export function Swatch({ token, label }: { token: string; label?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState("");
  useEffect(() => {
    const read = () => { if (ref.current) setVal(hex(getComputedStyle(ref.current).backgroundColor)); };
    read(); const mo = new MutationObserver(read); mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, [token]);
  return (
    <div className="g-sw">
      <span ref={ref} style={{ background: `var(${token})` } as CSSProperties} />
      <Text size="1" weight="medium">{label ?? token.replace(/^--(pr|sherpa)-/, "")}</Text>
      <code>{token}</code>
      <code className="g-sw__hex">{val}</code>
    </div>
  );
}
