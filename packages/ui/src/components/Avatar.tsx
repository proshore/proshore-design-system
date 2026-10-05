import { useState } from "react";
import { ProshoreIcon } from "./Brand";

function initialsOf(name: string) {
  const parts = name.replace(/\(.*?\)/g, "").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

/**
 * Avatar: profile picture (for example the Google Workspace photo) with an initials fallback that also
 * appears when the image fails to load. `proshore` adds a small Proshore mark so staff are recognisable
 * as "inside the Proshore layer" even in client workspaces. Decorative when a name is shown next to it (alt="").
 */
export function Avatar({ name, src, size = 32, proshore = false, decorative = false }: { name: string; src?: string; size?: number; proshore?: boolean; decorative?: boolean }) {
  const [failed, setFailed] = useState(false);
  const showImg = !!src && !failed;
  return (
    <span className="pr-avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }} role={decorative ? undefined : "img"} aria-label={decorative ? undefined : name} aria-hidden={decorative || undefined}>
      {showImg ? <img src={src} alt="" onError={() => setFailed(true)} referrerPolicy="no-referrer" /> : <span aria-hidden>{initialsOf(name)}</span>}
      {proshore && <span className="pr-avatar__badge" aria-hidden><ProshoreIcon height={Math.max(8, Math.round(size * 0.3))} /></span>}
    </span>
  );
}
