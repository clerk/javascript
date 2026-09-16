import * as stylex from '@stylexjs/stylex';

import { colorVars, fontFamilyVars, typeScaleVars } from '../tokens.stylex';

export type TypographySize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';

export type TypographyColor = 'primary' | 'foreground' | 'foreground-secondary' | 'warning' | 'negative' | 'positive';

export const styles = stylex.create({
  base: {
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
  },
});

export const sizes = stylex.create({
  xs: {
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
  },
  sm: {
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
  base: {
    fontSize: typeScaleVars['--cl-text-base-size'],
    lineHeight: typeScaleVars['--cl-text-base-leading'],
  },
  lg: {
    fontSize: typeScaleVars['--cl-text-lg-size'],
    lineHeight: typeScaleVars['--cl-text-lg-leading'],
  },
  xl: {
    fontSize: typeScaleVars['--cl-text-xl-size'],
    lineHeight: typeScaleVars['--cl-text-xl-leading'],
  },
  '2xl': {
    fontSize: typeScaleVars['--cl-text-2xl-size'],
    lineHeight: typeScaleVars['--cl-text-2xl-leading'],
  },
});

// Text has no fill to sit on, so each color resolves to the readable token of its
// pair: the saturated one for warning/negative/positive, the `-foreground` text tokens
// for the achromatic pair.
export const colors = stylex.create({
  primary: { color: colorVars['--cl-color-brand'] },
  foreground: { color: colorVars['--cl-color-foreground'] },
  'foreground-secondary': { color: colorVars['--cl-color-foreground-secondary'] },
  warning: { color: colorVars['--cl-color-warning'] },
  negative: { color: colorVars['--cl-color-negative'] },
  positive: { color: colorVars['--cl-color-positive'] },
});

// Text truncation, composed by any component that clamps copy.
export const truncationStyles = stylex.create({
  // Single-line ellipsis.
  singleLine: {
    overflow: 'hidden',
    display: 'block',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // Multi-line clamp base; the caller sets `-webkit-line-clamp` via inline style.
  multiLine: {
    overflow: 'hidden',
    WebkitBoxOrient: 'vertical',
    display: '-webkit-box',
  },
});

// Fixed-width figures, for values that change in place without shifting the layout around them.
export const tabularNumbersStyle = stylex.create({
  enabled: {
    fontVariantNumeric: 'tabular-nums',
  },
});
