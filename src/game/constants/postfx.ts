/** Velocity MRT motion blur (`scene.ts`); strength scales with `getSpeedRatio(speed)`. */

export const MOTION_BLUR = {
  /** Multiplier on the velocity buffer at full speed (Three.js example uses ~0–3). */
  MAX_AMOUNT: 1.2,
  SMOOTH_RATE: 40,
  /**
   * Per-pixel scale on velocity (screen UV). Road strip stays sharper; facades/skyline
   * at the sides smear more. `sideDistance` is 0 at screen center, 1 at left/right edge.
   */
  ROAD_EDGE_INNER: 0.34,
  ROAD_EDGE_OUTER: 0.78,
  /** >1 keeps the road band sharp longer before env blur ramps up. */
  ENV_MASK_POWER: 2.4,
  /** Velocity scale on the road (center). */
  ROAD_BLUR_SCALE: 0.45,
  /** Velocity scale on the far left/right (environment). */
  ENV_BLUR_SCALE: 2.6,
  SAMPLE_COUNT: 8,
} as const;

/** Full-screen corner motion blur driven by player speed (0 = off at crawl, 1 = max speed). */

export const SPEED_CORNER_BLUR = {
  SMOOTH_RATE: 5.5,
  /** Peak UV offset per blur sample at full speed (screen-space). */
  MAX_OFFSET: 0.02,
  /** Chebyshev distance from center where blur begins / reaches full strength. */
  CORNER_INNER: 0.38,
  CORNER_OUTER: 0.96,
  /** Blend between forward (down-screen) smear and radial streak at corners. */
  FORWARD_MIX: 0.25,
  /**
   * Power curve applied before the canvas write. Below 1 lifts dark paint (cars, walls)
   * more than headlights. A linear gain does the opposite: brights run away and shadows stay black.
   * 1 leaves the pass unchanged.
   */
  OUTPUT_GAMMA: 0.28,
} as const;
