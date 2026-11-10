import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, fontFamilyVars, fontWeightVars, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  base: {
    '--_cl-icon-color': 'currentColor',
    borderRadius: '2px',
    cursor: 'pointer',
    display: 'inline',
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontWeight: fontWeightVars['--cl-font-medium'],
    textDecorationColor: {
      default: 'transparent',
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:disabled, [data-disabled], [aria-disabled="true"])': 'currentColor',
      },
    },
    textDecorationLine: 'underline',
    textDecorationSkipInk: 'auto',
    textUnderlinePosition: 'from-font',
    transitionDuration: {
      default: durationVars['--cl-duration-base'],
      '@media (hover: hover)': {
        default: null,
        ':hover:not(:disabled, [data-disabled], [aria-disabled="true"])': durationVars['--cl-duration-instant'],
      },
    },
    transitionProperty: 'color, text-decoration-color',
    transitionTimingFunction: 'linear',
  },
  external: {
    display: 'inline-block',
    paddingInlineEnd: '1.25em',
    position: 'relative',
  },
  iconSlot: {
    alignItems: 'center',
    display: 'inline-flex',
    marginInlineStart: '0.25em',
    position: 'absolute',
    height: '1lh',
  },
});

export const colors = stylex.create({
  primary: { color: colorVars['--cl-color-brand'] },
  neutral: { color: colorVars['--cl-color-foreground'] },
  negative: { color: colorVars['--cl-color-negative'] },
});

export const sizes = stylex.create({
  xs: { fontSize: typeScaleVars['--cl-text-xs-size'], lineHeight: typeScaleVars['--cl-text-xs-leading'] },
  sm: { fontSize: typeScaleVars['--cl-text-xs-size'], lineHeight: typeScaleVars['--cl-text-xs-leading'] },
  md: { fontSize: typeScaleVars['--cl-text-sm-size'], lineHeight: typeScaleVars['--cl-text-sm-leading'] },
  lg: { fontSize: typeScaleVars['--cl-text-base-size'], lineHeight: typeScaleVars['--cl-text-base-leading'] },
});
