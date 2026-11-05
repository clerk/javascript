'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useComboboxContext } from './combobox-context';

export interface ComboboxTriggerProps extends ComponentProps<'button'> {
  /** Clears the input and selection instead of toggling the list while there is a value. */
  clearable?: boolean;
  /** Accessible name while the trigger clears. Defaults to `Clear`. */
  clearLabel?: string;
}

export const ComboboxTrigger = React.forwardRef<HTMLButtonElement, ComboboxTriggerProps>(
  function ComboboxTrigger(props, ref) {
    const { render, clearable = false, clearLabel = 'Clear', ...otherProps } = props;
    const { open, setOpen, focusInput, popupId, triggerRef, hasValue, clear } = useComboboxContext();
    const clearing = clearable && hasValue;
    const state = { open, clearing };

    const defaultProps = {
      type: 'button',
      tabIndex: -1,
      ...(clearing
        ? null
        : {
            'aria-controls': popupId,
            'aria-expanded': open,
            'aria-haspopup': 'listbox' as const,
          }),
      onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
        event.preventDefault();
      },
      onClick() {
        if (clearing) {
          clear();
          return;
        }
        setOpen(!open);
        focusInput();
      },
    } satisfies DefaultProps<'button'>;

    return useRender({
      defaultTagName: 'button',
      render,
      ref: [triggerRef, ref],
      state,
      stateAttributesMapping: {
        open: (value: boolean): Record<string, string> | null => (value ? { 'data-open': '' } : { 'data-closed': '' }),
        clearing: (value: boolean): Record<string, string> | null => (value ? { 'data-clearing': '' } : null),
      },
      props: mergeProps<'button'>(defaultProps, clearing ? { ...otherProps, 'aria-label': clearLabel } : otherProps),
    });
  },
);
