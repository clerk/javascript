'use client';

import React from 'react';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useTooltipContext } from './tooltip-context';

export interface TooltipPositionerProps extends ComponentProps<'div'> {}

export function TooltipPositioner(props: TooltipPositionerProps) {
  const { render, ...otherProps } = props;
  const { mounted, refs, floatingStyles, placement, getFloatingProps } = useTooltipContext();

  const side = placement.split('-')[0];

  const defaultProps = {
    'data-cl-slot': 'tooltip-positioner',
    'data-cl-side': side,
    ref: refs.setFloating,
    style: floatingStyles,
    ...(getFloatingProps() as React.ComponentPropsWithRef<'div'>),
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    enabled: mounted,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}
