'use client';

import { useMergeRefs } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useAutocompleteContext } from './autocomplete-context';

export type AutocompleteInputProps = ComponentProps<'input'>;

export const AutocompleteInput = React.forwardRef<HTMLInputElement, AutocompleteInputProps>(
  function AutocompleteInput(props, ref) {
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

    // floating-ui types `setReference` as a method signature, but at runtime it's
    // a stable callback that doesn't use `this`, so the unbound-method check is a
    // false positive here.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const combinedRef = useMergeRefs([refs.setReference, ref]);

    const state = { open };

    const defaultProps = {
      'data-cl-slot': 'autocomplete-input',
      ...getReferenceProps({
        ref: combinedRef,
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

    return renderElement({
      defaultTagName: 'input',
      render,
      state,
      stateAttributesMapping: {
        open: (v: boolean): Record<string, string> | null => (v ? { 'data-cl-open': '' } : { 'data-cl-closed': '' }),
      },
      props: mergeProps<'input'>(defaultProps, otherProps),
    });
  },
);
