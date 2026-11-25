'use client';

import * as stylex from '@stylexjs/stylex';
import React from 'react';

import {
  Chart as Primitive,
  type ChartActive,
  type ChartCursorProps as PrimitiveChartCursorProps,
  type ChartGridProps as PrimitiveChartGridProps,
  type ChartSelectionProps as PrimitiveChartSelectionProps,
  type ChartTooltipProps as PrimitiveChartTooltipProps,
  type ChartXAxisProps as PrimitiveChartXAxisProps,
  type ChartXTickProps as PrimitiveChartXTickProps,
  type ChartYAxisProps as PrimitiveChartYAxisProps,
  type ChartYLineProps as PrimitiveChartYLineProps,
  type ChartYTickProps as PrimitiveChartYTickProps,
} from '../../primitives/chart';
import type { MosaicStyleProps } from '../../props';
import { mergeStyleProps, themeProps } from '../../props';
import { reset } from '../../styles/reset.styles';
import { ChartTooltipContent } from './chart';
import { partStyles } from './chart-parts.styles';
import { type ChartTooltipData, useChartStyle } from './internal/chart-style';

type Styled<Props> = Omit<Props, 'className' | 'style'> & MosaicStyleProps;

export type ChartGridProps = Styled<PrimitiveChartGridProps>;

/** Dotted lines at the Y ticks, below the bars. Children replace the lines. */
export const ChartGrid = React.forwardRef<SVGSVGElement, ChartGridProps>(function ChartGrid(
  { children, xstyle, ...rest },
  ref,
) {
  useChartStyle('Grid');
  return (
    <Primitive.Grid
      ref={ref}
      {...mergeStyleProps(themeProps('chart-grid'), stylex.props(xstyle), rest)}
    >
      {children ??
        (ticks =>
          ticks.map(tick => (
            <Primitive.YLine
              key={tick.value}
              value={tick.value}
              {...mergeStyleProps(themeProps('chart-grid-line'), stylex.props(partStyles.gridLine))}
            />
          )))}
    </Primitive.Grid>
  );
});

export type ChartYLineProps = Styled<PrimitiveChartYLineProps>;

/** A solid line at a Y value, such as the zero line inside `Chart.Bars`. */
export const ChartYLine = React.forwardRef<SVGLineElement, ChartYLineProps>(function ChartYLine(
  { xstyle, ...rest },
  ref,
) {
  return (
    <Primitive.YLine
      ref={ref}
      {...mergeStyleProps(themeProps('chart-y-line'), stylex.props(partStyles.yLine, xstyle), rest)}
    />
  );
});

export type ChartYTickProps = Styled<PrimitiveChartYTickProps>;

export const ChartYTick = React.forwardRef<SVGTextElement, ChartYTickProps>(function ChartYTick(
  { xstyle, ...rest },
  ref,
) {
  return (
    <Primitive.YTick
      ref={ref}
      {...mergeStyleProps(themeProps('chart-y-tick'), stylex.props(partStyles.tick, xstyle), rest)}
    />
  );
});

export type ChartYAxisProps = Styled<PrimitiveChartYAxisProps>;

/**
 * Value labels beside the plot, formatted with the chart's `formatValue`. Leaves them out while
 * the chart has no rows. Children replace the labels.
 */
export const ChartYAxis = React.forwardRef<SVGSVGElement, ChartYAxisProps>(function ChartYAxis(
  { format, children, xstyle, ...rest },
  ref,
) {
  const { style } = useChartStyle('YAxis');
  const formatValue = style.format.value;
  const formatTick = React.useCallback((value: number) => formatValue(value, 'axis'), [formatValue]);
  return (
    <Primitive.YAxis
      ref={ref}
      format={format ?? formatTick}
      {...mergeStyleProps(themeProps('chart-y-axis'), stylex.props(xstyle), rest)}
    >
      {children ??
        (ticks =>
          style.empty
            ? null
            : ticks.map(tick => (
                <ChartYTick
                  key={tick.value}
                  tick={tick}
                />
              )))}
    </Primitive.YAxis>
  );
});

export type ChartXTickProps = Styled<PrimitiveChartXTickProps>;

export const ChartXTick = React.forwardRef<SVGTextElement, ChartXTickProps>(function ChartXTick(
  { xstyle, ...rest },
  ref,
) {
  return (
    <Primitive.XTick
      ref={ref}
      {...mergeStyleProps(themeProps('chart-x-tick'), stylex.props(partStyles.tick, xstyle), rest)}
    />
  );
});

export type ChartXAxisProps = Styled<PrimitiveChartXAxisProps>;

/** Category labels below the plot, formatted with the chart's `formatCategory`. Children replace the labels. */
export const ChartXAxis = React.forwardRef<SVGSVGElement, ChartXAxisProps>(function ChartXAxis(
  { format, children, xstyle, ...rest },
  ref,
) {
  const { style } = useChartStyle('XAxis');
  const formatCategory = style.format.category;
  const formatTick = React.useCallback((key: string) => formatCategory(key, 'axis'), [formatCategory]);
  return (
    <Primitive.XAxis
      ref={ref}
      format={format ?? formatTick}
      {...mergeStyleProps(themeProps('chart-x-axis'), stylex.props(xstyle), rest)}
    >
      {children ??
        (ticks =>
          ticks.map(tick => (
            <ChartXTick
              key={tick.key}
              tick={tick}
            />
          )))}
    </Primitive.XAxis>
  );
});

export type ChartSelectionProps = Styled<PrimitiveChartSelectionProps>;

/** Pointer and keyboard selection. Without children it renders `Chart.Cursor` and `Chart.Tooltip`. */
export const ChartSelection = React.forwardRef<HTMLDivElement, ChartSelectionProps>(function ChartSelection(
  { children, xstyle, ...rest },
  ref,
) {
  const { style } = useChartStyle('Selection');
  return (
    <Primitive.Selection
      ref={ref}
      {...mergeStyleProps(
        themeProps('chart-selection'),
        stylex.props(
          partStyles.selection,
          partStyles.selectionRing,
          style.activatable && partStyles.activatable,
          xstyle,
        ),
        rest,
      )}
    >
      {children ?? (
        <>
          <ChartCursor />
          <ChartTooltip />
        </>
      )}
    </Primitive.Selection>
  );
});

export type ChartCursorProps = Styled<PrimitiveChartCursorProps>;

/** The hover band behind the bars. */
export const ChartCursor = React.forwardRef<HTMLDivElement, ChartCursorProps>(function ChartCursor(
  { xstyle, ...rest },
  ref,
) {
  return (
    <Primitive.Cursor
      ref={ref}
      {...mergeStyleProps(themeProps('chart-cursor'), stylex.props(partStyles.cursor, xstyle), rest)}
    />
  );
});

export type ChartTooltipProps<TActive extends ChartActive = ChartActive> = Styled<
  Omit<PrimitiveChartTooltipProps<TActive>, 'children'>
> & {
  /** Renders the tooltip body. Return null to hide it. Default: `Chart.TooltipContent` with the rows */
  children?: (tooltip: ChartTooltipData<TActive>) => React.ReactNode;
};

const renderTooltipContent = ({ heading, metrics, rows }: ChartTooltipData) => (
  <ChartTooltipContent
    heading={heading}
    metrics={metrics}
    rows={rows}
  />
);

// eslint-disable-next-line typescript/consistent-type-assertions -- The ref wrapper drops the active type parameter; the caller names the type its chart-type hook selects, as with the primitive.
export const ChartTooltip = React.forwardRef<HTMLDivElement, ChartTooltipProps>(function ChartTooltip(
  { children = renderTooltipContent, xstyle, ...rest },
  ref,
) {
  const { tooltip } = useChartStyle('Tooltip').style;
  return (
    <Primitive.Tooltip
      ref={ref}
      {...mergeStyleProps(themeProps('chart-tooltip'), stylex.props(reset.base, partStyles.tooltip, xstyle), rest)}
    >
      {() => (tooltip ? children(tooltip) : null)}
    </Primitive.Tooltip>
  );
}) as <TActive extends ChartActive = ChartActive>(
  props: ChartTooltipProps<TActive> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null;
