import { createContext, useContext, useId } from 'react';

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
  rowHeaderIds: string | undefined;
  registerRowHeader: (id: string) => () => void;
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

export function useRowHeaderLabel(label: string, id: string | undefined) {
  const generatedId = useId();
  const ownId = id ?? generatedId;
  const rowHeaderIds = useContext(TableRowContext)?.rowHeaderIds;
  return {
    id: ownId,
    'aria-label': label,
    'aria-labelledby': rowHeaderIds ? `${ownId} ${rowHeaderIds}` : undefined,
  };
}
