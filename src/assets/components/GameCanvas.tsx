import { useEffect, useRef, useState } from "react";

import { HUD_TEXT } from "../../constants/hud";
import { PLAYER } from "../../game/constants/player";
import { UNITS } from "../../game/constants/world";
import { readBestScore, storeBestScore } from "../../game/bestScore";
import { createGame } from "../../game/game";
import type { ILevelConfig } from "../../game/levels";
import type { IGameController, IGameHudState } from "../../game/types";

import "./GameCanvas.css";

const INITIAL_HUD: IGameHudState = {
  speedKmh: 0,
  score: 0,
  health: PLAYER.MAX_HEALTH,
  maxHealth: PLAYER.MAX_HEALTH,
  isGameOver: false,
  isPaused: false,
};

interface IOverlayPanelProps {
  title: string;
  actionLabel: string;
  onAction: () => void;
}

const OverlayPanel = ({ title, actionLabel, onAction }: IOverlayPanelProps) => (
  <div className="game-status-overlay">
    <div className="game-over-panel">
      <h1 className="game-over-title">{title}</h1>
      <button type="button" className="game-restart-button" onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  </div>
);

interface Props {
  level: ILevelConfig;
  onExit: () => void;
}

export const GameCanvas = ({ level, onExit }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasFailed, setHasFailed] = useState(false);
  const [hud, setHud] = useState<IGameHudState>(INITIAL_HUD);
  const [bestScore, setBestScore] = useState(readBestScore);
  const mountRef = useRef<HTMLDivElement>(null);
  const bestScoreRef = useRef(bestScore);
  const gameRef = useRef<IGameController | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) {
      return;
    }

    let isEffectActive = true;

    setHasFailed(false);
    setIsLoading(true);
    setHud(INITIAL_HUD);

    const game = createGame(
      container,
      {
        onReady: () => {
          if (!isEffectActive) {
            return;
          }

          setHasFailed(false);
          setIsLoading(false);
        },
        onTick: (nextHud) => {
          if (!isEffectActive) {
            return;
          }

          setHud(nextHud);

          if (nextHud.score <= bestScoreRef.current) {
            return;
          }

          bestScoreRef.current = nextHud.score;
          storeBestScore(nextHud.score);
          setBestScore(nextHud.score);
        },
        onError: () => {
          if (!isEffectActive) {
            return;
          }

          setIsLoading(false);
          setHasFailed(true);
        },
      },
      level,
    );
    gameRef.current = game;

    return () => {
      isEffectActive = false;
      game.dispose();
      gameRef.current = null;
    };
  }, [level]);

  const healthPercent =
    hud.maxHealth > 0
      ? (Math.max(0, hud.health) / hud.maxHealth) * UNITS.PERCENT
      : 0;
  const isPaused = hud.isPaused && !hud.isGameOver;
  const isHudVisible = !isLoading && !hasFailed && !isPaused;
  return (
    <div className="game-canvas-container">
      <div className="game-mount" ref={mountRef} />

      {isLoading && (
        <div className="game-status-overlay">{HUD_TEXT.LOADING}</div>
      )}

      {hasFailed && (
        <div className="game-status-overlay">{HUD_TEXT.START_FAILED}</div>
      )}

      {isHudVisible && (
        <div className="game-hud">
          {!hud.isGameOver && (
            <button
              type="button"
              className="game-pause-button"
              aria-label={HUD_TEXT.PAUSE}
              onClick={() => gameRef.current?.setPaused(true)}
            >
              <span className="game-pause-bar" />
              <span className="game-pause-bar" />
            </button>
          )}
          <div className="game-speed">
            <span className="game-speed-value">{hud.speedKmh}</span>
            <span className="game-speed-unit">{HUD_TEXT.SPEED_UNIT}</span>
          </div>
          <div className="game-score">
            <span className="game-score-value">{hud.score}</span>
            <span className="game-score-unit">{HUD_TEXT.SCORE_UNIT}</span>
            <span className="game-score-best">
              {HUD_TEXT.BEST_SCORE} {bestScore}
            </span>
          </div>
          <div className="game-health">
            <div className="game-health-label">
              {hud.health} / {hud.maxHealth}
            </div>
            <div className="game-health-track">
              <div
                className="game-health-fill"
                style={{ width: `${healthPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {isPaused && !isLoading && !hasFailed && (
        <div className="pause-screen">
          <button
            type="button"
            className="pause-screen-resume"
            onClick={() => gameRef.current?.setPaused(false)}
          >
            <span className="pause-screen-title">{HUD_TEXT.PAUSED_TITLE}</span>
            <span className="pause-screen-hint">{HUD_TEXT.PAUSED_HINT}</span>
          </button>
          <button type="button" className="pause-screen-home" onClick={onExit}>
            {HUD_TEXT.HOME}
          </button>
        </div>
      )}

      {isHudVisible && hud.isGameOver && (
        <OverlayPanel
          title={HUD_TEXT.GAME_OVER_TITLE}
          actionLabel={HUD_TEXT.RETRY}
          onAction={() => gameRef.current?.restart()}
        />
      )}
    </div>
  );
};
