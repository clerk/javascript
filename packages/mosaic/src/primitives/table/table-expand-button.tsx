'use client';

import React from 'react';

import { type ComponentProps, type DefaultProps, mergeProps, useRender } from '../utils';
import { TableRowContext, useTableContext } from './table-context';

export type TableExpandButtonProps = ComponentProps<'button'>;

export const TableExpandButton = React.forwardRef<HTMLButtonElement, TableExpandButtonProps>(
  function TableExpandButton(props, ref) {
    const { render, ...otherProps } = props;
    const { excludeFromNavigation } = useTableContext();
    const row = React.useContext(TableRowContext)?.row;
    const canExpand = row?.getCanExpand() ?? false;
    const expanded = row?.getIsExpanded() ?? false;

    const register = React.useCallback(
      (node: HTMLButtonElement | null) => {
        if (node) {
          excludeFromNavigation(node);
        }
      },
      [excludeFromNavigation],
    );

    const ownProps = {
      type: 'button',
      tabIndex: -1,
      'aria-expanded': expanded,
      onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => event.preventDefault(),
      onClick: () => row?.toggleExpanded(),
    } satisfies DefaultProps<'button'>;

    const state = { expanded };

    return useRender({
      defaultTagName: 'button',
      render,
      enabled: canExpand,
      ref: [register, ref],
      state,
      stateAttributesMapping: {
        expanded: (v: boolean): Record<string, string> => (v ? { 'data-expanded': '' } : { 'data-collapsed': '' }),
      },
      props: mergeProps<'button'>(ownProps, otherProps),
    });
  },
);
