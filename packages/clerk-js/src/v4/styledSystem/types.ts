// eslint-disable-next-line no-restricted-imports
import { Interpolation as _Interpolation } from '@emotion/react';
import React from 'react';

import { InternalTheme } from '../foundations';

type StyleRule = Exclude<_Interpolation<InternalTheme>, string | number | boolean>;

/**
 * Primitives can override their styles using the css prop.
 * For customising layout/theme, prefer using the props defined on the component.
 */
type ThemableCssProp = ((params: InternalTheme) => StyleRule) | StyleRule;
type CssProp = { css?: ThemableCssProp };

export type AsProp = { as?: React.ElementType };

type ElementProps = {
  div: JSX.IntrinsicElements['div'];
  input: JSX.IntrinsicElements['input'];
  button: JSX.IntrinsicElements['button'];
  heading: JSX.IntrinsicElements['h1'];
  p: JSX.IntrinsicElements['p'];
  a: JSX.IntrinsicElements['a'];
  label: JSX.IntrinsicElements['label'];
};

type PrimitiveProps<HtmlT extends keyof ElementProps> = ElementProps[HtmlT] & CssProp;
type PickSiblingProps<C extends React.FunctionComponent, T extends keyof Parameters<C>[0]> = Pick<Parameters<C>[0], T>;
type PropsOfComponent<C extends React.FunctionComponent> = Parameters<C>[0];

export type { InternalTheme, PrimitiveProps, PickSiblingProps, PropsOfComponent, StyleRule, ThemableCssProp };
