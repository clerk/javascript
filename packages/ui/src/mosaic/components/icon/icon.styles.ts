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
    // The default is `instant` because the arrival never varies (see `motion.md`); only the exit
    // is contextual, so a container that wants one hands its timing down the same way it hands
    // down `--_cl-icon-color` (see `button.styles.ts`).
    transitionDuration: `var(--_cl-icon-duration, ${durationVars['--cl-duration-instant']})`,
    transitionProperty: 'color',
    transitionTimingFunction: 'linear',
  },
});

export const sizes = stylex.create({
  xs: { height: space['3'], width: space['3'] },
  sm: { height: space['3.5'], width: space['3.5'] },
  md: { height: space['4'], width: space['4'] },
  lg: { height: space['5'], width: space['5'] },
});
