'use client';

import { FloatingArrow } from '@floating-ui/react';
import React from 'react';

import { useTooltipContext } from './tooltip-context';

export type TooltipArrowProps = React.ComponentPropsWithRef<typeof FloatingArrow>;

export function TooltipArrow(props: TooltipArrowProps) {
  const { floatingContext, arrowRef, placement } = useTooltipContext();
  const side = placement.split('-')[0];

  return (
    <FloatingArrow
      data-cl-slot='tooltip-arrow'
      data-cl-side={side}
      {...props}
      ref={arrowRef}
      context={floatingContext}
    />
  );
}
