import { useEffect } from "react";

const PROSHORE_ICON = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="68 66 138 249" fill="#ff5102"><path d="m72.61,278.61s0,0,0,.55l19.91,10.91v-118.03l-19.91,10.9v95.68Z"/><polygon points="108.82 298.98 128.73 309.9 128.73 152.22 108.82 163.11 108.82 298.98"/><polygon points="164.9 132.4 94.37 91.68 74.54 102.51 145.03 143.27 145.03 143.27 145.03 224.75 164.94 213.85 164.94 132.42 164.9 132.4"/><polygon points="201.13 112.55 130.61 71.84 110.77 82.67 181.26 123.42 181.26 123.42 181.26 204.9 201.17 194.01 201.17 112.58 201.13 112.55"/></svg>');

function load(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
}

/**
 * Sets the tab title and a favicon made of the client logo with a small Proshore badge, so client tabs are
 * findable among many tabs and still clearly Proshore. Falls back to an initials tile when there is no logo.
 * Title format: "Client · Product".
 */
export function useDocumentIdentity({ client, product, logo }: { client: string; product: string; logo?: string }) {
  useEffect(() => { document.title = `${client} · ${product}`; }, [client, product]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d"); if (!g) return;
      g.fillStyle = "#ffffff"; g.beginPath(); g.roundRect(0, 0, 64, 64, 14); g.fill();
      const img = logo ? await load(logo) : null;
      if (img) g.drawImage(img, 4, 4, 56, 56);
      else { g.fillStyle = "#05005c"; g.font = "700 30px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(client.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase(), 32, 34); }
      const badge = await load(PROSHORE_ICON);
      g.fillStyle = "#ffffff"; g.beginPath(); g.arc(50, 50, 15, 0, Math.PI * 2); g.fill();
      if (badge) g.drawImage(badge, 41, 38, 18, 24);
      if (cancelled) return;
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
      link.type = "image/png"; link.href = c.toDataURL("image/png");
    })();
    return () => { cancelled = true; };
  }, [client, logo]);
}
