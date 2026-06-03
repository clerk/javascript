'use client';

import { FloatingFocusManager } from '@floating-ui/react';
import React from 'react';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { usePopoverContext } from './popover-context';

export interface PopoverPositionerProps extends ComponentProps<'div'> {}

export function PopoverPositioner(props: PopoverPositionerProps) {
  const { render, ...otherProps } = props;
  const { mounted, floatingContext, refs, floatingStyles, placement, getFloatingProps, modal, labelId, descriptionId } =
    usePopoverContext();

  const side = placement.split('-')[0];

  const defaultProps = {
    'data-cl-slot': 'popover-positioner',
    'data-cl-side': side,
    ref: refs.setFloating,
    style: floatingStyles,
    'aria-labelledby': labelId,
    'aria-describedby': descriptionId,
    ...(getFloatingProps() as React.ComponentPropsWithRef<'div'>),
  };

  const element = renderElement({
    defaultTagName: 'div',
    render,
    enabled: mounted,
    props: mergeProps<'div'>(defaultProps, otherProps),
  });

  return (
    <FloatingFocusManager
      context={floatingContext}
      modal={modal}
    >
      {element!}
    </FloatingFocusManager>
  );
}
