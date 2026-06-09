'use client';

import { useListItem, useMergeRefs } from '@floating-ui/react';
import type React from 'react';
import { useEffect, useId } from 'react';

import { type ComponentProps, mergeProps, renderElement } from '../../utils/render-element';
import { useAutocompleteContext } from './autocomplete-context';

export interface AutocompleteOptionProps extends ComponentProps<'div'> {
  value: string;
  label?: string;
  disabled?: boolean;
}

export function AutocompleteOption(props: AutocompleteOptionProps) {
  const { render, ref: consumerRef, value, label, disabled, ...otherProps } = props;
  const { activeIndex, selectedValue, getItemProps, handleSelect, valuesByIndexRef, registerSelectedIndex, refs } =
    useAutocompleteContext();

  const id = useId();
  const displayLabel = label ?? value;
  const { ref: itemRef, index } = useListItem({ label: displayLabel });
  const combinedRef = useMergeRefs([itemRef, consumerRef]);

  const isSelected = selectedValue === value;
  const isActive = activeIndex === index;

  useEffect(() => {
    valuesByIndexRef.current.set(index, value);
    registerSelectedIndex(index, value);
    return () => {
      valuesByIndexRef.current.delete(index);
    };
  }, [index, value, valuesByIndexRef, registerSelectedIndex]);

  const state = {
    selected: isSelected,
    active: isActive,
    disabled: !!disabled,
  };

  const defaultProps = {
    'data-cl-slot': 'autocomplete-option',
    id,
    ref: combinedRef,
    role: 'option' as const,
    'aria-selected': isActive,
    'aria-disabled': disabled || undefined,
    ...(getItemProps({
      onClick() {
        if (!disabled) {
          handleSelect(value, index, displayLabel);
          (refs.domReference.current as HTMLElement | null)?.focus();
        }
      },
    }) as React.ComponentPropsWithRef<'div'>),
  };

  return renderElement({
    defaultTagName: 'div',
    render,
    state,
    stateAttributesMapping: {
      selected: (v: boolean) => (v ? { 'data-cl-selected': '' } : null),
      active: (v: boolean) => (v ? { 'data-cl-active': '' } : null),
      disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
    },
    props: mergeProps<'div'>(defaultProps, otherProps),
  });
}
