import { type ReactNode, type RefObject, useLayoutEffect } from 'react';

import { BarChart, type BarChartInstance, type UseBarChartOptions } from '../index';
import type { ActiveBar } from '../types';

export type TestChartProps<TDatum> = Pick<
  UseBarChartOptions<TDatum>,
  | 'data'
  | 'series'
  | 'index'
  | 'categoryGap'
  | 'projection'
  | 'isBarActive'
  | 'selection'
  | 'onSelectionChange'
  | 'onActivate'
> & {
  ariaLabel: string;
  formatXTick?: (value: string) => string | null;
  /** Mounts `BarChart.BarSelection`. Default: true */
  barSelection?: boolean;
  renderTooltip?: (active: ActiveBar<TDatum>) => ReactNode;
  boundary?: RefObject<HTMLElement | null>;
  height?: number | string;
  /** Mounts `BarChart.Bar`. Default: true */
  bar?: boolean;
  barClassName?: string;
  /** Receives the chart object after each render. */
  chartRef?: { current: BarChartInstance<TDatum> | null };
};

/** Composes every bar chart part from one flat set of test props. */
export function TestChart<TDatum>({
  ariaLabel,
  formatXTick,
  barSelection = true,
  renderTooltip,
  boundary,
  height,
  bar = true,
  barClassName,
  chartRef,
  ...options
}: TestChartProps<TDatum>) {
  const chart = BarChart.useBarChart({ ...options, formatCategory: formatXTick });
  useLayoutEffect(() => {
    if (chartRef) {
      chartRef.current = chart;
    }
  });
  return (
    <BarChart.Root
      chart={chart}
      height={height}
      aria-label={ariaLabel}
    >
      <BarChart.StackedBars>
        {bar ? <BarChart.Bar className={barClassName} /> : null}
        <BarChart.ProjectionOutline />
        <BarChart.ZeroLine />
      </BarChart.StackedBars>
      <BarChart.XAxis format={formatXTick}>
        {ticks =>
          ticks.map(tick => (
            <BarChart.XTick
              key={tick.key}
              tick={tick}
            />
          ))
        }
      </BarChart.XAxis>
      {barSelection ? (
        <BarChart.BarSelection>
          <BarChart.Cursor data-testid='cursor' />
          {renderTooltip ? (
            <BarChart.Tooltip<TDatum>
              boundaryRef={boundary}
              data-testid='tooltip'
            >
              {renderTooltip}
            </BarChart.Tooltip>
          ) : null}
        </BarChart.BarSelection>
      ) : null}
    </BarChart.Root>
  );
}
