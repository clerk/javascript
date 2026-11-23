import React from 'react';

import type { ChartActive, ChartInstance as PrimitiveChartInstance } from '../../../primitives/chart';
import type { ChartLegendItem, ChartTooltipMetric, ChartTooltipRow } from '../chart-series';
import type { ChartFormat } from './use-chart-format';

/** Only a styled chart-type hook sets it, so a chart that carries it came from one. */
export const CHART_STYLE: unique symbol = Symbol('chart style');

/** What a tooltip shows for the selection. Everything but `active` spreads into `Chart.TooltipContent`. */
export interface ChartTooltipData<TActive extends ChartActive = ChartActive> {
  active: TActive;
  heading: string;
  metrics: readonly ChartTooltipMetric[];
  /** The selected section's series with a value, top of the stack first. */
  rows: readonly ChartTooltipRow[];
}

/** What the styled parts read beyond the headless chart. A styled chart-type hook computes it. */
export interface ChartStyle<TActive extends ChartActive = ChartActive> {
  /** Reflected as `data-chart` on the root. */
  type: 'bar';
  /** `colors[i]` is the value of `--_cl-chart-series-<i>` on the root. */
  colors: readonly string[];
  /** The series, then a labelled projection. */
  legend: readonly ChartLegendItem[];
  format: ChartFormat;
  empty: boolean;
  activatable: boolean;
  /** The tooltip for the current selection, or null to hide it. */
  tooltip: ChartTooltipData<TActive> | null;
}

/** A chart from a styled chart-type hook, such as `Chart.useBarChart`. `Chart.Root` takes it. */
export type ChartInstance<TActive extends ChartActive = ChartActive> = PrimitiveChartInstance<TActive> &
  Readonly<{ [CHART_STYLE]: ChartStyle<TActive> }>;

export interface ChartStyleContextValue {
  style: ChartStyle;
  /** Where `Chart.Legend` renders, above the plot. Null until the root mounts. */
  legendHost: HTMLElement | null;
}

export const ChartStyleContext = React.createContext<ChartStyleContextValue | null>(null);

export function useChartStyle(part: string): ChartStyleContextValue {
  const context = React.useContext(ChartStyleContext);
  if (!context) {
    throw new Error(`<Chart.${part}> must be used within <Chart.Root>`);
  }
  return context;
}
