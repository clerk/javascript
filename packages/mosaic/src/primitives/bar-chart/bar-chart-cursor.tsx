'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useBarSelectionContext } from './bar-chart-context';

export type BarChartCursorProps = ComponentProps<'div'>;

export const BarChartCursor = React.forwardRef<HTMLDivElement, BarChartCursorProps>(
  function BarChartCursor(props, ref) {
    const { render, ...otherProps } = props;
    const { selectedCategory, plot } = useBarSelectionContext('Cursor');

    const ownProps = {
      'aria-hidden': 'true',
      style: selectedCategory
        ? {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: selectedCategory.bandX - plot.x,
            width: selectedCategory.bandWidth,
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
  },
);
