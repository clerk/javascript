import { StyleRule } from './types';

export function createCssUtils() {
  const addCenteredFlex = (display: 'flex' | 'inline-flex') => ({
    display: display,
    justifyContent: 'center',
    alignItems: 'center',
  });

  const addIfCondition = <S extends StyleRule>(cond: boolean | undefined, obj: S): S | undefined =>
    cond ? obj : undefined;

  return { addCenteredFlex, addIfCondition };
}

export const cssutils = createCssUtils();
