import { createContext, useContext } from 'react';

import { ChartContext } from '../chart/chart-context';
import type { ChartInstance } from '../chart/types';
import type { BarStyleElement } from './bar-chart-canvas';
import type { PaintedProjection, PreparedStackedBars, StackedBarLayout } from './bar-chart-layout';
import type { ActiveBar, BarCategory, BarIdentity, BarSelection } from './types';

/** Only `useBarChart` sets it, so a chart that carries it came from `useBarChart`. */
export const BAR_LAYOUT: unique symbol = Symbol('BarChart layout');

/** What the bar marks paint from. Read by `BarChart` parts only. */
export type BarLayout<TDatum> = Readonly<{
  prepared: PreparedStackedBars<TDatum>;
  projection: StackedBarLayout<TDatum>['projection'];
  isBarActive: ((bar: BarIdentity<TDatum>) => boolean) | undefined;
}>;

/** The measured layout and selection of one stacked bar chart, returned by `BarChart.useBarChart`. */
export type BarChartInstance<TDatum = unknown> = ChartInstance<ActiveBar<TDatum>, BarSelection, BarCategory> &
  Readonly<{ [BAR_LAYOUT]: BarLayout<TDatum> }>;

function isBarChart(chart: ChartInstance): chart is BarChartInstance {
  return BAR_LAYOUT in chart;
}

export function useBarChartContext(part: string) {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error(`<BarChart.${part}> must be used within <Chart.Root>`);
  }
  const { chart, ariaLabel } = context;
  if (!isBarChart(chart)) {
    throw new Error(`<BarChart.${part}> needs a chart from BarChart.useBarChart`);
  }
  return { chart, layout: chart[BAR_LAYOUT], ariaLabel };
}

export interface StackedBarsContextValue {
  /** Registers the `BarChart.Bar` element whose computed `color` paints bars. */
  setBar: (element: BarStyleElement | null) => void;
  projection: PaintedProjection | null;
}

export const StackedBarsContext = createContext<StackedBarsContextValue | null>(null);

export function useStackedBarsContext(part: string) {
  const context = useContext(StackedBarsContext);
  if (!context) {
    throw new Error(`<BarChart.${part}> must be used within <BarChart.StackedBars>`);
  }
  return context;
}
