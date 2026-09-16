'use client';

import { useListItem } from '@floating-ui/react';
import React, { useEffect, useId } from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../../utils';
import { useComboboxContext } from './combobox-context';
import { ComboboxOptionContext } from './combobox-option-context';

export interface ComboboxOptionProps extends ComponentProps<'div'> {
  value: string;
  label?: string;
  disabled?: boolean;
}

export const ComboboxOption = React.forwardRef<HTMLDivElement, ComboboxOptionProps>(
  function ComboboxOption(props, ref) {
    const { render, value, label, disabled, ...otherProps } = props;
    const { activeIndex, selectedValue, getItemProps, handleSelect, valuesByIndexRef, registerSelectedIndex, refs } =
      useComboboxContext();

    const id = useId();
    const displayLabel = label ?? value;
    const { ref: itemRef, index } = useListItem({ label: displayLabel });

    const isSelected = selectedValue === value;
    const isActive = activeIndex === index;

    useEffect(() => {
      const map = valuesByIndexRef.current;
      if (!disabled) {
        map.set(index, value);
      }
      const unregisterSelectedIndex = registerSelectedIndex(index, value, displayLabel);
      return () => {
        map.delete(index);
        unregisterSelectedIndex?.();
      };
    }, [index, value, displayLabel, disabled, valuesByIndexRef, registerSelectedIndex]);

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
            (refs.domReference.current as HTMLElement | null)?.focus();
          }
        },
      }),
    };

    const merged = mergeProps<'div'>(defaultProps, otherProps);
    // The option id is owned by the primitive and drives the input's
    // aria-activedescendant linkage: a consumer-supplied id must not override it.
    merged.id = id;

    const element = useRender({
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
    return <ComboboxOptionContext.Provider value={isSelected}>{element}</ComboboxOptionContext.Provider>;
  },
);
