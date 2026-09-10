'use client';

import { FloatingArrow } from '@floating-ui/react';
import React from 'react';

import { useComboboxContext } from './combobox-context';

export type ComboboxArrowProps = React.ComponentPropsWithRef<typeof FloatingArrow>;

export function ComboboxArrow(props: ComboboxArrowProps) {
  const { floatingContext, arrowRef, placement } = useComboboxContext();
  const side = placement.split('-')[0];

  return (
    <FloatingArrow
      data-side={side}
      {...props}
      ref={arrowRef}
      context={floatingContext}
    />
  );
}
