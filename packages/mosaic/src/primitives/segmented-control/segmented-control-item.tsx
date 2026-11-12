'use client';

import React from 'react';

import { useCompositeItem } from '../hooks/use-composite';
import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useSegmentedControlContext } from './segmented-control-context';

export interface SegmentedControlItemProps extends Omit<ComponentProps<'button'>, 'value'> {
  value: unknown;
  disabled?: boolean;
}

export const SegmentedControlItem = React.forwardRef<HTMLButtonElement, SegmentedControlItemProps>(
  function SegmentedControlItem(props, ref) {
    const { render, value: itemValue, disabled: disabledProp, ...otherProps } = props;
    const { value: selectedValue, select, disabled: groupDisabled } = useSegmentedControlContext();

    const compositeItem = useCompositeItem(itemValue);

    const disabled = groupDisabled || !!disabledProp;
    const isSelected = Object.is(selectedValue, itemValue);

    const state = {
      selected: isSelected,
      disabled,
    };

    const defaultProps = {
      role: 'radio',
      type: 'button',
      'aria-checked': isSelected,
      'aria-disabled': disabled || undefined,
      value: typeof itemValue === 'string' ? itemValue : undefined,
      onClick: () => {
        if (!disabled) {
          select(itemValue);
        }
      },
    } satisfies DefaultProps<'button'>;

    return useRender({
      defaultTagName: 'button',
      render,
      ref: [compositeItem, ref],
      state,
      stateAttributesMapping: {
        selected: (v: boolean) => (v ? { 'data-selected': '' } : null),
        disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
      },
      props: mergeProps<'button'>(defaultProps, otherProps),
    });
  },
);
