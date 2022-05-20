import type { Interpolation, Theme } from '@emotion/react';

import type { StaticCssFn, ThemableCssFn } from './types';

/**
 *  Add any custom helpers here. These will be expanded and applied on the element
 *  during render.
 */
const utils = [
  ['px', (value: any) => ({ paddingLeft: value, paddingRight: value })],
  ['py', (value: any) => ({ paddingTop: value, paddingBottom: value })],
  ['mx', (value: any) => ({ marginTop: value, marginBottom: value })],
  ['my', (value: any) => ({ marginTop: value, marginBottom: value })],
] as const;

type UtilKeys = typeof utils[number][0];

type CssUtils = {
  [k in UtilKeys]?: string | number;
};

type WithUtils<T> = T & CssUtils;

/**
 * This is our abstraction over emotion's css() util, intended to replace the need
 * for the emotion/styled package. The base css() util does not accept a theme prop
 * and in many cases, TS cannot infer the correct types if not used directly inside
 * JSX. See /primitives for usage examples.
 */
const css: ThemableCssFn<WithUtils<Interpolation<Theme>>> = (param): Interpolation<Theme> => {
  return (theme: Theme) => {
    let result = typeof param === 'function' ? param(theme) : param;
    if (!!result && typeof result === 'object') {
      result = { ...result };
      for (const [name, fn] of utils) {
        if (name in result) {
          result = { ...result, ...fn(result[name as keyof typeof result]) };
        }
      }
    }
    return result;
  };
};

/**
 * This function is only used for strict typing
 * Can be useful when creating base styles and is
 * useful for resets
 */
const staticCss: StaticCssFn<Interpolation<Theme>> = param => {
  return param;
};

export { css, staticCss };
export type { CssUtils };
