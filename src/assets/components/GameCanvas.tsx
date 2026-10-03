import { useEffect, useRef, useState } from "react";

import { createGame } from "../../game/game";
import type { GameController, GameHudState } from "../../game/type";

import "./GameCanvas.css";

const INITIAL_HUD: GameHudState = {
  speedKmh: 0,
  health: 100,
  maxHealth: 100,
  isGameOver: false,
  isPaused: false,
};

export const GameCanvas = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameController | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [hud, setHud] = useState<GameHudState>(INITIAL_HUD);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) {
      return;
    }

    const game = createGame(container, {
      onReady: () => {
        setIsLoading(false);
      },
      onTick: (state) => {
        setHud((previous) => {
          if (
            previous.speedKmh === state.speedKmh &&
            previous.health === state.health &&
            previous.isGameOver === state.isGameOver &&
            previous.isPaused === state.isPaused
          ) {
            return previous;
          }
          return state;
        });
      },
      onError: () => {
        setIsLoading(false);
        setErrorMessage("The city could not be started.");
      },
    });
    gameRef.current = game;

    return () => {
      game.dispose();
      gameRef.current = null;
    };
  }, []);

  const healthRatio = hud.maxHealth > 0 ? Math.max(0, hud.health) / hud.maxHealth : 0;
  const showHud = !isLoading && errorMessage.length === 0;

  return (
    <div className="game-canvas-container">
      <div className="game-mount" ref={mountRef} />

      {isLoading && <div className="game-status-overlay">Loading city...</div>}

      {errorMessage.length > 0 && <div className="game-status-overlay">{errorMessage}</div>}

      {showHud && (
        <div className="game-hud">
          <div className="game-hud-cluster">
            <div className="game-speed">{hud.speedKmh} km/h</div>
            {!hud.isGameOver && (
              <button
                type="button"
                className="game-pause-button"
                onClick={() => {
                  gameRef.current?.setPaused(!hud.isPaused);
                }}
              >
                {hud.isPaused ? "Resume" : "Pause"}
              </button>
            )}
          </div>
          <div className="game-health">
            <div className="game-health-track">
              <div className="game-health-fill" style={{ width: `${healthRatio * 100}%` }} />
            </div>
            <div className="game-health-label">
              {hud.health} / {hud.maxHealth}
            </div>
          </div>
        </div>
      )}

      {showHud && hud.isPaused && !hud.isGameOver && (
        <div className="game-status-overlay">
          <div className="game-over-panel">
            <h1 className="game-over-title">Paused</h1>
            <button
              type="button"
              className="game-restart-button"
              onClick={() => {
                gameRef.current?.setPaused(false);
              }}
            >
              Resume
            </button>
          </div>
        </div>
      )}

      {showHud && !hud.isGameOver && !hud.isPaused && (
        <div className="game-touch-hint">Drag the lower half of the screen. Sideways steers, up and down sets speed.</div>
      )}

      {showHud && hud.isGameOver && (
        <div className="game-status-overlay">
          <div className="game-over-panel">
            <h1 className="game-over-title">Game over</h1>
            <button
              type="button"
              className="game-restart-button"
              onClick={() => {
                gameRef.current?.restart();
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
