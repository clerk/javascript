'use client';

import { useListItem } from '@floating-ui/react';
import React, { useEffect } from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useSelectHighlightContext, useSelectOptionsContext } from './select-context';

export interface SelectOptionProps extends ComponentProps<'button'> {
  value: string;
  label?: string;
  disabled?: boolean;
}

export const SelectOption = React.forwardRef<HTMLButtonElement, SelectOptionProps>(function SelectOption(props, ref) {
  const { activeIndex, selectedValues } = useSelectHighlightContext();
  const { ref: itemRef, index } = useListItem({ label: props.label ?? props.value });
  return (
    <SelectOptionBody
      {...props}
      forwardedRef={ref}
      listItemRef={itemRef}
      index={index}
      isActive={activeIndex === index}
      isSelected={selectedValues.includes(props.value)}
      isAnchor={selectedValues.at(-1) === props.value}
    />
  );
});

interface SelectOptionBodyProps extends SelectOptionProps {
  forwardedRef: React.ForwardedRef<HTMLButtonElement>;
  listItemRef: (node: HTMLElement | null) => void;
  index: number;
  isActive: boolean;
  isSelected: boolean;
  isAnchor: boolean;
}

const SelectOptionBody = React.memo(function SelectOptionBody(bodyProps: SelectOptionBodyProps) {
  const { forwardedRef: ref, listItemRef: itemRef, index, isActive, isSelected, isAnchor, ...props } = bodyProps;
  const { render, value, label, disabled, ...otherProps } = props;
  const { setSelectedIndex, getItemProps, handleSelect, valueToLabelRef, selectedItemRef } = useSelectOptionsContext();

  const displayLabel = label ?? value;

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
