import * as stylex from '@stylexjs/stylex';

import { colorVars, fontFamilyVars, radiusVars, space, targetVars, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  addon: {
    '--_cl-button-radius': 'max(0px, calc(var(--_cl-input-group-radius) - var(--_cl-input-group-inset)))',
    gap: space['1'],
    alignItems: 'center',
    display: 'flex',
    flexShrink: 0,
  },
  start: { paddingInlineStart: 'max(0px, calc(var(--_cl-input-group-inset) - 1px))' },
  end: { paddingInlineEnd: 'max(0px, calc(var(--_cl-input-group-inset) - 1px))' },
  root: {
    overflow: 'hidden',
    alignItems: 'center',
    display: 'flex',
    minHeight: { default: null, '@media (pointer: coarse)': targetVars['--cl-target-coarse'] },
    width: '100%',
  },
  text: {
    alignItems: 'center',
    color: colorVars['--cl-color-input-placeholder'],
    display: 'flex',
    flexShrink: 0,
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    paddingInlineEnd: {
      default: 0,
      ':last-child': space['3'],
    },
    paddingInlineStart: {
      default: 0,
      ':first-child': space['3'],
    },
    pointerEvents: 'none',
  },
});

export const sizes = stylex.create({
  sm: {
    '--_cl-input-group-inset': `max(0px, calc((${space['7']} - ${space['6']}) / 2))`,
    '--_cl-input-group-radius': radiusVars['--cl-radius-md'],
    borderRadius: radiusVars['--cl-radius-md'],
    height: space['7'],
  },
  md: {
    '--_cl-input-group-inset': `max(0px, calc((${space['8']} - ${space['7']}) / 2))`,
    '--_cl-input-group-radius': radiusVars['--cl-radius-md'],
    borderRadius: radiusVars['--cl-radius-md'],
    height: space['8'],
  },
  lg: {
    '--_cl-input-group-inset': `max(0px, calc((${space['9']} - ${space['8']}) / 2))`,
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
