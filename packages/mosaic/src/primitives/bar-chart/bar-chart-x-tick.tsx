'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useBarChartContext } from './bar-chart-context';
import type { XTick } from './x-ticks';

export type BarChartXTickProps = ComponentProps<'text'> & {
  /** An entry from the `BarChart.XAxis` children function. */
  tick: XTick;
};

export const BarChartXTick = React.forwardRef<SVGTextElement, BarChartXTickProps>(function BarChartXTick(props, ref) {
  const { tick, render, ...otherProps } = props;
  const { chart } = useBarChartContext('XTick');
  const activeCategory = chart.selected?.category ?? null;

  const ownProps = {
    x: tick.x,
    y: chart.plot.y + chart.plot.height + 24,
    textAnchor: tick.textAnchor,
    children: tick.label,
  } satisfies DefaultProps<'text'>;

  return useRender({
    defaultTagName: 'text',
    render,
    ref,
    state: { active: tick.category !== null && tick.category === activeCategory },
    stateAttributesMapping: {
      active: (active: boolean) => (active ? { 'data-active': '' } : null),
    },
    props: mergeProps<'text'>(ownProps, otherProps),
  });
});
