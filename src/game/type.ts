export const BODY_KIND = {
  PLAYER: "player",
  NPC: "npc",
} as const;

export type BodyKind = (typeof BODY_KIND)[keyof typeof BODY_KIND];

export type BodyUserData = {
  kind: BodyKind;
  id: number;
};

export const IMPACT_KIND = {
  SIDE: "side",
  FRONT: "front",
  REAR: "rear",
} as const;

export type ImpactKind = (typeof IMPACT_KIND)[keyof typeof IMPACT_KIND];

export type GameHudState = {
  speedKmh: number;
  health: number;
  maxHealth: number;
  isGameOver: boolean;
  isPaused: boolean;
};

export type GameCallbacks = {
  onReady: () => void;
  onTick: (state: GameHudState) => void;
  onError: (error: unknown) => void;
};

export type GameController = {
  dispose: () => void;
  restart: () => void;
  setPaused: (paused: boolean) => void;
};
