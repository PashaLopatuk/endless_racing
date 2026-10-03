export const SIMULATION = {
  FIXED_TIMESTEP: 1 / 60,
  /** Longest frame the loop accepts, so a background tab does not fast-forward the race. */
  MAX_FRAME_DELTA: 0.1,
  /** Upper bound of fixed steps per rendered frame, so slow devices drop time instead of spiralling. */
  MAX_STEPS_PER_FRAME: 4,
  GRAVITY: -9.81,
} as const;

export const GAME_LOG = {
  PREFIX: "[EndlessRacing]",
  BOOT_FAILED: "Game failed to start",
  FRAME_FAILED: "Game frame failed",
} as const;
