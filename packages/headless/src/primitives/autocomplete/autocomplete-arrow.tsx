'use client';

import { FloatingArrow } from '@floating-ui/react';
import React from 'react';

import { useAutocompleteContext } from './autocomplete-context';

export type AutocompleteArrowProps = React.ComponentPropsWithRef<typeof FloatingArrow>;

export function AutocompleteArrow(props: AutocompleteArrowProps) {
  const { floatingContext, arrowRef, placement } = useAutocompleteContext();
  const side = placement.split('-')[0];

  return (
    <FloatingArrow
      data-cl-slot='autocomplete-arrow'
      data-cl-side={side}
      {...props}
      ref={arrowRef}
      context={floatingContext}
    />
  );
}
