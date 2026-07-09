'use client';

import { FloatingArrow } from '@floating-ui/react';
import React from 'react';

import { useMenuContext } from './menu-context';

export type MenuArrowProps = React.ComponentPropsWithRef<typeof FloatingArrow>;

export function MenuArrow(props: MenuArrowProps) {
  const { floatingContext, arrowRef, placement } = useMenuContext();
  const side = placement.split('-')[0];

  return (
    <FloatingArrow
      data-cl-slot='menu-arrow'
      data-cl-side={side}
      {...props}
      ref={arrowRef}
      context={floatingContext}
    />
  );
}
