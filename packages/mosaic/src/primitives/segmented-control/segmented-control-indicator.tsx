'use client';

import React from 'react';

import { type ComponentProps, useRender } from '../utils';
import { type SegmentedControlDirection, useSegmentedControlContext } from './segmented-control-context';

export type SegmentedControlIndicatorProps = ComponentProps<'span'>;

export const SegmentedControlIndicator = React.forwardRef<HTMLSpanElement, SegmentedControlIndicatorProps>(
  function SegmentedControlIndicator(props, ref) {
    const { render, ...otherProps } = props;
    const { direction } = useSegmentedControlContext();

    return useRender({
      defaultTagName: 'span',
      render,
      ref,
      state: { direction },
      stateAttributesMapping: {
        direction: (v: SegmentedControlDirection) => ({ 'data-direction': v }),
      },
      props: { 'aria-hidden': true, ...otherProps },
    });
  },
);
