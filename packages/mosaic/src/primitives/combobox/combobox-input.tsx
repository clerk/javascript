'use client';

import React, { useContext } from 'react';

import { readingDirectionKeys, useDirection } from '../direction-provider';
import { type ComponentProps, mergeProps, useRender } from '../utils';
import { ComboboxChipsContext } from './combobox-chips-context';
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
    selectedValues,
    removeValue,
    disabled,
  } = useComboboxContext();
  const chips = useContext(ComboboxChipsContext);
  const { previousKey } = readingDirectionKeys(useDirection());

  const state = { open };

  const defaultProps = {
    ...getReferenceProps({
      value: inputValue,
      disabled,
      'aria-autocomplete': 'list' as const,
      onChange(event: React.ChangeEvent<HTMLInputElement>) {
        handleInputChange(event.target.value);
      },
      onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        const last = selectedValues.at(-1);
        const { selectionStart, selectionEnd } = event.currentTarget;
        if (chips && last !== undefined && selectionStart === 0 && selectionEnd === 0) {
          if (event.key === 'Backspace') {
            event.preventDefault();
            removeValue(last);
            return;
          }
          if (event.key === previousKey) {
            event.preventDefault();
            chips.focusLastChip();
            return;
          }
        }
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
