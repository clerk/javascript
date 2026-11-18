import * as stylex from '@stylexjs/stylex';

import { durationVars, easingVars, space } from '../../tokens.stylex';

const fadeIn = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const draw = stylex.keyframes({
  from: { strokeDashoffset: 14 },
  to: { strokeDashoffset: 0 },
});

export const styles = stylex.create({
  content: {
    gap: space['1'],
    alignItems: 'center',
    animationDuration: durationVars['--cl-duration-base'],
    animationName: {
      default: fadeIn,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: easingVars['--cl-ease-enter'],
    display: 'flex',
    whiteSpace: 'nowrap',
  },
  check: {
    strokeDasharray: 14,
    strokeDashoffset: {
      default: 14,
      '@media (prefers-reduced-motion: reduce)': 0,
    },
    animationDelay: '60ms',
    animationDuration: durationVars['--cl-duration-base'],
    animationFillMode: 'forwards',
    animationName: {
      default: draw,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: easingVars['--cl-ease-enter'],
    marginInlineEnd: `calc(-1 * ${space['0.5']})`,
    position: 'relative',
    top: '-1px',
  },
});
