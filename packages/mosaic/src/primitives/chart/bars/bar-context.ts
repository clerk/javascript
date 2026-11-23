import { createContext, useContext } from 'react';

import { ChartContext } from '../chart-context';
import type { ChartInstance } from '../types';
import type { BarStyleElement } from './bar-canvas';
import type { PreparedStackedBars, StackedBarLayout } from './bar-layout';
import type { ActiveBar, BarCategory, BarIdentity, BarSelection } from './types';

/** Only `useBarChart` sets it, so a chart that carries it came from `useBarChart`. */
export const BAR_LAYOUT: unique symbol = Symbol('bar layout');

/** What the bar marks paint from. Read by the bar parts only. */
export type BarLayout<TDatum> = Readonly<{
  prepared: PreparedStackedBars<TDatum>;
  projection: StackedBarLayout<TDatum>['projection'];
  isBarActive: ((bar: BarIdentity<TDatum>) => boolean) | undefined;
}>;

/** The measured layout and selection of one stacked bar chart, returned by `Chart.useBarChart`. */
export type BarChartInstance<TDatum = unknown> = ChartInstance<ActiveBar<TDatum>, BarSelection, BarCategory> &
  Readonly<{ [BAR_LAYOUT]: BarLayout<TDatum> }>;

function isBarChart(chart: ChartInstance): chart is BarChartInstance {
  return BAR_LAYOUT in chart;
}

export function useBarChartContext(part: string) {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error(`<Chart.${part}> must be used within <Chart.Root>`);
  }
  const { chart, ariaLabel } = context;
  if (!isBarChart(chart)) {
    throw new Error(`<Chart.${part}> needs a chart from Chart.useBarChart`);
  }
  return { chart, layout: chart[BAR_LAYOUT], ariaLabel };
}

export interface StackedBarsContextValue {
  /** Registers the `Chart.Bar` element whose computed `color` paints bars. */
  setBar: (element: BarStyleElement | null) => void;
  /** Registers the `Chart.ProjectionOutline` element whose computed stroke outlines the projection. */
  setProjectionOutline: (element: BarStyleElement | null) => void;
}

export const StackedBarsContext = createContext<StackedBarsContextValue | null>(null);

export function useStackedBarsContext(part: string) {
  const context = useContext(StackedBarsContext);
  if (!context) {
    throw new Error(`<Chart.${part}> must be used within <Chart.StackedBars>`);
  }
  return context;
}
