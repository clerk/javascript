import type { InternalTheme, InternalThemeFoundations } from './defaultFoundations';

export const createInternalTheme = (foundations: InternalThemeFoundations): InternalTheme => {
  const res = {} as any;
  const base = foundations as any;
  for (const scale in base) {
    res[scale] = {};
    for (const shade in base[scale]) {
      res[scale]['$' + shade] = base[scale][shade];
    }
  }
  return Object.freeze(res);
};
