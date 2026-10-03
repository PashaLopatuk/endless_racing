export const STREET = {
  ROAD_SEGMENT_LENGTH: 48,
  ROAD_SEGMENT_COUNT: 8,
  /** Segments placed behind the camera so the road never shows a gap while wrapping. */
  ROAD_SEGMENTS_BEHIND: 1,
  SIDEWALK_WIDTH: 2.6,
  DESPAWN_Z: -72,
} as const;

export const STREET_ROW = {
  BUILDINGS: {
    COUNT_PER_SIDE: 12,
    SPACING: 28,
    START_Z: -48,
    GAP: 1.2,
    SEED_LEFT: 1,
    SEED_RIGHT: 100,
  },
  HOUSES: {
    COUNT_PER_SIDE: 12,
    SPACING: 18,
    START_Z: -24,
    ROW_DEPTH: 10,
    CURB_GAP: 0.45,
    SEED_LEFT: 400,
    SEED_RIGHT: 500,
  },
  TRAFFIC_LIGHTS: {
    COUNT_PER_SIDE: 7,
    SPACING: 48,
    START_Z: -16,
    CURB_OFFSET: 1.15,
    SEED_LEFT: 0,
    SEED_RIGHT: 20,
  },
} as const;

export const ROAD = {
  ASPHALT_COLOR: 0x171a20,
  ASPHALT_THICKNESS: 0.2,
  SIDEWALK_COLOR: 0x2a2c31,
  SIDEWALK_HEIGHT: 0.28,
  SIDEWALK_Y: 0.04,
  MARK_THICKNESS: 0.025,
  MARK_Y: 0.02,
  EDGE_COLOR: 0xc6b15a,
  EDGE_WIDTH: 0.09,
  EDGE_INSET: 0.16,
  DASH_COLOR: 0xd5d0c4,
  DASH_WIDTH: 0.1,
  DASH_LENGTH: 2.4,
  DASH_STRIDE: 8,
  DASH_PHASE: 0.35,
} as const;

export const TRAFFIC_LIGHT = {
  POLE: { SIZE: [0.14, 4.4, 0.14], Y: 2.2, COLOR: 0x2c3036 },
  ARM: { SIZE: [1.15, 0.1, 0.1], X: 0.58, Y: 4.35 },
  HEAD: { SIZE: [0.26, 0.62, 0.2], X: 1.15, Y: 4.2, COLOR: 0x17191d },
  LAMP: { SIZE: [0.14, 0.14, 0.05], TOP_Y: 4.38, STEP: 0.18, Z: -0.12 },
  LAMP_COLORS: [0xff3b30, 0xffb020, 0x3ddc6a],
  UNLIT_GLOW: 0.12,
  FOOTPRINT: 0.4,
} as const;
