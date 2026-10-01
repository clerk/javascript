import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars } from '../tokens.stylex';

const wave = stylex.keyframes({
  '0%': { opacity: 1 },
  '37.5%': { opacity: 0.6 },
  '75%': { opacity: 1 },
  '100%': { opacity: 1 },
});

export const skeletonStyles = stylex.create({
  bone: {
    borderRadius: radiusVars['--cl-radius-md'],
    animationDelay: 'var(--_cl-skeleton-delay, 0ms)',
    animationDuration: '1.2s',
    animationFillMode: 'both',
    animationIterationCount: 'infinite',
    animationName: {
      default: 'none',
      ':where([data-skeleton-wave])': wave,
      '@media (prefers-reduced-motion: reduce)': { default: 'none', ':where([data-skeleton-wave])': 'none' },
    },
    animationTimingFunction: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    backgroundColor: colorVars['--cl-color-neutral-alpha-200'],
    userSelect: 'none',
  },
  line: {
    borderRadius: radiusVars['--cl-radius-sm'],
    marginBlock: '0.2lh',
    display: 'block',
    height: '0.6lh',
    maxWidth: '100%',
  },
});
