import { useCallback } from "react";

import { useSoundEnabled } from "react-sounds";

import { storeSoundEnabled } from "../../game/soundEnabled";
import { GlassIconButton } from "./mainMenu/GlassIconButton";
import { VolumeOffIcon, VolumeOnIcon } from "./mainMenu/icons";

interface Props {
  buttonClassName?: string;
  variant?: "square" | "circle";
}

export const SoundToggleButton = ({
  buttonClassName,
  variant = "circle",
}: Props) => {
  const [isSoundEnabled, setSoundEnabled] = useSoundEnabled();

  const handleToggle = useCallback(() => {
    const nextEnabled = !isSoundEnabled;

    setSoundEnabled(nextEnabled);
    storeSoundEnabled(nextEnabled);
  }, [isSoundEnabled, setSoundEnabled]);

  const ariaLabel = isSoundEnabled ? "Mute sound" : "Unmute sound";
  const iconClassName = buttonClassName
    ? "game-sound-icon"
    : "glass-icon-button__icon";

  const icon = isSoundEnabled ? (
    <VolumeOnIcon className={iconClassName} />
  ) : (
    <VolumeOffIcon className={iconClassName} />
  );

  if (buttonClassName) {
    return (
      <button
        type="button"
        className={buttonClassName}
        aria-label={ariaLabel}
        onClick={handleToggle}
      >
        {icon}
      </button>
    );
  }

  return (
    <GlassIconButton ariaLabel={ariaLabel} variant={variant} onClick={handleToggle}>
      {icon}
    </GlassIconButton>
  );
};
