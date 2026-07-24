import * as stylex from '@stylexjs/stylex';

import { colorVars, typeScaleVars } from '../tokens.stylex';

export type TypographySize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';

export type TypographyIntent =
  | 'primary'
  | 'primaryForeground'
  | 'destructive'
  | 'destructiveForeground'
  | 'muted'
  | 'mutedForeground';

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

export const intents = stylex.create({
  primary: { color: colorVars['--cl-color-primary'] },
  primaryForeground: { color: colorVars['--cl-color-primary-foreground'] },
  destructive: { color: colorVars['--cl-color-destructive'] },
  destructiveForeground: { color: colorVars['--cl-color-destructive-foreground'] },
  muted: { color: colorVars['--cl-color-muted'] },
  mutedForeground: { color: colorVars['--cl-color-muted-foreground'] },
});
