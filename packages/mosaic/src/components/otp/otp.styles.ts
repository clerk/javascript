import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  easingVars,
  fontFamilyVars,
  fontWeightVars,
  radiusVars,
  space,
  targetVars,
  typeScaleVars,
} from '../../tokens.stylex';

const focusBorderColor = 'light-dark(#bebebe, #525252)';
const focusShadow = '0 0 0 3px light-dark(rgb(23 23 23 / 8%), rgb(255 255 255 / 8%))';
const positiveFocusShadow = `0 0 0 3px ${colorVars['--cl-color-positive-alpha-300']}`;

const digitIn = stylex.keyframes({
  from: { color: 'transparent' },
});

const shake = stylex.keyframes({
  '0%, 100%': { transform: 'translateX(0)' },
  '15%': { transform: 'translateX(-4px)' },
  '30%': { transform: 'translateX(4px)' },
  '45%': { transform: 'translateX(-3px)' },
  '60%': { transform: 'translateX(3px)' },
  '75%': { transform: 'translateX(-1px)' },
  '90%': { transform: 'translateX(1px)' },
});

export const styles = stylex.create({
  root: {
    gap: space['2'],
    alignItems: 'center',
    direction: 'ltr',
    display: 'flex',
    justifyContent: 'flex-start',
    position: 'relative',
    width: '100%',
  },
  rejected: {
    animationDuration: durationVars['--cl-duration-slower'],
    animationName: {
      default: shake,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: easingVars['--cl-ease-in-out'],
  },
  filled: {
    animationDuration: durationVars['--cl-duration-fast'],
    animationName: digitIn,
    animationTimingFunction: easingVars['--cl-ease-enter'],
  },
  ringed: {
    borderColor: {
      default: null,
      ':focus-visible': colorVars['--cl-color-border'],
      ':focus-visible:where([aria-invalid="true"])': colorVars['--cl-color-negative'],
      ':where([aria-invalid="true"])': colorVars['--cl-color-negative'],
    },
    boxShadow: {
      default: null,
      ':focus-visible': 'none',
      ':focus-visible:where([aria-invalid="true"])': 'none',
    },
  },
  ring: {
    borderRadius: radiusVars['--cl-radius-lg'],
    boxShadow: {
      default: `inset 0 0 0 1px ${focusBorderColor}, ${focusShadow}`,
      ':where([data-status="error"])': `inset 0 0 0 1px ${colorVars['--cl-color-negative']}, 0 0 0 3px ${colorVars['--cl-color-negative-alpha-300']}`,
    },
    insetBlockStart: 0,
    insetInlineStart: 0,
    opacity: { default: 0, ':where([data-visible])': 1 },
    pointerEvents: 'none',
    position: 'absolute',
    transform: 'translateX(var(--_cl-otp-ring-x, 0px))',
    transitionDuration: {
      default: `${durationVars['--cl-duration-base']}, ${durationVars['--cl-duration-fast']}`,
      ':where([data-snap])': `${durationVars['--cl-duration-instant']}, ${durationVars['--cl-duration-fast']}`,
    },
    transitionProperty: {
      default: 'transform, opacity',
      '@media (prefers-reduced-motion: reduce)': 'opacity',
    },
    transitionTimingFunction: easingVars['--cl-ease-enter'],
    height: 'var(--_cl-otp-ring-height, 0px)',
    width: 'var(--_cl-otp-ring-width, 0px)',
  },
  slot: {
    borderRadius: radiusVars['--cl-radius-lg'],
    aspectRatio: '1',
    caretColor: colorVars['--cl-color-brand'],
    color: colorVars['--cl-color-foreground'],
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-lg-size'],
    fontVariantNumeric: 'tabular-nums',
    fontWeight: fontWeightVars['--cl-font-medium'],
    lineHeight: typeScaleVars['--cl-text-lg-leading'],
    textAlign: 'center',
    maxWidth: space['12'],
    width: '100%',
  },
  // The success cell restates the focus shadow so a verified code keeps its colour
  // while focused, mirroring how the shared surface handles `aria-invalid`.
  rowCentered: {
    justifyContent: 'center',
  },
  success: {
    borderColor: {
      default: colorVars['--cl-color-positive'],
      ':focus-visible': colorVars['--cl-color-positive'],
      '@media (hover: hover)': {
        ':hover:not(:disabled, [data-disabled], [aria-disabled="true"])': colorVars['--cl-color-positive'],
      },
    },
    boxShadow: {
      default: null,
      ':focus-visible': positiveFocusShadow,
    },
    transitionDuration: durationVars['--cl-duration-base'],
  },
  touchTarget: {
    minHeight: { default: null, '@media (pointer: coarse)': targetVars['--cl-target-coarse'] },
    minWidth: { default: null, '@media (pointer: coarse)': targetVars['--cl-target-coarse'] },
  },
});
