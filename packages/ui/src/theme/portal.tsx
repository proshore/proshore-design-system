import { createContext, useContext } from "react";

/** Element that themed portals (drawers) render into, so light/dark tokens apply to them. */
export const PortalHost = createContext<HTMLElement | null>(null);
export const usePortalHost = () => useContext(PortalHost);
