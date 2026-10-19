import { getIsWeb } from "./platform";

export interface IStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const getStorage = (): IStorage => {
  if (getIsWeb()) {
    return window.localStorage;
  }

  return window.localStorage;
};
