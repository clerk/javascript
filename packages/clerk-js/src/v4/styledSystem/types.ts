// eslint-disable-next-line no-restricted-imports
import { Interpolation as _Interpolation } from '@emotion/react';
import React from 'react';

import { BaseTheme } from '../foundations';

export type Theme = BaseTheme;
export type StyleRule = _Interpolation<Theme>;

/**
 * Primitives can override their styles using the css prop.
 * For customising layout/theme, prefer using the props defined on the component.
 */
type ThemableCssProp = ((params: Theme) => StyleRule) | StyleRule;
type CssProp = { css?: ThemableCssProp };

export type AsProp = { as?: React.ElementType };

type ElementProps = {
  div: JSX.IntrinsicElements['div'];
  input: JSX.IntrinsicElements['input'];
  button: JSX.IntrinsicElements['button'];
  heading: JSX.IntrinsicElements['h1'];
  p: JSX.IntrinsicElements['p'];
  a: JSX.IntrinsicElements['a'];
};

export type PrimitiveProps<HtmlT extends keyof ElementProps> = ElementProps[HtmlT] & CssProp;
export type PickSiblingProps<C extends React.FunctionComponent, T extends keyof Parameters<C>[0]> = Pick<
  Parameters<C>[0],
  T
>;
