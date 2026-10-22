import { compareObjects } from "../util/compare";

import { createSoundEffects } from "./audio";
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
import { readDynamicLightsEnabled } from "./settings";
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
  const gameScene = createGameScene(container, level);
  const input = createTouchInput();
  const skyMode = level.palette.skyMode ?? "night";
  const dynamicLightsEnabled = readDynamicLightsEnabled();
  const player = createPlayer(
    physics.world,
    gameScene.objectScene,
    skyMode,
    dynamicLightsEnabled,
  );
  const traffic = createTraffic(
    physics.world,
    gameScene.objectScene,
    level.cars,
    level.palette.outputGamma,
    skyMode,
  );

  const soundEffects = createSoundEffects();
  const environment = createEnvironment(gameScene.objectScene, level);
  const collisions = createCollisionSystem({
    player,
    traffic,
    onPlayerImpact: (impact) => {
      // Camera shake: scales with impact strength; horizontal shake dominates over vertical
      gameScene.triggerImpact(impact.severity);

      // Play hit sound scaled by severity
      soundEffects.playHit(impact.severity);

      // Play death sound if the hit was fatal
      if (impact.isFatal) {
        soundEffects.playDeath();
      }
    },
  });

  console.time("view.warmUp");
  await gameScene.warmUp();
  console.timeEnd("view.warmUp");

  let isPaused = false;
  let isDisposed = false;
  let deltaTimeAccumulator = 0;
  let simulationTime = 0;
  let distance = 0;
  let lastHud: IGameHudState | null = null;

  const step = (dt: number) => {
    const isGameOver = player.isWrecked;

    player.update(isGameOver ? IDLE_GESTURE : input.read(), dt, isGameOver);

    traffic.update(player.speed, player.worldZ, player.x, dt, !isGameOver);

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

      gameScene.follow(player.x, player.speed, dt);
      gameScene.render();

      publishHud();
    },
    restart: () => {
      isPaused = false;
      deltaTimeAccumulator = 0;
      distance = 0;
      soundEffects.stopAll();
      collisions.reset();
      player.reset();
      traffic.reset();
    },
    setPaused: (nextIsPaused) => {
      isPaused = nextIsPaused;
    },
    resize: () => {
      gameScene.resize();
    },
    dispose: () => {
      if (isDisposed) {
        return;
      }

      isDisposed = true;

      soundEffects.dispose();
      input.dispose();
      environment.dispose();
      traffic.dispose();
      player.dispose();
      gameScene.dispose();
      physics.dispose();
      sharedAssets.dispose();
    },
  };
};
