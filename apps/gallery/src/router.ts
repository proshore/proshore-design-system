import { useEffect, useState } from "react";

/** Minimal hash router: every page is a real link (keyboard, back button, shareable). */
const read = () => (window.location.hash.replace(/^#/, "") || "/foundations").split("?")[0];
export function useRoute() {
  const [path, setPath] = useState(read);
  useEffect(() => { const on = () => setPath(read()); window.addEventListener("hashchange", on); return () => window.removeEventListener("hashchange", on); }, []);
  return path;
}

export const pages = [
  { path: "/foundations", label: "Foundations" },
  { path: "/actions", label: "Actions" },
  { path: "/layout", label: "Layout and feedback" },
  { path: "/forms", label: "Forms" },
  { path: "/tables", label: "Tables" },
  { path: "/charts", label: "Charts" },
  { path: "/overlays", label: "Overlays and menus" },
  { path: "/dialogs", label: "Dialogs and boards" },
  { path: "/brand", label: "Brand and icons" },
  { path: "/shell", label: "App shell" },
  { path: "/examples", label: "Examples" },
  { path: "/sign-in", label: "Sign in" },
] as const;
