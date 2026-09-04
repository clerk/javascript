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
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    width: '100%',
  },
  slot: {
    borderRadius: radiusVars['--cl-radius-lg'],
    caretColor: colorVars['--cl-color-primary'],
    color: colorVars['--cl-color-card-foreground'],
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-lg-size'],
    fontVariantNumeric: 'tabular-nums',
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-lg-leading'],
    textAlign: 'center',
    height: space['14'],
    width: '100%',
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
