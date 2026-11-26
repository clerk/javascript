'use client';

import * as stylex from '@stylexjs/stylex';
import React from 'react';

import {
  Chart as Primitive,
  type ChartBarProps as PrimitiveChartBarProps,
  type ChartBarsProps as PrimitiveChartBarsProps,
  type ChartFocusOutlineProps as PrimitiveChartFocusOutlineProps,
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
 * children it renders `Chart.Bar`, `Chart.ProjectionOutline`, a zero line and `Chart.FocusOutline`.
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
          <ChartFocusOutline />
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

export type ChartFocusOutlineProps = Omit<PrimitiveChartFocusOutlineProps, 'className' | 'style'> & MosaicStyleProps;

/**
 * The keyboard focus ring around the selected section's bars, 2px clear of them. StyleX cannot set
 * an SVG `rx`, so the corner radius is an attribute: the bars' top radius plus the gap, so the ring
 * stays concentric with them.
 */
export const ChartFocusOutline = React.forwardRef<SVGRectElement, ChartFocusOutlineProps>(function ChartFocusOutline(
  { xstyle, offset = 3, rx = 6, ...rest },
  ref,
) {
  return (
    <Primitive.FocusOutline
      ref={ref}
      offset={offset}
      rx={rx}
      {...mergeStyleProps(themeProps('chart-focus-outline'), stylex.props(barStyles.focusOutline, xstyle), rest)}
    />
  );
});
