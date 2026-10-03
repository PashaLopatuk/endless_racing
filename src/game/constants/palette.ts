export const TOWER_PALETTE = [
  0x141820, 0x1c1b18, 0x10141c, 0x171b24, 0x12161a, 0x1a1420, 0x10201e,
  0x221a16,
] as const;
export const OFFICE_PALETTE = [
  0x0e1620, 0x101a1a, 0x16141e, 0x0c1218, 0x1a1a1e,
] as const;
export const APARTMENT_PALETTE = [
  0x3a2a24, 0x2e3238, 0x40382c, 0x2a3430, 0x3c2c34, 0x34302a, 0x44302a,
] as const;
export const WAREHOUSE_PALETTE = [
  0x2a2420, 0x312821, 0x241e1c, 0x1e2428, 0x3a221c, 0x2c2a1a,
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

/** Small random HSL shift applied to every picked wall colour so repeated palette entries never look identical. */
export const COLOR_RANDOMIZE = {
  HUE: 0.025,
  SATURATION: 0.08,
  LIGHTNESS: 0.035,
} as const;
