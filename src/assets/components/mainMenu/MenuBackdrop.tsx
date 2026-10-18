import type { ILevelConfig } from "../../../game/levels";

import { levelBackdropGradient } from "./levelVisuals";

interface Props {
  level: ILevelConfig;
}

export const MenuBackdrop = ({ level }: Props) => (
  <div className="menu-backdrop" aria-hidden="true">
    <div
      className="menu-backdrop-image"
      style={{ background: levelBackdropGradient(level) }}
    />
    <div className="menu-backdrop-vignette" />
    <div className="menu-backdrop-scanlines" />
    <div className="menu-backdrop-ring" />
  </div>
);
