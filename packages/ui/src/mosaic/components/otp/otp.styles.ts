import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  fontFamilyVars,
  fontWeightVars,
  radiusVars,
  space,
  targetVars,
  typeScaleVars,
} from '../../tokens.stylex';

const positiveFocusShadow = `0 0 0 3px light-dark(
  color-mix(in oklab, ${colorVars['--cl-color-positive']} 12%, transparent),
  color-mix(in oklab, ${colorVars['--cl-color-positive']} 15%, transparent)
)`;

export const styles = stylex.create({
  root: {
    alignItems: 'center',
    display: 'flex',
    width: 'fit-content',
  },
  slot: {
    caretColor: colorVars['--cl-color-primary'],
    color: colorVars['--cl-color-card-foreground'],
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontVariantNumeric: 'tabular-nums',
    fontWeight: fontWeightVars['--cl-font-medium'],
    textAlign: 'center',
  },
  // The success cell restates the focus shadow so a verified code keeps its colour
  // while focused, mirroring how the shared surface handles `aria-invalid`.
  success: {
    borderColor: {
      default: colorVars['--cl-color-positive'],
      ':focus-visible': colorVars['--cl-color-positive'],
      '@media (hover: hover)': {
        ':hover': colorVars['--cl-color-positive'],
      },
    },
    boxShadow: {
      default: null,
      ':focus-visible': positiveFocusShadow,
    },
  },
  touchTarget: {
    minHeight: { default: null, '@media (pointer: coarse)': targetVars['--cl-target-coarse'] },
    minWidth: { default: null, '@media (pointer: coarse)': targetVars['--cl-target-coarse'] },
  },
});

export const rootSizes = stylex.create({
  sm: { gap: space['1.5'] },
  md: { gap: space['2'] },
  lg: { gap: space['2'] },
});

export const slotSizes = stylex.create({
  sm: {
    borderRadius: radiusVars['--cl-radius-md'],
    fontSize: {
      default: typeScaleVars['--cl-text-sm-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--cl-text-sm-size']})`,
    },
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    height: space['8'],
    width: space['8'],
  },
  md: {
    borderRadius: radiusVars['--cl-radius-lg'],
    fontSize: {
      default: typeScaleVars['--cl-text-base-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--cl-text-base-size']})`,
    },
    lineHeight: typeScaleVars['--cl-text-base-leading'],
    height: space['10'],
    width: space['10'],
  },
  lg: {
    borderRadius: radiusVars['--cl-radius-lg'],
    fontSize: {
      default: typeScaleVars['--cl-text-lg-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--cl-text-lg-size']})`,
    },
    lineHeight: typeScaleVars['--cl-text-lg-leading'],
    height: space['12'],
    width: space['12'],
  },
});
