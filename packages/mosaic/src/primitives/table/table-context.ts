import { createContext, useContext } from 'react';

import type { DataTableRow, UseDataTableReturn } from '../hooks/use-data-table';

export type TableCollection = Pick<
  UseDataTableReturn<unknown>,
  | 'rows'
  | 'selectionMode'
  | 'rowSelection'
  | 'setRowSelection'
  | 'getIsAllRowsSelected'
  | 'getIsSomeRowsSelected'
  | 'toggleAllRowsSelected'
>;

export interface TableContextValue {
  table: TableCollection | null;
  tree: boolean;
  hasSelection: boolean;
  registerAction: () => () => void;
  excludeFromNavigation: (element: Element) => void;
}

export interface TableRowContextValue {
  row: DataTableRow<unknown> | null;
  disabled: boolean;
}

export const TableContext = createContext<TableContextValue | null>(null);

export const TableHeaderContext = createContext(false);

export const TableRowContext = createContext<TableRowContextValue | null>(null);

export function useTableContext() {
  const ctx = useContext(TableContext);
  if (!ctx) {
    throw new Error('Table compound components must be used within <Table.Root>');
  }
  return ctx;
}
