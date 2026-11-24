import { type ReactNode, type RefObject, useLayoutEffect } from 'react';

import { type ActiveBar, type BarChartInstance, Chart, type UseBarChartOptions } from '..';

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
  | 'messages'
> & {
  ariaLabel: string;
  formatXTick?: (value: string) => string | null;
  /** Mounts `Chart.Selection`. Default: true */
  selectionPart?: boolean;
  renderTooltip?: (active: ActiveBar<TDatum>) => ReactNode;
  boundary?: RefObject<HTMLElement | null>;
  height?: number | string;
  /** Mounts `Chart.Bar`. Default: true */
  bar?: boolean;
  barClassName?: string;
  outlineClassName?: string;
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
  outlineClassName,
  chartRef,
  ...options
}: TestChartProps<TDatum>) {
  const chart = Chart.useBarChart({ ...options, formatCategory: formatXTick });
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
      <Chart.Bars>
        {bar ? <Chart.Bar className={barClassName} /> : null}
        <Chart.ProjectionOutline className={outlineClassName} />
        <Chart.YLine value={0} />
      </Chart.Bars>
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
