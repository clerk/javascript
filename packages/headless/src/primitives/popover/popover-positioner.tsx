'use client';

import { FloatingFocusManager, useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { usePopoverContext } from './popover-context';

export type PopoverPositionerProps = ComponentProps<'div'>;

export function PopoverPositioner(props: PopoverPositionerProps) {
  const { render, ref: consumerRef, ...otherProps } = props;
  const { mounted, floatingContext, refs, floatingStyles, placement, getFloatingProps, modal, labelId, descriptionId } =
    usePopoverContext();

  const side = placement.split('-')[0];

  // floating-ui types `setFloating` as a method signature, but at runtime it's
  // a stable callback that doesn't use `this`, so the unbound-method check is a
  // false positive here.
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const combinedRef = useMergeRefs([refs.setFloating, consumerRef]);

  const defaultProps = {
    'data-cl-slot': 'popover-positioner',
    'data-cl-side': side,
    ref: combinedRef,
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

  if (!element) {
    return null;
  }

  return (
    <FloatingFocusManager
      context={floatingContext}
      modal={modal}
    >
      {element}
    </FloatingFocusManager>
  );
}
