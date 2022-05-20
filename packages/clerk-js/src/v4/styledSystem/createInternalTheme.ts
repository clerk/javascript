type PrefixWith<K extends string, T> = `${K}${Extract<T, boolean | number | string>}`;

type ThemeWithPrefix<Theme> = {
  [scale in keyof Theme]: {
    [token in keyof Theme[scale] as PrefixWith<'$', token>]: Theme[scale][token];
  };
};

const createInternalTheme = <T extends Record<string, any>>(theme: T): ThemeWithPrefix<Readonly<T>> => {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(theme).map(([scale, values]) => [
        scale,
        Object.fromEntries(Object.entries(values).map(([name, value]) => [`$${name}`, value])),
      ]),
    ) as any,
  );
};

export { createInternalTheme };
