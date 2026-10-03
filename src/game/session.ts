import { compareObjects } from "../util/compare";

import { sharedAssets } from "./assets/sharedAssets";
import { createCollisionSystem } from "./collision";
import { PLAYER } from "./constants/player";
import { SIMULATION } from "./constants/simulation";
import { UNITS } from "./constants/world";
import { createTouchInput, type DriveGesture } from "./input";
import { createEnvironment } from "./level/environment";
import type { PhysicsWorld } from "./physics";
import { createPlayer } from "./player";
import { createGameScene } from "./scene";
import { createTraffic } from "./traffic";
import type { GameCallbacks, GameHudState } from "./types";

export interface GameSessionOptions {
  container: HTMLElement;
  /** Ownership passes to the session; it is freed in `dispose`. */
  physics: PhysicsWorld;
  callbacks: GameCallbacks;
}

/** One running race: owns the scene, the actors, and the fixed-step simulation. */
export interface GameSession {
  frame(dt: number): void;
  restart(): void;
  setPaused(isPaused: boolean): void;
  resize(): void;
  dispose(): void;
}

const IDLE_GESTURE: DriveGesture = Object.freeze({
  isActive: false,
  deltaX: 0,
  deltaY: 0,
});

export const createGameSession = ({
  container,
  physics,
  callbacks,
}: GameSessionOptions): GameSession => {
  const view = createGameScene(container);
  const input = createTouchInput();
  const player = createPlayer(physics.world, view.scene);
  const traffic = createTraffic(physics.world, view.scene);
  const environment = createEnvironment(view.scene);
  const collisions = createCollisionSystem({ player, traffic });

  view.warmUp();

  let isPaused = false;
  let deltaTimeAccumulator = 0;
  let simulationTime = 0;
  let lastHud: GameHudState | null = null;

  const step = (dt: number) => {
    const isGameOver = player.isWrecked;

    player.update(isGameOver ? IDLE_GESTURE : input.read(), dt, isGameOver);
    player.commitPose();

    traffic.update(player.speed, dt, !isGameOver);

    environment.scroll(player.speed * dt);

    collisions.resolve(physics.step(), {
      simulationTime,
      isPlayerHittable: !isGameOver,
    });

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
    const hud: GameHudState = {
      speedKmh: Math.round(player.speed * UNITS.KMH_PER_MPS),
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
