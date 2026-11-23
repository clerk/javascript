'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useStackedBarsContext } from './bar-context';

export type ChartBarProps = ComponentProps<'g'>;

/**
 * Styles the bars that `Chart.StackedBars` paints on Canvas. Before each paint the primitive puts
 * this hidden element in every state it draws, through `data-series`, `data-inactive` and
 * `data-projection`, and paints with the element's computed `color`.
 */
export const ChartBar = React.forwardRef<SVGGElement, ChartBarProps>(function ChartBar(props, ref) {
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
