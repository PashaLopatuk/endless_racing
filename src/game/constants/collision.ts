import type { ImpactKind } from "../types";

import { IMPACT_KIND } from "./kinds";

export const IMPACT_DAMAGE: Readonly<Record<ImpactKind, number>> = {
  [IMPACT_KIND.SIDE]: 20,
  [IMPACT_KIND.FRONT]: 56,
  [IMPACT_KIND.REAR]: 30,
};

export const IMPACT_SPEED_LOSS: Readonly<Record<ImpactKind, number>> = {
  [IMPACT_KIND.SIDE]: 10,
  [IMPACT_KIND.FRONT]: 46,
  [IMPACT_KIND.REAR]: 46,
};

export const COLLISION = {
  COOLDOWN_SECONDS: 0.45,
  LOW_CLOSING_SPEED: 3,
  /** Contact normals weaker than this (|x| + |z|) fall back to the offset between the two cars. */
  WEAK_NORMAL_THRESHOLD: 0.2,
  /** Normals this close to 45 degrees are classified by comparing lateral and closing speed. */
  DIAGONAL_THRESHOLD: 0.2,
  MIN_PUSH_OFFSET: 0.05,

  SIDE_SEPARATION: 0.42,
  /** Instant sideways speed (m/s) added to an NPC on a hit. */
  SIDE_PUSH_IMPULSE: 12,
  /** Longitudinal shove; traffic turns this into meters with a fixed scale. */
  BUMPER_PUSH_IMPULSE: 32,
  BUMPER_SIDE_PUSH_RATIO: 0.25,
  NPC_PUSH_RATIO: 0.4,
} as const;
