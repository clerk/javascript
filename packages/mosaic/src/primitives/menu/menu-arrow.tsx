'use client';

import { FloatingArrow, useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { parsePlacement } from '../utils/side-offset';
import { useMenuContext } from './menu-context';

export type MenuArrowProps = Omit<React.ComponentPropsWithoutRef<typeof FloatingArrow>, 'context'>;

export const MenuArrow = React.forwardRef<SVGSVGElement, MenuArrowProps>(function MenuArrow(props, ref) {
  const { floatingContext, arrowRef, placement } = useMenuContext();
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
