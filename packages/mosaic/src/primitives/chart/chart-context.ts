import { createContext, type RefObject, useContext } from 'react';

import type { CartesianChartInstance, ChartInstance, ChartSize } from './types';

export interface ChartContextValue {
  chart: ChartInstance;
  ariaLabel: string;
  /** Marks the chart interactive while the returned cleanup has not run. */
  registerInteraction: () => () => void;
}

export const ChartContext = createContext<ChartContextValue | null>(null);

export function useChartContext(part: string) {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error(`<Chart.${part}> must be used within <Chart.Root>`);
  }
  return context;
}

function hasValueAxis(chart: ChartInstance): chart is CartesianChartInstance {
  return 'scaleY' in chart;
}

/** The chart of a part that draws against the value axis, such as `Chart.YAxis`. */
export function useCartesianChart(part: string) {
  const { chart } = useChartContext(part);
  if (!hasValueAxis(chart)) {
    throw new Error(`<Chart.${part}> needs a chart with a value axis, such as one from Chart.useBarChart`);
  }
  return chart;
}

export function hasArea(size: ChartSize) {
  return size.width > 0 && size.height > 0;
}

export interface SelectionContextValue {
  /** Spans the whole chart, so its client rect anchors the tooltip. */
  chartBoxRef: RefObject<HTMLElement | null>;
  /** Makes the surface focusable while the returned cleanup has not run. */
  registerTooltip: () => () => void;
}

export const SelectionContext = createContext<SelectionContextValue | null>(null);

export function useSelectionContext(part: string) {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error(`<Chart.${part}> must be used within <Chart.Selection>`);
  }
  return context;
}
