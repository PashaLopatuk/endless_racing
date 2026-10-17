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
  let bootGeneration = 0;
  let session: IGameSession | null = null;
  let stopLoop: (() => void) | null = null;

  const onResize = () => {
    session?.resize();
  };

  /**
   * Session teardown must not run synchronously from inside the rAF tick: Rapier WASM
   * can still hold a world borrow when `frame()` throws, and `world.free()` then fails.
   */
  const disposeSessionAsync = (target: IGameSession | null) => {
    if (!target) {
      return;
    }

    requestAnimationFrame(() => {
      target.dispose();
    });
  };

  const disposePhysicsAsync = (target: IPhysicsWorld) => {
    requestAnimationFrame(() => {
      target.dispose();
    });
  };

  const shutdown = () => {
    stopLoop?.();
    stopLoop = null;

    window.removeEventListener("resize", onResize);

    const current = session;
    session = null;
    disposeSessionAsync(current);
  };

  const fail = (message: string, error: unknown) => {
    if (isDisposed) {
      return;
    }

    console.error(`${GAME_LOG.PREFIX} ${message}`, error);
    shutdown();
    callbacks.onError(error);
  };

  const createActiveCallbacks = (generation: number): IGameCallbacks => ({
    onReady: () => {
      if (isDisposed || generation !== bootGeneration) {
        return;
      }

      callbacks.onReady();
    },
    onTick: (hud) => {
      if (isDisposed || generation !== bootGeneration) {
        return;
      }

      callbacks.onTick(hud);
    },
    onError: (error) => {
      if (isDisposed || generation !== bootGeneration) {
        return;
      }

      callbacks.onError(error);
    },
  });

  const startSession = async (
    physics: IPhysicsWorld,
    generation: number,
    activeCallbacks: IGameCallbacks,
  ) => {
    let created: IGameSession;

    try {
      created = await createGameSession({
        container,
        physics,
        callbacks: activeCallbacks,
      });
    } catch (error) {
      disposePhysicsAsync(physics);

      throw error;
    }

    if (isDisposed || generation !== bootGeneration) {
      created.dispose();
      return;
    }

    session = created;

    window.addEventListener("resize", onResize);

    stopLoop = startLoop((dt) => {
      if (generation !== bootGeneration || isDisposed) {
        return;
      }

      try {
        session?.frame(dt);
      } catch (error) {
        fail(GAME_LOG.FRAME_FAILED, error);
      }
    });

    activeCallbacks.onReady();
  };

  const boot = async () => {
    const generation = bootGeneration;
    const activeCallbacks = createActiveCallbacks(generation);

    try {
      const physics = await createPhysics();

      if (isDisposed || generation !== bootGeneration) {
        disposePhysicsAsync(physics);
        return;
      }

      await startSession(physics, generation, activeCallbacks);
    } catch (error) {
      if (generation === bootGeneration && !isDisposed) {
        fail(GAME_LOG.BOOT_FAILED, error);
      }
    }
  };

  void boot();

  return {
    dispose: () => {
      isDisposed = true;
      bootGeneration += 1;
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
