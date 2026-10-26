'use client';

import { FloatingArrow, useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { parsePlacement } from '../utils/side-offset';
import { useToastPositionerContext } from './toast-context';

export type ToastArrowProps = Omit<React.ComponentPropsWithRef<typeof FloatingArrow>, 'context'>;

export const ToastArrow = React.forwardRef<SVGSVGElement, ToastArrowProps>(function ToastArrow(props, ref) {
  const { floatingContext, arrowRef, placement } = useToastPositionerContext();
  const combinedRef = useMergeRefs([arrowRef, ref]);
  const side = parsePlacement(placement).side;

  return (
    <FloatingArrow
      data-side={side}
      {...props}
      ref={combinedRef}
      context={floatingContext}
    />
  );
});
