export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

export const approach = (current: number, target: number, rate: number, dt: number): number => {
  const blend = 1 - Math.exp(-rate * dt);
  return current + (target - current) * blend;
};

export const randomRange = (min: number, max: number): number => {
  return min + Math.random() * (max - min);
};

export const createRng = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
};
