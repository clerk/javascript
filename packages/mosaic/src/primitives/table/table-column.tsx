'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { useCellIndex, useTableContext } from './table-context';
import { isOwnClick } from './table-dom';

export interface TableColumnProps extends ComponentProps<'th'> {
  /** Identifies the column in the sort state. */
  value?: string;
  /** Renders this column's cells as row headers. Each row, and its selection checkbox and expand button, take their names from them. @default false */
  rowHeader?: boolean;
  /** Sorts the table by this column when the header is clicked or pressed with Enter or Space. Requires `value`. @default false */
  sortable?: boolean;
}

export const TableColumn = React.forwardRef<HTMLTableCellElement, TableColumnProps>(function TableColumn(props, ref) {
  const { render, value, sortable = false, rowHeader = false, ...otherProps } = props;
  const { sort, sortBy, registerColumn, registerInteractive, registerRowHeaderColumn } = useTableContext();
  const [elementRef, index] = useCellIndex();
  const canSort = sortable && value !== undefined;
  const sortDirection = canSort && sort?.column === value ? sort.direction : undefined;

  React.useLayoutEffect(registerColumn, [registerColumn]);
  React.useLayoutEffect(() => (canSort ? registerInteractive() : undefined), [canSort, registerInteractive]);
  React.useLayoutEffect(
    () => (rowHeader && index !== -1 ? registerRowHeaderColumn(index) : undefined),
    [rowHeader, index, registerRowHeaderColumn],
  );

  const defaultProps: Record<string, unknown> = {
    scope: 'col',
    ...(canSort
      ? {
          'aria-sort': sortDirection ?? 'none',
          onClick: (event: React.MouseEvent<HTMLTableCellElement>) => {
            if (isOwnClick(event)) {
              sortBy(value);
            }
          },
          onKeyDown: (event: React.KeyboardEvent<HTMLTableCellElement>) => {
            if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              sortBy(value);
            }
          },
        }
      : {}),
  };

  const state = { sortable: canSort, sortDirection };

  return useRender({
    defaultTagName: 'th',
    render,
    ref: [elementRef, ref],
    state,
    stateAttributesMapping: {
      sortable: (v: boolean) => (v ? { 'data-sortable': '' } : null),
      sortDirection: (v: string | undefined) => (v ? { 'data-sort-direction': v } : null),
    },
    props: mergeProps<'th'>(defaultProps, otherProps),
  });
});
