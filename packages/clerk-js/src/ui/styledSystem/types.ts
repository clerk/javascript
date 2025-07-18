// eslint-disable-next-line no-restricted-imports
import type { Interpolation as _Interpolation } from '@emotion/react';
import type React from 'react';

import type { InternalTheme } from '../foundations';

type StyleRule = Exclude<_Interpolation<InternalTheme>, string | number | boolean>;

/**
 * Primitives can override their styles using the css prop.
 * For customising layout/theme, prefer using the props defined on the component.
 */
type ThemableCssProp = ((params: InternalTheme) => StyleRule) | StyleRule;
type CssProp = { css?: ThemableCssProp };

export type AsProp = { as?: React.ElementType | undefined };

type ElementProps = {
  div: React.JSX.IntrinsicElements['div'];
  input: React.JSX.IntrinsicElements['input'];
  button: React.JSX.IntrinsicElements['button'];
  heading: React.JSX.IntrinsicElements['h1'];
  p: React.JSX.IntrinsicElements['p'];
  a: React.JSX.IntrinsicElements['a'];
  label: React.JSX.IntrinsicElements['label'];
  img: React.JSX.IntrinsicElements['img'];
  form: React.JSX.IntrinsicElements['form'];
  table: React.JSX.IntrinsicElements['table'];
  thead: React.JSX.IntrinsicElements['thead'];
  tbody: React.JSX.IntrinsicElements['tbody'];
  th: React.JSX.IntrinsicElements['th'];
  tr: React.JSX.IntrinsicElements['tr'];
  td: React.JSX.IntrinsicElements['td'];
  dl: React.JSX.IntrinsicElements['dl'];
  dt: React.JSX.IntrinsicElements['dt'];
  dd: React.JSX.IntrinsicElements['dd'];
  hr: React.JSX.IntrinsicElements['hr'];
  textarea: React.JSX.IntrinsicElements['textarea'];
};

/**
 * Some elements, like Flex can accept StateProps
 * simply because they need to be targettable when their container
 * component has a specific state. We then remove the props
 * before rendering the element to the DOM
 */
type StateProps = Partial<Record<'isDisabled' | 'hasError' | 'isLoading' | 'isOpen' | 'isActive', any>>;
/**
 * The form control elements can also accept a isRequired prop on top of the StateProps
 * We're handling it differently since this is a prop that cannot change - a required field
 * will remain required throughout the lifecycle of the component
 */
type RequiredProp = Partial<Record<'isRequired', boolean>>;

type PrimitiveProps<HtmlT extends keyof ElementProps> = ElementProps[HtmlT] & CssProp;
type PropsOfComponent<C extends (...args: any[]) => any> = Parameters<C>[0];

export type { InternalTheme, PrimitiveProps, PropsOfComponent, StyleRule, ThemableCssProp, StateProps, RequiredProp };
