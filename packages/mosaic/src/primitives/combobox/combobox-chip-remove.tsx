'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useComboboxChipValue } from './combobox-chips-context';
import { useComboboxContext } from './combobox-context';

export type ComboboxChipRemoveProps = ComponentProps<'button'>;

export const ComboboxChipRemove = React.forwardRef<HTMLButtonElement, ComboboxChipRemoveProps>(
  function ComboboxChipRemove(props, ref) {
    const { render, ...otherProps } = props;
    const { removeValue, focusInput, disabled } = useComboboxContext();
    const value = useComboboxChipValue();

    const defaultProps = {
      type: 'button',
      tabIndex: -1,
      disabled,
      onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
        event.preventDefault();
      },
      onClick() {
        removeValue(value);
        focusInput();
      },
    } satisfies DefaultProps<'button'>;

    return useRender({
      defaultTagName: 'button',
      render,
      ref,
      state: { disabled },
      stateAttributesMapping: {
        disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
      },
      props: mergeProps<'button'>(defaultProps, otherProps),
    });
  },
);
