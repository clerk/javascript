'use client';

import { CompositeItem } from '@floating-ui/react';
import React, { useCallback } from 'react';

import { type ComponentProps, isRef, mergeProps, useRender } from '../utils';
import { useSegmentedControlContext } from './segmented-control-context';

export interface SegmentedControlItemProps extends ComponentProps<'button'> {
  value: string;
  disabled?: boolean;
}

export const SegmentedControlItem = React.forwardRef<HTMLButtonElement, SegmentedControlItemProps>(
  function SegmentedControlItem(props, ref) {
    const { render, value: itemValue, disabled: disabledProp, children, ...otherProps } = props;
    const {
      value: selectedValue,
      select: selectValue,
      registerItem,
      disabled: groupDisabled,
    } = useSegmentedControlContext();

    const disabled = groupDisabled || !!disabledProp;
    const isSelected = selectedValue === itemValue;

    const select = () => {
      if (!disabled && !isSelected) {
        selectValue(itemValue);
      }
    };

    const register = useCallback(
      (element: HTMLButtonElement | null) => registerItem(itemValue, element),
      [registerItem, itemValue],
    );

    const state = {
      selected: isSelected,
      disabled,
    };

    return (
      <CompositeItem
        disabled={disabled}
        render={(compositeProps: React.HTMLAttributes<HTMLElement>) => {
          const defaultProps: Record<string, unknown> = {
            role: 'radio' as const,
            type: 'button' as const,
            'aria-checked': isSelected,
            'aria-disabled': disabled || undefined,
            onClick: select,
            onFocus: () => {
              if (selectedValue !== '') {
                select();
              }
            },
          };

          const merged = mergeProps<'button'>(mergeProps<'button'>(defaultProps, otherProps), compositeProps);
          const { ref: compositeRef, ...mergedProps } = merged;
          const orderedProps = {
            ...(isSelected ? { 'data-selected': '' } : null),
            ...(disabled ? { 'data-disabled': '' } : null),
            ...mergedProps,
          };

          // eslint-disable-next-line react-hooks/rules-of-hooks -- floating-ui's Composite calls this render callback synchronously during its own render, so the hook keeps a stable position.
          return useRender({
            defaultTagName: 'button',
            render,
            ref: [isRef(compositeRef) ? compositeRef : undefined, register, ref],
            state,
            stateAttributesMapping: {
              selected: (v: boolean) => (v ? { 'data-selected': '' } : null),
              disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
            },
            props: orderedProps,
          });
        }}
      >
        {children}
      </CompositeItem>
    );
  },
);
