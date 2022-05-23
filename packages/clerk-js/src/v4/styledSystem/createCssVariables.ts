import hash from '@emotion/hash';

let varHashId = Date.now();

export const createCssVariables = <T extends string[]>(...names: T): { [k in T[number]]: string } => {
  return Object.fromEntries(names.map(name => [name, `var(--${name}-${hash((++varHashId).toString())})`])) as any;
};
