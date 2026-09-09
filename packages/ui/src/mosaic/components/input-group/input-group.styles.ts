import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  focusVars,
  fontFamilyVars,
  radiusVars,
  space,
  targetVars,
  typeScaleVars,
} from '../../tokens.stylex';
import { buttonScope } from '../button/button.markers.stylex';

/* eslint-disable @stylexjs/no-lookahead-selectors -- Supported browsers include :has(); the marker scopes matching to Mosaic buttons. */
export const styles = stylex.create({
  addon: {
    '--_cl-button-radius': 'max(0px, calc(var(--_cl-input-group-radius) - var(--_cl-input-group-inset)))',
    gap: space['1'],
    alignItems: 'center',
    alignSelf: 'stretch',
    color: colorVars['--cl-color-input-placeholder'],
    display: 'flex',
    flexShrink: 0,
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
  },
  button: {
    outlineOffset: {
      default: null,
      ':focus-visible': 0,
    },
  },
  buttonSize: {
    height: 'calc(var(--_cl-input-group-height) - 2 * var(--_cl-input-group-inset))',
  },
  iconButton: {
    width: 'calc(var(--_cl-input-group-height) - 2 * var(--_cl-input-group-inset))',
  },
  start: {
    borderEndStartRadius: 'max(0px, calc(var(--_cl-input-group-radius) - 1px))',
    borderStartStartRadius: 'max(0px, calc(var(--_cl-input-group-radius) - 1px))',
    paddingInlineEnd: { default: space['3'], [stylex.when.descendant(':where(*)', buttonScope)]: 0 },
    paddingInlineStart: {
      default: space['3'],
      [stylex.when.descendant(':where(*)', buttonScope)]: 'max(0px, calc(var(--_cl-input-group-inset) - 1px))',
    },
  },
  end: {
    borderEndEndRadius: 'max(0px, calc(var(--_cl-input-group-radius) - 1px))',
    borderStartEndRadius: 'max(0px, calc(var(--_cl-input-group-radius) - 1px))',
    paddingInlineEnd: {
      default: space['3'],
      [stylex.when.descendant(':where(*)', buttonScope)]: 'max(0px, calc(var(--_cl-input-group-inset) - 1px))',
    },
    paddingInlineStart: { default: space['3'], [stylex.when.descendant(':where(*)', buttonScope)]: 0 },
  },
  root: {
    '--_cl-input-group-inset': `calc(${focusVars['--cl-focus-outline-width']} + 1px)`,
    overflow: 'visible',
    alignItems: 'center',
    display: 'flex',
    minHeight: { default: null, '@media (pointer: coarse)': targetVars['--cl-target-coarse'] },
    width: '100%',
  },
});

/* eslint-enable @stylexjs/no-lookahead-selectors */

export const sizes = stylex.create({
  sm: {
    '--_cl-input-group-height': space['7'],
    '--_cl-input-group-radius': radiusVars['--cl-radius-md'],
    borderRadius: radiusVars['--cl-radius-md'],
    height: space['7'],
  },
  md: {
    '--_cl-input-group-height': space['8'],
    '--_cl-input-group-radius': radiusVars['--cl-radius-md'],
    borderRadius: radiusVars['--cl-radius-md'],
    height: space['8'],
  },
  lg: {
    '--_cl-input-group-height': space['9'],
    '--_cl-input-group-radius': radiusVars['--cl-radius-lg'],
    borderRadius: radiusVars['--cl-radius-lg'],
    height: space['9'],
  },
});

export const textSizes = stylex.create({
  sm: {
    fontSize: {
      default: typeScaleVars['--cl-text-xs-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--cl-text-xs-size']})`,
    },
    lineHeight: typeScaleVars['--cl-text-xs-leading'],
  },
  md: {
    fontSize: {
      default: typeScaleVars['--cl-text-sm-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--cl-text-sm-size']})`,
    },
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
  },
  lg: {
    fontSize: {
      default: typeScaleVars['--cl-text-base-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--cl-text-base-size']})`,
    },
    lineHeight: 1.375,
  },
});

export const compactActionInsets = stylex.create({
  sm: {
    marginInlineEnd: { default: 0, ':last-child': space['0.5'] },
    marginInlineStart: { default: 0, ':first-child': space['0.5'] },
  },
  md: {
    marginInlineEnd: { default: 0, ':last-child': space['1'] },
    marginInlineStart: { default: 0, ':first-child': space['1'] },
  },
  lg: {
    marginInlineEnd: { default: 0, ':last-child': space['1.5'] },
    marginInlineStart: { default: 0, ':first-child': space['1.5'] },
  },
});
