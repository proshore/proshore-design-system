/** Marks invented content. Used on every fixture-derived block. */
export function DemoTag({ children = "Demo data" }: { children?: string }) {
  return <span className="sherpa-demo-tag" style={{ fontSize: "var(--font-size-1)", color: "var(--gray-11)" }}>{children}</span>;
}
