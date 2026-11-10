'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useComboboxContext } from './combobox-context';

export type ComboboxClearProps = ComponentProps<'button'>;

export const ComboboxClear = React.forwardRef<HTMLButtonElement, ComboboxClearProps>(
  function ComboboxClear(props, ref) {
    const { render, ...otherProps } = props;
    const { inputValue, selectedValue, clear } = useComboboxContext();

    const defaultProps = {
      type: 'button',
      tabIndex: -1,
      'aria-label': 'Clear',
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
      props: mergeProps<'button'>(defaultProps, otherProps),
    });

    return inputValue !== '' || selectedValue !== null ? element : null;
  },
);
