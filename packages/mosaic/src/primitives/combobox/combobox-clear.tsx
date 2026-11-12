'use client';

import React from 'react';

import { Button } from '../button';
import { type ComponentProps, type DefaultProps, mergeProps } from '../utils';
import { useComboboxContext } from './combobox-context';

export type ComboboxClearProps = ComponentProps<'button'>;

export const ComboboxClear = React.forwardRef<HTMLButtonElement, ComboboxClearProps>(
  function ComboboxClear(props, ref) {
    const { render, disabled: disabledProp, ...otherProps } = props;
    const { inputValue, selectedValues, clear, disabled: rootDisabled, focusableWhenDisabled } = useComboboxContext();
    const disabled = disabledProp === true || rootDisabled;

    const defaultProps = {
      tabIndex: -1,
      'aria-label': 'Clear',
      onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
        event.preventDefault();
      },
      onClick() {
        clear();
      },
    } satisfies DefaultProps<'button'>;

    if (inputValue === '' && selectedValues.length === 0) {
      return null;
    }

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
