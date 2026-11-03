import { createContext, useContext, useId, useLayoutEffect, useRef, useState } from 'react';

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
  rowHeaderColumns: number[];
  registerRowHeaderColumn: (index: number) => () => void;
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

export function useRowHeaderLabel(id: string | undefined, ariaLabel: string | undefined) {
  const generatedId = useId();
  const ownId = id ?? generatedId;
  const rowHeaderIds = useContext(TableRowContext)?.rowHeaderIds;
  const labelledBy = rowHeaderIds && ariaLabel ? `${ownId} ${rowHeaderIds}` : rowHeaderIds;
  return { id: ownId, 'aria-labelledby': labelledBy };
}

export function useCellIndex() {
  const ref = useRef<HTMLTableCellElement | null>(null);
  const [index, setIndex] = useState(-1);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Re-reads cellIndex after every render so the index follows column changes; setIndex bails out when it is unchanged, so it cannot loop.
  useLayoutEffect(() => {
    setIndex(ref.current?.cellIndex ?? -1);
  });
  return [ref, index] as const;
}
