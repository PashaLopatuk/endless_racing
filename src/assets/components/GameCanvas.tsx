import { useEffect, useRef, useState } from "react";

import { HUD_TEXT } from "../../constants/hud";
import { PLAYER } from "../../game/constants/player";
import { UNITS } from "../../game/constants/world";
import { createGame } from "../../game/game";
import type { GameController, GameHudState } from "../../game/types";

import "./GameCanvas.css";

const INITIAL_HUD: GameHudState = {
  speedKmh: 0,
  health: PLAYER.MAX_HEALTH,
  maxHealth: PLAYER.MAX_HEALTH,
  isGameOver: false,
  isPaused: false,
};

interface OverlayPanelProps {
  title: string;
  actionLabel: string;
  onAction: () => void;
}

const OverlayPanel = ({ title, actionLabel, onAction }: OverlayPanelProps) => (
  <div className="game-status-overlay">
    <div className="game-over-panel">
      <h1 className="game-over-title">{title}</h1>
      <button type="button" className="game-restart-button" onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  </div>
);

export const GameCanvas = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [hud, setHud] = useState<GameHudState>(INITIAL_HUD);
  const mountRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameController | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) {
      return;
    }

    const game = createGame(container, {
      onReady: () => {
        setIsLoading(false);
      },
      onTick: setHud,
      onError: () => {
        setIsLoading(false);
        setHasFailed(true);
      },
    });
    gameRef.current = game;

    return () => {
      game.dispose();
      gameRef.current = null;
    };
  }, []);

  const healthPercent = hud.maxHealth > 0 ? (Math.max(0, hud.health) / hud.maxHealth) * UNITS.PERCENT : 0;
  const isHudVisible = !isLoading && !hasFailed;
  const isRacing = isHudVisible && !hud.isGameOver && !hud.isPaused;

  return (
    <div className="game-canvas-container">
      <div className="game-mount" ref={mountRef} />

      {isLoading && <div className="game-status-overlay">{HUD_TEXT.LOADING}</div>}

      {hasFailed && <div className="game-status-overlay">{HUD_TEXT.START_FAILED}</div>}

      {isHudVisible && (
        <div className="game-hud">
          <div className="game-hud-cluster">
            <div className="game-speed">
              {hud.speedKmh} {HUD_TEXT.SPEED_UNIT}
            </div>
            {!hud.isGameOver && (
              <button type="button" className="game-pause-button" onClick={() => gameRef.current?.setPaused(!hud.isPaused)}>
                {hud.isPaused ? HUD_TEXT.RESUME : HUD_TEXT.PAUSE}
              </button>
            )}
          </div>
          <div className="game-health">
            <div className="game-health-track">
              <div className="game-health-fill" style={{ width: `${healthPercent}%` }} />
            </div>
            <div className="game-health-label">
              {hud.health} / {hud.maxHealth}
            </div>
          </div>
        </div>
      )}

      {isHudVisible && hud.isPaused && !hud.isGameOver && (
        <OverlayPanel title={HUD_TEXT.PAUSED_TITLE} actionLabel={HUD_TEXT.RESUME} onAction={() => gameRef.current?.setPaused(false)} />
      )}

      {isRacing && <div className="game-touch-hint">{HUD_TEXT.TOUCH_HINT}</div>}

      {isHudVisible && hud.isGameOver && (
        <OverlayPanel title={HUD_TEXT.GAME_OVER_TITLE} actionLabel={HUD_TEXT.RETRY} onAction={() => gameRef.current?.restart()} />
      )}
    </div>
  );
};
