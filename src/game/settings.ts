import { getStorage } from "../util/storage";
import { getIsAndroid } from "../util/platform";

export const DYNAMIC_LIGHTS_ENABLED_KEY = "dynamic-lights-enabled";

export const getDefaultDynamicLightsEnabled = (): boolean => {
  return !getIsAndroid();
};

export const readDynamicLightsEnabled = (): boolean => {
  try {
    const storage = getStorage();
    const stored = storage.getItem(DYNAMIC_LIGHTS_ENABLED_KEY);

    if (stored !== null) {
      return stored === "true";
    }

    return getDefaultDynamicLightsEnabled();
  } catch {
    return getDefaultDynamicLightsEnabled();
  }
};

export const storeDynamicLightsEnabled = (enabled: boolean): void => {
  try {
    const storage = getStorage();
    storage.setItem(DYNAMIC_LIGHTS_ENABLED_KEY, enabled ? "true" : "false");
  } catch {
    // Private browsing can block storage; setting still applies in memory
  }
};
