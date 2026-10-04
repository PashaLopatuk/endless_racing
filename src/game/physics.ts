import * as RAPIER from "@dimforge/rapier3d-compat";

import { BODY_KIND } from "./constants/kinds";
import { SIMULATION } from "./constants/simulation";
import type { IBodyUserData } from "./types";

export interface IContactEvent {
  bodyA: RAPIER.RigidBody;
  bodyB: RAPIER.RigidBody;
  normalX: number;
  normalY: number;
  normalZ: number;
}

export interface IPhysicsWorld {
  readonly world: RAPIER.World;
  /** Advances one fixed step. The returned array is reused; consume it before the next step. */
  step(): readonly IContactEvent[];
  dispose(): void;
}

interface IContactNormal {
  x: number;
  y: number;
  z: number;
}

const KNOWN_BODY_KINDS = new Set(Object.values(BODY_KIND));

export const readBodyData = (body: RAPIER.RigidBody): IBodyUserData | null => {
  const data = body.userData as Partial<IBodyUserData> | undefined;

  if (
    !data ||
    !KNOWN_BODY_KINDS.has(data.kind!) ||
    typeof data.id !== "number"
  ) {
    return null;
  }

  return data as IBodyUserData;
};

const readContactNormal = (
  world: RAPIER.World,
  colliderA: RAPIER.Collider,
  colliderB: RAPIER.Collider,
): IContactNormal | null => {
  let normal: IContactNormal | null = null;

  world.contactPair(colliderA, colliderB, (manifold) => {
    const manifoldNormal = manifold.normal();

    normal = {
      x: manifoldNormal.x,
      y: manifoldNormal.y,
      z: manifoldNormal.z,
    };
  });

  return normal;
};

export const createPhysics = async (): Promise<IPhysicsWorld> => {
  await RAPIER.init();

  const world = new RAPIER.World({ x: 0, y: SIMULATION.GRAVITY, z: 0 });

  world.timestep = SIMULATION.FIXED_TIMESTEP;

  const eventQueue = new RAPIER.EventQueue(true);
  const contacts: IContactEvent[] = [];
  const startedPairs: { handleA: number; handleB: number }[] = [];
  let isDisposed = false;

  const step = (): readonly IContactEvent[] => {
    if (isDisposed) {
      contacts.length = 0;
      return contacts;
    }

    world.step(eventQueue);
    contacts.length = 0;
    startedPairs.length = 0;

    eventQueue.drainCollisionEvents((handleA, handleB, isStarted) => {
      if (!isStarted) {
        return;
      }

      startedPairs.push({ handleA, handleB });
    });

    // `contactPair` must not run inside `drainCollisionEvents` — Rapier WASM rejects
    // nested world access ("recursive use … unsafe aliasing").
    for (const { handleA, handleB } of startedPairs) {
      const colliderA = world.getCollider(handleA);
      const colliderB = world.getCollider(handleB);

      const bodyA = colliderA.parent();
      const bodyB = colliderB.parent();

      if (!bodyA || !bodyB) {
        continue;
      }

      const normal = readContactNormal(world, colliderA, colliderB);

      contacts.push({
        bodyA,
        bodyB,
        normalX: normal?.x ?? 0,
        normalY: normal?.y ?? 0,
        normalZ: normal?.z ?? 0,
      });
    }

    return contacts;
  };

  return {
    world,
    step,
    dispose: () => {
      if (isDisposed) {
        return;
      }

      isDisposed = true;
      eventQueue.free();
      world.free();
    },
  };
};
