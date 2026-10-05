import type { AppGlyph } from "@proshore/ui";

/** One app in the Sherpa suite as this prototype lists it. `product` groups apps. */
export type SuiteApp = { id: string; name: string; product: string; description: string; status: string; href: string; glyph: AppGlyph };
export type SuiteProduct = { id: string; name: string; tagline: string };
