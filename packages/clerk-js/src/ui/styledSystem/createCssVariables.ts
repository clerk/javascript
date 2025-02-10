import { fromEntries } from '../utils/fromEntries';

export const createCssVariables = <T extends string[]>(...names: T): { [k in T[number]]: string } => {
  return fromEntries(names.map(name => [name, `var(--${name})`]));
};
