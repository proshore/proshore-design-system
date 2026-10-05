import { useEffect, useState } from "react";

export const routes = [
  { path: "/overview", label: "Overview" },
  { path: "/landscape", label: "Landscape" },
  { path: "/findings", label: "Findings" },
  { path: "/evidence", label: "Evidence" },
  { path: "/decision", label: "Decision" },
] as const;

function read() {
  const raw = window.location.hash.replace(/^#/, "") || "/overview";
  const [path, query = ""] = raw.split("?");
  return { path, params: new URLSearchParams(query) };
}

/** Minimal hash router: every screen is a real link (keyboard, back button, shareable). */
export function useRoute() {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}
