'use client';

import { FloatingArrow, useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { useTooltipContext } from './tooltip-context';

export type TooltipArrowProps = Omit<React.ComponentPropsWithRef<typeof FloatingArrow>, 'context'>;

export const TooltipArrow = React.forwardRef<SVGSVGElement, TooltipArrowProps>(function TooltipArrow(props, ref) {
  const { floatingContext, arrowRef, placement } = useTooltipContext();
  // Merge the consumer ref with the primitive-owned arrowRef so passing a ref
  // does not clobber the ref FloatingArrow relies on for positioning.
  const combinedRef = useMergeRefs([arrowRef, ref]);
  const side = placement.split('-')[0];

  return (
    <FloatingArrow
      data-cl-slot='tooltip-arrow'
      data-cl-side={side}
      {...props}
      ref={combinedRef}
      context={floatingContext}
    />
  );
});
