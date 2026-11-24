'use client';

import React, { useContext } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { ComboboxItemContext } from './combobox-item-context';

export interface ComboboxItemIndicatorProps extends ComponentProps<'span'> {
  keepMounted?: boolean;
}

export const ComboboxItemIndicator = React.forwardRef<HTMLSpanElement, ComboboxItemIndicatorProps>(
  function ComboboxItemIndicator({ render, keepMounted = false, ...props }, ref) {
    const selected = useContext(ComboboxItemContext);
    if (selected === null) {
      throw new Error('Combobox.ItemIndicator must be used within Combobox.Item');
    }
    return useRender({
      defaultTagName: 'span',
      render,
      ref,
      enabled: keepMounted || selected,
      state: { selected },
      stateAttributesMapping: {
        selected: (v: boolean) => (v ? { 'data-selected': '' } : null),
      },
      props: mergeProps<'span'>({ 'aria-hidden': true }, props),
    });
  },
);
