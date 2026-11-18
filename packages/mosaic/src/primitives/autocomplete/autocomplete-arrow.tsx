'use client';

import { FloatingArrow, useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { parsePlacement } from '../utils/side-offset';
import { useAutocompleteContext } from './autocomplete-context';

export type AutocompleteArrowProps = Omit<React.ComponentPropsWithoutRef<typeof FloatingArrow>, 'context'>;

export const AutocompleteArrow = React.forwardRef<SVGSVGElement, AutocompleteArrowProps>(
  function AutocompleteArrow(props, ref) {
    const { floatingContext, arrowRef, placement } = useAutocompleteContext();
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
  },
);
