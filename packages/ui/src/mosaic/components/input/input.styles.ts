import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  fontFamilyVars,
  fontWeightVars,
  radiusVars,
  space,
  typeScaleVars,
} from '../../tokens.stylex';

const disabledBackgroundColor = `color-mix(in oklab, ${colorVars['--cl-color-primary']} 5%, transparent)`;
const interactionBorderColor = `color-mix(in oklab, ${colorVars['--cl-color-neutral']} 20%, transparent)`;

export const styles = stylex.create({
  base: {
    borderColor: {
      default: colorVars['--cl-color-border'],
      ':focus-visible': interactionBorderColor,
      ':focus-visible:where([aria-invalid="true"])': colorVars['--cl-color-negative'],
      ':where([aria-invalid="true"])': colorVars['--cl-color-negative'],
      '@media (hover: hover)': {
        ':hover:not([aria-invalid="true"])': interactionBorderColor,
      },
    },
    borderStyle: 'solid',
    borderWidth: {
      default: '1px',
      ':where([aria-invalid="true"])': '2px',
    },
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--cl-color-primary']}`,
      ':focus-visible:where([aria-invalid="true"])': 'none',
    },
    backgroundColor: colorVars['--cl-color-input'],
    display: 'block',
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    outlineOffset: '2px',
    transitionDuration: durationVars['--cl-duration-base'],
    transitionProperty: 'color, background-color, border-color',
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
    borderRadius: radiusVars['--cl-radius-control'],
    paddingInline: space['3'],
    fontSize: {
      default: typeScaleVars['--cl-text-xs-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--cl-text-xs-size']})`,
    },
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
    height: space['7'],
  },
  md: {
    borderRadius: radiusVars['--cl-radius-control'],
    paddingInline: space['3'],
    fontSize: {
      default: typeScaleVars['--cl-text-sm-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--cl-text-sm-size']})`,
    },
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    height: space['8'],
  },
  lg: {
    borderRadius: radiusVars['--cl-radius-element'],
    paddingInline: space['3'],
    fontSize: {
      default: typeScaleVars['--cl-text-base-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--cl-text-base-size']})`,
    },
    lineHeight: 1.375,
    height: space['9'],
  },
});
