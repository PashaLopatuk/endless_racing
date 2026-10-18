import { LEVELS } from "../../game/levels";
import type { ILevelConfig } from "../../game/levels";

import "./MainMenu.css";

interface Props {
  onSelectLevel: (levelId: string) => void;
}

const hexColor = (value: number): string =>
  `#${value.toString(16).padStart(6, "0")}`;

const unitColor = (channels: readonly [number, number, number]): string => {
  const [red, green, blue] = channels.map((channel) =>
    Math.round(channel * 255),
  );

  return `rgb(${red} ${green} ${blue})`;
};

const LevelCard = ({
  level,
  onSelect,
}: {
  level: ILevelConfig;
  onSelect: () => void;
}) => {
  const skyline = level.buildings.buildings.map((building) => ({
    id: building.id,
    color: hexColor(building.wallColors[0] ?? level.palette.skyColor),
  }));

  return (
    <li className="level-card">
      <button type="button" className="level-card-button" onClick={onSelect}>
        <span
          className="level-card-preview"
          style={{
            background: `linear-gradient(180deg, ${unitColor(level.palette.zenith)} 0%, ${unitColor(level.palette.horizon)} 58%, ${hexColor(level.terrain.groundColor)} 100%)`,
          }}
        >
          <span className="level-card-skyline">
            {skyline.map((building, index) => (
              <span
                key={building.id}
                className="level-card-tower"
                style={{
                  backgroundColor: building.color,
                  height: `${46 + ((index * 17) % 38)}%`,
                }}
              />
            ))}
          </span>
          <span
            className="level-card-road"
            style={{ backgroundColor: hexColor(level.terrain.asphaltColor) }}
          >
            <span
              className="level-card-lane"
              style={{ backgroundColor: hexColor(level.terrain.dashColor) }}
            />
          </span>
        </span>
        <span className="level-card-caption">
          <span className="level-card-name">{level.name}</span>
          <span className="level-card-action">Start</span>
        </span>
      </button>
    </li>
  );
};

export const MainMenu = ({ onSelectLevel }: Props) => (
  <div className="main-menu-container">
    <header className="main-menu-header">
      <p className="main-menu-kicker">Endless</p>
      <h1 className="main-menu-title">Choose a city</h1>
    </header>
    <ul className="level-gallery">
      {LEVELS.map((level) => (
        <LevelCard
          key={level.id}
          level={level}
          onSelect={() => onSelectLevel(level.id)}
        />
      ))}
    </ul>
  </div>
);
