'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { useComboboxContext } from './combobox-context';

export type ComboboxInputProps = ComponentProps<'input'>;

export const ComboboxInput = React.forwardRef<HTMLInputElement, ComboboxInputProps>(function ComboboxInput(props, ref) {
  const { render, ...otherProps } = props;
  const {
    open,
    inputValue,
    activeIndex,
    refs,
    getReferenceProps,
    handleInputChange,
    handleSelect,
    labelsRef,
    valuesByIndexRef,
  } = useComboboxContext();

  const state = { open };

  const defaultProps = {
    ...getReferenceProps({
      value: inputValue,
      'aria-autocomplete': 'list' as const,
      onChange(event: React.ChangeEvent<HTMLInputElement>) {
        handleInputChange(event.target.value);
      },
      onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter' && activeIndex != null) {
          const value = valuesByIndexRef.current.get(activeIndex);
          const label = labelsRef.current[activeIndex];
          if (value != null) {
            event.preventDefault();
            handleSelect(value, activeIndex, label ?? value);
          }
        }
      },
    }),
  };

  return useRender({
    defaultTagName: 'input',
    render,
    // eslint-disable-next-line @typescript-eslint/unbound-method -- floating-ui types `setReference` as a method, but it is a stable callback that does not use `this`.
    ref: [refs.setReference, ref],
    state,
    stateAttributesMapping: {
      open: (v: boolean): Record<string, string> | null => (v ? { 'data-open': '' } : { 'data-closed': '' }),
    },
    props: mergeProps<'input'>(defaultProps, otherProps),
  });
});
