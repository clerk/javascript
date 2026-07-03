'use client';

import { FloatingArrow } from '@floating-ui/react';
import React from 'react';

import { useSelectContext } from './select-context';

export type SelectArrowProps = React.ComponentPropsWithRef<typeof FloatingArrow>;

export function SelectArrow(props: SelectArrowProps) {
  const { floatingContext, arrowRef, placement } = useSelectContext();
  const side = placement.split('-')[0];

  return (
    <FloatingArrow
      data-cl-slot='select-arrow'
      data-cl-side={side}
      {...props}
      ref={arrowRef}
      context={floatingContext}
    />
  );
}
