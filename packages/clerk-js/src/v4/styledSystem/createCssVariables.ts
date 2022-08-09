// eslint-disable-next-line no-restricted-imports

import { fromEntries } from '../utils';

const varHashId = Date.now();

export const createCssVariables = <T extends string[]>(...names: T): { [k in T[number]]: string } => {
  return fromEntries(names.map(name => [name, `var(--${name})`]));
};
