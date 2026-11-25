import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, space, typeScaleVars } from '../../tokens.stylex';

const swatchColor = 'var(--_cl-chart-swatch)';

export const legendStyles = stylex.create({
  root: {
    listStyle: 'none',
    alignItems: 'center',
    color: colorVars['--cl-color-foreground-secondary'],
    columnGap: space['4'],
    display: 'flex',
    flexWrap: 'wrap',
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    rowGap: space['1.5'],
  },
  item: {
    gap: space['1.5'],
    alignItems: 'center',
    display: 'inline-flex',
  },
  trigger: {
    borderWidth: 0,
    gap: space['1.5'],
    alignItems: 'center',
    backgroundColor: 'transparent',
    cursor: 'help',
    display: 'inline-flex',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textUnderlineOffset: '0.2em',
  },
});

export const swatchStyles = stylex.create({
  base: {
    display: 'inline-block',
    flexShrink: 0,
  },
  square: {
    borderRadius: '2px',
    backgroundColor: swatchColor,
    height: '0.625rem',
    width: '0.625rem',
  },
  line: {
    borderRadius: '1px',
    backgroundColor: swatchColor,
    height: '0.875rem',
    width: '0.25rem',
  },
  dashed: {
    borderTopColor: swatchColor,
    borderTopStyle: 'dashed',
    borderTopWidth: '2px',
    height: 0,
    width: '0.875rem',
  },
  color: (color: string) => ({ '--_cl-chart-swatch': color }),
});

export const tooltipContentStyles = stylex.create({
  root: {
    gap: space['2'],
    color: colorVars['--cl-color-foreground'],
    display: 'flex',
    flexDirection: 'column',
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    minWidth: '10rem',
  },
  heading: {
    gap: space['3'],
    alignItems: 'center',
    display: 'flex',
    fontWeight: fontWeightVars['--cl-font-medium'],
    justifyContent: 'space-between',
  },
  list: {
    gap: space['1'],
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
  },
  label: {
    color: colorVars['--cl-color-foreground-secondary'],
    flexGrow: 1,
  },
  value: {
    fontVariantNumeric: 'tabular-nums',
    fontWeight: fontWeightVars['--cl-font-medium'],
    textAlign: 'end',
  },
});
