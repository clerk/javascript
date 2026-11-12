'use client';

import React, { useCallback } from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { ComboboxChipContext, useComboboxChipsContext } from './combobox-chips-context';
import { useComboboxContext } from './combobox-context';

export interface ComboboxChipProps extends ComponentProps<'div'> {
  value: string;
}

export const ComboboxChip = React.forwardRef<HTMLDivElement, ComboboxChipProps>(function ComboboxChip(props, ref) {
  const { render, value, ...otherProps } = props;
  const { registerChip, navigate, removeChip } = useComboboxChipsContext();
  const { setOpen, focusInput, disabled } = useComboboxContext();

  const registerRef = useCallback(
    (element: HTMLDivElement | null) => registerChip(value, element),
    [registerChip, value],
  );

  const defaultProps = {
    tabIndex: -1,
    'aria-disabled': disabled || undefined,
    onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      if (event.target !== event.currentTarget) {
        return;
      }
      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        if (disabled) {
          return;
        }
        removeChip(value, event.key === 'Backspace' ? 'previous' : 'next');
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (disabled) {
          return;
        }
        setOpen(true);
        focusInput();
        return;
      }
      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        focusInput();
        return;
      }
      navigate(event);
    },
  } satisfies DefaultProps<'div'>;

  const element = useRender({
    defaultTagName: 'div',
    render,
    ref: [registerRef, ref],
    state: { disabled },
    stateAttributesMapping: {
      disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
    },
    props: mergeProps<'div'>(defaultProps, otherProps),
  });

  return <ComboboxChipContext.Provider value={value}>{element}</ComboboxChipContext.Provider>;
});
