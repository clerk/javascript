import { Interpolation, Theme } from '@emotion/react';
import React from 'react';

type ElementProps = {
  div: React.HTMLAttributes<HTMLDivElement>;
  input: React.HTMLAttributes<HTMLInputElement>;
  button: React.HTMLAttributes<HTMLButtonElement>;
  heading: React.HTMLAttributes<HTMLHeadingElement>;
  p: React.HTMLAttributes<HTMLParagraphElement>;
};

interface StaticCssFn<T> {
  (params: T): Interpolation<Theme>;
}

interface ThemableCssFn<T> {
  (params: (theme: Theme) => T): Interpolation<Theme>;
  (params: T): Interpolation<Theme>;
}

/**
 * Primitives can override their styles using the css prop.
 * For customising layout/theme, prefer using the defined props.
 */
type ThemableCssProp = ((params: Theme) => Interpolation<Theme>) | Interpolation<Theme>;
type CssProp = { css?: ThemableCssProp };

type AsProp = { as?: React.ElementType };

// type CommonProps = {};
type PrimitiveProps<HtmlT extends keyof ElementProps> = ElementProps[HtmlT] & CssProp;

export type { PrimitiveProps, AsProp, StaticCssFn, ThemableCssFn };
