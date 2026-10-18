import { GlassIconButton } from "./GlassIconButton";
import { MenuIcon, SettingsIcon } from "./icons";

interface Props {
  tierLabel: string;
  onOpenLevelSelect: () => void;
}

export const MenuTopBar = ({ tierLabel, onOpenLevelSelect }: Props) => (
  <header className="menu-top-bar">
    <GlassIconButton
      ariaLabel="Open level selector"
      variant="square"
      onClick={onOpenLevelSelect}
    >
      <MenuIcon className="glass-icon-button__icon" />
    </GlassIconButton>

    <div className="menu-top-bar__center">
      <div className="menu-tier-pill">
        <span className="menu-tier-pill__dot" />
        <span className="menu-tier-pill__label">{tierLabel}</span>
      </div>
    </div>

    <GlassIconButton ariaLabel="Settings and audio" variant="circle">
      <SettingsIcon className="glass-icon-button__icon" />
    </GlassIconButton>
  </header>
);
