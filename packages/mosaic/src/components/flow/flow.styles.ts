import * as stylex from '@stylexjs/stylex';

import { durationVars, easingVars } from '../../tokens.stylex';

export const styles = stylex.create({
  root: {
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
    overflowY: { default: 'visible', ':where([data-transitioning])': 'clip' },
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
    transitionDelay: {
      default: durationVars['--cl-duration-fast'],
      ':where([data-ending-style])': durationVars['--cl-duration-instant'],
      '@media (prefers-reduced-motion: reduce)': durationVars['--cl-duration-instant'],
    },
    transitionDuration: {
      default: durationVars['--cl-duration-base'],
      ':where([data-ending-style])': durationVars['--cl-duration-fast'],
    },
    transitionProperty: 'opacity',
    transitionTimingFunction: {
      default: easingVars['--cl-ease-enter'],
      ':where([data-ending-style])': easingVars['--cl-ease-exit'],
    },
    minWidth: 0,
    width: '100%',
  },
});
