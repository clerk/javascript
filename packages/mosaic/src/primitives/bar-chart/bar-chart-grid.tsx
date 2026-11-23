'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { hasArea, useBarChartContext } from './bar-chart-context';
import type { ChartTick } from './types';

export type BarChartGridProps = Omit<ComponentProps<'svg'>, 'children'> & {
  /** Renders the lines, usually one `BarChart.GridLine` per entry. */
  children?: (lines: readonly ChartTick[]) => React.ReactNode;
};

export const BarChartGrid = React.forwardRef<SVGSVGElement, BarChartGridProps>(function BarChartGrid(props, ref) {
  const { children, render, ...otherProps } = props;
  const { chart } = useBarChartContext('Grid');
  const { size, yTicks } = chart;

  const ownProps = {
    width: size.width,
    height: size.height,
    'aria-hidden': 'true',
    style: { position: 'absolute', inset: 0, display: 'block', pointerEvents: 'none' },
    children: children?.(yTicks),
  } satisfies DefaultProps<'svg'>;

  return useRender({
    defaultTagName: 'svg',
    render,
    ref,
    enabled: hasArea(size),
    props: mergeProps<'svg'>(ownProps, otherProps),
  });
});
