import type { Range, Rng } from "../types";

/** mulberry32: neighbouring seeds produce unrelated sequences, unlike a plain LCG. */
const MULBERRY = {
  INCREMENT: 0x6d2b79f5,
  SHIFT_A: 15,
  SHIFT_B: 7,
  SHIFT_C: 14,
  MIX: 61,
  UINT32_RANGE: 4294967296,
} as const;

export interface Weighted {
  weight: number;
}

export const createRng = (seed: number): Rng => {
  let state = seed >>> 0;

  return () => {
    state = (state + MULBERRY.INCREMENT) | 0;

    let mixed = Math.imul(state ^ (state >>> MULBERRY.SHIFT_A), 1 | state);

    mixed =
      (mixed +
        Math.imul(mixed ^ (mixed >>> MULBERRY.SHIFT_B), MULBERRY.MIX | mixed)) ^
      mixed;

    return (
      ((mixed ^ (mixed >>> MULBERRY.SHIFT_C)) >>> 0) / MULBERRY.UINT32_RANGE
    );
  };
};

export const randomIn = (random: Rng, [min, max]: Range): number => {
  return min + random() * (max - min);
};

/** Inclusive on both ends. */
export const randomIntIn = (random: Rng, [min, max]: Range): number => {
  return Math.floor(randomIn(random, [min, max + 1]));
};

export const chance = (random: Rng, probability: number): boolean => {
  return random() < probability;
};

export const pick = <T>(random: Rng, items: readonly T[]): T => {
  return items[Math.floor(random() * items.length)];
};

export const pickWeighted = <T extends Weighted>(
  random: Rng,
  items: readonly T[],
): T => {
  const total = items.reduce((sum, item) => sum + item.weight, 0);

  let roll = random() * total;

  for (const item of items) {
    roll -= item.weight;

    if (roll < 0) {
      return item;
    }
  }

  return items[items.length - 1];
};
