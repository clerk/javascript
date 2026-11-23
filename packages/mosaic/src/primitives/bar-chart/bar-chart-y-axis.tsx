'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { hasArea, useBarChartContext } from './bar-chart-context';

export interface BarChartYTickItem {
  value: number;
  y: number;
  label: React.ReactNode;
}

export type BarChartYAxisProps = Omit<ComponentProps<'svg'>, 'children' | 'format'> & {
  /** Formats a tick value. Default: the locale number */
  format?: (value: number) => React.ReactNode;
  /** Renders the labels, usually one `BarChart.YTick` per entry. */
  children?: (ticks: readonly BarChartYTickItem[]) => React.ReactNode;
};

const formatNumber = (value: number) => value.toLocaleString();

export const BarChartYAxis = React.forwardRef<SVGSVGElement, BarChartYAxisProps>(function BarChartYAxis(props, ref) {
  const { format = formatNumber, children, render, ...otherProps } = props;
  const { frame, layout } = useBarChartContext('YAxis');
  const ticks = React.useMemo(
    () => layout.yTicks.map(tick => ({ value: tick.value, y: tick.y, label: format(tick.value) })),
    [format, layout.yTicks],
  );

  const ownProps = {
    width: frame.size.width,
    height: frame.size.height,
    'aria-hidden': 'true',
    style: { position: 'absolute', inset: 0, display: 'block', overflow: 'visible' },
    children: children?.(ticks),
  } satisfies DefaultProps<'svg'>;

  return useRender({
    defaultTagName: 'svg',
    render,
    ref,
    enabled: hasArea(frame.size),
    props: mergeProps<'svg'>(ownProps, otherProps),
  });
});
