import { GAME_LOG } from "./constants/simulation";
import { startLoop } from "./loop";
import { createPhysics, type IPhysicsWorld } from "./physics";
import { createGameSession, type IGameSession } from "./session";
import type { IGameCallbacks, IGameController } from "./types";

/**
 * Composition root. Boots Rapier asynchronously, then runs a `IGameSession` on the animation loop.
 * Safe to dispose at any point, including before the physics engine has finished loading.
 */
export const createGame = (
  container: HTMLElement,
  callbacks: IGameCallbacks,
): IGameController => {
  let isDisposed = false;
  let session: IGameSession | null = null;
  let stopLoop: (() => void) | null = null;

  const onResize = () => {
    session?.resize();
  };

  const shutdown = () => {
    stopLoop?.();
    stopLoop = null;

    window.removeEventListener("resize", onResize);

    session?.dispose();
    session = null;
  };

  const fail = (message: string, error: unknown) => {
    if (isDisposed) {
      return;
    }

    console.error(`${GAME_LOG.PREFIX} ${message}`, error);
    shutdown();
    callbacks.onError(error);
  };

  const startSession = (physics: IPhysicsWorld) => {
    try {
      session = createGameSession({ container, physics, callbacks });
    } catch (error) {
      physics.dispose();

      throw error;
    }

    window.addEventListener("resize", onResize);

    stopLoop = startLoop((dt) => {
      try {
        session?.frame(dt);
      } catch (error) {
        fail(GAME_LOG.FRAME_FAILED, error);
      }
    });

    callbacks.onReady();
  };

  const boot = async () => {
    try {
      const physics = await createPhysics();

      if (isDisposed) {
        physics.dispose();
        return;
      }

      startSession(physics);
    } catch (error) {
      fail(GAME_LOG.BOOT_FAILED, error);
    }
  };

  void boot();

  return {
    dispose: () => {
      isDisposed = true;
      shutdown();
    },
    restart: () => {
      session?.restart();
    },
    setPaused: (isPaused) => {
      session?.setPaused(isPaused);
    },
  };
};
