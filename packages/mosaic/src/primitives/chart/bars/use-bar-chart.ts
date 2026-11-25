'use client';

import React from 'react';

import { useChartFrame, useChartInstance } from '../internal/use-chart-instance';
import type { ChartOptions } from '../types';
import { BAR_LAYOUT, type BarChartInstance } from './bar-context';
import { prepareStackedBars, projectStackedBars } from './bar-layout';
import { barSelectionModel, DEFAULT_BAR_MESSAGES } from './bar-selection';
import type { ActiveBar, BarChartMessages, BarIdentity, BarProjection, BarSelection, BarSeries } from './types';

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
  /** Returns false for a bar that `Chart.Bar` styles through `data-inactive`. Default: every bar is active */
  isBarActive?: (bar: BarIdentity<TDatum>) => boolean;
  /** Screen reader text, including how Up and Down move between sections. Default: English */
  messages?: Partial<BarChartMessages>;
}

/**
 * Measures, lays out and selects a stacked bar chart. Pass the result to `Chart.Root`, or render
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
  const {
    vertical = DEFAULT_BAR_MESSAGES.vertical,
    positiveValues = DEFAULT_BAR_MESSAGES.positiveValues,
    negativeValues = DEFAULT_BAR_MESSAGES.negativeValues,
    projected = DEFAULT_BAR_MESSAGES.projected,
  } = options.messages ?? {};
  const projectionLabel = projection?.label;
  const { formatValue = String } = options;
  const model = React.useMemo(
    () =>
      barSelectionModel({
        layout,
        data,
        series,
        projection:
          projectionIndex === undefined || projectionValue === undefined
            ? undefined
            : { datumIndex: projectionIndex, value: projectionValue, label: projectionLabel },
        formatValue,
        messages: { vertical, positiveValues, negativeValues, projected },
      }),
    [
      data,
      formatValue,
      layout,
      negativeValues,
      positiveValues,
      projectionIndex,
      projectionLabel,
      projectionValue,
      projected,
      series,
      vertical,
    ],
  );
  const instance = useChartInstance({ frame, layout, model, options });

  return {
    ...instance,
    scaleY: layout.scaleY,
    yTicks: layout.yTicks,
    [BAR_LAYOUT]: { prepared, projection: layout.projection, isBarActive },
  };
}
