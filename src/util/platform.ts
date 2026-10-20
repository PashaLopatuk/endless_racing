export const getIsWeb = () => {
  return true;
};

export const getIsAndroid = (): boolean => {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /android/i.test(navigator.userAgent);
};
