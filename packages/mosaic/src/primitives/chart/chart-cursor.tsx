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

  // A keyboard selection outlines just its section, such as one side of a stacked bar; a pointer
  // shows the whole column.
  const focusRect = chart.selectionSource === 'keyboard' ? chart.focusRect : null;
  const ownProps = {
    'aria-hidden': 'true',
    style: focusRect
      ? {
          position: 'absolute',
          top: focusRect.y - plot.y,
          left: focusRect.x - plot.x,
          width: focusRect.width,
          height: focusRect.height,
          pointerEvents: 'none',
        }
      : selectedCategory
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
    state: { focusVisible: chart.selectionSource === 'keyboard' },
    stateAttributesMapping: {
      focusVisible: (focusVisible: boolean) => (focusVisible ? { 'data-focus-visible': '' } : null),
    },
    props: mergeProps<'div'>(ownProps, otherProps),
  });
});
