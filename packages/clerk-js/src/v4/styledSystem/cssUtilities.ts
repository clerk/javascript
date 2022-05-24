import { StyleRule, Theme } from './types';

export function createCssUtils<T extends Theme = Theme>() {
  const addCenteredFlex = (display: 'flex' | 'inline-flex') => ({
    display: display,
    justifyContent: 'center',
    alignItems: 'center',
  });

  const addFocusRing = (theme: T) => ({
    '&:focus': {
      '&::-moz-focus-inner': { border: '0' },
      WebkitTapHighlightColor: 'transparent',
      outline: 'none',
      outlineOffset: '0',
      boxShadow: theme.shadows.$focusRing,
      transitionProperty: theme.transitionProperty.$common,
      transitionTimingFunction: theme.transitionTiming.$common,
      transitionDuration: theme.transitionDuration.$focusRing,
      // TODO: Remove if not needed
      // "&[type*='text']": {
      //   borderColor: '$color !important',
      //   boxShadow: 'none !important',
      // },
    },
  });

  const addIfCondition = <S extends StyleRule>(cond: boolean | undefined, obj: S): S | undefined =>
    cond ? obj : undefined;

  return { addCenteredFlex, addFocusRing, addIfCondition };
}

export const cssutils = createCssUtils();
