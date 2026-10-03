import type { BODY_KIND, IMPACT_KIND } from "./constants/kinds";

export type ValueOf<T> = T[keyof T];
export type BodyKind = ValueOf<typeof BODY_KIND>;
export type ImpactKind = ValueOf<typeof IMPACT_KIND>;

export type Vec3Tuple = readonly [number, number, number];
export type Range = readonly [number, number];
export type Rng = () => number;

export interface BodyUserData {
  kind: BodyKind;
  id: number;
}

export interface GameHudState {
  speedKmh: number;
  health: number;
  maxHealth: number;
  isGameOver: boolean;
  isPaused: boolean;
}

export interface GameCallbacks {
  onReady(): void;
  onTick(state: GameHudState): void;
  onError(error: unknown): void;
}

export interface GameController {
  dispose(): void;
  restart(): void;
  setPaused(isPaused: boolean): void;
}
