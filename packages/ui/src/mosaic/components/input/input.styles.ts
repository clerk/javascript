import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  easingVars,
  fontFamilyVars,
  fontWeightVars,
  radiusVars,
  space,
  typeScaleVars,
} from '../../tokens.stylex';

const disabledBackgroundColor = `color-mix(in oklab, ${colorVars['--cl-color-primary']} 5%, transparent)`;
const hoverBorderColor = 'light-dark(#bebebe, #525252)';
const focusShadow = '0 0 0 3px light-dark(rgb(23 23 23 / 8%), rgb(255 255 255 / 8%))';
const invalidFocusShadow = `0 0 0 3px light-dark(
  color-mix(in oklab, ${colorVars['--cl-color-negative']} 12%, transparent),
  color-mix(in oklab, ${colorVars['--cl-color-negative']} 15%, transparent)
)`;

export const styles = stylex.create({
  base: {
    borderColor: {
      default: colorVars['--cl-color-border'],
      ':focus-visible': hoverBorderColor,
      ':focus-visible:where([aria-invalid="true"])': colorVars['--cl-color-negative'],
      ':where([aria-invalid="true"])': colorVars['--cl-color-negative'],
      '@media (hover: hover)': {
        ':hover:not([aria-invalid="true"])': hoverBorderColor,
      },
    },
    borderStyle: 'solid',
    borderWidth: '1px',
    outline: {
      default: 'none',
      '@media (forced-colors: active)': {
        default: null,
        ':focus-visible': '2px solid CanvasText',
      },
    },
    backgroundColor: colorVars['--cl-color-input'],
    boxShadow: {
      default: null,
      ':focus-visible': focusShadow,
      ':focus-visible:where([aria-invalid="true"])': invalidFocusShadow,
    },
    display: 'block',
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    outlineOffset: {
      default: null,
      '@media (forced-colors: active)': {
        default: null,
        ':focus-visible': '2px',
      },
    },
    transitionDuration: {
      default: durationVars['--cl-duration-base'],
      ':focus-visible': durationVars['--cl-duration-fast'],
    },
    transitionProperty: 'color, background-color, border-color, box-shadow',
    transitionTimingFunction: {
      default: 'linear',
      ':focus-visible': `linear, linear, linear, ${easingVars['--cl-ease-default']}`,
    },
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
    backgroundColor: disabledBackgroundColor,
    cursor: 'not-allowed',
    opacity: 0.5,
    pointerEvents: 'none',
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
