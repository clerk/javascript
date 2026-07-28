import * as stylex from '@stylexjs/stylex';

import { colorVars, typeScaleVars } from '../tokens.stylex';

export type TypographySize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';

export type TypographyColor = 'primary' | 'neutral' | 'warning' | 'negative' | 'positive';

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
// pair: the saturated one for warning/negative/positive, `-foreground` for neutral
// (`--cl-color-neutral` is a surface fill).
export const colors = stylex.create({
  primary: { color: colorVars['--cl-color-primary'] },
  neutral: { color: colorVars['--cl-color-neutral-foreground'] },
  warning: { color: colorVars['--cl-color-warning'] },
  negative: { color: colorVars['--cl-color-negative'] },
  positive: { color: colorVars['--cl-color-positive'] },
});
