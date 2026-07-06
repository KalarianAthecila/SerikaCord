// Nameplate presets — decorative backgrounds shown behind a user's name in the
// member list, DM list, and the sidebar user panel. Presets are CSS-based so
// they work without external image assets. Users can also pick a custom solid
// colour or gradient.

import type { CSSProperties } from "react";

export interface NameplatePreset {
  id: string;
  name: string;
  /** CSS `background` value used for the plate. */
  css: string;
}

export const NAMEPLATE_PRESETS: NameplatePreset[] = [
  { id: "sunset", name: "Sunset", css: "linear-gradient(90deg, #ff7e5f 0%, #feb47b 100%)" },
  { id: "ocean", name: "Ocean", css: "linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%)" },
  { id: "grape", name: "Grape", css: "linear-gradient(90deg, #654ea3 0%, #eaafc8 100%)" },
  { id: "mint", name: "Mint", css: "linear-gradient(90deg, #11998e 0%, #38ef7d 100%)" },
  { id: "ember", name: "Ember", css: "linear-gradient(90deg, #f12711 0%, #f5af19 100%)" },
  { id: "midnight", name: "Midnight", css: "linear-gradient(90deg, #0f2027 0%, #203a43 50%, #2c5364 100%)" },
  { id: "sakura", name: "Sakura", css: "linear-gradient(90deg, #ffdde1 0%, #ee9ca7 100%)" },
  { id: "aurora", name: "Aurora", css: "linear-gradient(90deg, #00c3ff 0%, #7b2ff7 50%, #ff5edf 100%)" },
  { id: "gold", name: "Gold", css: "linear-gradient(90deg, #b8860b 0%, #ffd700 50%, #b8860b 100%)" },
  { id: "slate", name: "Slate", css: "linear-gradient(90deg, #434343 0%, #000000 100%)" },
  { id: "bubblegum", name: "Bubblegum", css: "linear-gradient(90deg, #ff9a9e 0%, #fad0c4 100%)" },
  { id: "neon", name: "Neon", css: "linear-gradient(90deg, #f857a6 0%, #ff5858 100%)" },
];

export function getNameplatePreset(id?: string | null): NameplatePreset | undefined {
  if (!id) return undefined;
  return NAMEPLATE_PRESETS.find((p) => p.id === id);
}

export interface NameplateCustomization {
  type?: "none" | "color" | "gradient" | "preset";
  color?: string;
  gradient?: string[];
  presetId?: string;
}

/**
 * Returns the `background` CSS value for a user's nameplate, or `null` when the
 * user has no nameplate set. Callers typically render this as a low-opacity
 * layer behind the name.
 */
export function getNameplateBackground(
  // Index signature keeps this from being a "weak type", so any customization
  // object (with or without a declared `nameplate` field) can be passed.
  customization?: { nameplate?: NameplateCustomization | null; [key: string]: unknown } | null,
): string | null {
  const np = customization?.nameplate;
  if (!np || !np.type || np.type === "none") return null;

  if (np.type === "color" && np.color) return np.color;
  if (np.type === "gradient" && np.gradient && np.gradient.length >= 2) {
    return `linear-gradient(90deg, ${np.gradient.join(", ")})`;
  }
  if (np.type === "preset") {
    return getNameplatePreset(np.presetId)?.css ?? null;
  }
  return null;
}

/**
 * Convenience style for a full-bleed nameplate layer. Render inside a
 * `position: relative` row, behind the name content, e.g.:
 *   {bg && <div className="absolute inset-0 -z-0" style={getNameplateLayerStyle(bg)} />}
 */
export function getNameplateLayerStyle(background: string, opacity = 0.5): CSSProperties {
  return { background, opacity };
}
