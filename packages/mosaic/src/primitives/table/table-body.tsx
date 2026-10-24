'use client';

import React from 'react';

import { type ComponentProps, useRender } from '../utils';
import { useTableContext } from './table-context';

export type TableBodyProps = ComponentProps<'tbody'>;

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(function TableBody(props, ref) {
  const { render, ...otherProps } = props;
  useTableContext();

  return useRender({
    defaultTagName: 'tbody',
    render,
    ref,
    props: otherProps,
  });
});
