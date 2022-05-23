import { applyCustomCssUtilities, WithCustomCssUtilities } from './customCssUtilities';
import type { StyleRule, Theme } from './types';

interface ThemableCssFn<T> {
  // This is a duplicate definition to help with IDE intellisense
  (params: (theme: Theme) => T): StyleRule;
  (params: ((theme: Theme) => T) | T): StyleRule;
}

/**
 * This is our abstraction over emotion's css() util, intended to replace the need
 * for the emotion/styled package. The base css() util does not accept a theme prop
 * and in many cases, TS cannot infer the correct types if not used directly inside
 * JSX. See /primitives for usage examples.
 */
export const css: ThemableCssFn<WithCustomCssUtilities<StyleRule>> = (param): StyleRule => {
  return (theme: Theme) => {
    const res = { ...(typeof param === 'function' ? param(theme) : param) };
    applyCustomCssUtilities(res);
    return res;
  };
};

interface StaticCssFn<T> {
  (params: T): StyleRule;
}

/**
 * This function is only used for strict typing
 * Can be useful when creating base styles and is
 * useful for resets
 */
export const staticCss: StaticCssFn<StyleRule> = param => {
  return param;
};
