export const TRAFFIC_CONE = {
  FOOTPRINT: 0.76,
  TOTAL_HEIGHT: 1.35,
  BASE: {
    SIZE: [0.72, 0.08, 0.72] as const,
    Y: 0.04,
    COLOR: 0x1c1c1f,
  },
  CONE: {
    BOTTOM_RADIUS: 0.26,
    TOP_RADIUS: 0.065,
    HEIGHT: 1.25,
    Y_START: 0.08,
    RADIAL_SEGMENTS: 8,
  },
  COLORS: {
    ORANGE_PRIMARY: 0xff5500,
    ORANGE_VIVID: 0xff6200,
    ORANGE_AMBER: 0xf54a00,
    REFLECTIVE_WHITE: 0xf2f5f8,
    BASE_DARK: 0x1c1c1f,
    INNER_RIM: 0x161618,
  },
} as const;
