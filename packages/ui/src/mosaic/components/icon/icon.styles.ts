import * as stylex from '@stylexjs/stylex';

import { durationVars, space } from '../../tokens.stylex';

export const styles = stylex.create({
  base: {
    // A container that wants the icon at a different strength than its label writes
    // `--_cl-icon-color` (see `button.styles.ts`); everywhere else the icon inherits as before.
    color: 'var(--_cl-icon-color, currentColor)',
    display: 'inline-block',
    flexShrink: 0,
    // Transitions don't inherit, so the container's own color transition doesn't animate this.
    transitionDuration: durationVars['--cl-duration-fast'],
    transitionProperty: 'color',
    transitionTimingFunction: 'linear',
  },
});

export const sizes = stylex.create({
  sm: { height: space['3.5'], width: space['3.5'] },
  md: { height: space['4'], width: space['4'] },
  lg: { height: space['5'], width: space['5'] },
});
