import { useState } from "react";

/**
 * ClientMark: a client's logo on a neutral plate so any logo stays legible in light and dark mode.
 * Logos are uploaded by Proshore (SVG or PNG); an initials tile is the fallback, also when the image fails.
 * The client's colours never enter the UI: only the logo image (decision 39).
 */
export function ClientMark({ name, src, size = 32 }: { name: string; src?: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  return (
    <span className="pr-clientmark" style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }} aria-hidden>
      {src && !failed ? <img src={src} alt="" onError={() => setFailed(true)} /> : <span>{initials}</span>}
    </span>
  );
}
