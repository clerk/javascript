'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useStackedBarsContext } from './bar-chart-context';

export type BarChartBarProps = ComponentProps<'g'>;

/**
 * Styles the bars that `BarChart.StackedBars` paints on Canvas. Before each paint the primitive puts
 * this hidden element in every state it draws, through `data-series`, `data-inactive` and
 * `data-projection`, and paints with the element's computed `color`.
 */
export const BarChartBar = React.forwardRef<SVGGElement, BarChartBarProps>(function BarChartBar(props, ref) {
  const { render, ...otherProps } = props;
  const { setBar } = useStackedBarsContext('Bar');

  const ownProps = {
    'aria-hidden': true,
    style: { display: 'none' },
  } satisfies DefaultProps<'g'>;

  return useRender({
    defaultTagName: 'g',
    render,
    ref: [setBar, ref],
    props: mergeProps<'g'>(ownProps, otherProps),
  });
});
