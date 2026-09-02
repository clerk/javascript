import * as stylex from '@stylexjs/stylex';

import { durationVars, easingVars } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
    overflow: 'hidden',
    position: 'relative',
    transitionDuration: {
      default: durationVars['--cl-duration-slow'],
      ':where([data-initial])': durationVars['--cl-duration-instant'],
    },
    transitionProperty: {
      default: 'height',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionTimingFunction: easingVars['--cl-ease-enter'],
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
    position: {
      default: 'relative',
      ':where([data-closed])': 'absolute',
    },
    transform: {
      default: 'translateX(0)',
      ':where([data-ending-style])': 'translateX(calc(var(--cl-flow-transition-direction, 1) * -100%))',
      ':where([data-starting-style])': 'translateX(calc(var(--cl-flow-transition-direction, 1) * 100%))',
      '@media (prefers-reduced-motion: reduce)': {
        default: 'translateX(0)',
        ':where([data-ending-style])': 'translateX(0)',
        ':where([data-starting-style])': 'translateX(0)',
      },
    },
    transitionDuration: durationVars['--cl-duration-slow'],
    transitionProperty: {
      default: 'transform',
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    transitionTimingFunction: easingVars['--cl-ease-enter'],
    willChange: 'transform',
    minWidth: 0,
    width: '100%',
  },
});
