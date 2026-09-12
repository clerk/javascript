'use client';

import React, { useContext } from 'react';

import { type ComponentProps, mergeProps, useRender } from '../../utils';
import { ComboboxOptionContext } from './combobox-option-context';

export type ComboboxOptionIndicatorProps = ComponentProps<'span'>;

export const ComboboxOptionIndicator = React.forwardRef<HTMLSpanElement, ComboboxOptionIndicatorProps>(
  function ComboboxOptionIndicator({ render, ...props }, ref) {
    const selected = useContext(ComboboxOptionContext);
    if (selected === null) {
      throw new Error('Combobox.OptionIndicator must be used within Combobox.Option');
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
