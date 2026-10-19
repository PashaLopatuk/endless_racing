import { getStorage } from "../util/storage";

const BEST_SCORE_KEY = "endless-racing-best-score";

export const readBestScore = (): number => {
  try {
    const storage = getStorage();
    const value = Number(storage.getItem(BEST_SCORE_KEY));

    if (!Number.isFinite(value) || value <= 0) {
      return 0;
    }

    return Math.floor(value);
  } catch {
    return 0;
  }
};

export const storeBestScore = (score: number): void => {
  try {
    const storage = getStorage();

    storage.setItem(BEST_SCORE_KEY, String(Math.floor(score)));
  } catch {
    // Private browsing can block storage; the current run still shows the score.
  }
};
