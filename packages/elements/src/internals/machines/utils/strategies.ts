export const matchStrategy = (current: string | undefined, desired: string | undefined): boolean => {
  if (!current || !desired) {
    return false;
  }

  if (current === desired) {
    return true;
  }

  return current.startsWith(`${desired}_`);
};
