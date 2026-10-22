export const AUDIO = {
  /** Path to custom hit/impact sound effect file in public directory. */
  HIT_URL: "/audio/hit.mp3",
  /** Path to custom death/wreck sound effect file in public directory. */
  DEATH_URL: "/audio/death.mp3",

  /** Global volume scale for sound effects (0 to 1). */
  MASTER_VOLUME: 0.85,
  /** Volume multiplier for collision hits. */
  HIT_VOLUME: 0.9,
  /** Volume multiplier for player wreck / death sound. */
  DEATH_VOLUME: 1.0,
} as const;
