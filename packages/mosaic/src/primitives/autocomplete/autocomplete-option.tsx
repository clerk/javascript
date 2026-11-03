'use client';

import { useListItem } from '@floating-ui/react';
import React, { useEffect, useId } from 'react';

import { type ComponentProps, type DefaultProps, isHTMLElement, mergeProps, useRender, useStore } from '../utils';
import { useAutocompleteOptionsContext } from './autocomplete-context';

export interface AutocompleteOptionProps extends ComponentProps<'div'> {
  value: string;
  label?: string;
  disabled?: boolean;
}

export const AutocompleteOption = React.forwardRef<HTMLDivElement, AutocompleteOptionProps>(
  function AutocompleteOption(props, ref) {
    const { render, value, label, disabled, ...otherProps } = props;
    const { store, getItemProps, handleSelect, valuesByIndexRef, registerSelectedIndex, refs } =
      useAutocompleteOptionsContext();

    const id = useId();
    const displayLabel = label ?? value;
    const { ref: itemRef, index } = useListItem({ label: displayLabel });

    const isSelected = useStore(store, state => state.selectedValue === value);
    const isActive = useStore(store, state => state.activeIndex === index);

    useEffect(() => {
      const map = valuesByIndexRef.current;
      if (!disabled) {
        map.set(index, value);
      }
      registerSelectedIndex(index, isSelected);
      return () => {
        map.delete(index);
      };
    }, [index, value, disabled, isSelected, valuesByIndexRef, registerSelectedIndex]);

    const state = {
      selected: isSelected,
      active: isActive,
      disabled: !!disabled,
    };

    const ownProps = {
      id,
      role: 'option',
      'aria-selected': isSelected,
      'aria-disabled': disabled || undefined,
    } satisfies DefaultProps<'div'>;

    const defaultProps = {
      ...ownProps,
      ...getItemProps({
        onClick() {
          if (!disabled) {
            handleSelect(value, index, displayLabel);
            const reference = refs.domReference.current;
            if (isHTMLElement(reference)) {
              reference.focus();
            }
          }
        },
      }),
    };

    const merged = mergeProps<'div'>(defaultProps, otherProps);
    // The option id is owned by the primitive and drives the input's
    // aria-activedescendant linkage: a consumer-supplied id must not override it.
    merged.id = id;

    return useRender({
      defaultTagName: 'div',
      render,
      ref: [itemRef, ref],
      state,
      stateAttributesMapping: {
        selected: (v: boolean) => (v ? { 'data-selected': '' } : null),
        active: (v: boolean) => (v ? { 'data-active': '' } : null),
        disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
      },
      props: merged,
    });
  },
);
