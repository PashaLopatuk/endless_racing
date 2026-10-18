import type { ILevelConfig } from "../../../game/levels";

import { hexColor, levelBackdropGradient, levelSkylineColors } from "./levelVisuals";

interface Props {
  level: ILevelConfig;
  className?: string;
}

export const LevelArtPreview = ({ level, className }: Props) => {
  const skyline = levelSkylineColors(level);

  return (
    <span
      className={className}
      style={{ background: levelBackdropGradient(level) }}
    >
      <span className="level-art-skyline">
        {skyline.map((color, index) => (
          <span
            key={`${level.id}-${index}`}
            className="level-art-tower"
            style={{
              backgroundColor: color,
              height: `${46 + ((index * 17) % 38)}%`,
            }}
          />
        ))}
      </span>
      <span
        className="level-art-road"
        style={{ backgroundColor: hexColor(level.terrain.asphaltColor) }}
      >
        <span
          className="level-art-lane"
          style={{ backgroundColor: hexColor(level.terrain.dashColor) }}
        />
      </span>
    </span>
  );
};
