import type { Interpolation, SerializedStyles, Theme } from '@emotion/react';
import { css as _css } from '@emotion/react';

type ThemedCallback = (theme: Theme) => Interpolation<Theme>;
interface ThemedCss {
  (params: ThemedCallback): Interpolation<Theme>;
  (params: Interpolation<Theme>): Interpolation<Theme>;
  (params: TemplateStringsArray): SerializedStyles;
}

/*
  This is our abstraction over emotion's css() util, intended to replace the need
  for the emotion/styled package. The base css() util does not accept a theme prop
  and in many cases, TS cannot infer the correct types if not used directly inside
  JSX. See /primitives for usage examples
 */
// @ts-expect-error
export const css: ThemedCss = (param): Interpolation<Theme> | SerializedStyles => {
  return (theme: Theme) => {
    if (typeof param === 'function') {
      return param(theme);
    }
    if (typeof param === 'string') {
      return param;
    }
    // @ts-expect-error
    return _css(param);
  };
};
