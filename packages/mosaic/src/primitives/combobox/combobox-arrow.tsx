'use client';

import { FloatingArrow, useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { useComboboxContext } from './combobox-context';

export type ComboboxArrowProps = Omit<React.ComponentPropsWithoutRef<typeof FloatingArrow>, 'context'>;

export const ComboboxArrow = React.forwardRef<SVGSVGElement, ComboboxArrowProps>(function ComboboxArrow(props, ref) {
  const { floatingContext, arrowRef, placement } = useComboboxContext();
  const mergedRef = useMergeRefs([arrowRef, ref]);
  const side = placement.split('-')[0];

  return (
    <FloatingArrow
      data-side={side}
      {...props}
      ref={mergedRef}
      context={floatingContext}
    />
  );
});
