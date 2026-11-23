'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { hasArea, useChartContext } from './chart-context';
import type { ChartTick } from './types';

export type ChartGridProps = Omit<ComponentProps<'svg'>, 'children'> & {
  /** Renders the lines, usually one `Chart.YLine` per tick value. */
  children?: (ticks: readonly ChartTick[]) => React.ReactNode;
};

export const ChartGrid = React.forwardRef<SVGSVGElement, ChartGridProps>(function ChartGrid(props, ref) {
  const { children, render, ...otherProps } = props;
  const { chart } = useChartContext('Grid');
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
