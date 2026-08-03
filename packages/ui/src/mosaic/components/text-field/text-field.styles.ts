import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    color: colorVars['--cl-color-card-foreground'],
    display: 'grid',
    minWidth: 0,
    width: '100%',
  },
  label: {
    alignItems: 'center',
    alignSelf: 'start',
    display: 'inline-flex',
    fontWeight: fontWeightVars['--cl-font-medium'],
    minWidth: 0,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: space['1.5'],
    minWidth: 0,
  },
  message: {
    margin: 0,
  },
  description: {
    color: colorVars['--cl-color-neutral-faded'],
  },
  error: {
    gap: space['1'],
    alignItems: 'flex-start',
    color: colorVars['--cl-color-negative'],
    display: 'flex',
  },
  errorIcon: {
    flexShrink: 0,
  },
  disabledText: {
    opacity: 0.5,
  },
});

export const layouts = stylex.create({
  stacked: {
    gridTemplateColumns: 'minmax(0, 1fr)',
    rowGap: space['2'],
  },
  horizontal: {
    columnGap: space['6'],
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 24rem)',
  },
});

export const labelSizes = stylex.create({
  sm: {
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
  },
  md: {
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
  lg: {
    fontSize: typeScaleVars['--cl-text-base-size'],
    lineHeight: 1.375,
  },
});

export const horizontalLabelSizes = stylex.create({
  sm: { minHeight: space['7'] },
  md: { minHeight: space['8'] },
  lg: { minHeight: space['9'] },
});

export const messageSizes = stylex.create({
  sm: {
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
  },
  md: {
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
  },
  lg: {
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
});
