export const PALM_TREE = {
  FOOTPRINT: 3.5,
  HEIGHT_RANGE: [16.5, 23.5] as const,
  TRUNK_SEGMENTS: 7,
  BASE_RADIUS: 0.32,
  TOP_RADIUS: 0.17,
  CURVE_OFFSET_RANGE: [0.6, 1.3] as const,
  FROND_COUNT: 11,
  TRUNK_COLORS: [
    0x5c4232, 0x684c38, 0x543a2a, 0x6e523e, 0x4e3626,
  ] as const,
  THATCH_COLOR: 0x423022,
  LEAF_COLORS: [
    0x2d5c26, 0x386a30, 0x447a38, 0x326228, 0x4a843e,
  ] as const,
  // Legacy compatibility fields
  SIZE_TIERS: [0.8, 0.9, 1.0, 1.1, 1.2] as const,
  TRUNK: {
    SIZE: [0.35, 18.0, 0.35] as const,
    Y: 9.0,
  },
  LEAVES: [
    { size: [2.5, 0.3, 2.5] as [number, number, number], position: [0, 18.2, 0] as [number, number, number] },
    { size: [3.8, 0.2, 1.2] as [number, number, number], position: [0, 18.0, 0] as [number, number, number] },
    { size: [1.2, 0.2, 3.8] as [number, number, number], position: [0, 18.0, 0] as [number, number, number] },
  ] as const,
} as const;
