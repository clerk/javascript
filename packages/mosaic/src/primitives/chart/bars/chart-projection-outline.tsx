'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useStackedBarsContext } from './bar-context';

export type ChartProjectionOutlineProps = ComponentProps<'rect'>;

export const ChartProjectionOutline = React.forwardRef<SVGRectElement, ChartProjectionOutlineProps>(
  function ChartProjectionOutline(props, ref) {
    const { render, ...otherProps } = props;
    const { projection } = useStackedBarsContext('ProjectionOutline');

    const ownProps = projection
      ? ({
          x: projection.x - 1,
          y: projection.y - 1,
          width: projection.width + 2,
          height: projection.height + 1,
          rx: projection.radius,
          pointerEvents: 'none',
        } satisfies DefaultProps<'rect'>)
      : {};

    return useRender({
      defaultTagName: 'rect',
      render,
      ref,
      enabled: !!projection,
      props: mergeProps<'rect'>(ownProps, otherProps),
    });
  },
);
