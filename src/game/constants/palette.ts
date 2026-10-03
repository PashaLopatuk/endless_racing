/** Midtown / downtown towers: limestone, brick setbacks, granite curtain walls. */
export const TOWER_PALETTE = [
  0xc8bfb0, 0xb5a898, 0xa09080, 0x9a8878, 0x3e444c, 0x343a42, 0x4a525a,
  0x8a5048, 0x7a4438, 0x5c6068, 0xc4b4a0, 0x6a5a50, 0x2e3438,
] as const;

/** Glass-and-steel office blocks (cool midtown greys and blue-glass tones). */
export const OFFICE_PALETTE = [
  0x2a3440, 0x384858, 0x1e2830, 0x455260, 0x323c48, 0x4a5868, 0x283238,
  0x3c4854,
] as const;

/** Prewar apartments and walk-ups: brownstone, red brick, stucco, cast-iron brown. */
export const APARTMENT_PALETTE = [
  0x7a4838, 0x6b3c30, 0x8c5840, 0x5c4840, 0x9a7860, 0x684838, 0x4a5a58,
  0x886850, 0x543830, 0x706058,
] as const;

/** Industrial / loft brick and soot-stained masonry. */
export const WAREHOUSE_PALETTE = [
  0x5c4030, 0x4a3428, 0x6a5040, 0x3a3028, 0x554438, 0x2a2624, 0x483830,
  0x645040,
] as const;

/** Limestone cornices, cast iron, and dark storefront trim on street buildings. */
export const BUILDING_TRIM_PALETTE = [
  0xb0a698, 0x8a8078, 0x5a544c, 0x3a3834, 0x9a9088, 0x6a6258, 0x484440,
] as const;

export const HOUSE_PALETTE = [
  0x4e2a22, 0x4a3e28, 0x34402f, 0x2c3446, 0x4a453c, 0x223c3a, 0x3c2838,
  0x56341f, 0x423c22, 0x3a2a24, 0x2a2d32,
] as const;

export const TRIM_PALETTE = [
  0x6a5e4e, 0x5a4638, 0x443a30, 0x766c60, 0x3a342c, 0x4e3e32, 0x5e5446,
] as const;
export const ROOF_PALETTE = [
  0x2a2224, 0x3a2e2a, 0x24282c, 0x40302a, 0x2e3a36, 0x1e1c22,
] as const;
export const DOOR_PALETTE = [
  0x1a120e, 0x241810, 0x140e0c, 0x1c2430, 0x301818, 0x18281e,
] as const;
export const AWNING_PALETTE = [
  0x6a1c1c, 0x1c4a2a, 0x1c2a5a, 0x6a4a14, 0x4a1c4a, 0x2a2a2a,
] as const;
export const NEON_PALETTE = [
  0xff4fa0, 0x4fe0ff, 0xffb347, 0x9dff6a, 0xc77dff,
] as const;
export const METAL_PALETTE = [0x2a2e33, 0x3a3f46, 0x1e2226] as const;

/** Small random HSL shift so repeated palette entries never look identical (houses and shared trim). */
export const COLOR_RANDOMIZE = {
  HUE: 0.025,
  SATURATION: 0.08,
  LIGHTNESS: 0.035,
} as const;

/** Wider spread for street buildings so limestone, brick, and grey towers read as different blocks. */
export const BUILDING_COLOR_RANDOMIZE = {
  HUE: 0.055,
  SATURATION: 0.12,
  LIGHTNESS: 0.06,
} as const;
