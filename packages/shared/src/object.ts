export const without = <T extends object, P extends keyof T>(obj: T, ...props: P[]): Omit<T, P> => {
  const copy = { ...obj };
  for (const prop of props) {
    delete copy[prop];
  }
  return copy;
};

export const removeUndefined = <T extends object>(obj: T): Partial<T> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
};

export const applyFunctionToObj = <T extends Record<string, any>, R>(
  obj: T,
  fn: (val: any, key: string) => R,
): Record<string, R> => {
  const result = {} as Record<string, R>;
  for (const key in obj) {
    result[key] = fn(obj[key], key);
  }
  return result;
};

export const filterProps = <T extends Record<string, any>>(obj: T, filter: (a: any) => boolean): T => {
  const result = {} as T;
  for (const key in obj) {
    if (obj[key] && filter(obj[key])) {
      result[key] = obj[key];
    }
  }
  return result;
};
