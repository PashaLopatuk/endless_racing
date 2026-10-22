import { COLLISION } from "./constants/collision";
import { BODY_KIND, IMPACT_KIND } from "./constants/kinds";
import { readBodyData, type IContactEvent } from "./physics";
import type { IImpactResult, IPlayer } from "./player";
import type { INpcCar, ITraffic } from "./traffic";
import type { IBodyUserData, ImpactKind } from "./types";

export interface ICollisionParticipants {
  player: IPlayer;
  traffic: ITraffic;
  onPlayerImpact?: (impact: IImpactResult) => void;
}

export interface ICollisionFrame {
  /** Seconds of simulated time; drives the per-car hit cooldown deterministically. */
  simulationTime: number;
  isPlayerHittable: boolean;
}

export interface ICollisionSystem {
  resolve(contacts: readonly IContactEvent[], frame: ICollisionFrame): void;
  reset(): void;
}

export interface IImpactSample {
  normalX: number;
  normalZ: number;
  /** NPC position minus player position. */
  offsetX: number;
  offsetZ: number;
  lateralSpeed: number;
  closingSpeed: number;
}

interface IContactPair {
  player: IBodyUserData | null;
  npcs: IBodyUserData[];
}

const pushSignFor = (offsetX: number): number => {
  return Math.abs(offsetX) > COLLISION.MIN_PUSH_OFFSET ? Math.sign(offsetX) : 1;
};

/** Uses the contact normal when it is reliable, otherwise the dominant axis between the two cars. */
const impactAxis = ({ normalX, normalZ, offsetX, offsetZ }: IImpactSample) => {
  if (
    Math.abs(normalX) + Math.abs(normalZ) >=
    COLLISION.WEAK_NORMAL_THRESHOLD
  ) {
    return { axisX: normalX, axisZ: normalZ };
  }

  if (Math.abs(offsetX) > Math.abs(offsetZ)) {
    return { axisX: Math.sign(offsetX) || 1, axisZ: 0 };
  }

  return { axisX: 0, axisZ: Math.sign(offsetZ) || 1 };
};

export const classifyImpact = (sample: IImpactSample): ImpactKind => {
  const { axisX, axisZ } = impactAxis(sample);

  const absX = Math.abs(axisX);
  const absZ = Math.abs(axisZ);

  const isDiagonal = Math.abs(absX - absZ) < COLLISION.DIAGONAL_THRESHOLD;

  const isSide = isDiagonal
    ? sample.lateralSpeed > sample.closingSpeed
    : absX > absZ;

  if (isSide || sample.closingSpeed < COLLISION.LOW_CLOSING_SPEED) {
    return IMPACT_KIND.SIDE;
  }

  return sample.offsetZ >= 0 ? IMPACT_KIND.FRONT : IMPACT_KIND.REAR;
};

const separateFromPlayer = (
  player: IPlayer,
  traffic: ITraffic,
  npc: INpcCar,
  kind: ImpactKind,
  offset: { x: number; z: number },
) => {
  const pushSign = pushSignFor(offset.x);

  if (kind === IMPACT_KIND.SIDE) {
    player.shiftAfterHit(-pushSign * COLLISION.SIDE_SEPARATION);

    traffic.queueImpulse(npc.id, {
      x: pushSign * COLLISION.SIDE_PUSH_IMPULSE,
      y: 0,
      z: 0,
    });

    return;
  }

  const bumperPush =
    offset.z >= 0
      ? COLLISION.BUMPER_PUSH_IMPULSE
      : -COLLISION.BUMPER_PUSH_IMPULSE;

  traffic.queueImpulse(npc.id, {
    x:
      pushSign *
      COLLISION.SIDE_PUSH_IMPULSE *
      COLLISION.BUMPER_SIDE_PUSH_RATIO,
    y: 0,
    z: bumperPush,
  });
};

const separateNpcs = (left: INpcCar, right: INpcCar, traffic: ITraffic) => {
  const leftPosition = traffic.getWorldPosition(left.id);
  const rightPosition = traffic.getWorldPosition(right.id);

  if (!leftPosition || !rightPosition) {
    return;
  }

  const sign = rightPosition.x >= leftPosition.x ? 1 : -1;
  const impulse = COLLISION.SIDE_PUSH_IMPULSE * COLLISION.NPC_PUSH_RATIO;

  traffic.queueImpulse(right.id, { x: sign * impulse, y: 0, z: 0 });
  traffic.queueImpulse(left.id, { x: -sign * impulse, y: 0, z: 0 });
};

const splitContact = (contact: IContactEvent): IContactPair | null => {
  const dataA = readBodyData(contact.bodyA);
  const dataB = readBodyData(contact.bodyB);

  if (!dataA || !dataB) {
    return null;
  }

  const pair: IContactPair = { player: null, npcs: [] };

  for (const data of [dataA, dataB]) {
    if (data.kind === BODY_KIND.PLAYER) {
      pair.player = data;
    } else {
      pair.npcs.push(data);
    }
  }

  return pair;
};

export const createCollisionSystem = ({
  player,
  traffic,
  onPlayerImpact,
}: ICollisionParticipants): ICollisionSystem => {
  const lastHitAt = new Map<number, number>();

  const isCoolingDown = (npcId: number, now: number): boolean => {
    const previous = lastHitAt.get(npcId) ?? -Infinity;

    if (now - previous < COLLISION.COOLDOWN_SECONDS) {
      return true;
    }

    lastHitAt.set(npcId, now);

    return false;
  };

  const resolvePlayerHit = (
    contact: IContactEvent,
    npc: INpcCar,
    now: number,
  ) => {
    if (!npc.isActive || isCoolingDown(npc.id, now)) {
      return;
    }

    const npcPosition = traffic.getWorldPosition(npc.id);

    if (!npcPosition) {
      return;
    }

    const offset = {
      x: npcPosition.x - player.x,
      z: npcPosition.z - player.worldZ,
    };

    const kind = classifyImpact({
      normalX: contact.normalX,
      normalZ: contact.normalZ,
      offsetX: offset.x,
      offsetZ: offset.z,
      lateralSpeed: 0,
      closingSpeed: Math.max(0, player.speed - npc.cruiseSpeed),
    });

    const impact = player.absorbImpact(kind);

    separateFromPlayer(player, traffic, npc, kind, offset);

    onPlayerImpact?.(impact);
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
          separateNpcs(firstNpc, secondNpc, traffic);
        }
      }
    },
    reset: () => {
      lastHitAt.clear();
    },
  };
};
