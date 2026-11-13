'use client';

import { FloatingArrow, useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { parsePlacement } from '../utils/side-offset';
import { useSelectContext } from './select-context';

export type SelectArrowProps = Omit<React.ComponentPropsWithoutRef<typeof FloatingArrow>, 'context'>;

export const SelectArrow = React.forwardRef<SVGSVGElement, SelectArrowProps>(function SelectArrow(props, ref) {
  const { floatingContext, arrowRef, placement } = useSelectContext();
  const mergedRef = useMergeRefs([arrowRef, ref]);
  const side = parsePlacement(placement).side;

  return (
    <FloatingArrow
      data-side={side}
      {...props}
      ref={mergedRef}
      context={floatingContext}
    />
  );
});
