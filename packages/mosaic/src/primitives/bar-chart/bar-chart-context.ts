import { createContext, type RefObject, useContext } from 'react';

import type { BarStyleElement } from './bar-chart-canvas';
import type { PaintedProjection, StackedBarLayout } from './bar-chart-layout';
import type { ActiveBar, BarCategory, ChartFrame, ChartPlot, ChartSize } from './types';

export interface BarChartContextValue {
  frame: ChartFrame;
  layout: StackedBarLayout<unknown>;
  data: readonly unknown[];
  ariaLabel: string;
  /** Marks the chart interactive while the returned cleanup has not run. */
  registerInteraction: () => () => void;
  setActiveCategory: (category: string | null) => void;
}

export const BarChartContext = createContext<BarChartContextValue | null>(null);

/** Separate from `BarChartContext` so a selection change re-renders only the parts that show it. */
export const BarChartActiveCategoryContext = createContext<string | null>(null);

export function useBarChartContext<TDatum = unknown>(part: string) {
  const context = useContext(BarChartContext);
  if (!context) {
    throw new Error(`<BarChart.${part}> must be used within <BarChart.Root>`);
  }
  return {
    ...context,
    // SAFETY: `BarChart.Root` holds the rows and layout of one `useStackedBarLayout<TDatum>` call, and
    // a part's `TDatum` is the type of the chart it renders in. Context cannot carry the parameter.
    // eslint-disable-next-line typescript/consistent-type-assertions -- React context is not generic per consumer.
    layout: context.layout as StackedBarLayout<TDatum>,
    // eslint-disable-next-line typescript/consistent-type-assertions -- React context is not generic per consumer.
    data: context.data as readonly TDatum[],
  };
}

export function hasArea(size: ChartSize) {
  return size.width > 0 && size.height > 0;
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

export interface BarSelectionContextValue {
  activeBar: ActiveBar<unknown> | null;
  /** The selected category while a section is selected. */
  selectedCategory: BarCategory | undefined;
  plot: ChartPlot;
  chartWidth: number;
  /** Spans the whole chart, so its client rect anchors the tooltip. */
  chartBoxRef: RefObject<HTMLElement | null>;
  /** Makes the surface focusable while the returned cleanup has not run. */
  registerTooltip: () => () => void;
}

export const BarSelectionContext = createContext<BarSelectionContextValue | null>(null);

export function useBarSelectionContext(part: string) {
  const context = useContext(BarSelectionContext);
  if (!context) {
    throw new Error(`<BarChart.${part}> must be used within <BarChart.BarSelection>`);
  }
  return context;
}
