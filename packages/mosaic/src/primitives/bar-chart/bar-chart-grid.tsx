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
  const { frame, layout } = useBarChartContext('Grid');

  const ownProps = {
    width: frame.size.width,
    height: frame.size.height,
    'aria-hidden': 'true',
    style: { position: 'absolute', inset: 0, display: 'block', pointerEvents: 'none' },
    children: children?.(layout.yTicks),
  } satisfies DefaultProps<'svg'>;

  return useRender({
    defaultTagName: 'svg',
    render,
    ref,
    enabled: hasArea(frame.size),
    props: mergeProps<'svg'>(ownProps, otherProps),
  });
});
