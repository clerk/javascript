'use client';

import { FloatingArrow, useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { useToastPositionerContext } from './toast-context';

export type ToastArrowProps = Omit<React.ComponentPropsWithRef<typeof FloatingArrow>, 'context'>;

export const ToastArrow = React.forwardRef<SVGSVGElement, ToastArrowProps>(function ToastArrow(props, ref) {
  const { floatingContext, arrowRef, placement } = useToastPositionerContext();
  const combinedRef = useMergeRefs([arrowRef, ref]);
  const side = placement.split('-')[0];

  return (
    <FloatingArrow
      data-side={side}
      {...props}
      ref={combinedRef}
      context={floatingContext}
    />
  );
});
