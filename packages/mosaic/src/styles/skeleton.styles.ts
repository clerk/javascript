import * as stylex from '@stylexjs/stylex';

import { colorVars, easingVars, radiusVars } from '../tokens.stylex';
import { skeletonVars } from './skeleton.stylex';

const fill = colorVars['--cl-color-neutral-alpha-200'];
const highlight =
  'light-dark(color-mix(in oklab, var(--cl-color-neutral) 3%, transparent), color-mix(in oklab, var(--cl-color-neutral) 14%, transparent))';
const gradient = `linear-gradient(to right, ${fill} 33%, ${highlight}, ${fill} 66%)`;

const shimmer = stylex.keyframes({
  from: { backgroundPosition: '100% 0' },
  to: { backgroundPosition: '0% 0' },
});

export const skeletonStyles = stylex.create({
  shimmer: {
    backgroundPosition: '100% 0',
    animationDuration: '2s',
    animationIterationCount: 'infinite',
    animationName: {
      default: shimmer,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationPlayState: skeletonVars['--_cl-skeleton-state'],
    animationTimingFunction: easingVars['--cl-ease-in-out'],
    backgroundImage: gradient,
    backgroundSize: '300% 100%',
  },
  bone: {
    borderRadius: radiusVars['--cl-radius-md'],
    userSelect: 'none',
  },
  line: {
    borderRadius: 0,
    animationName: 'none',
    backgroundImage: 'none',
    display: 'block',
    height: '1lh',
    maxWidth: '100%',
    '::before': {
      backgroundPosition: '100% 0',
      animationDuration: '2s',
      animationIterationCount: 'infinite',
      animationName: {
        default: shimmer,
        '@media (prefers-reduced-motion: reduce)': 'none',
      },
      animationPlayState: skeletonVars['--_cl-skeleton-state'],
      animationTimingFunction: easingVars['--cl-ease-in-out'],
      backgroundImage: gradient,
      backgroundSize: '300% 100%',
      content: "''",
      display: 'inline-block',
      verticalAlign: 'baseline',
      height: stylex.firstThatWorks('1cap', '0.7em'),
      width: '100%',
    },
  },
});
