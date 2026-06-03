'use client';

import { FloatingArrow } from '@floating-ui/react';
import React from 'react';
import { usePopoverContext } from './popover-context';

export interface PopoverArrowProps extends React.ComponentPropsWithRef<typeof FloatingArrow> {}

export function PopoverArrow(props: PopoverArrowProps) {
  const { floatingContext, arrowRef, placement } = usePopoverContext();
  const side = placement.split('-')[0];

  return (
    <FloatingArrow
      data-cl-slot='popover-arrow'
      data-cl-side={side}
      {...props}
      ref={arrowRef}
      context={floatingContext}
    />
  );
}
