'use client';

import { useListItem, useMergeRefs } from '@floating-ui/react';
import { useEffect } from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, renderElement } from '../../utils/render-element';
import { useSelectContext } from './select-context';

export interface SelectOptionProps extends ComponentProps<'button'> {
  value: string;
  label?: string;
  disabled?: boolean;
}

export function SelectOption(props: SelectOptionProps) {
  const { render, value, label, disabled, ...otherProps } = props;
  const { activeIndex, selectedValue, getItemProps, handleSelect, valueToLabelRef, selectedItemRef } =
    useSelectContext();

  const displayLabel = label ?? value;
  const { ref: itemRef, index } = useListItem({ label: displayLabel });

  const isSelected = selectedValue === value;
  const isActive = activeIndex === index;

  useEffect(() => {
    const map = valueToLabelRef.current;
    map.set(value, displayLabel);
    return () => {
      map.delete(value);
    };
  }, [value, displayLabel, valueToLabelRef]);

  const combinedRef = useMergeRefs([itemRef, isSelected ? selectedItemRef : null]);

  const state = {
    selected: isSelected,
    active: isActive,
    disabled: !!disabled,
  };

  const ownProps = {
    'data-cl-slot': 'select-option',
    type: 'button',
    ref: combinedRef,
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

  return renderElement({
    defaultTagName: 'button',
    render,
    state,
    stateAttributesMapping: {
      selected: (v: boolean) => (v ? { 'data-cl-selected': '' } : null),
      active: (v: boolean) => (v ? { 'data-cl-active': '' } : null),
      disabled: (v: boolean) => (v ? { 'data-cl-disabled': '' } : null),
    },
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}
