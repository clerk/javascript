import { Interpolation, Theme } from '@emotion/react';

/**
 *  Add any custom helpers here. These will be expanded and applied on the element
 *  during render.
 */
const CUSTOM_CSS_UTILITIES = [
  ['px', (value: any) => ({ paddingLeft: value, paddingRight: value })],
  ['py', (value: any) => ({ paddingTop: value, paddingBottom: value })],
  ['mx', (value: any) => ({ marginTop: value, marginBottom: value })],
  ['my', (value: any) => ({ marginTop: value, marginBottom: value })],
] as const;

type CustomCssUtilityKey = typeof CUSTOM_CSS_UTILITIES[number][0];

type CustomCssUtilities = {
  [k in CustomCssUtilityKey]?: string | number;
};

export type WithCustomCssUtilities<T> = T & CustomCssUtilities;

export const applyCustomCssUtilities = (interpolation: Interpolation<Theme>, utils = CUSTOM_CSS_UTILITIES) => {
  if (!interpolation || typeof interpolation !== 'object') {
    return interpolation;
  }
  const res = { ...interpolation };
  for (const [shorthand, utilFn] of utils) {
    if (shorthand in res) {
      Object.assign(res, utilFn(res[shorthand as keyof typeof res]));
    }
  }
  return res;
};
