import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, easingVars, space } from '../tokens.stylex';

const GAP = `var(--_cl-feedback-gap, ${space['2']})`;

export const feedbackStyles = stylex.create({
  collapse: {
    overflow: 'clip',
    alignContent: 'end',
    display: 'grid',
    maskImage: `linear-gradient(to bottom, transparent, black ${GAP})`,
    position: 'relative',
    transitionDuration: durationVars['--cl-duration-slow'],
    transitionProperty: {
      default: 'height',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionTimingFunction: {
      default: easingVars['--cl-ease-enter'],
      ':where([data-ending-style])': easingVars['--cl-ease-in-out'],
    },
    height: {
      default: `calc(var(--_cl-feedback-height) + ${GAP})`,
      ':where(:not([data-open]), [data-starting-style])': 0,
    },
    marginTop: `calc(-1 * ${GAP})`,
  },
  message: {
    inset: { default: null, ':where([data-ending-style])': 'auto 0 0' },
    gap: space['1'],
    alignItems: 'flex-start',
    display: 'flex',
    opacity: { default: 1, ':where([data-starting-style], [data-ending-style])': 0 },
    // Leaves the flow while it exits so the message arriving behind it takes the row.
    position: { default: null, ':where([data-ending-style])': 'absolute' },
    textWrap: 'pretty',
    transitionDelay: {
      default: durationVars['--cl-duration-fast'],
      ':where([data-ending-style])': durationVars['--cl-duration-instant'],
      '@media (prefers-reduced-motion: reduce)': durationVars['--cl-duration-instant'],
    },
    transitionDuration: durationVars['--cl-duration-fast'],
    transitionProperty: 'opacity',
    transitionTimingFunction: {
      default: easingVars['--cl-ease-enter'],
      ':where([data-ending-style])': easingVars['--cl-ease-exit'],
    },
    marginTop: GAP,
  },
  icon: {
    flexShrink: 0,
    height: '1lh',
  },
  error: {
    color: colorVars['--cl-color-negative'],
  },
  info: {
    color: colorVars['--cl-color-foreground-secondary'],
  },
  success: {
    color: colorVars['--cl-color-positive'],
  },
});

export const feedbackHeight = stylex.create({
  measured: (height: number) => ({ '--_cl-feedback-height': `${height}px` }),
});
