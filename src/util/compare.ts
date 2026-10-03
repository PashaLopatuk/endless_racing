import { getObjectKeys } from "./object";

export const compareObjects = <TObj extends object>(objA: TObj, objB: TObj) => {
  return getObjectKeys(objA).every((key) => objA[key] === objB[key]);
};
