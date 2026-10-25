'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { TableRowContext, type TableRowContextValue, useTableContext, useTableItem } from './table-context';
import { focusIsInChildRows, isRowOwnClick, isRtl, openLink, type TableLink } from './table-dom';

export interface TableRowProps extends ComponentProps<'tr'>, Partial<TableLink> {
  /** Removes the row from keyboard navigation, selection and its action. @default false */
  disabled?: boolean;
  /** Lets the row expand before its children are loaded. @default false */
  expandable?: boolean;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(props, ref) {
  const { render, disabled = false, expandable = false, href, target, rel, download, onClick, ...otherProps } = props;
  const table = useTableContext();
  const item = useTableItem();
  const { value } = item;
  const { registerDisabled, registerInteractive } = table;
  const elementRef = React.useRef<HTMLTableRowElement | null>(null);

  const actionable = !disabled && (onClick !== undefined || href !== undefined);
  const canSelect = !disabled && table.selectionMode !== 'none';
  const selected = table.selection.includes(value);
  const canExpand = table.tree && (item.hasChildren || expandable);
  const expanded = canExpand && table.expanded.includes(value);
  const hasSelection = table.selection.length > 0;
  const [rowHeaders, setRowHeaders] = React.useState<string[]>([]);
  const rowHeaderIds = rowHeaders.length > 0 ? rowHeaders.join(' ') : undefined;

  const registerRowHeader = React.useCallback((id: string) => {
    setRowHeaders(ids => [...ids, id]);
    return () => setRowHeaders(ids => ids.filter(other => other !== id));
  }, []);

  React.useLayoutEffect(() => (actionable ? registerInteractive() : undefined), [actionable, registerInteractive]);
  React.useLayoutEffect(() => (disabled ? registerDisabled(value) : undefined), [disabled, value, registerDisabled]);

  const toggleSelected = (options?: { range?: boolean }) => {
    if (canSelect) {
      table.toggleSelected(value, options);
    }
  };

  const toggleExpanded = () => {
    if (!canExpand) {
      return;
    }
    const element = elementRef.current;
    if (expanded && element && focusIsInChildRows(element)) {
      element.focus();
    }
    table.toggleExpanded(value);
  };

  const runAction = (event: React.MouseEvent<HTMLTableRowElement>) => {
    onClick?.(event);
    if (href !== undefined && !event.defaultPrevented) {
      openLink(event.currentTarget, { href, target, rel, download }, event);
    }
  };

  const defaultProps: Record<string, unknown> = {
    'aria-labelledby': rowHeaderIds,
    'aria-selected': canSelect ? selected : undefined,
    'aria-disabled': disabled || undefined,
    ...(table.tree
      ? {
          'aria-level': item.depth + 1,
          'aria-posinset': item.index + 1,
          'aria-setsize': item.setSize,
          'aria-expanded': canExpand ? expanded : undefined,
        }
      : {}),
    style: { '--table-row-depth': item.depth },
    onClick: (event: React.MouseEvent<HTMLTableRowElement>) => {
      if (disabled || !isRowOwnClick(event)) {
        return;
      }
      const pointer = event.detail !== 0;
      if (canSelect && pointer && (hasSelection || !actionable)) {
        toggleSelected({ range: event.shiftKey });
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
        } else {
          toggleSelected();
        }
      } else if (event.key === ' ' && canSelect) {
        event.preventDefault();
        toggleSelected({ range: event.shiftKey });
      } else if (onRow && canExpand) {
        const [expandKey, collapseKey] = isRtl(element) ? ['ArrowLeft', 'ArrowRight'] : ['ArrowRight', 'ArrowLeft'];
        if ((event.key === expandKey && !expanded) || (event.key === collapseKey && expanded)) {
          event.preventDefault();
          toggleExpanded();
        }
      }
    },
  };

  const rowContext: TableRowContextValue = {
    disabled,
    canSelect,
    selected,
    canExpand,
    expanded,
    toggleSelected,
    toggleExpanded,
    rowHeaderIds,
    registerRowHeader,
  };

  const state = { selected, disabled, expanded, actionable };

  return (
    <TableRowContext.Provider value={rowContext}>
      {useRender({
        defaultTagName: 'tr',
        render,
        ref: [elementRef, ref],
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
