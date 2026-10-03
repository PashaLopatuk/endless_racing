import type { ContactEvent } from "./physics";
import { createEnvironment } from "./level/environment";
import { createTouchInput, type DriveGesture } from "./input";
import { startLoop } from "./loop";
import { createTraffic, type NpcCar } from "./npc";
import { createPhysics } from "./physics";
import { createPlayer, damageForImpact, speedLossForImpact, type Player } from "./player";
import { createGameScene } from "./scene";
import { BODY_KIND, IMPACT_KIND, type BodyUserData, type GameCallbacks, type GameController, type ImpactKind } from "./type";
import {
  BUMPER_PUSH_IMPULSE,
  COLLISION_COOLDOWN_SECONDS,
  FIXED_TIMESTEP,
  KMH_PER_MPS,
  LOW_CLOSING_SPEED,
  MAX_FRAME_DELTA,
  MAX_HEALTH,
  MAX_PHYSICS_STEPS,
  SIDE_PUSH_IMPULSE,
  SIDE_SEPARATION,
} from "./const";

const IDLE_GESTURE: DriveGesture = { isActive: false, deltaX: 0, deltaY: 0 };

const readBodyData = (value: unknown): BodyUserData | null => {
  if (!value || typeof value !== "object" || !("kind" in value) || !("id" in value)) {
    return null;
  }
  return value as BodyUserData;
};

const bodyWithKind = (contact: ContactEvent, kind: BodyUserData["kind"]) => {
  const dataA = readBodyData(contact.bodyA.userData);
  const dataB = readBodyData(contact.bodyB.userData);
  if (dataA?.kind === kind) {
    return contact.bodyA;
  }
  if (dataB?.kind === kind) {
    return contact.bodyB;
  }
  return null;
};

const classifyImpact = (
  normalX: number,
  normalZ: number,
  playerX: number,
  playerZ: number,
  npcX: number,
  npcZ: number,
  lateralSpeed: number,
  closingSpeed: number,
): ImpactKind => {
  let axisX = normalX;
  let axisZ = normalZ;
  if (Math.abs(axisX) + Math.abs(axisZ) < 0.2) {
    const offsetX = npcX - playerX;
    const offsetZ = npcZ - playerZ;
    if (Math.abs(offsetX) > Math.abs(offsetZ)) {
      axisX = Math.sign(offsetX) || 1;
      axisZ = 0;
    } else {
      axisX = 0;
      axisZ = Math.sign(offsetZ) || 1;
    }
  }

  const absX = Math.abs(axisX);
  const absZ = Math.abs(axisZ);
  let isSide = absX > absZ;
  if (Math.abs(absX - absZ) < 0.2) {
    isSide = lateralSpeed > closingSpeed;
  }
  if (isSide) {
    return IMPACT_KIND.SIDE;
  }
  if (closingSpeed < LOW_CLOSING_SPEED) {
    return IMPACT_KIND.SIDE;
  }
  return npcZ >= playerZ ? IMPACT_KIND.FRONT : IMPACT_KIND.REAR;
};

const pushCarsApart = (player: Player, npc: NpcCar, kind: ImpactKind) => {
  const playerPosition = player.body.translation();
  const npcPosition = npc.body.translation();
  const offsetX = npcPosition.x - playerPosition.x;
  const pushSign = Math.abs(offsetX) > 0.05 ? Math.sign(offsetX) : 1;

  if (kind === IMPACT_KIND.SIDE) {
    player.nudge(-pushSign * SIDE_SEPARATION);
    npc.body.applyImpulse({ x: pushSign * SIDE_PUSH_IMPULSE, y: 0, z: 0 }, true);
    return;
  }

  const isAhead = npcPosition.z >= playerPosition.z;
  npc.body.applyImpulse(
    {
      x: pushSign * SIDE_PUSH_IMPULSE * 0.25,
      y: 0,
      z: isAhead ? BUMPER_PUSH_IMPULSE : -BUMPER_PUSH_IMPULSE,
    },
    true,
  );
};

export const createGame = (container: HTMLElement, callbacks: GameCallbacks): GameController => {
  let disposed = false;
  let isPaused = false;
  let teardown: (() => void) | null = null;
  let restartRun = () => {};

  const boot = async () => {
    try {
      const physics = await createPhysics();
      if (disposed) {
        physics.dispose();
        return;
      }

      const view = createGameScene(container);
      const input = createTouchInput();
      const player = createPlayer(physics.world, view.scene);
      const traffic = createTraffic(physics.world, view.scene);
      const environment = createEnvironment(view.scene);
      const recentHits = new Map<number, number>();
      let isGameOver = false;
      let accumulator = 0;
      let isTornDown = false;

      const resolveContact = (contact: ContactEvent) => {
        const dataA = readBodyData(contact.bodyA.userData);
        const dataB = readBodyData(contact.bodyB.userData);
        if (!dataA || !dataB) {
          return;
        }

        const playerBody = bodyWithKind(contact, BODY_KIND.PLAYER);
        const npcBody = bodyWithKind(contact, BODY_KIND.NPC);
        if (!playerBody || !npcBody || playerBody === npcBody) {
          if (dataA.kind === BODY_KIND.NPC && dataB.kind === BODY_KIND.NPC) {
            const left = traffic.findByBody(contact.bodyA);
            const right = traffic.findByBody(contact.bodyB);
            if (!left || !right) {
              return;
            }
            const sign = right.body.translation().x >= left.body.translation().x ? 1 : -1;
            right.body.applyImpulse({ x: sign * SIDE_PUSH_IMPULSE * 0.4, y: 0, z: 0 }, true);
            left.body.applyImpulse({ x: -sign * SIDE_PUSH_IMPULSE * 0.4, y: 0, z: 0 }, true);
          }
          return;
        }

        const npc = traffic.findByBody(npcBody);
        if (!npc || !npc.isActive || isGameOver) {
          return;
        }

        const now = performance.now() / 1000;
        const previous = recentHits.get(npc.id) ?? -Infinity;
        if (now - previous < COLLISION_COOLDOWN_SECONDS) {
          return;
        }
        recentHits.set(npc.id, now);

        const playerPosition = player.body.translation();
        const npcPosition = npc.body.translation();
        const playerVelocity = player.body.linvel();
        const npcVelocity = npc.body.linvel();
        const lateralSpeed = Math.abs(playerVelocity.x - npcVelocity.x);
        const closingSpeed = Math.max(0, player.speed - npc.cruiseSpeed);
        const kind = classifyImpact(
          contact.normalX,
          contact.normalZ,
          playerPosition.x,
          playerPosition.z,
          npcPosition.x,
          npcPosition.z,
          lateralSpeed,
          closingSpeed,
        );

        player.applyDamage(damageForImpact(kind));
        player.cutSpeed(speedLossForImpact(kind));
        pushCarsApart(player, npc, kind);
        if (player.health <= 0) {
          isGameOver = true;
        }
      };

      const simulationStep = (dt: number) => {
        player.update(isGameOver ? IDLE_GESTURE : input.read(), dt, isGameOver);
        player.commitPose();
        traffic.update(player.speed, dt, !isGameOver);
        environment.scroll(player.speed * dt);
        const contacts = physics.step();
        for (const contact of contacts) {
          resolveContact(contact);
        }
        player.syncMesh();
        traffic.sync();
      };

      const frame = (dt: number) => {
        if (disposed || isTornDown) {
          return;
        }
        try {
          if (!isPaused) {
            accumulator = Math.min(accumulator + dt, MAX_FRAME_DELTA);
            let steps = 0;
            while (accumulator >= FIXED_TIMESTEP && steps < MAX_PHYSICS_STEPS) {
              simulationStep(FIXED_TIMESTEP);
              accumulator -= FIXED_TIMESTEP;
              steps += 1;
            }
          }
          view.follow(player.x, player.speed, dt);
          view.render();
          callbacks.onTick({
            speedKmh: Math.round(player.speed * KMH_PER_MPS),
            health: Math.ceil(player.health),
            maxHealth: MAX_HEALTH,
            isGameOver,
            isPaused,
          });
        } catch (error) {
          if (!disposed) {
            callbacks.onError(error);
          }
          teardown?.();
        }
      };

      const stopLoop = startLoop(frame);
      const onResize = () => {
        view.resize();
      };
      window.addEventListener("resize", onResize);

      restartRun = () => {
        if (disposed || isTornDown) {
          return;
        }
        isGameOver = false;
        isPaused = false;
        recentHits.clear();
        player.reset();
        traffic.reset();
      };

      teardown = () => {
        if (isTornDown) {
          return;
        }
        isTornDown = true;
        stopLoop();
        window.removeEventListener("resize", onResize);
        input.dispose();
        environment.dispose();
        traffic.dispose();
        player.dispose();
        view.dispose();
        physics.dispose();
      };

      if (disposed) {
        teardown();
        return;
      }
      callbacks.onReady();
    } catch (error) {
      if (!disposed) {
        callbacks.onError(error);
      }
    }
  };

  void boot();

  return {
    dispose: () => {
      disposed = true;
      teardown?.();
      teardown = null;
    },
    restart: () => {
      restartRun();
    },
    setPaused: (paused: boolean) => {
      isPaused = paused;
    },
  };
};
