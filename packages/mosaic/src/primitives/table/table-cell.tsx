'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { TableRowContext, useTableContext } from './table-context';

export interface TableCellProps extends ComponentProps<'td'> {
  /** Renders the cell as a row header. The row and its selection checkbox and expand button take their names from it. @default false */
  rowHeader?: boolean;
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(props, ref) {
  const { render, rowHeader = false, ...otherProps } = props;
  useTableContext();
  const registerRowHeader = React.useContext(TableRowContext)?.registerRowHeader;
  const generatedId = React.useId();
  const id = otherProps.id ?? generatedId;

  React.useLayoutEffect(
    () => (rowHeader && registerRowHeader ? registerRowHeader(id) : undefined),
    [rowHeader, registerRowHeader, id],
  );

  const defaultProps: Record<string, unknown> = rowHeader ? { id, scope: 'row' } : {};

  return useRender({
    defaultTagName: rowHeader ? 'th' : 'td',
    render,
    ref,
    props: mergeProps<'td'>(defaultProps, otherProps),
  });
});
