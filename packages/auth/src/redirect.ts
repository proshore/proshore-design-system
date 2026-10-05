/**
 * Open-redirect safe `returnTo`: only a same-origin relative path is accepted.
 * Must start with exactly one "/", and not "//" or "/\" (browsers treat both as
 * protocol-relative). Control characters and backslashes anywhere are refused.
 * Anything else falls back to "/".
 */
export function safeReturnTo(value: string | null | undefined): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 2000) return "/";
  if (value[0] !== "/" || value[1] === "/" || value[1] === "\\") return "/";
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return "/";
  try {
    // Resolve against a dummy origin: the result must stay on that origin.
    const u = new URL(value, "http://returnto.invalid");
    if (u.origin !== "http://returnto.invalid") return "/";
  } catch {
    return "/";
  }
  return value;
}
