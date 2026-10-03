import { SIMULATION } from "./constants/simulation";
import { UNITS } from "./constants/world";

/** Calls `tick` once per animation frame with the elapsed seconds (capped). Returns a stop function. */
export const startLoop = (tick: (dt: number) => void): (() => void) => {
  let frameId = 0;
  let previous = performance.now();
  let isRunning = true;

  const frame = (now: number) => {
    if (!isRunning) {
      return;
    }

    const dt = Math.min(
      (now - previous) / UNITS.MS_PER_SECOND,
      SIMULATION.MAX_FRAME_DELTA,
    );

    previous = now;
    tick(dt);

    frameId = requestAnimationFrame(frame);
  };

  frameId = requestAnimationFrame(frame);

  return () => {
    isRunning = false;
    cancelAnimationFrame(frameId);
  };
};
