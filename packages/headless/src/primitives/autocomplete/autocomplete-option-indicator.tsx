'use client';

import React, { useContext } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { AutocompleteOptionContext } from './autocomplete-option-context';

export type AutocompleteOptionIndicatorProps = ComponentProps<'span'>;

export const AutocompleteOptionIndicator = React.forwardRef<HTMLSpanElement, AutocompleteOptionIndicatorProps>(
  function AutocompleteOptionIndicator({ render, ...props }, ref) {
    const selected = useContext(AutocompleteOptionContext);
    if (selected === null) {
      throw new Error('Autocomplete.OptionIndicator must be used within Autocomplete.Option');
    }
    return useRender({
      defaultTagName: 'span',
      render,
      ref,
      enabled: selected,
      props: mergeProps<'span'>({ 'aria-hidden': true }, props),
    });
  },
);
