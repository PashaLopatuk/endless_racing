import { compareObjects } from "../util/compare";

import { sharedAssets } from "./assets/sharedAssets";
import { createCollisionSystem } from "./collision";
import { PLAYER } from "./constants/player";
import { SIMULATION } from "./constants/simulation";
import { UNITS } from "./constants/world";
import { createTouchInput, type IDriveGesture } from "./input";
import { createEnvironment } from "./level/environment";
import type { ILevelConfig } from "./levels";
import type { IPhysicsWorld } from "./physics";
import { createPlayer } from "./player";
import { createGameScene } from "./scene";
import { createTraffic } from "./traffic";
import type { IGameCallbacks, IGameHudState } from "./types";

export interface IGameSessionOptions {
  container: HTMLElement;
  /** Ownership passes to the session; it is freed in `dispose`. */
  physics: IPhysicsWorld;
  callbacks: IGameCallbacks;
  level: ILevelConfig;
}

/** One running race: owns the scene, the actors, and the fixed-step simulation. */
export interface IGameSession {
  frame(dt: number): void;
  restart(): void;
  setPaused(isPaused: boolean): void;
  resize(): void;
  dispose(): void;
}

const IDLE_GESTURE: IDriveGesture = Object.freeze({
  isActive: false,
  deltaX: 0,
  deltaY: 0,
});

export const createGameSession = async ({
  container,
  physics,
  callbacks,
  level,
}: IGameSessionOptions): Promise<IGameSession> => {
  const view = createGameScene(container, level);
  const input = createTouchInput();
  const player = createPlayer(physics.world, view.scene);
  const traffic = createTraffic(
    physics.world,
    view.scene,
    level.cars,
    level.palette.outputGamma,
  );
  const environment = createEnvironment(view.scene, level);
  const collisions = createCollisionSystem({ player, traffic });

  await view.warmUp();

  let isPaused = false;
  let isDisposed = false;
  let deltaTimeAccumulator = 0;
  let simulationTime = 0;
  let distance = 0;
  let lastHud: IGameHudState | null = null;

  const step = (dt: number) => {
    const isGameOver = player.isWrecked;

    player.update(isGameOver ? IDLE_GESTURE : input.read(), dt, isGameOver);

    traffic.update(player.speed, dt, !isGameOver);

    environment.scroll(player.speed * dt);

    player.commitPose();
    traffic.commitDynamics(player.speed);

    const contacts = physics.step();

    collisions.resolve(contacts, {
      simulationTime,
      isPlayerHittable: !isGameOver,
    });

    if (!isGameOver) {
      distance += player.speed * dt;
    }

    simulationTime += dt;
    player.syncMesh();
    traffic.sync();
  };

  const processSimulationByDeltaTime = (dt: number) => {
    deltaTimeAccumulator += dt;

    let steps = 0;

    while (
      deltaTimeAccumulator >= SIMULATION.FIXED_TIMESTEP &&
      steps < SIMULATION.MAX_STEPS_PER_FRAME
    ) {
      step(SIMULATION.FIXED_TIMESTEP);

      deltaTimeAccumulator -= SIMULATION.FIXED_TIMESTEP;

      steps += 1;
    }

    if (deltaTimeAccumulator >= SIMULATION.FIXED_TIMESTEP) {
      deltaTimeAccumulator = 0;
    }
  };

  const publishHud = () => {
    const hud: IGameHudState = {
      speedKmh: Math.round(player.speed * UNITS.KMH_PER_MPS),
      score: Math.floor(distance),
      health: Math.ceil(player.health),
      maxHealth: PLAYER.MAX_HEALTH,
      isGameOver: player.isWrecked,
      isPaused,
    };

    if (lastHud && compareObjects(lastHud, hud)) {
      return;
    }

    lastHud = hud;
    callbacks.onTick(hud);
  };

  return {
    frame: (dt) => {
      if (isDisposed) {
        return;
      }

      if (isPaused) {
        publishHud();

        return;
      }

      processSimulationByDeltaTime(dt);

      view.follow(player.x, player.speed, dt);
      view.render();

      publishHud();
    },
    restart: () => {
      isPaused = false;
      deltaTimeAccumulator = 0;
      distance = 0;
      collisions.reset();
      player.reset();
      traffic.reset();
    },
    setPaused: (nextIsPaused) => {
      isPaused = nextIsPaused;
    },
    resize: () => {
      view.resize();
    },
    dispose: () => {
      if (isDisposed) {
        return;
      }

      isDisposed = true;

      input.dispose();
      environment.dispose();
      traffic.dispose();
      player.dispose();
      view.dispose();
      physics.dispose();
      sharedAssets.dispose();
    },
  };
};
