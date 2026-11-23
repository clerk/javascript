'use client';

import { useMemo } from 'react';

import { prepareStackedBars, projectStackedBars, type StackedBarLayout } from './bar-chart-layout';
import type { BarProjection, BarSeries, ChartFrame } from './types';

export interface StackedBarLayoutOptions<TDatum> {
  data: readonly TDatum[];
  series: readonly BarSeries<TDatum>[];
  /** Returns a unique, stable category key. */
  index: (datum: TDatum, index: number) => string;
  /** Fraction of each category band left empty between bars. Default: 0.28 */
  categoryGap?: number;
  /** Paints a projected total behind the bar at `datumIndex`, when it rises above the bar. */
  projection?: BarProjection;
}

/** Prepared rows and a function that projects them into a measured frame. */
export interface StackedBarLayoutSource<TDatum = unknown> {
  data: readonly TDatum[];
  project: (frame: ChartFrame) => StackedBarLayout<TDatum>;
}

/**
 * Prepares stacked bar data for `BarChart.Root`. Preparation reruns when `data`, `series` or `index`
 * change, so memoize `series` and `index`.
 */
export function useStackedBarLayout<TDatum>({
  data,
  series,
  index,
  categoryGap = 0.28,
  projection,
}: StackedBarLayoutOptions<TDatum>): StackedBarLayoutSource<TDatum> {
  const prepared = useMemo(() => prepareStackedBars({ data, series, index }), [data, index, series]);
  return useMemo(
    () => ({
      data,
      project: (frame: ChartFrame) => projectStackedBars(prepared, { ...frame, categoryGap, projection }),
    }),
    [categoryGap, data, prepared, projection],
  );
}
