import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  durationVars,
  easingVars,
  fontFamilyVars,
  fontWeightVars,
  radiusVars,
  shadowVars,
  space,
  typeScaleVars,
} from '../../tokens.stylex';

const stackGap = space['2'];

export const styles = stylex.create({
  viewport: {
    insetInline: space['4'],
    outline: 'none',
    insetBlockEnd: space['4'],
    position: 'fixed',
  },

  root: {
    borderRadius: radiusVars['--cl-radius-lg'],
    gap: space['2'],
    insetInline: 0,
    marginInline: 'auto',
    paddingBlock: space['3'],
    alignItems: 'center',
    backgroundColor: colorVars['--cl-color-background'],
    boxShadow: shadowVars['--cl-shadow-lg'],
    color: colorVars['--cl-color-foreground'],
    display: {
      default: 'flex',
      ':where([data-limited])': 'none',
    },
    fontFamily: fontFamilyVars['--cl-font-family-sans'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    insetBlockEnd: 0,
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    opacity: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0,
    },
    paddingInlineEnd: space['5'],
    paddingInlineStart: space['4'],
    position: 'absolute',
    transform: `translateY(calc(var(--toast-offset-y) * -1 - var(--toast-index) * ${stackGap}))`,
    transitionDuration: {
      default: `${durationVars['--cl-duration-fast']}, ${durationVars['--cl-duration-base']}, ${durationVars['--cl-duration-base']}`,
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
    },
    transitionProperty: {
      default: 'opacity, transform, translate',
      '@media (prefers-reduced-motion: reduce)': 'opacity',
    },
    transitionTimingFunction: {
      default: `${easingVars['--cl-ease-enter']}, ${easingVars['--cl-ease-default']}, ${easingVars['--cl-ease-default']}`,
      ':where([data-ending-style])': easingVars['--cl-ease-exit'],
    },
    translate: {
      default: '0 0',
      ':where([data-starting-style], [data-ending-style])': `0 ${space['4']}`,
      '@media (prefers-reduced-motion: reduce)': {
        default: '0 0',
        ':where([data-starting-style], [data-ending-style])': '0 0',
      },
    },
    maxWidth: 'min(100%, 28rem)',
    width: 'max-content',
    '::after': {
      insetInline: 0,
      content: '""',
      insetBlockStart: '100%',
      position: 'absolute',
      height: stackGap,
    },
  },

  content: {
    gap: space['0.5'],
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },

  title: {
    fontWeight: fontWeightVars['--cl-font-medium'],
  },

  description: {
    color: colorVars['--cl-color-foreground-secondary'],
    fontSize: typeScaleVars['--cl-text-sm-size'],
    lineHeight: typeScaleVars['--cl-text-sm-leading'],
    textWrap: 'pretty',
  },

  icon: {
    borderRadius: radiusVars['--cl-radius-full'],
    alignItems: 'center',
    display: 'inline-flex',
    flexShrink: 0,
    justifyContent: 'center',
    height: space['6'],
    width: space['6'],
  },

  anchoredPositioner: {
    outline: 'none',
  },

  anchoredIcon: {
    display: 'inline-flex',
    flexShrink: 0,
  },
});

export const iconColors = stylex.create({
  success: {
    backgroundColor: colorVars['--cl-color-positive-alpha-200'],
    color: colorVars['--cl-color-positive'],
  },
  error: {
    backgroundColor: colorVars['--cl-color-negative-alpha-200'],
    color: colorVars['--cl-color-negative'],
  },
  loading: {
    backgroundColor: colorVars['--cl-color-neutral-alpha-100'],
    color: colorVars['--cl-color-foreground-secondary'],
  },
});
