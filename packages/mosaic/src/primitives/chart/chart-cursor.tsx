'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useChartContext, useSelectionContext } from './chart-context';

export type ChartCursorProps = ComponentProps<'div'>;

export const ChartCursor = React.forwardRef<HTMLDivElement, ChartCursorProps>(function ChartCursor(props, ref) {
  const { render, ...otherProps } = props;
  useSelectionContext('Cursor');
  const { chart } = useChartContext('Cursor');
  const { plot, selected } = chart;
  const selectedCategory = selected ? chart.categories[selected.datumIndex] : undefined;

  const ownProps = {
    'aria-hidden': 'true',
    style: selectedCategory
      ? {
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: selectedCategory.x - plot.x,
          width: selectedCategory.width,
          pointerEvents: 'none',
        }
      : undefined,
  } satisfies DefaultProps<'div'>;

  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    enabled: !!selectedCategory,
    props: mergeProps<'div'>(ownProps, otherProps),
  });
});
