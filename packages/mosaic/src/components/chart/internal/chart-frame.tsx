'use client';

import * as stylex from '@stylexjs/stylex';
import React from 'react';

import type { ChartActive, ChartInstance } from '../../../primitives/chart';
import { Chart as Primitive } from '../../../primitives/chart';
import type { MosaicElementProps } from '../../../props';
import { mergeStyleProps, themeProps } from '../../../props';
import { focusOutline } from '../../../styles/focus-outline.styles';
import { reset } from '../../../styles/reset.styles';
import { EmptyState } from '../../empty-state';
import { ChartLegend } from '../chart';
import type { ChartLegendItem } from '../chart-series';
import { frameStyles } from './chart-frame.styles';
import { seriesColors } from './series.styles';
import { SERIES_SLOTS } from './series-bridge';
import type { ChartFormat } from './use-chart-format';

/** `ready` once there is data to draw, `empty` without rows, `error` when painting failed. */
export type ChartState = 'ready' | 'empty' | 'error';

export interface ChartFrameProps extends Omit<MosaicElementProps<'div'>, 'children'> {
  /** Reflected as `data-chart`. */
  type: string;
  state: ChartState;
  /** Total height, legend included, so the legend wrapping never changes the footprint. */
  height: number | string;
  legend: readonly ChartLegendItem[] | null;
  /** The value of `--_cl-chart-series-<i>` for each position, set here so every mark and the tooltip inherit it. */
  seriesColors: readonly string[];
  children: React.ReactNode;
}

/** The `cl-chart` root: a flex column holding the legend and the plot. */
export const ChartFrame = React.forwardRef<HTMLDivElement, ChartFrameProps>(function ChartFrame(
  { type, state, height, legend, seriesColors: colors, children, xstyle, ...rest },
  ref,
) {
  const colorStyles = colors.flatMap((color, position) => {
    const slot = SERIES_SLOTS[position];
    return slot === undefined ? [] : [seriesColors[slot](color)];
  });
  return (
    <div
      ref={ref}
      {...mergeStyleProps(
        themeProps('chart', { chart: type, state }),
        stylex.props(
          reset.base,
          frameStyles.root,
          frameStyles.height(typeof height === 'number' ? `${height}px` : height),
          colorStyles,
          xstyle,
        ),
        rest,
      )}
    >
      {legend && legend.length > 0 ? <ChartLegend items={legend} /> : null}
      <div {...stylex.props(frameStyles.plotArea)}>{children}</div>
    </div>
  );
});

export function ChartPlot({
  chart,
  'aria-label': ariaLabel,
  children,
}: Readonly<{ chart: ChartInstance; 'aria-label': string; children: React.ReactNode }>) {
  return (
    <Primitive.Root
      chart={chart}
      aria-label={ariaLabel}
      height='100%'
      {...mergeStyleProps(themeProps('chart-plot'), stylex.props(frameStyles.plot))}
    >
      {children}
    </Primitive.Root>
  );
}

/** Below the marks, so an opaque mark covers it. */
export function ChartGridLines() {
  return (
    <Primitive.Grid>
      {ticks =>
        ticks.map(tick => (
          <Primitive.YLine
            key={tick.value}
            value={tick.value}
            {...mergeStyleProps(themeProps('chart-grid-line'), stylex.props(frameStyles.gridLine))}
          />
        ))
      }
    </Primitive.Grid>
  );
}

/** Inside the marks' SVG, so it paints over them. */
export function ChartZeroLine() {
  return (
    <Primitive.YLine
      value={0}
      {...mergeStyleProps(themeProps('chart-zero-line'), stylex.props(frameStyles.zeroLine))}
    />
  );
}

export function ChartAxes({
  format,
  showXAxis,
  showYAxis,
  xTicks,
}: Readonly<{ format: ChartFormat; showXAxis: boolean; showYAxis: boolean; xTicks: 'category' | 'calendar' }>) {
  const formatY = React.useCallback((value: number) => format.value(value, 'axis'), [format]);
  const formatX = React.useCallback((key: string) => format.category(key, 'axis'), [format]);
  const tick = (axis: 'x' | 'y') => mergeStyleProps(themeProps('chart-tick', { axis }), stylex.props(frameStyles.tick));
  return (
    <>
      {showYAxis ? (
        <Primitive.YAxis format={formatY}>
          {ticks =>
            ticks.map(item => (
              <Primitive.YTick
                key={item.value}
                tick={item}
                {...tick('y')}
              />
            ))
          }
        </Primitive.YAxis>
      ) : null}
      {showXAxis ? (
        <Primitive.XAxis
          ticks={xTicks}
          format={formatX}
        >
          {ticks =>
            ticks.map(item => (
              <Primitive.XTick
                key={item.key}
                tick={item}
                {...tick('x')}
              />
            ))
          }
        </Primitive.XAxis>
      ) : null}
    </>
  );
}

/** Pointer and keyboard selection with the hover band and the tooltip. */
export function ChartSelectionLayer<TActive extends ChartActive>({
  children,
  activatable,
}: Readonly<{
  /** Returns the tooltip body, or null to hide the tooltip. */
  children: (active: TActive) => React.ReactNode;
  activatable: boolean;
}>) {
  return (
    <Primitive.Selection
      {...mergeStyleProps(
        themeProps('chart-selection'),
        stylex.props(frameStyles.selection, focusOutline.within, activatable && frameStyles.activatable),
      )}
    >
      <Primitive.Cursor {...mergeStyleProps(themeProps('chart-cursor'), stylex.props(frameStyles.cursor))} />
      <Primitive.Tooltip<TActive>
        {...mergeStyleProps(themeProps('chart-tooltip'), stylex.props(reset.base, frameStyles.tooltip))}
      >
        {children}
      </Primitive.Tooltip>
    </Primitive.Selection>
  );
}

/** Covers the plot, for the empty and error states. */
export function ChartOverlay({ slot, children }: Readonly<{ slot: string; children: React.ReactNode }>) {
  return <div {...mergeStyleProps(themeProps(slot), stylex.props(frameStyles.overlay))}>{children}</div>;
}

export function DefaultChartEmptyState({ label }: Readonly<{ label: string }>) {
  return (
    <EmptyState.Root>
      <EmptyState.Label>{label}</EmptyState.Label>
    </EmptyState.Root>
  );
}
