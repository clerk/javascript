'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { hasArea, useCartesianChart } from './chart-context';

export interface ChartYTickItem {
  value: number;
  y: number;
  label: React.ReactNode;
}

export type ChartYAxisProps = Omit<ComponentProps<'svg'>, 'children' | 'format'> & {
  /** Formats a tick value. Default: the locale number */
  format?: (value: number) => React.ReactNode;
  /** Renders the labels, usually one `Chart.YTick` per entry. */
  children?: (ticks: readonly ChartYTickItem[]) => React.ReactNode;
};

const formatNumber = (value: number) => value.toLocaleString();

export const ChartYAxis = React.forwardRef<SVGSVGElement, ChartYAxisProps>(function ChartYAxis(props, ref) {
  const { format = formatNumber, children, render, ...otherProps } = props;
  const chart = useCartesianChart('YAxis');
  const { size, yTicks } = chart;
  const ticks = React.useMemo(
    () => yTicks.map(tick => ({ value: tick.value, y: tick.y, label: format(tick.value) })),
    [format, yTicks],
  );

  const ownProps = {
    width: size.width,
    height: size.height,
    'aria-hidden': 'true',
    style: { position: 'absolute', inset: 0, display: 'block', overflow: 'visible' },
    children: children?.(ticks),
  } satisfies DefaultProps<'svg'>;

  return useRender({
    defaultTagName: 'svg',
    render,
    ref,
    enabled: hasArea(size),
    props: mergeProps<'svg'>(ownProps, otherProps),
  });
});
