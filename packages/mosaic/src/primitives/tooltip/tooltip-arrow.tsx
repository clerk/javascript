'use client';

import { FloatingArrow, useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { parsePlacement } from '../utils/side-offset';
import { useTooltipContext } from './tooltip-context';

export type TooltipArrowProps = Omit<React.ComponentPropsWithRef<typeof FloatingArrow>, 'context'>;

export const TooltipArrow = React.forwardRef<SVGSVGElement, TooltipArrowProps>(function TooltipArrow(props, ref) {
  const { floatingContext, arrowRef, placement } = useTooltipContext();
  // Merge the consumer ref with the primitive-owned arrowRef so passing a ref
  // does not clobber the ref FloatingArrow relies on for positioning.
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
