import { LEVELS, type ILevelConfig } from "../../../game/levels";
import { readBestScore } from "../../../game/bestScore";

import { CloseIcon, MapIcon } from "./icons";
import { LevelSelectCard } from "./LevelSelectCard";
import { getMenuLevelMeta } from "./menuLevelMeta";
import { GlassIconButton } from "./GlassIconButton";

interface Props {
  isOpen: boolean;
  selectedIndex: number;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  onConfirmRace: () => void;
}

const selectedLabel = (level: ILevelConfig): string => {
  const meta = getMenuLevelMeta(level.id);

  return `${meta.displayName} (${meta.subtitle})`;
};

export const LevelSelectScreen = ({
  isOpen,
  selectedIndex,
  onClose,
  onSelectIndex,
  onConfirmRace,
}: Props) => {
  const selectedLevel = LEVELS[selectedIndex];
  const bestScore = readBestScore();

  return (
    <div
      className={`level-select-screen${isOpen ? " level-select-screen--open" : ""}`}
      aria-hidden={!isOpen}
    >
      <div className="level-select-screen__header">
        <div className="level-select-screen__title-block">
          <span className="level-select-screen__title-icon">
            <MapIcon className="level-select-screen__map-icon" />
          </span>
          <span>
            <h2 className="level-select-screen__title">WORLD TOUR CIRCUITS</h2>
            <p className="level-select-screen__subtitle">
              SELECT BIOME // {LEVELS.length} CHAMPIONSHIPS
            </p>
          </span>
        </div>

        <GlassIconButton
          ariaLabel="Close level selector"
          variant="circle"
          onClick={onClose}
        >
          <CloseIcon className="glass-icon-button__icon" />
        </GlassIconButton>
      </div>

      <div className="level-select-screen__list">
        {LEVELS.map((level, index) => (
          <LevelSelectCard
            key={level.id}
            level={level}
            meta={getMenuLevelMeta(level.id)}
            index={index}
            isSelected={index === selectedIndex}
            bestScore={bestScore}
            onSelect={() => onSelectIndex(index)}
          />
        ))}
      </div>

      <div className="level-select-screen__footer">
        <p className="level-select-screen__selected">
          SELECTED:{" "}
          <span className="level-select-screen__selected-name">
            {selectedLevel ? selectedLabel(selectedLevel) : "—"}
          </span>
        </p>
        <button
          type="button"
          className="level-select-screen__confirm"
          onClick={onConfirmRace}
        >
          CONFIRM &amp; RACE
        </button>
      </div>
    </div>
  );
};
