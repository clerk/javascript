'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useComboboxContext } from './combobox-context';

export type ComboboxClearProps = ComponentProps<'button'>;

export const ComboboxClear = React.forwardRef<HTMLButtonElement, ComboboxClearProps>(
  function ComboboxClear(props, ref) {
    const { render, ...otherProps } = props;
    const { inputValue, selectedValues, clear, disabled } = useComboboxContext();

    const defaultProps = {
      type: 'button',
      tabIndex: -1,
      'aria-label': 'Clear',
      disabled,
      onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
        event.preventDefault();
      },
      onClick() {
        clear();
      },
    } satisfies DefaultProps<'button'>;

    const element = useRender({
      defaultTagName: 'button',
      render,
      ref,
      state: { disabled },
      stateAttributesMapping: {
        disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
      },
      props: mergeProps<'button'>(defaultProps, otherProps),
    });

    return inputValue !== '' || selectedValues.length > 0 ? element : null;
  },
);
