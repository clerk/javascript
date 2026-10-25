'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { useTableContext } from './table-context';

export interface TableColumnProps extends ComponentProps<'th'> {
  /** Identifies the column in the sort state. */
  value?: string;
  /** Sorts the table by this column when the header is clicked or pressed with Enter or Space. Requires `value`. @default false */
  sortable?: boolean;
}

export const TableColumn = React.forwardRef<HTMLTableCellElement, TableColumnProps>(function TableColumn(props, ref) {
  const { render, value, sortable = false, ...otherProps } = props;
  const { sort, sortBy, registerColumn, registerInteractive } = useTableContext();
  const canSort = sortable && value !== undefined;
  const sortDirection = canSort && sort?.column === value ? sort.direction : undefined;

  React.useLayoutEffect(registerColumn, [registerColumn]);
  React.useLayoutEffect(() => (canSort ? registerInteractive() : undefined), [canSort, registerInteractive]);

  const defaultProps: Record<string, unknown> = {
    scope: 'col',
    ...(canSort
      ? {
          'aria-sort': sortDirection ?? 'none',
          onClick: () => sortBy(value),
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
    ref,
    state,
    stateAttributesMapping: {
      sortable: (v: boolean) => (v ? { 'data-sortable': '' } : null),
      sortDirection: (v: string | undefined) => (v ? { 'data-sort-direction': v } : null),
    },
    props: mergeProps<'th'>(defaultProps, otherProps),
  });
});
