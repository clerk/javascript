'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { TableHeaderContext, TableRowContext, useRowHeaderLabel, useTableContext } from './table-context';

export type TableSelectionCheckboxProps = ComponentProps<'input'>;

export const TableSelectionCheckbox = React.forwardRef<HTMLInputElement, TableSelectionCheckboxProps>(
  function TableSelectionCheckbox(props, ref) {
    const { render, ...otherProps } = props;
    const { enabled, checked, indeterminate, disabled, toggle } = useSelectionCheckboxState();
    const labelProps = useRowHeaderLabel(otherProps.id, otherProps['aria-label']);

    const setIndeterminate = React.useCallback(
      (node: HTMLInputElement | null) => {
        if (node) {
          node.indeterminate = indeterminate;
        }
      },
      [indeterminate],
    );

    const ownProps = {
      ...labelProps,
      type: 'checkbox',
      checked,
      disabled,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        toggle({ range: 'shiftKey' in event.nativeEvent && event.nativeEvent.shiftKey === true });
      },
    } satisfies DefaultProps<'input'>;

    const state = { checked, indeterminate, disabled };

    return useRender({
      defaultTagName: 'input',
      render,
      enabled,
      ref: [setIndeterminate, ref],
      state,
      stateAttributesMapping: {
        checked: (v: boolean) => (v ? { 'data-checked': '' } : null),
        indeterminate: (v: boolean) => (v ? { 'data-indeterminate': '' } : null),
        disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
      },
      props: mergeProps<'input'>(ownProps, otherProps),
    });
  },
);

function useSelectionCheckboxState() {
  const table = useTableContext();
  const row = React.useContext(TableRowContext);
  const inHeader = React.useContext(TableHeaderContext);

  if (row) {
    return {
      enabled: table.selectionMode !== 'none',
      checked: row.selected,
      indeterminate: false,
      disabled: !row.canSelect,
      toggle: row.toggleSelected,
    };
  }
  return {
    enabled: inHeader && table.selectionMode === 'multiple',
    checked: table.allSelected,
    indeterminate: table.someSelected,
    disabled: !table.canSelectAll,
    toggle: table.toggleAllSelected,
  };
}
