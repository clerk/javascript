import * as stylex from '@stylexjs/stylex';

import { colorVars, easingVars, radiusVars } from '../tokens.stylex';

const wave = stylex.keyframes({
  '0%': { opacity: 1 },
  '28%': { opacity: 0.32 },
  '56%': { opacity: 1 },
  '100%': { opacity: 1 },
});

export const skeletonStyles = stylex.create({
  wave: {
    animationDelay: 'var(--_cl-skeleton-delay, 0ms)',
    animationDuration: '2s',
    animationFillMode: 'both',
    animationIterationCount: 'infinite',
    animationName: {
      default: 'none',
      ':where([data-skeleton-wave])': wave,
      '@media (prefers-reduced-motion: reduce)': { default: 'none', ':where([data-skeleton-wave])': 'none' },
    },
    animationTimingFunction: easingVars['--cl-ease-in-out'],
  },
  bone: {
    borderRadius: radiusVars['--cl-radius-md'],
    backgroundColor: colorVars['--cl-color-neutral-alpha-200'],
    userSelect: 'none',
  },
  line: {
    borderRadius: 0,
    backgroundColor: 'transparent',
    display: 'block',
    height: '1lh',
    maxWidth: '100%',
    '::before': {
      backgroundColor: colorVars['--cl-color-neutral-alpha-200'],
      content: "''",
      display: 'inline-block',
      verticalAlign: 'baseline',
      height: stylex.firstThatWorks('1cap', '0.7em'),
      width: '100%',
    },
  },
});
