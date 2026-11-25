'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useChartContext } from './chart-context';
import type { XTick } from './types';

export type ChartXTickProps = ComponentProps<'text'> & {
  /** An entry from the `Chart.XAxis` children function. */
  tick: XTick;
};

export const ChartXTick = React.forwardRef<SVGTextElement, ChartXTickProps>(function ChartXTick(props, ref) {
  const { tick, render, ...otherProps } = props;
  const { chart } = useChartContext('XTick');
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
