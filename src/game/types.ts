import type { BODY_KIND, IMPACT_KIND } from "./constants/kinds";

export type ValueOf<T> = T[keyof T];
export type BodyKind = ValueOf<typeof BODY_KIND>;
export type ImpactKind = ValueOf<typeof IMPACT_KIND>;

export type Vec3Tuple = readonly [number, number, number];
export type Range = readonly [number, number];
export type Rng = () => number;

export interface IBodyUserData {
  kind: BodyKind;
  id: number;
}

export interface IGameHudState {
  speedKmh: number;
  health: number;
  maxHealth: number;
  isGameOver: boolean;
  isPaused: boolean;
}

export interface IGameCallbacks {
  onReady(): void;
  onTick(state: IGameHudState): void;
  onError(error: unknown): void;
}

export interface IGameController {
  dispose(): void;
  restart(): void;
  setPaused(isPaused: boolean): void;
}
