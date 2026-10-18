export const TRAFFIC = {
  FIRST_ID: 1,
  POOL_SIZE: 48,
  MAX_ACTIVE: 19,
  /** Cap when the player crawls; avoids gridlock ahead. */
  MAX_ACTIVE_SLOW: 10,

  MIN_SPEED: 7,
  MAX_SPEED: 16,
  /** NPCs always drift toward the camera at least this fast, so stalled traffic still clears. */
  MIN_CLOSING_SPEED: 0.5,
  /** Per-step bleed on hit slide. Lower values settle a shove in a fraction of a second. */
  LATERAL_DAMPING: 0.91,

  /** How far ahead (m) new cars may appear; closer road is fill-only by drift, never pop-in. */
  SPAWN_AHEAD_MIN: 118,
  /** Outer edge of the ahead spawn band (m). */
  FILL_AHEAD_MAX: 172,
  /** Target center-to-center spacing along each lane. */
  TARGET_GRID_SPACING: 41,
  /** Stagger each lane's grid so Z slices are not four-wide walls. */
  LANE_GRID_OFFSET: 5,
  /** Treat a grid cell as taken if a car is within this radius (m). */
  GRID_OCCUPY_RADIUS: 17,
  /** Cross-lane slice thickness when keeping a passage open (m). */
  Z_SLICE_HALF: 7,
  /** Spawns attempted each spawn tick (when capacity allows). */
  SPAWNS_PER_TICK: 1,
  /** Tight cruise spread so closing speeds stay similar and gaps do not collapse. */
  CRUISE_JITTER: 2.2,
  DESPAWN_Z: -20,
  /** Minimum center-to-center distance along a lane (meters). */
  MIN_LANE_GAP: 13,
  SPAWN_BAND: 12,
  /** Lanes kept free across every spawn band so the road is never fully blocked. */
  MIN_FREE_LANES: 1,
  SPAWN_INTERVAL_MIN: 0.62,
  SPAWN_INTERVAL_MAX: 1.35,
  /** Multiplier on spawn interval at min player speed (1 = no change). */
  SPAWN_INTERVAL_SLOW_SCALE: 3.2,
  INITIAL_SPAWN_DELAY: 1.1,
  /** Fraction of grid cells filled at race start (0–1); lower = sparser opening traffic. */
  INITIAL_GRID_FILL_RATIO: 0.68,
  /** Meters ahead of the player where we enforce a free lane. */
  PLAYER_CLEARANCE_AHEAD: 108,
  /** Small overlap behind the player when counting lane fill. */
  PLAYER_CLEARANCE_BEHIND: 8,

  /** How far ahead (m) to scan for a slower lead in the same lane. */
  LANE_CHANGE_LOOKAHEAD: 38,
  /** Start a lane change when time-to-contact drops below this (s). */
  LANE_CHANGE_REACTION_TIME: 1.05,
  /** Lateral speed (m/s) while merging into another lane. */
  LANE_CHANGE_SPEED: 10,
  /** Seconds before the same car may initiate another lane change. */
  LANE_CHANGE_COOLDOWN: 9.5,
  /** Roll each frame a blocked car may merge (keeps overtakes rare). */
  LANE_CHANGE_CHANCE: 0.035,

  /** Match speed of the car directly ahead within this gap (m). */
  FOLLOW_LOOKAHEAD: 42,
  /** Back off below the lead cruise when closer than this bumper gap (m). */
  FOLLOW_MIN_GAP: 7.5,
  /** Cruise drop when tailgating the lead car. */
  FOLLOW_BACKOFF: 2.2,

  LAMP_BRIGHTNESS_MIN: 0.58,
  LAMP_BRIGHTNESS_MAX: 2.28,
  /** Emissive-only DRL on day levels (no spot/pool lights). */
  DAY_LAMP_BRIGHTNESS_MIN: 0.42,
  DAY_LAMP_BRIGHTNESS_MAX: 1.05,
} as const;

export const NPC_BODY = {
  DENSITY: 6,
  FRICTION: 0.15,
  RESTITUTION: 0.02,
} as const;

/** Out-of-bounds lot behind the camera where pooled NPCs wait, fully built, until they are needed. */
export const PARKING_ZONE = {
  X: 0,
  Z: -400,
  SPACING: 8,
} as const;

export interface ITrafficSeed {
  lane: number;
  z: number;
  cruiseSpeed: number;
}

