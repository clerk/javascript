import * as stylex from '@stylexjs/stylex';

import { colorVars, durationVars, easingVars, space } from '../tokens.stylex';

const GAP = space['2'];

export const feedbackStyles = stylex.create({
  collapse: {
    overflow: 'clip',
    alignContent: 'start',
    display: 'grid',
    position: 'relative',
    transitionDuration: durationVars['--cl-duration-slow'],
    transitionProperty: {
      default: 'height, margin-top',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionTimingFunction: easingVars['--cl-ease-enter'],
    height: {
      default: 'var(--_cl-feedback-height)',
      ':where(:not([data-open]), [data-starting-style])': 0,
    },
    marginTop: {
      default: 0,
      ':where(:not([data-open]), [data-starting-style])': `calc(-1 * ${GAP})`,
    },
  },
  message: {
    inset: { default: null, ':where([data-ending-style])': '0 0 auto' },
    margin: 0,
    gap: space['1'],
    alignItems: 'flex-start',
    display: 'flex',
    opacity: { default: 1, ':where([data-starting-style], [data-ending-style])': 0 },
    // Leaves the flow while it exits so the message arriving behind it takes the row.
    position: { default: null, ':where([data-ending-style])': 'absolute' },
    textWrap: 'pretty',
    transitionDuration: durationVars['--cl-duration-base'],
    transitionProperty: 'opacity',
    transitionTimingFunction: 'linear',
  },
  icon: {
    flexShrink: 0,
    height: '1lh',
  },
  error: {
    color: colorVars['--cl-color-negative'],
  },
  success: {
    color: colorVars['--cl-color-positive'],
  },
});

export const feedbackHeight = stylex.create({
  measured: (height: number) => ({ '--_cl-feedback-height': `${height}px` }),
});
