import * as stylex from '@stylexjs/stylex';

import { colorVars, fontWeightVars, radiusVars, space, typeScaleVars } from '../../tokens.stylex';

const primary5 = `color-mix(in oklab, ${colorVars['--cl-color-primary']} 5%, transparent)`;
const focusRing = `0 0 0 1.5px ${colorVars['--cl-color-card']}, 0 0 0 3px ${colorVars['--cl-color-primary']}`;

export const styles = stylex.create({
  base: {
    borderColor: {
      default: colorVars['--cl-color-border'],
      ':focus-visible': colorVars['--cl-color-border'],
      ':hover:not(:focus-visible):not([aria-invalid="true"])': '#b7b7b7',
      ':where([aria-invalid="true"])': colorVars['--cl-color-negative'],
    },
    borderStyle: 'solid',
    borderWidth: {
      default: '1px',
      ':where([aria-invalid="true"])': '2px',
    },
    outline: 'none',
    transition: 'color 0.15s, background-color 0.15s, border-color 0.15s',
    backgroundColor: colorVars['--cl-color-card'],
    boxShadow: {
      default: null,
      ':focus-visible': focusRing,
      ':focus-visible:where([aria-invalid="true"])': focusRing,
      ':where([aria-invalid="true"])': 'none',
    },
    boxSizing: 'border-box',
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
      color: colorVars['--cl-color-input-placeholder'],
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
    borderRadius: radiusVars['--cl-radius-control'],
    paddingInline: space['3'],
    fontSize: typeScaleVars['--cl-text-xs-size'],
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    height: space['7'],
  },
  md: {
    borderRadius: radiusVars['--cl-radius-control'],
    paddingInline: space['3'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    height: space['8'],
  },
  lg: {
    borderRadius: radiusVars['--cl-radius-element'],
    paddingInline: space['3'],
    fontSize: typeScaleVars['--cl-text-base-size'],
    lineHeight: 1.375,
    height: space['9'],
  },
});
