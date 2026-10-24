'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { TableHeaderContext, useTableContext } from './table-context';

export type TableHeaderProps = ComponentProps<'thead'>;

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  function TableHeader(props, ref) {
    const { render, children, ...otherProps } = props;
    useTableContext();

    const defaultProps: Record<string, unknown> = {
      children: <tr>{children}</tr>,
    };

    return (
      <TableHeaderContext.Provider value>
        {useRender({
          defaultTagName: 'thead',
          render,
          ref,
          props: mergeProps<'thead'>(defaultProps, otherProps),
        })}
      </TableHeaderContext.Provider>
    );
  },
);
