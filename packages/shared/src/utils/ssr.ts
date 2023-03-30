export const inClientSide = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};
