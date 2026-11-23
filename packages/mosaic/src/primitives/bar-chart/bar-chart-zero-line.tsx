'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useBarChartContext } from './bar-chart-context';

export type BarChartZeroLineProps = ComponentProps<'line'>;

export const BarChartZeroLine = React.forwardRef<SVGLineElement, BarChartZeroLineProps>(
  function BarChartZeroLine(props, ref) {
    const { render, ...otherProps } = props;
    const { layout } = useBarChartContext('ZeroLine');

    const ownProps = {
      x1: layout.plot.x,
      x2: layout.plot.x + layout.plot.width,
      y1: layout.zeroY,
      y2: layout.zeroY,
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
