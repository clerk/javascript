'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { TableRowContext, useCellIndex, useTableContext } from './table-context';

export type TableCellProps = ComponentProps<'td'>;

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(props, ref) {
  const { render, ...otherProps } = props;
  const { rowHeaderColumns } = useTableContext();
  const [elementRef, index] = useCellIndex();
  const rowHeader = rowHeaderColumns.includes(index);
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
    ref: [elementRef, ref],
    props: mergeProps<'td'>(defaultProps, otherProps),
  });
});
