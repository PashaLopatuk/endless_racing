import { useSyncExternalStore } from "react";
import { getStorage, STORAGE_CHANGED_EVENT_NAME } from "../util/storage";

export const useStorage = (key: string) => {
  const storage = getStorage();

  return useSyncExternalStore(
    (onStoreChanged) => {
      window.addEventListener(STORAGE_CHANGED_EVENT_NAME, onStoreChanged);

      return () => {
        window.removeEventListener(STORAGE_CHANGED_EVENT_NAME, onStoreChanged);
      };
    },
    () => {
      return storage.getItem(key);
    },
  );
};
