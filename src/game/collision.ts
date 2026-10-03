import { COLLISION } from "./constants/collision";
import { BODY_KIND, IMPACT_KIND } from "./constants/kinds";
import { readBodyData, type ContactEvent } from "./physics";
import type { Player } from "./player";
import type { NpcCar, Traffic } from "./traffic";
import type { BodyUserData, ImpactKind } from "./types";

export interface CollisionParticipants {
  player: Player;
  traffic: Traffic;
}

export interface CollisionFrame {
  /** Seconds of simulated time; drives the per-car hit cooldown deterministically. */
  simulationTime: number;
  isPlayerHittable: boolean;
}

export interface CollisionSystem {
  resolve(contacts: readonly ContactEvent[], frame: CollisionFrame): void;
  reset(): void;
}

export interface ImpactSample {
  normalX: number;
  normalZ: number;
  /** NPC position minus player position. */
  offsetX: number;
  offsetZ: number;
  lateralSpeed: number;
  closingSpeed: number;
}

interface ContactPair {
  player: BodyUserData | null;
  npcs: BodyUserData[];
}

const pushSignFor = (offsetX: number): number => {
  return Math.abs(offsetX) > COLLISION.MIN_PUSH_OFFSET ? Math.sign(offsetX) : 1;
};

/** Uses the contact normal when it is reliable, otherwise the dominant axis between the two cars. */
const impactAxis = ({ normalX, normalZ, offsetX, offsetZ }: ImpactSample) => {
  if (Math.abs(normalX) + Math.abs(normalZ) >= COLLISION.WEAK_NORMAL_THRESHOLD) {
    return { axisX: normalX, axisZ: normalZ };
  }
  if (Math.abs(offsetX) > Math.abs(offsetZ)) {
    return { axisX: Math.sign(offsetX) || 1, axisZ: 0 };
  }
  return { axisX: 0, axisZ: Math.sign(offsetZ) || 1 };
};

export const classifyImpact = (sample: ImpactSample): ImpactKind => {
  const { axisX, axisZ } = impactAxis(sample);
  const absX = Math.abs(axisX);
  const absZ = Math.abs(axisZ);
  const isDiagonal = Math.abs(absX - absZ) < COLLISION.DIAGONAL_THRESHOLD;
  const isSide = isDiagonal ? sample.lateralSpeed > sample.closingSpeed : absX > absZ;

  if (isSide || sample.closingSpeed < COLLISION.LOW_CLOSING_SPEED) {
    return IMPACT_KIND.SIDE;
  }
  return sample.offsetZ >= 0 ? IMPACT_KIND.FRONT : IMPACT_KIND.REAR;
};

const separateFromPlayer = (player: Player, npc: NpcCar, kind: ImpactKind, offset: { x: number; z: number }) => {
  const pushSign = pushSignFor(offset.x);
  if (kind === IMPACT_KIND.SIDE) {
    player.nudge(-pushSign * COLLISION.SIDE_SEPARATION);
    npc.body.applyImpulse({ x: pushSign * COLLISION.SIDE_PUSH_IMPULSE, y: 0, z: 0 }, true);
    return;
  }
  const bumperPush = offset.z >= 0 ? COLLISION.BUMPER_PUSH_IMPULSE : -COLLISION.BUMPER_PUSH_IMPULSE;
  npc.body.applyImpulse({ x: pushSign * COLLISION.SIDE_PUSH_IMPULSE * COLLISION.BUMPER_SIDE_PUSH_RATIO, y: 0, z: bumperPush }, true);
};

const separateNpcs = (left: NpcCar, right: NpcCar) => {
  const sign = right.body.translation().x >= left.body.translation().x ? 1 : -1;
  const impulse = COLLISION.SIDE_PUSH_IMPULSE * COLLISION.NPC_PUSH_RATIO;
  right.body.applyImpulse({ x: sign * impulse, y: 0, z: 0 }, true);
  left.body.applyImpulse({ x: -sign * impulse, y: 0, z: 0 }, true);
};

const splitContact = (contact: ContactEvent): ContactPair | null => {
  const dataA = readBodyData(contact.bodyA);
  const dataB = readBodyData(contact.bodyB);
  if (!dataA || !dataB) {
    return null;
  }
  const pair: ContactPair = { player: null, npcs: [] };
  for (const data of [dataA, dataB]) {
    if (data.kind === BODY_KIND.PLAYER) {
      pair.player = data;
    } else {
      pair.npcs.push(data);
    }
  }
  return pair;
};

export const createCollisionSystem = ({ player, traffic }: CollisionParticipants): CollisionSystem => {
  const lastHitAt = new Map<number, number>();

  const isCoolingDown = (npcId: number, now: number): boolean => {
    const previous = lastHitAt.get(npcId) ?? -Infinity;
    if (now - previous < COLLISION.COOLDOWN_SECONDS) {
      return true;
    }
    lastHitAt.set(npcId, now);
    return false;
  };

  const resolvePlayerHit = (contact: ContactEvent, npc: NpcCar, now: number) => {
    if (!npc.isActive || isCoolingDown(npc.id, now)) {
      return;
    }
    const playerPosition = player.body.translation();
    const npcPosition = npc.body.translation();
    const offset = { x: npcPosition.x - playerPosition.x, z: npcPosition.z - playerPosition.z };
    const kind = classifyImpact({
      normalX: contact.normalX,
      normalZ: contact.normalZ,
      offsetX: offset.x,
      offsetZ: offset.z,
      lateralSpeed: Math.abs(player.body.linvel().x - npc.body.linvel().x),
      closingSpeed: Math.max(0, player.speed - npc.cruiseSpeed),
    });
    player.absorbImpact(kind);
    separateFromPlayer(player, npc, kind, offset);
  };

  return {
    resolve: (contacts, frame) => {
      for (const contact of contacts) {
        const pair = splitContact(contact);
        if (!pair) {
          continue;
        }
        const [first, second] = pair.npcs;
        const firstNpc = first && traffic.findById(first.id);
        if (!firstNpc) {
          continue;
        }
        if (pair.player && frame.isPlayerHittable) {
          resolvePlayerHit(contact, firstNpc, frame.simulationTime);
          continue;
        }
        const secondNpc = second && traffic.findById(second.id);
        if (secondNpc) {
          separateNpcs(firstNpc, secondNpc);
        }
      }
    },
    reset: () => {
      lastHitAt.clear();
    },
  };
};
