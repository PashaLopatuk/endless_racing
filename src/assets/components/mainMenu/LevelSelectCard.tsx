import type { ILevelConfig } from "../../../game/levels";

import { LevelArtPreview } from "./LevelArtPreview";
import type { IMenuLevelMeta } from "./menuLevelMeta";

interface Props {
  level: ILevelConfig;
  meta: IMenuLevelMeta;
  index: number;
  isSelected: boolean;
  bestScore: number;
  onSelect: () => void;
}

const formatRecord = (bestScore: number): string =>
  bestScore > 0 ? `${bestScore} M` : "—";

export const LevelSelectCard = ({
  level,
  meta,
  index,
  isSelected,
  bestScore,
  onSelect,
}: Props) => (
  <button
    type="button"
    className={`level-select-card${isSelected ? " level-select-card--selected" : ""}`}
    data-track-index={index}
    onClick={onSelect}
  >
    <span className="level-select-card__hero">
      <LevelArtPreview level={level} className="level-art-preview level-art-preview--card" />
      <span className="level-select-card__hero-gradient" />
      <span className="level-select-card__badges">
        <span
          className={`level-select-card__biome level-select-card__biome--${meta.biomeAccent}`}
        >
          {meta.biomeTag}
        </span>
        <span className="level-select-card__rating">{meta.rating}</span>
      </span>
      <span
        className={`level-select-card__status${isSelected ? " level-select-card__status--current" : ""}`}
      >
        {isSelected ? "CURRENT" : "AVAILABLE"}
      </span>
      <span className="level-select-card__headline">
        <span>
          <span className="level-select-card__name">{meta.displayName}</span>
          <span className="level-select-card__route">
            {meta.subtitle} // {meta.distanceLabel}
          </span>
        </span>
        <span className="level-select-card__record-block">
          <span className="level-select-card__record-label">BEST</span>
          <span className="level-select-card__record-value">
            {formatRecord(bestScore)}
          </span>
        </span>
      </span>
    </span>

    <span className="level-select-card__footer">
      <span className="level-select-card__stats">
        <span>
          HAZARD:{" "}
          <strong className={`level-select-card__hazard--${meta.hazardTone}`}>
            {meta.hazard}
          </strong>
        </span>
        <span>
          CORNERS: <strong>{meta.corners}</strong>
        </span>
        <span>
          SURFACE: <strong>{meta.surface}</strong>
        </span>
      </span>
      <span
        className={`level-select-card__action${isSelected ? " level-select-card__action--selected" : ""}`}
      >
        {isSelected ? "SELECTED" : "SELECT"}
      </span>
    </span>
  </button>
);
