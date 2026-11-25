import * as stylex from '@stylexjs/stylex';

import type { SeriesSlot } from './series-bridge';

type SeriesSelector = `:where([data-series='${SeriesSlot}'])`;

// One rule per slot. `satisfies` fails the type check when `SERIES_SLOTS` gains a slot this map lacks.
const markBySeries = {
  default: null,
  ":where([data-series='0'])": 'var(--_cl-chart-series-0)',
  ":where([data-series='1'])": 'var(--_cl-chart-series-1)',
  ":where([data-series='2'])": 'var(--_cl-chart-series-2)',
  ":where([data-series='3'])": 'var(--_cl-chart-series-3)',
  ":where([data-series='4'])": 'var(--_cl-chart-series-4)',
  ":where([data-series='5'])": 'var(--_cl-chart-series-5)',
  ":where([data-series='6'])": 'var(--_cl-chart-series-6)',
  ":where([data-series='7'])": 'var(--_cl-chart-series-7)',
} as const satisfies { default: null } & Record<SeriesSelector, string>;

/** On an element a primitive stamps with a position `data-series`: `--_cl-chart-mark` is that series' color. */
export const seriesMark = stylex.create({
  mark: {
    '--_cl-chart-mark': markBySeries,
  },
});

/** On the chart root: `--_cl-chart-series-<i>` for each position. */
export const seriesColors = stylex.create({
  0: (color: string) => ({ '--_cl-chart-series-0': color }),
  1: (color: string) => ({ '--_cl-chart-series-1': color }),
  2: (color: string) => ({ '--_cl-chart-series-2': color }),
  3: (color: string) => ({ '--_cl-chart-series-3': color }),
  4: (color: string) => ({ '--_cl-chart-series-4': color }),
  5: (color: string) => ({ '--_cl-chart-series-5': color }),
  6: (color: string) => ({ '--_cl-chart-series-6': color }),
  7: (color: string) => ({ '--_cl-chart-series-7': color }),
});
