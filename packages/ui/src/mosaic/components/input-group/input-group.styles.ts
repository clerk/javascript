import * as stylex from '@stylexjs/stylex';

import { colorVars, fontFamilyVars, radiusVars, space, targetVars, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    overflow: 'hidden',
    alignItems: 'center',
    display: 'flex',
    minHeight: { default: null, '@media (pointer: coarse)': targetVars['--cl-target-coarse'] },
    width: '100%',
  },
  text: {
    alignItems: 'center',
    color: colorVars['--cl-color-neutral-faded'],
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
  },
});

export const sizes = stylex.create({
  sm: {
    borderRadius: radiusVars['--cl-radius-md'],
    height: space['7'],
  },
  md: {
    borderRadius: radiusVars['--cl-radius-md'],
    height: space['8'],
  },
  lg: {
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
