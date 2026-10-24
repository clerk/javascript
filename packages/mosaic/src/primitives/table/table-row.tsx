'use client';

import React from 'react';

import type { DataTableRow } from '../hooks/use-data-table';
import { type ComponentProps, mergeProps, useRender } from '../utils';
import { TableRowContext, type TableRowContextValue, useTableContext } from './table-context';
import { isRowOwnClick, isRtl, openLink, type TableLink } from './table-dom';

export interface TableRowProps extends ComponentProps<'tr'>, Partial<TableLink> {
  /** The row from `useDataTable`. It drives the row's selection and tree state. */
  row?: DataTableRow<unknown>;
  /** Removes the row from keyboard navigation, selection and its action. @default false */
  disabled?: boolean;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(props, ref) {
  const { render, row = null, disabled = false, href, target, rel, download, onClick, ...otherProps } = props;
  const { tree, hasSelection, registerAction } = useTableContext();

  const actionable = !disabled && (onClick !== undefined || href !== undefined);
  const canSelect = !disabled && (row?.getCanSelect() ?? false);
  const canExpand = row?.getCanExpand() ?? false;
  const expanded = row?.getIsExpanded() ?? false;
  const selected = row?.getIsSelected() ?? false;

  React.useLayoutEffect(() => (actionable ? registerAction() : undefined), [actionable, registerAction]);

  const runAction = (event: React.MouseEvent<HTMLTableRowElement>) => {
    onClick?.(event);
    if (href !== undefined && !event.defaultPrevented) {
      openLink(event.currentTarget, { href, target, rel, download }, event);
    }
  };

  const defaultProps: Record<string, unknown> = {
    'aria-selected': row?.getCanSelect() ? selected : undefined,
    'aria-disabled': disabled || undefined,
    ...(tree && row
      ? {
          'aria-level': row.depth + 1,
          'aria-posinset': row.index + 1,
          'aria-setsize': row.setSize,
          'aria-expanded': canExpand ? expanded : undefined,
        }
      : {}),
    style: row ? { '--table-row-depth': row.depth } : undefined,
    onClick: (event: React.MouseEvent<HTMLTableRowElement>) => {
      if (disabled || !isRowOwnClick(event)) {
        return;
      }
      const pointer = event.detail !== 0;
      if (canSelect && pointer && (hasSelection || !actionable)) {
        row?.toggleSelected({ range: event.shiftKey });
      } else if (actionable) {
        runAction(event);
      }
    },
    // eslint-disable-next-line sonarjs/cognitive-complexity -- One pass over the row's keydown; each branch handles a separate key.
    onKeyDown: (event: React.KeyboardEvent<HTMLTableRowElement>) => {
      const element = event.currentTarget;
      const onRow = event.target === element;
      const onCell = event.target instanceof HTMLTableCellElement && event.target.parentElement === element;
      if (event.defaultPrevented || disabled || !(onRow || onCell)) {
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        if (actionable) {
          element.click();
        } else if (canSelect) {
          row?.toggleSelected();
        }
      } else if (event.key === ' ' && canSelect) {
        event.preventDefault();
        row?.toggleSelected({ range: event.shiftKey });
      } else if (onRow && canExpand) {
        const [expandKey, collapseKey] = isRtl(element) ? ['ArrowLeft', 'ArrowRight'] : ['ArrowRight', 'ArrowLeft'];
        if ((event.key === expandKey && !expanded) || (event.key === collapseKey && expanded)) {
          event.preventDefault();
          row?.toggleExpanded();
        }
      }
    },
  };

  const rowContext = React.useMemo<TableRowContextValue>(() => ({ row, disabled }), [row, disabled]);

  const state = { selected, disabled, expanded, actionable };

  return (
    <TableRowContext.Provider value={rowContext}>
      {useRender({
        defaultTagName: 'tr',
        render,
        ref,
        state,
        stateAttributesMapping: {
          selected: (v: boolean) => (v ? { 'data-selected': '' } : null),
          disabled: (v: boolean) => (v ? { 'data-disabled': '' } : null),
          expanded: (v: boolean) => (v ? { 'data-expanded': '' } : null),
          actionable: (v: boolean) => (v ? { 'data-actionable': '' } : null),
        },
        props: mergeProps<'tr'>(defaultProps, otherProps),
      })}
    </TableRowContext.Provider>
  );
});
