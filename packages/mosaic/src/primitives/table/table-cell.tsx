'use client';

import React from 'react';

import { type ComponentProps, useRender } from '../utils';
import { useTableContext } from './table-context';

export type TableCellProps = ComponentProps<'td'>;

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(props, ref) {
  const { render, ...otherProps } = props;
  useTableContext();

  return useRender({
    defaultTagName: 'td',
    render,
    ref,
    props: otherProps,
  });
});
