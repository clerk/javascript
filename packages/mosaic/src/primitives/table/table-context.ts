import { createContext, useContext, useId } from 'react';

export type TableSelectionMode = 'none' | 'single' | 'multiple';

export interface TableSort {
  column: string;
  direction: 'ascending' | 'descending';
}

export interface TableBodyRows {
  values: string[];
  tree: boolean;
}

export interface TableContextValue {
  selectionMode: TableSelectionMode;
  selection: string[];
  sort: TableSort | null;
  tree: boolean;
  allSelected: boolean;
  someSelected: boolean;
  canSelectAll: boolean;
  expanded: string[];
  toggleSelected: (value: string, options?: { range?: boolean }) => void;
  toggleAllSelected: () => void;
  toggleExpanded: (value: string) => void;
  sortBy: (column: string) => void;
  syncBodyRows: (rows: TableBodyRows) => void;
  registerDisabled: (value: string) => () => void;
  registerInteractive: () => () => void;
  registerColumn: () => () => void;
  columnCount: number;
  excludeFromNavigation: (element: Element) => void;
}

export interface TableItem {
  value: string;
  depth: number;
  index: number;
  setSize: number;
  hasChildren: boolean;
}

export interface TableRowContextValue {
  disabled: boolean;
  canSelect: boolean;
  selected: boolean;
  canExpand: boolean;
  expanded: boolean;
  toggleSelected: (options?: { range?: boolean }) => void;
  toggleExpanded: () => void;
  rowHeaderIds: string | undefined;
  registerRowHeader: (id: string) => () => void;
}

export const TableContext = createContext<TableContextValue | null>(null);

export const TableHeaderContext = createContext(false);

export const TableItemContext = createContext<TableItem | null>(null);

export const TableRowContext = createContext<TableRowContextValue | null>(null);

export function useTableContext() {
  const ctx = useContext(TableContext);
  if (!ctx) {
    throw new Error('Table compound components must be used within <Table.Root>');
  }
  return ctx;
}

export function useTableItem() {
  const item = useContext(TableItemContext);
  if (!item) {
    throw new Error('<Table.Row> must be rendered by the children function of <Table.Body>');
  }
  return item;
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
