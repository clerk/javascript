export const without = <T extends object, P extends keyof T>(obj: T, ...props: P[]): Omit<T, P> => {
  const copy = { ...obj };
  for (const prop of props) {
    delete copy[prop];
  }
  return copy;
};
