import { getStorage } from "../util/storage";
import { LEVELS } from "./levels";

const SELECTED_LEVEL_KEY = "endless-racing-selected-level";

const isKnownLevelId = (levelId: string): boolean =>
  LEVELS.some((level) => level.id === levelId);

export const readSelectedLevelId = (): string | null => {
  try {
    const storage = getStorage();

    const levelId = storage.getItem(SELECTED_LEVEL_KEY);

    if (!levelId || !isKnownLevelId(levelId)) {
      return null;
    }

    return levelId;
  } catch {
    return null;
  }
};

export const storeSelectedLevelId = (levelId: string): void => {
  try {
    if (!isKnownLevelId(levelId)) {
      return;
    }

    const storage = getStorage();

    storage.setItem(SELECTED_LEVEL_KEY, levelId);
  } catch {
    // Private browsing can block storage; menu still works for this session.
  }
};

export const getInitialMenuLevelIndex = (): number => {
  const levelId = readSelectedLevelId();

  if (!levelId) {
    return 0;
  }

  const index = LEVELS.findIndex((level) => level.id === levelId);

  return index >= 0 ? index : 0;
};
