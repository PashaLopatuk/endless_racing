import * as RAPIER from "@dimforge/rapier3d-compat";

import { BODY_KIND } from "./constants/kinds";
import { SIMULATION } from "./constants/simulation";
import type { BodyUserData } from "./types";

export interface ContactEvent {
  bodyA: RAPIER.RigidBody;
  bodyB: RAPIER.RigidBody;
  normalX: number;
  normalY: number;
  normalZ: number;
}

export interface PhysicsWorld {
  readonly world: RAPIER.World;
  /** Advances one fixed step. The returned array is reused; consume it before the next step. */
  step(): readonly ContactEvent[];
  dispose(): void;
}

interface ContactNormal {
  x: number;
  y: number;
  z: number;
}

const KNOWN_BODY_KINDS = new Set<unknown>(Object.values(BODY_KIND));

export const readBodyData = (body: RAPIER.RigidBody): BodyUserData | null => {
  const data = body.userData as Partial<BodyUserData> | undefined;
  if (!data || !KNOWN_BODY_KINDS.has(data.kind) || typeof data.id !== "number") {
    return null;
  }
  return data as BodyUserData;
};

const readContactNormal = (world: RAPIER.World, colliderA: RAPIER.Collider, colliderB: RAPIER.Collider): ContactNormal | null => {
  let normal: ContactNormal | null = null;
  world.contactPair(colliderA, colliderB, (manifold) => {
    const manifoldNormal = manifold.normal();
    normal = { x: manifoldNormal.x, y: manifoldNormal.y, z: manifoldNormal.z };
  });
  return normal;
};

export const createPhysics = async (): Promise<PhysicsWorld> => {
  await RAPIER.init();

  const world = new RAPIER.World({ x: 0, y: SIMULATION.GRAVITY, z: 0 });
  world.timestep = SIMULATION.FIXED_TIMESTEP;
  const eventQueue = new RAPIER.EventQueue(true);
  const contacts: ContactEvent[] = [];

  const step = (): readonly ContactEvent[] => {
    world.step(eventQueue);
    contacts.length = 0;

    eventQueue.drainCollisionEvents((handleA, handleB, isStarted) => {
      if (!isStarted) {
        return;
      }
      const colliderA = world.getCollider(handleA);
      const colliderB = world.getCollider(handleB);
      const bodyA = colliderA.parent();
      const bodyB = colliderB.parent();
      if (!bodyA || !bodyB) {
        return;
      }
      const normal = readContactNormal(world, colliderA, colliderB);
      contacts.push({ bodyA, bodyB, normalX: normal?.x ?? 0, normalY: normal?.y ?? 0, normalZ: normal?.z ?? 0 });
    });

    return contacts;
  };

  return {
    world,
    step,
    dispose: () => {
      eventQueue.free();
      world.free();
    },
  };
};
