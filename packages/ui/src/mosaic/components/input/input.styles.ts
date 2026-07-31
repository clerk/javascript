import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

const primary30 = `color-mix(in oklab, ${colorVars['--cl-color-primary']} 30%, transparent)`;
const primary40 = `color-mix(in oklab, ${colorVars['--cl-color-primary']} 40%, transparent)`;
const primary20 = `color-mix(in oklab, ${colorVars['--cl-color-primary']} 20%, transparent)`;
const primary15 = `color-mix(in oklab, ${colorVars['--cl-color-primary']} 15%, transparent)`;
const primary5 = `color-mix(in oklab, ${colorVars['--cl-color-primary']} 5%, transparent)`;

export const styles = stylex.create({
  base: {
    borderColor: {
      default: primary30,
      ':focus-visible': colorVars['--cl-color-primary'],
      ':where([aria-invalid="true"])': colorVars['--cl-color-primary'],
    },
    borderRadius: radiusVars['--cl-radius-element'],
    borderStyle: 'solid',
    borderWidth: '1px',
    outline: 'none',
    transition: 'color 0.15s, background-color 0.15s, border-color 0.15s',
    backgroundColor: 'transparent',
    boxShadow: {
      default: null,
      ':focus-visible': `0 0 0 3px ${primary20}`,
      ':focus-visible:where([aria-invalid="true"])': `0 0 0 3px ${primary15}`,
      ':where([aria-invalid="true"])': `0 0 0 3px ${primary15}`,
    },
    color: 'inherit',
    display: 'block',
    fontFamily: 'inherit',
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
      color: primary40,
    },
  },
  disabled: {
    backgroundColor: primary5,
    cursor: 'not-allowed',
    opacity: 0.5,
    pointerEvents: 'none',
  },
});

export const sizes = stylex.create({
  sm: {
    paddingInline: space['2'],
    fontSize: {
      default: typeScaleVars['--cl-text-xs-size'],
      '@media (min-width: 768px)': typeScaleVars['--cl-text-sm-size'],
    },
    lineHeight: {
      default: typeScaleVars['--cl-text-xs-leading'],
      '@media (min-width: 768px)': typeScaleVars['--cl-text-sm-leading'],
    },
    height: space['7'],
  },
  md: {
    paddingInline: space['2.5'],
    fontSize: {
      default: typeScaleVars['--cl-text-base-size'],
      '@media (min-width: 768px)': typeScaleVars['--cl-text-sm-size'],
    },
    lineHeight: {
      default: typeScaleVars['--cl-text-base-leading'],
      '@media (min-width: 768px)': typeScaleVars['--cl-text-sm-leading'],
    },
    height: space['8'],
  },
});
