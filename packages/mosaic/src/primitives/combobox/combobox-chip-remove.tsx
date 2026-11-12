'use client';

import React from 'react';

import { Button } from '../button';
import { type ComponentProps, type DefaultProps, mergeProps } from '../utils';
import { useComboboxChipValue } from './combobox-chips-context';
import { useComboboxContext } from './combobox-context';

export type ComboboxChipRemoveProps = ComponentProps<'button'>;

export const ComboboxChipRemove = React.forwardRef<HTMLButtonElement, ComboboxChipRemoveProps>(
  function ComboboxChipRemove(props, ref) {
    const { render, disabled: disabledProp, ...otherProps } = props;
    const { removeValue, focusInput, disabled: rootDisabled, focusableWhenDisabled } = useComboboxContext();
    const value = useComboboxChipValue();
    const disabled = disabledProp === true || rootDisabled;

    const defaultProps = {
      tabIndex: -1,
      onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
        event.preventDefault();
      },
      onClick() {
        removeValue(value);
        focusInput();
      },
    } satisfies DefaultProps<'button'>;

    return (
      <Button
        ref={ref}
        render={render}
        disabled={disabled}
        focusableWhenDisabled={focusableWhenDisabled}
        {...mergeProps<'button'>(defaultProps, otherProps)}
      />
    );
  },
);
