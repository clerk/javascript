'use client';

import React from 'react';

import {
  type ActiveBar,
  type BarChartInstance as PrimitiveBarChartInstance,
  Chart as Primitive,
  type UseBarChartOptions as PrimitiveUseBarChartOptions,
} from '../../../primitives/chart';
import type { ChartFormatPlace, ChartLegendItem, ChartSeries } from '../chart-series';
import { CHART_STYLE, type ChartStyle } from '../internal/chart-style';
import { bridgeSeries } from '../internal/series-bridge';
import { useChartFormat } from '../internal/use-chart-format';
import {
  barActivity,
  type BarChartHighlight,
  type BarChartProjection,
  barTooltip,
  categoryGapFor,
} from './bar-tooltip';

export interface UseBarChartOptions<TDatum> extends Omit<
  PrimitiveUseBarChartOptions<TDatum>,
  'series' | 'projection' | 'isBarActive' | 'formatCategory'
> {
  /** Stack order, bottom first. Define it at module level or memoize it. */
  series: readonly ChartSeries<TDatum>[];
  /** A projected total, drawn when it rises above its row. `label` names it in the legend and tooltip. */
  projection?: BarChartProjection;
  /**
   * The bars that keep full strength. Every other bar is dimmed with an opaque mix toward
   * `--cl-color-surface`. Without it no bar is dimmed.
   */
  highlight?: BarChartHighlight | null;
  /** Formats a value. `place` is `'axis'` for a tick and `'tooltip'` for a tooltip row. */
  formatValue?: (value: number, place: ChartFormatPlace) => string;
  /**
   * Formats a category key. The `'tooltip'` form also names the period in announcements. Default:
   * a UTC date key such as `2026-01-05` as a date, any other key as is
   */
  formatCategory?: (key: string, place: ChartFormatPlace) => string;
}

/** A styled stacked bar chart from `Chart.useBarChart`. */
export type BarChartInstance<TDatum = unknown> = PrimitiveBarChartInstance<TDatum> &
  Readonly<{ [CHART_STYLE]: ChartStyle<ActiveBar<TDatum>> }>;

/** Room for the axes the styled parts draw. */
const MARGIN = { top: 8, right: 0, bottom: 32, left: 44 };

const PROJECTION_COLOR = 'var(--cl-color-foreground-secondary)';

/**
 * The headless `Chart.useBarChart` with series colors, a highlight, formatting and the legend and
 * tooltip content the styled parts render. Pass the result to `Chart.Root`.
 */
export function useBarChart<TDatum>(options: UseBarChartOptions<TDatum>): BarChartInstance<TDatum> {
  const { data, index, series, projection, highlight, formatValue, formatCategory, categoryGap, margin, ...selection } =
    options;
  const bridge = React.useMemo(() => bridgeSeries(series), [series]);
  const format = useChartFormat({ formatValue, formatCategory });

  const { category, section, series: highlightSeries } = highlight ?? {};
  const isBarActive = React.useMemo(
    () => barActivity(bridge, index, { category, section, series: highlightSeries }),
    [bridge, index, category, section, highlightSeries],
  );
  const announceCategory = React.useCallback((key: string) => format.category(key, 'tooltip'), [format]);
  const chart = Primitive.useBarChart({
    ...selection,
    data,
    index,
    series: bridge.positioned,
    projection,
    isBarActive,
    categoryGap: categoryGap ?? categoryGapFor(data.length),
    margin: { ...MARGIN, ...margin },
    formatCategory: announceCategory,
  });

  const projectionLabel = projection?.label;
  const projectionDescription = projection?.description;
  const legend = React.useMemo(
    (): readonly ChartLegendItem[] =>
      projectionLabel === undefined
        ? series
        : [
            ...series,
            {
              key: 'projection',
              label: projectionLabel,
              description: projectionDescription,
              color: PROJECTION_COLOR,
              swatch: 'dashed',
            },
          ],
    [projectionDescription, projectionLabel, series],
  );
  const active = chart.selected;
  const tooltip = React.useMemo(
    () => (active ? barTooltip({ active, series, projection, format }) : null),
    [active, series, projection, format],
  );
  const empty = data.length === 0;
  const activatable = selection.onActivate !== undefined;
  const style = React.useMemo(
    (): ChartStyle<ActiveBar<TDatum>> => ({
      type: 'bar',
      colors: bridge.colors,
      legend,
      format,
      empty,
      activatable,
      tooltip,
    }),
    [activatable, bridge.colors, empty, format, legend, tooltip],
  );
  return { ...chart, [CHART_STYLE]: style };
}
