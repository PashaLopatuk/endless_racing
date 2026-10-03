import type { ImpactKind } from "../types";

import { IMPACT_KIND } from "./kinds";

export const IMPACT_DAMAGE: Readonly<Record<ImpactKind, number>> = {
  [IMPACT_KIND.SIDE]: 4,
  [IMPACT_KIND.FRONT]: 26,
  [IMPACT_KIND.REAR]: 20,
};

export const IMPACT_SPEED_LOSS: Readonly<Record<ImpactKind, number>> = {
  [IMPACT_KIND.SIDE]: 0,
  [IMPACT_KIND.FRONT]: 6,
  [IMPACT_KIND.REAR]: 6,
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
  SIDE_PUSH_IMPULSE: 95,
  BUMPER_PUSH_IMPULSE: 150,
  BUMPER_SIDE_PUSH_RATIO: 0.25,
  NPC_PUSH_RATIO: 0.4,
} as const;
