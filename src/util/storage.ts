import { getIsWeb } from "./platform";

export interface IStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const STORAGE_CHANGED_EVENT_NAME = "storage-changed";

const dispatchStorageChangeEvent = (key: string, value: string) => {
  window.dispatchEvent(
    new CustomEvent(STORAGE_CHANGED_EVENT_NAME, {
      detail: {
        key,
        value,
      },
    }),
  );
};

const LocalStorageAdapter: IStorage = {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => {
    dispatchStorageChangeEvent(key, value);

    return localStorage.setItem(key, value);
  },
};

export const getStorage = (): IStorage => {
  if (getIsWeb()) {
    return LocalStorageAdapter;
  }

  return LocalStorageAdapter;
};
