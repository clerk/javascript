'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useAutocompleteContext } from './autocomplete-context';

export type AutocompleteTriggerProps = ComponentProps<'button'>;

export const AutocompleteTrigger = React.forwardRef<HTMLButtonElement, AutocompleteTriggerProps>(
  function AutocompleteTrigger(props, ref) {
    const { render, ...otherProps } = props;
    const { open, setOpen, focusInput, popupId, triggerRef } = useAutocompleteContext();
    const state = { open };

    const defaultProps = {
      type: 'button',
      tabIndex: -1,
      'aria-controls': popupId,
      'aria-expanded': open,
      'aria-haspopup': 'listbox',
      onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
        event.preventDefault();
      },
      onClick() {
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
      },
      props: mergeProps<'button'>(defaultProps, otherProps),
    });
  },
);
