'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { TableHeaderContext, TableRowContext, useRowHeaderLabel, useTableContext } from './table-context';

export type TableSelectionCheckboxProps = ComponentProps<'input'>;

export const TableSelectionCheckbox = React.forwardRef<HTMLInputElement, TableSelectionCheckboxProps>(
  function TableSelectionCheckbox(props, ref) {
    const { render, ...otherProps } = props;
    const { enabled, checked, indeterminate, disabled, label, toggle } = useSelectionCheckboxState();
    const labelProps = useRowHeaderLabel(label, otherProps.id);

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
  const { table } = useTableContext();
  const rowContext = React.useContext(TableRowContext);
  const inHeader = React.useContext(TableHeaderContext);
  const row = rowContext?.row;

  if (row && rowContext) {
    return {
      enabled: row.getCanSelect() || table?.selectionMode !== 'none',
      checked: row.getIsSelected(),
      indeterminate: false,
      disabled: rowContext.disabled || !row.getCanSelect(),
      label: 'Select',
      toggle: row.toggleSelected,
    };
  }
  const selectAll = inHeader && table?.selectionMode === 'multiple';
  return {
    enabled: Boolean(selectAll),
    checked: table?.getIsAllRowsSelected() ?? false,
    indeterminate: table?.getIsSomeRowsSelected() ?? false,
    disabled: table ? !table.rows.some(tableRow => tableRow.getCanSelect()) : true,
    label: 'Select all',
    toggle: () => table?.toggleAllRowsSelected(),
  };
}
