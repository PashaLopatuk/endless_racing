import { SoundToggleButton } from "../SoundToggleButton";
import { GlassIconButton } from "./GlassIconButton";
import { MenuIcon, SettingsIcon } from "./icons";

interface Props {
  tierLabel: string;
  onOpenLevelSelect: () => void;
  onOpenSettings?: () => void;
}

export const MenuTopBar = ({
  tierLabel,
  onOpenLevelSelect,
  onOpenSettings,
}: Props) => (
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

    <div className="menu-top-bar__actions">
      {onOpenSettings && (
        <GlassIconButton
          ariaLabel="Open settings"
          variant="circle"
          onClick={onOpenSettings}
        >
          <SettingsIcon className="glass-icon-button__icon" />
        </GlassIconButton>
      )}
      <SoundToggleButton />
    </div>
  </header>
);
