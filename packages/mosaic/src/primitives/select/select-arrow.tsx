'use client';

import { FloatingArrow } from '@floating-ui/react';
import React from 'react';

import { parsePlacement } from '../utils/side-offset';
import { useSelectContext } from './select-context';

export type SelectArrowProps = React.ComponentPropsWithRef<typeof FloatingArrow>;

export function SelectArrow(props: SelectArrowProps) {
  const { floatingContext, arrowRef, placement } = useSelectContext();
  const side = parsePlacement(placement).side;

  return (
    <FloatingArrow
      data-side={side}
      {...props}
      ref={arrowRef}
      context={floatingContext}
    />
  );
}
