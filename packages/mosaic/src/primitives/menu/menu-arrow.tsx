'use client';

import { FloatingArrow } from '@floating-ui/react';
import React from 'react';

import { parsePlacement } from '../utils/side-offset';
import { useMenuContext } from './menu-context';

export type MenuArrowProps = React.ComponentPropsWithRef<typeof FloatingArrow>;

export function MenuArrow(props: MenuArrowProps) {
  const { floatingContext, arrowRef, placement } = useMenuContext();
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
