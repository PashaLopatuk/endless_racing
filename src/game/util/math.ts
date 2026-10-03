export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

/** Frame-rate independent exponential smoothing toward `target`. */
export const approach = (
  current: number,
  target: number,
  rate: number,
  dt: number,
): number => {
  const blend = 1 - Math.exp(-rate * dt);

  return current + (target - current) * blend;
};

export const randomRange = (min: number, max: number): number => {
  return min + Math.random() * (max - min);
};
