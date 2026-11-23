import type { ReactNode } from 'react';

import {
  BarChart,
  type BarChartBarSelectionProps,
  type BarChartStackedBarsProps,
  type StackedBarLayoutOptions,
} from '../index';
import type { ActiveBar } from '../types';

export type TestChartProps<TDatum> = StackedBarLayoutOptions<TDatum> &
  Pick<BarChartBarSelectionProps<TDatum>, 'onActiveChange' | 'onActivate'> & {
    ariaLabel: string;
    formatXTick?: (value: string) => string | null;
    /** Mounts `BarChart.BarSelection`. Default: true */
    barSelection?: boolean;
    renderTooltip?: (active: ActiveBar<TDatum>) => ReactNode;
    boundary?: React.RefObject<HTMLElement | null>;
    height?: number | string;
    barClassName?: string;
    isBarActive?: BarChartStackedBarsProps<TDatum>['isBarActive'];
  };

/** Composes every bar chart part from one flat set of test props. */
export function TestChart<TDatum>({
  data,
  series,
  index,
  categoryGap,
  projection,
  ariaLabel,
  formatXTick,
  barSelection = true,
  onActiveChange,
  onActivate,
  renderTooltip,
  boundary,
  height,
  barClassName,
  isBarActive,
}: TestChartProps<TDatum>) {
  const layout = BarChart.useStackedBarLayout({ data, series, index, categoryGap, projection });
  return (
    <BarChart.Root
      layout={layout}
      height={height}
      aria-label={ariaLabel}
    >
      <BarChart.StackedBars<TDatum> isBarActive={isBarActive}>
        <BarChart.Bar className={barClassName} />
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
        <BarChart.BarSelection<TDatum>
          onActiveChange={onActiveChange}
          onActivate={onActivate}
          formatCategory={formatXTick}
        >
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
