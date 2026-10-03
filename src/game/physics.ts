import * as RAPIER from "@dimforge/rapier3d-compat";

import { FIXED_TIMESTEP, GRAVITY } from "./const";

export type ContactEvent = {
  bodyA: RAPIER.RigidBody;
  bodyB: RAPIER.RigidBody;
  normalX: number;
  normalY: number;
  normalZ: number;
};

export type PhysicsWorld = {
  world: RAPIER.World;
  step: () => ContactEvent[];
  dispose: () => void;
};

const readContactNormal = (
  world: RAPIER.World,
  colliderA: RAPIER.Collider,
  colliderB: RAPIER.Collider,
): { x: number; y: number; z: number } | null => {
  let normal: { x: number; y: number; z: number } | null = null;
  world.contactPair(colliderA, colliderB, (manifold) => {
    const manifoldNormal = manifold.normal();
    normal = { x: manifoldNormal.x, y: manifoldNormal.y, z: manifoldNormal.z };
  });
  return normal;
};

export const createPhysics = async (): Promise<PhysicsWorld> => {
  await RAPIER.init();

  const world = new RAPIER.World({ x: 0, y: GRAVITY, z: 0 });
  world.timestep = FIXED_TIMESTEP;
  const eventQueue = new RAPIER.EventQueue(true);

  const step = (): ContactEvent[] => {
    world.step(eventQueue);
    const contacts: ContactEvent[] = [];

    eventQueue.drainCollisionEvents((handleA, handleB, started) => {
      if (!started) {
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
      contacts.push({
        bodyA,
        bodyB,
        normalX: normal?.x ?? 0,
        normalY: normal?.y ?? 0,
        normalZ: normal?.z ?? 0,
      });
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
