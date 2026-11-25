'use client';

import { useListItem } from '@floating-ui/react';
import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useSelectContext, useSelectHighlightContext, useSelectItemsContext } from './select-context';

export interface SelectSelectAllProps extends ComponentProps<'button'> {
  /** Matched by typeahead. */
  label?: string;
}

/**
 * An item that selects every enabled item, or clears them once all are selected. Renders
 * nothing unless the Select is `multiple`.
 */
export const SelectSelectAll = React.forwardRef<HTMLButtonElement, SelectSelectAllProps>(
  function SelectSelectAll(props, ref) {
    const { multiple } = useSelectContext();
    return multiple ? (
      <SelectSelectAllBody
        {...props}
        forwardedRef={ref}
      />
    ) : null;
  },
);

interface SelectSelectAllBodyProps extends SelectSelectAllProps {
  forwardedRef: React.ForwardedRef<HTMLButtonElement>;
}

function SelectSelectAllBody(bodyProps: SelectSelectAllBodyProps) {
  const { forwardedRef: ref, render, label, ...otherProps } = bodyProps;
  const { enabledValues, toggleAll } = useSelectContext();
  const { activeIndex, selectedValues } = useSelectHighlightContext();
  const { getItemProps } = useSelectItemsContext();
  const { ref: itemRef, index } = useListItem({ label: label ?? null });

  const selectedCount = enabledValues.filter(value =>
    selectedValues.some(selected => Object.is(selected, value)),
  ).length;
  const disabled = enabledValues.length === 0;
  const checked = !disabled && selectedCount === enabledValues.length;
  const isActive = activeIndex === index;

  const indeterminate = selectedCount > 0 && !checked;
  const state = {
    checked,
    indeterminate,
    active: isActive,
    disabled,
  };

  const ownProps = {
    type: 'button',
    role: 'option',
    'aria-selected': checked,
    'aria-checked': indeterminate ? 'mixed' : checked,
    'aria-disabled': disabled || undefined,
    tabIndex: isActive ? 0 : -1,
  } satisfies DefaultProps<'button'>;

  const defaultProps = {
    ...ownProps,
    ...getItemProps({
      onClick() {
        if (!disabled) {
          toggleAll();
        }
      },
    }),
  };

  return useRender({
    defaultTagName: 'button',
    render,
    state,
    stateAttributesMapping: {
      checked: (v: boolean) => (v ? { 'data-checked': '' } : null),
      indeterminate: (v: boolean) => (v ? { 'data-indeterminate': '' } : null),
      active: (v: boolean) => (v ? { 'data-active': '' } : null),
      disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
    },
    ref: [itemRef, ref],
    props: mergeProps<'button'>(defaultProps, otherProps),
  });
}
