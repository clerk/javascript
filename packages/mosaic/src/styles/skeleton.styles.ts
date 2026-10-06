import * as stylex from '@stylexjs/stylex';

import { colorVars, easingVars, radiusVars } from '../tokens.stylex';

const highlight =
  'light-dark(color-mix(in oklab, var(--cl-color-background) 62%, transparent), color-mix(in oklab, var(--cl-color-neutral) 7%, transparent))';

const translate = stylex.keyframes({
  from: { transform: 'translateX(-100%)' },
  to: { transform: 'translateX(100%)' },
});

const pan = stylex.keyframes({
  from: { backgroundPosition: '100% 50%, 0 50%' },
  to: { backgroundPosition: '0% 50%, 0 50%' },
});

export const skeletonStyles = stylex.create({
  bone: {
    borderRadius: radiusVars['--cl-radius-md'],
    backgroundColor: colorVars['--cl-color-neutral-alpha-200'],
    userSelect: 'none',
  },
  shimmer: {
    overflow: 'hidden',
    position: 'relative',
    '::after': {
      inset: 0,
      animationDuration: '1.6s',
      animationIterationCount: 'infinite',
      animationName: {
        default: translate,
        '@media (prefers-reduced-motion: reduce)': 'none',
      },
      animationTimingFunction: easingVars['--cl-ease-in-out'],
      backgroundImage: `linear-gradient(90deg, transparent, ${highlight}, transparent)`,
      content: "''",
      position: 'absolute',
      transform: 'translateX(-100%)',
    },
  },
  text: {
    WebkitTextFillColor: 'transparent',
    backgroundPosition: '100% 50%, 0 50%',
    borderRadius: radiusVars['--cl-radius-full'],
    animationDuration: '1.6s',
    animationIterationCount: 'infinite',
    animationName: {
      default: pan,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: easingVars['--cl-ease-in-out'],
    backgroundImage: `linear-gradient(90deg, transparent 33.33%, ${highlight} 50%, transparent 66.67%), linear-gradient(${colorVars['--cl-color-neutral-alpha-200']}, ${colorVars['--cl-color-neutral-alpha-200']})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '300% 75%, 100% 75%',
    boxDecorationBreak: 'clone',
    color: 'transparent',
    userSelect: 'none',
  },
});
