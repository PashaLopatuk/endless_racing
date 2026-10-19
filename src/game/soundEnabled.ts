import { getStorage } from "../util/storage";

const SOUND_ENABLED_KEY = "endless-racing-sound-enabled";
const LEGACY_SOUND_ENABLED_KEY = "react-sounds-enabled";

export const readSoundEnabled = (): boolean => {
  try {
    const storage = getStorage();
    const stored = storage.getItem(SOUND_ENABLED_KEY);

    if (stored !== null) {
      return stored !== "false";
    }

    const legacy = storage.getItem(LEGACY_SOUND_ENABLED_KEY);

    if (legacy !== null) {
      return legacy !== "false";
    }

    return true;
  } catch {
    return true;
  }
};

export const storeSoundEnabled = (enabled: boolean): void => {
  try {
    const storage = getStorage();

    storage.setItem(SOUND_ENABLED_KEY, enabled ? "true" : "false");
  } catch {
    // Private browsing can block storage; sound still toggles for this session.
  }
};
