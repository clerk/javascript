'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useChartContext } from './chart-context';
import type { ChartYTickItem } from './chart-y-axis';

export type ChartYTickProps = ComponentProps<'text'> & {
  /** An entry from the `Chart.YAxis` children function. */
  tick: ChartYTickItem;
};

export const ChartYTick = React.forwardRef<SVGTextElement, ChartYTickProps>(function ChartYTick(props, ref) {
  const { tick, render, ...otherProps } = props;
  const { chart } = useChartContext('YTick');

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
