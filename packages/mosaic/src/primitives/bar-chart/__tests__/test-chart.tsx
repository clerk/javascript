import { type ReactNode, type RefObject, useLayoutEffect } from 'react';

import { Chart } from '../../chart';
import { type ActiveBar, BarChart, type BarChartInstance, type UseBarChartOptions } from '../index';

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
  /** Mounts `Chart.Selection`. Default: true */
  selectionPart?: boolean;
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
  selectionPart = true,
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
    <Chart.Root
      chart={chart}
      height={height}
      aria-label={ariaLabel}
    >
      <BarChart.StackedBars>
        {bar ? <BarChart.Bar className={barClassName} /> : null}
        <BarChart.ProjectionOutline />
        <Chart.YLine value={0} />
      </BarChart.StackedBars>
      <Chart.XAxis format={formatXTick}>
        {ticks =>
          ticks.map(tick => (
            <Chart.XTick
              key={tick.key}
              tick={tick}
            />
          ))
        }
      </Chart.XAxis>
      {selectionPart ? (
        <Chart.Selection>
          <Chart.Cursor data-testid='cursor' />
          {renderTooltip ? (
            <Chart.Tooltip<ActiveBar<TDatum>>
              boundaryRef={boundary}
              data-testid='tooltip'
            >
              {renderTooltip}
            </Chart.Tooltip>
          ) : null}
        </Chart.Selection>
      ) : null}
    </Chart.Root>
  );
}
