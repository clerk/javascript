import type { Interpolation, Theme } from '@emotion/react';

import { applyCustomCssUtilities, WithCustomCssUtilities } from './customCssUtilities';

interface ThemableCssFn<T> {
  (params: (theme: Theme) => T): Interpolation<Theme>;
  (params: T): Interpolation<Theme>;
}

/**
 * This is our abstraction over emotion's css() util, intended to replace the need
 * for the emotion/styled package. The base css() util does not accept a theme prop
 * and in many cases, TS cannot infer the correct types if not used directly inside
 * JSX. See /primitives for usage examples.
 */
export const css: ThemableCssFn<WithCustomCssUtilities<Interpolation<Theme>>> = (param): Interpolation<Theme> => {
  return (theme: Theme) => {
    return applyCustomCssUtilities(typeof param === 'function' ? param(theme) : param);
  };
};

interface StaticCssFn<T> {
  (params: T): Interpolation<Theme>;
}

/**
 * This function is only used for strict typing
 * Can be useful when creating base styles and is
 * useful for resets
 */
export const staticCss: StaticCssFn<Interpolation<Theme>> = param => {
  return param;
};
