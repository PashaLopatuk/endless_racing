import type { ILevelConfig } from "../../../game/levels";

export const hexColor = (value: number): string =>
  `#${value.toString(16).padStart(6, "0")}`;

export const unitColor = (channels: readonly [number, number, number]): string => {
  const [red, green, blue] = channels.map((channel) =>
    Math.round(channel * 255),
  );

  return `rgb(${red} ${green} ${blue})`;
};

export const levelBackdropGradient = (level: ILevelConfig): string => {
  const top = unitColor(level.palette.zenith);
  const mid = unitColor(level.palette.horizon);
  const ground = hexColor(level.terrain.groundColor);

  return `linear-gradient(180deg, ${top} 0%, ${mid} 42%, ${ground} 100%)`;
};

export const levelSkylineColors = (level: ILevelConfig): string[] =>
  level.buildings.buildings.map(
    (building) => hexColor(building.wallColors[0] ?? level.palette.skyColor),
  );
