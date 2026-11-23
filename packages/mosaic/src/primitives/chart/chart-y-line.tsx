'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useChartContext } from './chart-context';

export type ChartYLineProps = ComponentProps<'line'> & {
  /** The value on the Y axis the line marks, such as a tick value or 0. */
  value: number;
};

/** A line across the plot at a Y value, inside any chart SVG. */
export const ChartYLine = React.forwardRef<SVGLineElement, ChartYLineProps>(function ChartYLine(props, ref) {
  const { value, render, ...otherProps } = props;
  const { chart } = useChartContext('YLine');
  const y = chart.scaleY(value);

  const ownProps = {
    x1: chart.plot.x,
    x2: chart.plot.x + chart.plot.width,
    y1: y,
    y2: y,
    vectorEffect: 'non-scaling-stroke',
  } satisfies DefaultProps<'line'>;

  return useRender({
    defaultTagName: 'line',
    render,
    ref,
    props: mergeProps<'line'>(ownProps, otherProps),
  });
});
