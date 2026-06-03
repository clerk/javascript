'use client';

import React from 'react';
import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useAutocompleteContext } from './autocomplete-context';

export interface AutocompleteInputProps extends ComponentProps<'input'> {}

export function AutocompleteInput(props: AutocompleteInputProps) {
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
  } = useAutocompleteContext();

  const state = { open };

  const defaultProps = {
    'data-cl-slot': 'autocomplete-input',
    ...(getReferenceProps({
      ref: refs.setReference,
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
    }) as React.ComponentPropsWithRef<'input'>),
  };

  return renderElement({
    defaultTagName: 'input',
    render,
    state,
    stateAttributesMapping: {
      open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
    },
    props: mergeProps<'input'>(defaultProps, otherProps),
  });
}
