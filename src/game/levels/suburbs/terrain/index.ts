import type { ITerrainConfig } from "../../types";
import dtlaSprite from "../../../assets/textures/background-sprites/dtla_sprite.png";

export const SUBURBS_TERRAIN: ITerrainConfig = {
  groundColor: 0x526a40,
  asphaltColor: 0x383436,
  sidewalkColor: 0xd0c4b6,
  edgeColor: 0xf2cc5c,
  dashColor: 0xf6f2ec,
  park: {
    replaceBuildingChance: 0.28,
    nearInset: 5.1,
    grassColor: 0x567844,
    grassAccentColor: 0x4a6a3a,
    pathColor: 0xd2c6b4,
    borderColor: 0x8a7c72,
    benchColor: 0x5a4234,
    shrubColor: 0x3e5e34,
  },
  landscapeSprites: [
    {
      id: "dtla-skyline",
      type: "image",
      side: "center",
      textureUrl: dtlaSprite,
      position: [0, -3.5, 235],
      width: 86,
      height: 48,
      fog: true,
      renderOrder: 10,
    },
    {
      id: "left-mountain",
      type: "model",
      side: "left",
      model: "mountain",
      position: [-90, -3.5, 260],
      scale: [1.5, 1.25, 1.35],
      renderOrder: 1,
      options: {
        color: 0xbf7468,
        showHollywoodSign: false,
      },
    },
    {
      id: "right-mountain",
      type: "model",
      side: "right",
      model: "hollywood_mountain",
      position: [90, -3.5, 260],
      scale: [1.5, 1.25, 1.35],
      renderOrder: 1,
      options: {
        color: 0xbf7468,
        showHollywoodSign: true,
      },
    },
  ],
};
