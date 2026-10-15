'use client';

import { FloatingArrow } from '@floating-ui/react';
import React from 'react';

import { parsePlacement } from '../utils/side-offset';
import { useAutocompleteContext } from './autocomplete-context';

export type AutocompleteArrowProps = React.ComponentPropsWithRef<typeof FloatingArrow>;

export function AutocompleteArrow(props: AutocompleteArrowProps) {
  const { floatingContext, arrowRef, placement } = useAutocompleteContext();
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
