'use client';

import React from 'react';

import { prepareStackedBars, projectStackedBars, type StackedBarLayout } from './bar-chart-layout';
import { barSelectionModel } from './bar-chart-selection';
import type { ActiveBar, BarCategory, BarIdentity, BarProjection, BarSelection, BarSeries } from './types';
import { type ChartOptions, useChartFrame, useChartInstance } from './use-chart-instance';

export type { ChartInteractionProps as BarChartInteractionProps, XTickMode, XTicksOptions } from './use-chart-instance';

export interface UseBarChartOptions<TDatum> extends ChartOptions<BarSelection, ActiveBar<TDatum>> {
  data: readonly TDatum[];
  /** Stack order and each series' value. Memoize it: a new array prepares the stacks again. */
  series: readonly BarSeries<TDatum>[];
  /** Returns a unique, stable category key. Memoize it: a new function prepares the stacks again. */
  index: (datum: TDatum, index: number) => string;
  /** Fraction of each category band left empty between bars. Default: 0.28 */
  categoryGap?: number;
  /** Paints a projected total behind the bar at `datumIndex`, when it rises above the bar. */
  projection?: BarProjection;
  /** Returns false for a bar that `BarChart.Bar` styles through `data-inactive`. Default: every bar is active */
  isBarActive?: (bar: BarIdentity<TDatum>) => boolean;
}

/** The measured layout and selection of one chart, returned by `BarChart.useBarChart`. */
export type BarChartInstance<TDatum = unknown> = Omit<StackedBarLayout<TDatum>, 'categories' | 'yTicks'> &
  ReturnType<typeof useChartInstance<BarSelection, ActiveBar<TDatum>, BarCategory>> &
  Readonly<{
    isBarActive: ((bar: BarIdentity<TDatum>) => boolean) | undefined;
  }>;

/**
 * Measures, lays out and selects a stacked bar chart. Pass the result to `BarChart.Root`, or render
 * from it directly.
 */
export function useBarChart<TDatum>(options: UseBarChartOptions<TDatum>): BarChartInstance<TDatum> {
  const { data, series, index, categoryGap = 0.28, projection, isBarActive } = options;

  const frame = useChartFrame(options.margin);
  const { size, margin } = frame;
  // The owner re-renders on every selection change, so an inline `projection` must not relayout.
  const projectionIndex = projection?.datumIndex;
  const projectionValue = projection?.value;
  const prepared = React.useMemo(() => prepareStackedBars({ data, series, index }), [data, index, series]);
  const layout = React.useMemo(
    () =>
      projectStackedBars(prepared, {
        size,
        margin,
        categoryGap,
        projection:
          projectionIndex === undefined || projectionValue === undefined
            ? undefined
            : { datumIndex: projectionIndex, value: projectionValue },
      }),
    [categoryGap, margin, prepared, projectionIndex, projectionValue, size],
  );
  const model = React.useMemo(() => barSelectionModel(layout, data), [data, layout]);
  const instance = useChartInstance({ frame, layout, model, options });

  return { ...layout, ...instance, isBarActive };
}
