'use client';

import React, { useContext } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { SelectItemContext } from './select-item-context';

export interface SelectItemIndicatorProps extends ComponentProps<'span'> {
  keepMounted?: boolean;
}

export const SelectItemIndicator = React.forwardRef<HTMLSpanElement, SelectItemIndicatorProps>(
  function SelectItemIndicator({ render, keepMounted = false, ...props }, ref) {
    const selected = useContext(SelectItemContext);
    if (selected === null) {
      throw new Error('Select.ItemIndicator must be used within Select.Item');
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
