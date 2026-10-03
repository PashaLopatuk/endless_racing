export const getObjectKeys = <TObj extends object, TKeys = (keyof TObj)[]>(
  obj: TObj,
): TKeys => {
  return Object.keys(obj) as TKeys;
};
