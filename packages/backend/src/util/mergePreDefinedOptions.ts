export function mergePreDefinedOptions<T extends Record<string, any>>(preDefinedOptions: T, options: Partial<T>): T {
  return Object.keys(preDefinedOptions).reduce(
    (obj: T, key: string) => {
      return { ...obj, [key]: options[key] || obj[key] };
    },
    { ...preDefinedOptions },
  );
}
