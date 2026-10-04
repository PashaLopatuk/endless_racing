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
  STREET_LIGHTS: {
    COUNT_PER_SIDE: 12,
    SPACING: 28,
    START_Z: -22,
    /** Distance from road center to pole, on the sidewalk strip. */
    SIDEWALK_INSET: 2.05,
    SEED_LEFT: 60,
    SEED_RIGHT: 160,
  },
  CROSSWALKS: {
    COUNT: 4,
    SEED: 41803,
    START_Z: 24,
    MIN_SPACING: 62,
    SPACING_JITTER: 48,
  },
  ROAD_SIGNS: {
    COUNT: 20,
    SEED: 59127,
    START_Z: -6,
    MIN_SPACING: 14,
    SPACING_JITTER: 20,
    /** Distance from road center to the sign post on the sidewalk. */
    SIDEWALK_INSET: 1.55,
  },
  TRASH_BINS: {
    SIDEWALK: {
      COUNT: 5,
      SEED: 33491,
      START_Z: 4,
      MIN_SPACING: 52,
      SPACING_JITTER: 38,
      /** Distance from road center to bin on the sidewalk strip. */
      INSET: 1.25,
    },
    BETWEEN_HOUSES: {
      SEED: 8821,
      /** Chance to place a bin in each gap between neighbouring houses. */
      GAP_CHANCE: 0.22,
      Z_JITTER: [-1.2, 1.2] as const,
      /** Offset from curb into the row between houses and towers. */
      ROW_INSET: 6.2,
    },
  },
} as const;

export const ROAD = {
  ASPHALT_COLOR: 0x242a34,
  ASPHALT_THICKNESS: 0.2,
  SIDEWALK_COLOR: 0x34383f,
  SIDEWALK_HEIGHT: 0.28,
  SIDEWALK_Y: 0.04,
  MARK_THICKNESS: 0.025,
  MARK_Y: 0.02,
  EDGE_COLOR: 0xd4c06a,
  EDGE_WIDTH: 0.09,
  EDGE_INSET: 0.16,
  DASH_COLOR: 0xeae6dc,
  DASH_WIDTH: 0.1,
  DASH_LENGTH: 2.4,
  DASH_STRIDE: 8,
  DASH_PHASE: 0.35,
} as const;

export const CROSSWALK = {
  STRIPE_COLOR: ROAD.DASH_COLOR,
  STOP_BAR_COLOR: ROAD.DASH_COLOR,
  STRIPE: {
    /** Line thickness across the road (local X). */
    WIDTH: 0.42,
    /** Target gap; actual gap is scaled to span the full road width. */
    GAP: 0.95,
    /** Line length along the road (local Z). */
    LENGTH: 4.6,
  },
  STOP_BAR: {
    WIDTH: 0.14,
    INSET: 0.08,
  },
  ROAD_INSET: 0.18,
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

export const OVERHEAD_TRAFFIC_LIGHT = {
  /** Poles sit just outside the yellow edge lines. */
  SPAN_PAST_EDGE: 0.45,
  POLE: { SIZE: [0.18, 5.9, 0.18], Y: 2.95, COLOR: 0x2c3036 },
  BEAM: { SIZE: [0, 0.32, 0.28] as const, Y: 5.72 },
  HEAD: { SIZE: [0.28, 0.64, 0.22], Y: 5.28, COLOR: 0x17191d },
  LAMP: {
    SIZE: [0.15, 0.15, 0.05],
    TOP_Y: 5.48,
    STEP: 0.18,
    Z: 0.14,
  },
  /** Lane indices (0-based) that get a signal head pair. */
  HEAD_LANES: [1, 2],
  SEED: 880,
} as const;

export const STREET_LIGHT = {
  BASE: { SIZE: [0.42, 0.16, 0.42], Y: 0.08, COLOR: 0x2c3036 },
  POLE: { SIZE: [0.16, 6.4, 0.16], Y: 3.28, COLOR: 0x2c3036 },
  /** Arm reaches from the sidewalk pole past the curb over the road. */
  ARM: { SIZE: [2.35, 0.11, 0.11], X: 1.18, Y: 6.32 },
  HEAD: {
    SIZE: [1.05, 0.2, 0.38],
    /** Local distance from pole to fixture center along the arm. */
    X: 2.42,
    Y: 6.22,
    COLOR: 0x17191d,
  },
  LAMPS: [
    {
      SIZE: [0.18, 0.07, 0.12],
      OFFSET_X: -0.38,
      Y: 6.14,
      Z: -0.12,
      COLOR: 0xffd2a1,
    },
    {
      SIZE: [0.34, 0.1, 0.22],
      OFFSET_X: 0,
      Y: 6.12,
      Z: -0.14,
      COLOR: 0xffe8c8,
    },
    {
      SIZE: [0.22, 0.08, 0.15],
      OFFSET_X: 0.36,
      Y: 6.15,
      Z: -0.11,
      COLOR: 0xffc888,
    },
  ],
  DIM_GLOW: 0.18,
  FOOTPRINT: 0.48,
} as const;

export const ROAD_SIGN = {
  KINDS: ["speed", "warning", "info", "route"],
  FOOTPRINT: 0.55,
  POST: {
    COLOR: 0x3a3f46,
    BASE_SIZE: [0.28, 0.1, 0.28] as const,
    BASE_Y: 0.05,
    POLE_SIZE: [0.08, 2.05, 0.08] as const,
    POLE_Y: 1.12,
    SIGN_Y: 2.18,
    SIGN_FACE_X: 0.14,
  },
  PANEL: {
    FACE_OFFSET: 0.03,
    FRAME_SIZE: [0.52, 0.52, 0.04] as const,
    INNER_SIZE: [0.42, 0.42, 0.035] as const,
    RECT_SIZE: [0.58, 0.46, 0.04] as const,
    WIDE_SIZE: [0.72, 0.38, 0.04] as const,
  },
  SPEED: {
    FRAME_COLOR: 0xcf2e2e,
    FACE_COLOR: 0xf5f3ee,
    DIGIT_COLOR: 0x1a1d22,
    DIGIT_SIZE: [0.14, 0.22, 0.02] as const,
    LIMITS: [30, 50, 70],
  },
  WARNING: {
    FACE_COLOR: 0xf0c020,
    STRIPE_COLOR: 0x1a1d22,
    STRIPE_SIZE: [0.38, 0.08, 0.02] as const,
    ACCENTS: [{ y: 0.06 }, { y: -0.05 }, { y: 0 }],
  },
  INFO: {
    BAND_SIZE: [0.44, 0.1, 0.02] as const,
    BAND_Y: -0.1,
    COLORS: [
      { face: 0x2f6fb3, band: 0xf5f3ee },
      { face: 0x2f6fb3, band: 0xf0c020 },
      { face: 0x3a7f4c, band: 0xf5f3ee },
    ],
  },
  ROUTE: {
    ARROW_SIZE: [0.22, 0.12, 0.02] as const,
    COLORS: [
      { face: 0x2d8b4e, arrow: 0xf5f3ee, arrowY: 0 },
      { face: 0x2f6fb3, arrow: 0xf5f3ee, arrowY: 0.04 },
      { face: 0x4a4f58, arrow: 0xf0c020, arrowY: -0.02 },
    ],
  },
} as const;

export const TRASH_BIN = {
  FOOTPRINT: 0.42,
  BASE: { SIZE: [0.36, 0.06, 0.36] as const, Y: 0.03 },
  BODY: {
    LOWER_SIZE: [0.34, 0.42, 0.34] as const,
    LOWER_Y: 0.27,
    UPPER_SIZE: [0.3, 0.28, 0.3] as const,
    UPPER_Y: 0.62,
  },
  RIM: { SIZE: [0.32, 0.06, 0.32] as const, Y: 0.8 },
  LID: { SIZE: [0.28, 0.04, 0.18] as const, Y: 0.84, Z: 0.04 },
  PALETTES: [
    { body: 0x3d5f45, rim: 0x2f4a36, lid: 0x4a4f58, base: 0x2c3036 },
    { body: 0x4a4f58, rim: 0x3a3f46, lid: 0x5a606a, base: 0x2c3036 },
    { body: 0x365870, rim: 0x2a4658, lid: 0x4a4f58, base: 0x2c3036 },
  ],
} as const;
