import { Interpolation as _Interpolation, Theme as _Theme } from '@emotion/react';
import React from 'react';

import { WithCustomCssUtilities } from './customCssUtilities';

type ElementProps = {
  div: React.HTMLAttributes<HTMLDivElement>;
  input: React.HTMLAttributes<HTMLInputElement>;
  button: React.HTMLAttributes<HTMLButtonElement>;
  heading: React.HTMLAttributes<HTMLHeadingElement>;
  p: React.HTMLAttributes<HTMLParagraphElement>;
};

export type Theme = _Theme;
export type StyleRule = _Interpolation<Theme>;
export type StyleRuleWithCustomCssUtils = WithCustomCssUtilities<StyleRule>;

/**
 * Primitives can override their styles using the css prop.
 * For customising layout/theme, prefer using the props defined on the component.
 */
type ThemableCssProp = ((params: Theme) => StyleRule) | StyleRule;
type CssProp = { css?: ThemableCssProp };

export type AsProp = { as?: React.ElementType };

export type PrimitiveProps<HtmlT extends keyof ElementProps> = ElementProps[HtmlT] & CssProp;
