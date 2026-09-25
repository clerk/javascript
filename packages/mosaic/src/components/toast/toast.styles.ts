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

const shake = stylex.keyframes({
  '0%, 100%': { translate: '0 0' },
  '20%': { translate: '-4px 0' },
  '40%': { translate: '4px 0' },
  '60%': { translate: '-3px 0' },
  '80%': { translate: '2px 0' },
});

export const styles = stylex.create({
  viewport: {
    insetInline: space['4'],
    outline: 'none',
    insetBlockEnd: space['4'],
    position: 'fixed',
  },

  root: {
    borderRadius: radiusVars['--cl-radius-lg'],
    insetInline: 0,
    marginInline: 'auto',
    paddingBlock: space['3'],
    alignItems: 'center',
    animationDuration: durationVars['--cl-duration-slower'],
    animationName: {
      default: null,
      ':where([data-repeated])': shake,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: easingVars['--cl-ease-default'],
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
    transform: {
      default: `translateY(calc(var(--toast-index) * -1 * ${stackGap})) scale(calc(1 - var(--toast-index) * 0.05))`,
      ':where([data-expanded])': `translateY(calc(var(--toast-offset-y) * -1 - var(--toast-index) * ${stackGap}))`,
    },
    transitionDuration: durationVars['--cl-duration-slow'],
    transitionProperty: {
      default: 'opacity, transform, translate, height',
      '@media (prefers-reduced-motion: reduce)': 'opacity',
    },
    transitionTimingFunction: easingVars['--cl-ease-enter'],
    translate: {
      default: '0 0',
      ':where([data-starting-style], [data-ending-style])': '0 100%',
      '@media (prefers-reduced-motion: reduce)': {
        default: '0 0',
        ':where([data-starting-style], [data-ending-style])': '0 0',
      },
    },
    height: {
      default: 'var(--toast-frontmost-height)',
      ':where([data-expanded])': 'var(--toast-height)',
    },
    maxWidth: '100%',
    width: '22.25rem',
    '::after': {
      insetInline: 0,
      content: '""',
      insetBlockStart: '100%',
      position: 'absolute',
      height: stackGap,
    },
  },

  stackOrder: (zIndex: number) => ({
    zIndex,
  }),

  item: {
    gap: space['2'],
    alignItems: 'center',
    display: 'flex',
    opacity: {
      default: 1,
      ':where([data-behind]:not([data-expanded]))': 0,
    },
    transitionDuration: durationVars['--cl-duration-slow'],
    transitionProperty: 'opacity',
    transitionTimingFunction: easingVars['--cl-ease-enter'],
    minWidth: 0,
  },

  content: {
    gap: space['0.5'],
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },

  label: {
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

  anchoredRoot: {
    animationDuration: durationVars['--cl-duration-slower'],
    animationName: {
      default: null,
      ':where([data-repeated])': shake,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: easingVars['--cl-ease-default'],
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
