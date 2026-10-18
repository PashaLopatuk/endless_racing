/** Small random HSL shift so repeated palette entries never look identical (houses and shared trim). */
export const COLOR_RANDOMIZE = {
  HUE: 0.025,
  SATURATION: 0.08,
  LIGHTNESS: 0.035,
} as const;

/** Fallback spread when a building set does not pass its own. */
export const BUILDING_COLOR_RANDOMIZE = {
  HUE: 0.055,
  SATURATION: 0.12,
  LIGHTNESS: 0.06,
} as const;
