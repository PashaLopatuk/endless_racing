import type { ITerrainConfig } from "../../types";

import manhattanSprite from "../../../assets/textures/background-sprites/manhattan.png";

export const NIGHT_CITY_TERRAIN: ITerrainConfig = {
  groundColor: 0x12151c,
  asphaltColor: 0x242a34,
  sidewalkColor: 0x34383f,
  edgeColor: 0xd4c06a,
  dashColor: 0xeae6dc,
  landscapeSprites: [
    {
      id: "manhattan",
      type: "image",
      side: "center",
      textureUrl: manhattanSprite,
      position: [0, -3.5, 235],
      width: 129,
      height: 72,
      fog: false,
      renderOrder: 10,
    },
  ],
};
