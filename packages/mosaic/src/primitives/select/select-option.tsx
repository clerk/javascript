'use client';

import { useListItem } from '@floating-ui/react';
import React, { useEffect } from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useSelectContext } from './select-context';

export interface SelectOptionProps extends ComponentProps<'button'> {
  value: string;
  label?: string;
  disabled?: boolean;
}

export const SelectOption = React.forwardRef<HTMLButtonElement, SelectOptionProps>(function SelectOption(props, ref) {
  const { render, value, label, disabled, ...otherProps } = props;
  const {
    activeIndex,
    selectedValues,
    setSelectedIndex,
    getItemProps,
    handleSelect,
    valueToLabelRef,
    selectedItemRef,
  } = useSelectContext();

  const displayLabel = label ?? value;
  const { ref: itemRef, index } = useListItem({ label: displayLabel });

  const isSelected = selectedValues.includes(value);
  const isAnchor = selectedValues[selectedValues.length - 1] === value;
  const isActive = activeIndex === index;

  useEffect(() => {
    const map = valueToLabelRef.current;
    map.set(value, displayLabel);
    return () => {
      map.delete(value);
    };
  }, [value, displayLabel, valueToLabelRef]);

  useEffect(() => {
    if (isAnchor) {
      setSelectedIndex(index);
    }
  }, [index, isAnchor, setSelectedIndex]);

  const state = {
    selected: isSelected,
    active: isActive,
    disabled: !!disabled,
  };

  const ownProps = {
    type: 'button',
    role: 'option',
    'aria-selected': isSelected,
    'aria-disabled': disabled || undefined,
    tabIndex: isActive ? 0 : -1,
  } satisfies DefaultProps<'button'>;

  const defaultProps = {
    ...ownProps,
    ...getItemProps({
      onClick() {
        if (!disabled) {
          handleSelect(value, index);
        }
      },
    }),
  };

  return useRender({
    defaultTagName: 'button',
    render,
    state,
    stateAttributesMapping: {
      selected: (v: boolean) => (v ? { 'data-selected': '' } : null),
      active: (v: boolean) => (v ? { 'data-active': '' } : null),
      disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
    },
    ref: [itemRef, isAnchor ? selectedItemRef : null, ref],
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
});
