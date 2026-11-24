'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useBarsContext } from './bar-context';

export type ChartProjectionOutlineProps = ComponentProps<'g'>;

/**
 * Styles the outline that `Chart.Bars` paints around the projection on Canvas, in the same
 * pass as the fill, so the two stay aligned at any pixel ratio. The Canvas reads this hidden
 * element's computed `stroke`, `stroke-width` and `stroke-dasharray`.
 */
export const ChartProjectionOutline = React.forwardRef<SVGGElement, ChartProjectionOutlineProps>(
  function ChartProjectionOutline(props, ref) {
    const { render, ...otherProps } = props;
    const { setProjectionOutline } = useBarsContext('ProjectionOutline');

    const ownProps = {
      'aria-hidden': true,
      style: { display: 'none' },
    } satisfies DefaultProps<'g'>;

    return useRender({
      defaultTagName: 'g',
      render,
      ref: [setProjectionOutline, ref],
      props: mergeProps<'g'>(ownProps, otherProps),
    });
  },
);
