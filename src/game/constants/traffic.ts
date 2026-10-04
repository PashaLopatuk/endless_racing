export const TRAFFIC = {
  FIRST_ID: 1,
  POOL_SIZE: 36,
  MAX_ACTIVE: 28,

  MIN_SPEED: 7,
  MAX_SPEED: 16,
  /** NPCs always drift toward the camera at least this fast, so stalled traffic still clears. */
  MIN_CLOSING_SPEED: 1,
  LATERAL_DAMPING: 0.986,

  SPAWN_Z: 150,
  SPAWN_Z_RANDOMIZE: 22,
  DESPAWN_Z: -20,
  MIN_LANE_GAP: 18,
  SPAWN_BAND: 14,
  /** Lanes kept free across every spawn band so the road is never fully blocked. */
  MIN_FREE_LANES: 1,
  SPAWN_INTERVAL_MIN: 0.55,
  SPAWN_INTERVAL_MAX: 1.25,
  INITIAL_SPAWN_DELAY: 0.8,

  LAMP_BRIGHTNESS_MIN: 0.58,
  LAMP_BRIGHTNESS_MAX: 2.28,
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

export const NPC_PAINT_PALETTE = [
  0x314864, 0x3e4a34, 0x4a3b2c, 0x2c3544, 0x5a3434, 0x243e3e, 0x3a3048,
  0x6a6a70, 0x1e1e22, 0x5c5048,
] as const;

export interface ITrafficSeed {
  lane: number;
  z: number;
  cruiseSpeed: number;
}

export const INITIAL_TRAFFIC: readonly ITrafficSeed[] = [
  { lane: 0, z: 32, cruiseSpeed: 7 },
  { lane: 2, z: 50, cruiseSpeed: 9 },
  { lane: 3, z: 68, cruiseSpeed: 8 },
  { lane: 0, z: 90, cruiseSpeed: 10 },
  { lane: 2, z: 112, cruiseSpeed: 6.5 },
];
