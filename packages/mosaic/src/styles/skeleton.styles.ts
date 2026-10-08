import * as stylex from '@stylexjs/stylex';

import { colorVars, radiusVars } from '../tokens.stylex';

const highlight =
  'light-dark(color-mix(in oklab, var(--cl-color-background) 62%, transparent), color-mix(in oklab, var(--cl-color-neutral) 7%, transparent))';

const translate = stylex.keyframes({
  from: { transform: 'translateX(-100%)' },
  to: { transform: 'translateX(100%)' },
});

const pan = stylex.keyframes({
  from: { backgroundPosition: '100% 0, 0 0' },
  to: { backgroundPosition: '0% 0, 0 0' },
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
      animationTimingFunction: 'ease-in-out',
      backgroundImage: `linear-gradient(90deg, transparent, ${highlight}, transparent)`,
      content: "''",
      position: 'absolute',
      transform: 'translateX(-100%)',
    },
  },
  text: {
    overflow: 'hidden',
    display: 'block',
    userSelect: 'none',
    visibility: 'hidden',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
    width: {
      default: 'fit-content',
      ':empty': '12ch',
    },
    '::before': {
      backgroundPosition: '100% 0, 0 0',
      borderRadius: radiusVars['--cl-radius-full'],
      animationDuration: '1.6s',
      animationIterationCount: 'infinite',
      animationName: {
        default: pan,
        '@media (prefers-reduced-motion: reduce)': 'none',
      },
      animationTimingFunction: 'ease-in-out',
      backgroundImage: `linear-gradient(90deg, transparent 33.33%, ${highlight} 50%, transparent 66.67%), linear-gradient(${colorVars['--cl-color-neutral-alpha-200']}, ${colorVars['--cl-color-neutral-alpha-200']})`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: '300% 100%, 100% 100%',
      content: "''",
      display: 'inline-block',
      marginInlineEnd: '-100%',
      verticalAlign: 'baseline',
      visibility: 'visible',
      height: stylex.firstThatWorks('1cap', '0.7em'),
      width: '100%',
    },
  },
});
