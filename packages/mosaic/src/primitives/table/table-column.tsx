'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { useTableContext } from './table-context';

export type TableColumnProps = ComponentProps<'th'>;

export const TableColumn = React.forwardRef<HTMLTableCellElement, TableColumnProps>(function TableColumn(props, ref) {
  const { render, ...otherProps } = props;
  useTableContext();

  const ownProps = {
    scope: 'col',
  } satisfies DefaultProps<'th'>;

  return useRender({
    defaultTagName: 'th',
    render,
    ref,
    props: mergeProps<'th'>(ownProps, otherProps),
  });
});
