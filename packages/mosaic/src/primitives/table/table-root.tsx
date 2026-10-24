'use client';

import React from 'react';

import { type ComponentProps, mergeProps, useRender } from '../utils';
import { type TableCollection, TableContext, type TableContextValue } from './table-context';
import { isTextEntry } from './table-dom';
import { useGridNavigation } from './use-grid-navigation';

export interface TableRootProps extends ComponentProps<'table'> {
  /** The collection from `useDataTable`. It owns the rows, their selection and their expanded state. */
  table?: TableCollection;
}

export const TableRoot = React.forwardRef<HTMLTableElement, TableRootProps>(function TableRoot(props, ref) {
  const { render, table = null, ...otherProps } = props;
  const [element, setElement] = React.useState<HTMLTableElement | null>(null);
  const [actionCount, setActionCount] = React.useState(0);
  const excluded = React.useMemo(() => new WeakSet<Element>(), []);

  const selectionMode = table?.selectionMode ?? 'none';
  const tree = table?.rows.some(row => row.depth > 0 || row.getCanExpand()) ?? false;
  const hasSelection = table ? Object.values(table.rowSelection).some(Boolean) : false;
  const interactive = tree || selectionMode !== 'none' || actionCount > 0;

  useGridNavigation(element, interactive, excluded);

  const registerAction = React.useCallback(() => {
    setActionCount(count => count + 1);
    return () => setActionCount(count => count - 1);
  }, []);

  const excludeFromNavigation = React.useCallback((node: Element) => excluded.add(node), [excluded]);

  const contextValue = React.useMemo<TableContextValue>(
    () => ({ table, tree, hasSelection, registerAction, excludeFromNavigation }),
    [table, tree, hasSelection, registerAction, excludeFromNavigation],
  );

  const defaultProps: Record<string, unknown> = {
    role: tree ? 'treegrid' : interactive ? 'grid' : undefined,
    'aria-multiselectable': selectionMode === 'multiple' || undefined,
    onKeyDown: (event: React.KeyboardEvent<HTMLTableElement>) => {
      const { target, currentTarget } = event;
      if (!table || !(target instanceof Element) || !currentTarget.contains(target)) {
        return;
      }
      if (event.key === 'Escape' && hasSelection) {
        event.preventDefault();
        event.stopPropagation();
        table.setRowSelection({});
      } else if (
        event.key === 'a' &&
        (event.ctrlKey || event.metaKey) &&
        selectionMode === 'multiple' &&
        !isTextEntry(target)
      ) {
        event.preventDefault();
        if (!table.getIsAllRowsSelected()) {
          table.toggleAllRowsSelected();
        }
      }
    },
  };

  return (
    <TableContext.Provider value={contextValue}>
      {useRender({
        defaultTagName: 'table',
        render,
        ref: [setElement, ref],
        props: mergeProps<'table'>(defaultProps, otherProps),
      })}
    </TableContext.Provider>
  );
});
