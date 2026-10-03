/** Full-screen corner motion blur driven by player speed (0 = off at crawl, 1 = max speed). */

export const SPEED_CORNER_BLUR = {
  SMOOTH_RATE: 5.5,
  /** Peak UV offset per blur sample at full speed (screen-space). */
  MAX_OFFSET: 0.020,
  /** Chebyshev distance from center where blur begins / reaches full strength. */
  CORNER_INNER: 0.38,
  CORNER_OUTER: 0.96,
  /** Blend between forward (down-screen) smear and radial streak at corners. */
  FORWARD_MIX: 0.25,
  SAMPLE_COUNT: 4,
  /**
   * Power curve applied before the canvas write. Below 1 lifts dark paint (cars, walls)
   * more than headlights. A linear gain does the opposite: brights run away and shadows stay black.
   * 1 leaves the pass unchanged.
   */
  OUTPUT_GAMMA: 0.78,
} as const;
