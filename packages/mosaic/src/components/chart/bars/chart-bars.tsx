'use client';

import * as stylex from '@stylexjs/stylex';
import React from 'react';

import {
  Chart as Primitive,
  type ChartBarProps as PrimitiveChartBarProps,
  type ChartBarsProps as PrimitiveChartBarsProps,
  type ChartProjectionOutlineProps as PrimitiveChartProjectionOutlineProps,
} from '../../../primitives/chart';
import type { MosaicStyleProps } from '../../../props';
import { mergeStyleProps, themeProps } from '../../../props';
import { ChartYLine } from '../chart-parts';
import { seriesMark } from '../internal/series.styles';
import { barStyles } from './chart-bars.styles';

export type ChartBarsProps = Omit<PrimitiveChartBarsProps, 'className' | 'style'> & MosaicStyleProps;

/**
 * Paints the bars on Canvas above the cursor, so the hover band shows only in the gaps. Without
 * children it renders `Chart.Bar`, `Chart.ProjectionOutline` and a zero line.
 */
export const ChartBars = React.forwardRef<HTMLDivElement, ChartBarsProps>(function ChartBars(
  { children, xstyle, ...rest },
  ref,
) {
  return (
    <Primitive.Bars
      ref={ref}
      {...mergeStyleProps(themeProps('chart-bars'), stylex.props(barStyles.bars, xstyle), rest)}
    >
      {children ?? (
        <>
          <ChartBar />
          <ChartProjectionOutline />
          <ChartYLine value={0} />
        </>
      )}
    </Primitive.Bars>
  );
});

export type ChartBarProps = Omit<PrimitiveChartBarProps, 'className' | 'style'> & MosaicStyleProps;

/**
 * The hidden element the Canvas reads. Its `color` is the series color, mixed toward the surface
 * under `data-inactive`; its `max-width`, `row-gap` and corner radii set the bar geometry.
 */
export const ChartBar = React.forwardRef<SVGGElement, ChartBarProps>(function ChartBar({ xstyle, ...rest }, ref) {
  return (
    <Primitive.Bar
      ref={ref}
      {...mergeStyleProps(themeProps('chart-bar'), stylex.props(seriesMark.mark, barStyles.bar, xstyle), rest)}
    />
  );
});

export type ChartProjectionOutlineProps = Omit<PrimitiveChartProjectionOutlineProps, 'className' | 'style'> &
  MosaicStyleProps;

/** A dashed outline around the projected total. */
export const ChartProjectionOutline = React.forwardRef<SVGGElement, ChartProjectionOutlineProps>(
  function ChartProjectionOutline({ xstyle, ...rest }, ref) {
    return (
      <Primitive.ProjectionOutline
        ref={ref}
        {...mergeStyleProps(
          themeProps('chart-projection-outline'),
          stylex.props(barStyles.projectionOutline, xstyle),
          rest,
        )}
      />
    );
  },
);
