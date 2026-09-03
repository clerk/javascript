import * as stylex from '@stylexjs/stylex';

import { colorVars, fontFamilyVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  base: {
    display: 'block',
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    minWidth: 0,
    width: '100%',
    '::file-selector-button': {
      borderStyle: 'none',
      borderWidth: 0,
      backgroundColor: 'transparent',
      color: 'inherit',
      display: 'inline-flex',
      fontSize: typeScaleVars['--cl-text-sm-size'],
      fontWeight: fontWeightVars['--cl-font-medium'],
      lineHeight: typeScaleVars['--cl-text-sm-leading'],
      height: space['6'],
    },
    '::placeholder': {
      color: colorVars['--cl-color-input-placeholder'],
    },
  },
  headless: {
    borderRadius: 0,
    borderStyle: 'none',
    borderWidth: 0,
    outline: 'none',
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
});

export const sizes = stylex.create({
  sm: {
    borderRadius: radiusVars['--cl-radius-md'],
    paddingInline: space['3'],
    fontSize: {
      default: typeScaleVars['--cl-text-xs-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--cl-text-xs-size']})`,
    },
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    height: space['7'],
  },
  md: {
    borderRadius: radiusVars['--cl-radius-md'],
    paddingInline: space['3'],
    fontSize: {
      default: typeScaleVars['--cl-text-sm-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--cl-text-sm-size']})`,
    },
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    height: space['8'],
  },
  lg: {
    borderRadius: radiusVars['--cl-radius-lg'],
    paddingInline: space['3'],
    fontSize: {
      default: typeScaleVars['--cl-text-base-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--cl-text-base-size']})`,
    },
    lineHeight: 1.375,
    height: space['9'],
  },
});
