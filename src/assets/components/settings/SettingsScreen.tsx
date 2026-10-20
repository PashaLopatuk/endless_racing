import { useCallback } from "react";
import { useSoundEnabled } from "react-sounds";

import {
  DYNAMIC_LIGHTS_ENABLED_KEY,
  getDefaultDynamicLightsEnabled,
  storeDynamicLightsEnabled,
} from "../../../game/settings";
import { storeSoundEnabled } from "../../../game/soundEnabled";
import { useStorage } from "../../../lib/useStorage";
import { GlassIconButton } from "../mainMenu/GlassIconButton";
import { CloseIcon, SettingsIcon } from "../mainMenu/icons";

import "./SettingsScreen.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsScreen = ({ isOpen, onClose }: Props) => {
  const storedDynamicLights = useStorage(DYNAMIC_LIGHTS_ENABLED_KEY);
  const isDynamicLightsEnabled =
    storedDynamicLights !== null
      ? storedDynamicLights === "true"
      : getDefaultDynamicLightsEnabled();

  const [isSoundEnabled, setSoundEnabled] = useSoundEnabled();

  const handleToggleDynamicLights = useCallback(() => {
    const nextValue = !isDynamicLightsEnabled;
    storeDynamicLightsEnabled(nextValue);
  }, [isDynamicLightsEnabled]);

  const handleToggleSound = useCallback(() => {
    const nextValue = !isSoundEnabled;
    setSoundEnabled(nextValue);
    storeSoundEnabled(nextValue);
  }, [isSoundEnabled, setSoundEnabled]);

  return (
    <div
      className={`settings-screen${isOpen ? " settings-screen--open" : ""}`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-label="Settings"
    >
      <div className="settings-screen__header">
        <div className="settings-screen__title-block">
          <span className="settings-screen__title-icon">
            <SettingsIcon className="settings-screen__icon-svg" />
          </span>
          <span>
            <h2 className="settings-screen__title">SYSTEM SETTINGS</h2>
            <p className="settings-screen__subtitle">
              CONFIG // GRAPHICS &amp; AUDIO
            </p>
          </span>
        </div>

        <GlassIconButton
          ariaLabel="Close settings"
          variant="circle"
          onClick={onClose}
        >
          <CloseIcon className="glass-icon-button__icon" />
        </GlassIconButton>
      </div>

      <div className="settings-screen__content">
        <div className="settings-card">
          <div className="settings-card__info">
            <div className="settings-card__header">
              <h3 className="settings-card__title">DYNAMIC LIGHTS</h3>
              <span className="settings-card__badge settings-card__badge--perf">
                Performance
              </span>
            </div>
            <p className="settings-card__desc">
              Real-time spotlights and ground illumination for vehicle
              headlights.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isDynamicLightsEnabled}
            aria-label="Toggle dynamic lights"
            className={`settings-switch${isDynamicLightsEnabled ? " settings-switch--active" : ""}`}
            onClick={handleToggleDynamicLights}
          >
            <span className="settings-switch__thumb" />
          </button>
        </div>

        {/* Audio Setting */}
        <div className="settings-card">
          <div className="settings-card__info">
            <div className="settings-card__header">
              <h3 className="settings-card__title">SOUND &amp; MUSIC</h3>
            </div>
            <p className="settings-card__desc">
              Enable synthwave soundtrack and dynamic vehicle audio effects.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isSoundEnabled}
            aria-label="Toggle sound and music"
            className={`settings-switch${isSoundEnabled ? " settings-switch--active" : ""}`}
            onClick={handleToggleSound}
          >
            <span className="settings-switch__thumb" />
          </button>
        </div>
      </div>

      <div className="settings-screen__footer">
        <button
          type="button"
          className="settings-screen__close-button"
          onClick={onClose}
        >
          BACK
        </button>
      </div>
    </div>
  );
};
