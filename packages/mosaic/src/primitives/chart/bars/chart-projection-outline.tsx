'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useStackedBarsContext } from './bar-context';
import type { PaintedProjection } from './bar-layout';

export type ChartProjectionOutlineProps = ComponentProps<'path'>;

/** From the fill's edge to the path, so a 1px stroke leaves a 1px gap and covers whole pixels. */
const OUTLINE_OFFSET = 1.5;

/** Traces the fill at a constant offset, with concentric top corners and a square bottom on zero. */
function getOutlinePath({ x, y, width, height, radius }: PaintedProjection) {
  const left = x - OUTLINE_OFFSET;
  const right = x + width + OUTLINE_OFFSET;
  const top = y - OUTLINE_OFFSET;
  const bottom = y + height;
  const r = radius > 0 ? radius + OUTLINE_OFFSET : 0;
  return [
    `M${left} ${bottom}`,
    `V${top + r}`,
    `A${r} ${r} 0 0 1 ${left + r} ${top}`,
    `H${right - r}`,
    `A${r} ${r} 0 0 1 ${right} ${top + r}`,
    `V${bottom}`,
    'Z',
  ].join('');
}

export const ChartProjectionOutline = React.forwardRef<SVGPathElement, ChartProjectionOutlineProps>(
  function ChartProjectionOutline(props, ref) {
    const { render, ...otherProps } = props;
    const { projection } = useStackedBarsContext('ProjectionOutline');

    const ownProps = projection
      ? ({
          d: getOutlinePath(projection),
          pointerEvents: 'none',
        } satisfies DefaultProps<'path'>)
      : {};

    return useRender({
      defaultTagName: 'path',
      render,
      ref,
      enabled: !!projection,
      props: mergeProps<'path'>(ownProps, otherProps),
    });
  },
);
