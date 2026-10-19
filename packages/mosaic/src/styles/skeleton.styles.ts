import * as stylex from '@stylexjs/stylex';

import { colorVars } from '../tokens.stylex';

const highlight =
  'light-dark(color-mix(in oklab, var(--cl-color-background) 62%, transparent), color-mix(in oklab, var(--cl-color-neutral) 7%, transparent))';

const bar = colorVars['--cl-color-neutral-alpha-200'];

const roundedRadius = 'round(0.5cap, 1px)';
const roundedHeight = `calc(2 * ${roundedRadius})`;

const supportsRound = '@supports (width: round(1px, 1px))';

const shine = `linear-gradient(90deg, transparent 33.33%, ${highlight} 50%, transparent 66.67%)`;

const capEnd = (side: string, radius: string) =>
  `radial-gradient(circle at ${side} 50%, ${bar} calc(${radius} - 0.5px), transparent ${radius})`;

const translate = stylex.keyframes({
  from: { transform: 'translateX(-100%)' },
  to: { transform: 'translateX(100%)' },
});

const pan = stylex.keyframes({
  from: { backgroundPosition: '100% 50%, 0 50%, 100% 50%, 50% 50%' },
  to: { backgroundPosition: '0% 50%, 0 50%, 100% 50%, 50% 50%' },
});

export const skeletonStyles = stylex.create({
  fill: {
    '::before': {
      inset: 0,
      backgroundColor: colorVars['--cl-color-neutral-alpha-200'],
      content: "''",
      position: 'absolute',
      visibility: 'visible',
    },
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
      visibility: 'visible',
    },
  },
  textBar: {
    // eslint-disable-next-line @stylexjs/valid-styles -- Safari only supports the prefixed `box-decoration-break`; it compiles and emits correctly.
    WebkitBoxDecorationBreak: 'clone',
    backgroundPosition: '100% 50%, 0 50%, 100% 50%, 50% 50%',
    animationDuration: '1.6s',
    animationIterationCount: 'infinite',
    animationName: {
      default: pan,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: 'ease-in-out',
    backgroundImage: {
      default: `${shine}, ${capEnd('100%', '0.5cap')}, ${capEnd('0', '0.5cap')}, linear-gradient(${bar}, ${bar})`,
      [supportsRound]: `${shine}, ${capEnd('100%', roundedRadius)}, ${capEnd('0', roundedRadius)}, linear-gradient(${bar}, ${bar})`,
    },
    backgroundRepeat: 'no-repeat',
    backgroundSize: {
      default: '300% 1cap, 0.5cap 1cap, 0.5cap 1cap, calc(100% - 1cap) 1cap',
      [supportsRound]: `300% ${roundedHeight}, ${roundedRadius} ${roundedHeight}, ${roundedRadius} ${roundedHeight}, calc(100% - ${roundedHeight}) ${roundedHeight}`,
    },
    boxDecorationBreak: 'clone',
    color: 'transparent',
    visibility: 'visible',
  },
});
