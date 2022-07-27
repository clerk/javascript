// eslint-disable-next-line no-restricted-imports

const varHashId = Date.now();

export const createCssVariables = <T extends string[]>(...names: T): { [k in T[number]]: string } => {
  return Object.fromEntries(names.map(name => [name, `var(--${name})`])) as any;
};
