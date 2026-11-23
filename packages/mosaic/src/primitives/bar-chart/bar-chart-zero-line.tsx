'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useBarChartContext } from './bar-chart-context';

export type BarChartZeroLineProps = ComponentProps<'line'>;

export const BarChartZeroLine = React.forwardRef<SVGLineElement, BarChartZeroLineProps>(
  function BarChartZeroLine(props, ref) {
    const { render, ...otherProps } = props;
    const { chart } = useBarChartContext('ZeroLine');

    const ownProps = {
      x1: chart.plot.x,
      x2: chart.plot.x + chart.plot.width,
      y1: chart.zeroY,
      y2: chart.zeroY,
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
