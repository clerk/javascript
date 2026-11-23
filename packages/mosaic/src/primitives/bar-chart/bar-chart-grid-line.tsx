'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useBarChartContext } from './bar-chart-context';
import type { ChartTick } from './types';

export type BarChartGridLineProps = ComponentProps<'line'> & {
  /** An entry from the `BarChart.Grid` children function. */
  line: ChartTick;
};

export const BarChartGridLine = React.forwardRef<SVGLineElement, BarChartGridLineProps>(
  function BarChartGridLine(props, ref) {
    const { line, render, ...otherProps } = props;
    const { chart } = useBarChartContext('GridLine');

    const ownProps = {
      x1: chart.plot.x,
      x2: chart.plot.x + chart.plot.width,
      y1: line.y,
      y2: line.y,
      vectorEffect: 'non-scaling-stroke',
    } satisfies DefaultProps<'line'>;

    return useRender({
      defaultTagName: 'line',
      render,
      ref,
      props: mergeProps<'line'>(ownProps, otherProps),
    });
  },
);
