import * as stylex from '@stylexjs/stylex';

import { durationVars, easingVars, space, typeScaleVars } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    overflow: 'clip',
    position: 'relative',
    transitionDuration: {
      default: durationVars['--cl-duration-slow'],
      ':where([data-initial])': durationVars['--cl-duration-instant'],
    },
    transitionProperty: {
      default: 'none',
      ':where([data-transitioning])': 'height',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionTimingFunction: {
      default: easingVars['--cl-ease-enter'],
      ':where([data-height-change="shrink"])': easingVars['--cl-ease-in-out'],
    },
    height: 'var(--cl-flow-step-height)',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    insetBlockStart: {
      default: null,
      ':where([data-closed])': 0,
    },
    insetInlineStart: {
      default: null,
      ':where([data-closed])': 0,
    },
    opacity: {
      default: 1,
      ':where([data-starting-style], [data-ending-style])': 0,
    },
    position: {
      default: 'relative',
      ':where([data-closed])': 'absolute',
    },
    transform: {
      default: 'scale(1)',
      ':where([data-starting-style], [data-ending-style])': 'scale(0.96)',
      '@media (prefers-reduced-motion: reduce)': {
        default: 'scale(1)',
        ':where([data-starting-style], [data-ending-style])': 'scale(1)',
      },
    },
    transformOrigin: `50% calc(${space['4']} + ${typeScaleVars['--cl-text-base-size']} * ${typeScaleVars['--cl-text-base-leading']} / 2)`,
    transitionDelay: {
      default: `calc(${durationVars['--cl-duration-base']} / 2)`,
      ':where([data-ending-style])': durationVars['--cl-duration-instant'],
      '@media (prefers-reduced-motion: reduce)': durationVars['--cl-duration-instant'],
    },
    transitionDuration: {
      default: `${durationVars['--cl-duration-base']}, ${durationVars['--cl-duration-slow']}`,
      ':where([data-ending-style])': durationVars['--cl-duration-base'],
    },
    transitionProperty: {
      default: 'opacity, transform',
      '@media (prefers-reduced-motion: reduce)': 'opacity',
    },
    transitionTimingFunction: {
      default: easingVars['--cl-ease-enter'],
      ':where([data-ending-style])': easingVars['--cl-ease-in-out'],
    },
    willChange: 'transform',
    minWidth: 0,
    width: '100%',
  },
});
