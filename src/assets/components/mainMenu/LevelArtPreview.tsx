import type { ILevelConfig } from "../../../game/levels";

import { levelMainColor } from "./levelVisuals";

interface Props {
  level: ILevelConfig;
  className?: string;
}

export const LevelArtPreview = ({ level, className }: Props) => (
  <span
    className={className}
    style={{ backgroundColor: levelMainColor(level) }}
    aria-hidden="true"
  />
);
