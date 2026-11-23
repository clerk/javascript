'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useBarChartContext } from './bar-chart-context';
import type { BarChartYTickItem } from './bar-chart-y-axis';

export type BarChartYTickProps = ComponentProps<'text'> & {
  /** An entry from the `BarChart.YAxis` children function. */
  tick: BarChartYTickItem;
};

export const BarChartYTick = React.forwardRef<SVGTextElement, BarChartYTickProps>(function BarChartYTick(props, ref) {
  const { tick, render, ...otherProps } = props;
  const { chart } = useBarChartContext('YTick');

  const ownProps = {
    x: chart.plot.x - 12,
    y: tick.y,
    dy: '0.32em',
    textAnchor: 'end',
    children: tick.label,
  } satisfies DefaultProps<'text'>;

  return useRender({
    defaultTagName: 'text',
    render,
    ref,
    props: mergeProps<'text'>(ownProps, otherProps),
  });
});
