export const PARK = {
  /** Road-side strip in front of the building row. */
  NEAR_WIDTH_RANGE: [7, 11] as const,
  NEAR_DEPTH_RANGE: [10, 16] as const,
  WIDTH_RANGE: [10, 16] as const,
  DEPTH_RANGE: [12, 20] as const,
  GRASS_THICKNESS: 0.1,
  GRASS_Y: 0.05,
  PATH_THICKNESS: 0.025,
  PATH_Y: 0.08,
  BORDER: {
    WIDTH: 0.22,
    HEIGHT: 0.12,
    Y: 0.06,
  },
  BENCH: {
    SEAT_SIZE: [1.1, 0.12, 0.42] as const,
    SEAT_Y: 0.22,
    LEG_SIZE: [0.1, 0.18, 0.1] as const,
    LEG_Y: 0.12,
    LEG_SPAN: 0.38,
  },
  SHRUB: {
    SIZE: [0.9, 0.55, 0.9] as const,
    Y: 0.38,
  },
} as const;
