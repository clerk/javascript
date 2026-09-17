import * as stylex from '@stylexjs/stylex';

import { radiusVars, space } from '../../tokens.stylex';

const spin = stylex.keyframes({
  from: { transform: 'rotate(0deg)' },
  to: { transform: 'rotate(360deg)' },
});

export const styles = stylex.create({
  base: {
    // Both colors come off `currentColor` rather than a fixed pair, so the spinner reads on
    // whatever it sits on — a card, or the fill of a `filled` button, where a card-foreground
    // arc would disappear.
    borderColor: `color-mix(in oklab, currentColor 20%, transparent)`,
    borderRadius: radiusVars['--cl-radius-full'],
    borderStyle: 'solid',
    // The ring is one uniform border with a single arc picked out in the foreground color;
    // rotating the whole element is what animates the arc around it.
    animationDuration: '600ms',
    animationIterationCount: 'infinite',
    animationName: {
      default: spin,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationTimingFunction: 'linear',
    borderBlockStartColor: 'currentColor',
    boxSizing: 'border-box',
    display: 'inline-block',
    flexShrink: 0,
  },
});

// Sized off the `Icon` scale, since a spinner stands in for an icon wherever it appears. The
// border thins with it so the ring keeps its proportion rather than swallowing the small one.
export const sizes = stylex.create({
  sm: { borderWidth: '1.5px', height: space['3.5'], width: space['3.5'] },
  md: { borderWidth: '2px', height: space['4'], width: space['4'] },
});
