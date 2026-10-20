import { useEffect, useRef, useState } from "react";
import { MainSynthwaveTheme } from "./assets/audio";
import { GameCanvas } from "./assets/components/GameCanvas";
import { getLevelConfig } from "./game/levels";
import { MainMenu } from "./assets/components/mainMenu/MainMenu";
import { useSound } from "react-sounds";
import { SOUND_ENABLED_KEY } from "./game/soundEnabled";
import { useStorage } from "./lib/useStorage";

export const Game = () => {
  const [activeLevelId, setActiveLevelId] = useState<string | null>(null);
  const storedSoundSetting = useStorage(SOUND_ENABLED_KEY);
  const isSoundEnabled = storedSoundSetting !== "false";

  const soundEnabledRef = useRef(isSoundEnabled);
  const mainTheme = useSound(MainSynthwaveTheme, { loop: true });
  const mainThemeRef = useRef(mainTheme);

  useEffect(() => {
    soundEnabledRef.current = isSoundEnabled;
    mainThemeRef.current = mainTheme;
  }, [isSoundEnabled, mainTheme]);

  useEffect(() => {
    if (!isSoundEnabled) {
      if (mainThemeRef.current.isPlaying) {
        mainThemeRef.current.pause();
      }
      return;
    }

    if (!mainThemeRef.current.isPlaying) {
      mainThemeRef.current.play().catch(() => {
        // Autoplay policy may block playing until user gesture
      });
    }
  }, [isSoundEnabled]);

  // Window interaction and visibility listeners
  useEffect(() => {
    const startAudioOnFirstClick = () => {
      if (soundEnabledRef.current && !mainThemeRef.current.isPlaying) {
        mainThemeRef.current.play().catch(() => {});
      }
    };

    const handleBlur = () => {
      if (soundEnabledRef.current && mainThemeRef.current.isPlaying) {
        mainThemeRef.current.pause();
      }
    };

    const handleFocus = () => {
      if (soundEnabledRef.current && !mainThemeRef.current.isPlaying) {
        mainThemeRef.current.resume();
      }
    };

    window.addEventListener("click", startAudioOnFirstClick, { once: true });
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("click", startAudioOnFirstClick);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <div className="app-shell">
      {activeLevelId ? (
        <GameCanvas
          level={getLevelConfig(activeLevelId)}
          onExit={() => setActiveLevelId(null)}
        />
      ) : (
        <MainMenu onSelectLevel={setActiveLevelId} />
      )}
    </div>
  );
};
