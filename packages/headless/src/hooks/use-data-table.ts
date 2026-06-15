'use client';

import { useCallback, useMemo } from 'react';
import { useControllableState } from './use-controllable-state';

export type Updater<T> = T | ((old: T) => T);
export type OnChangeFn<T> = (updaterOrValue: Updater<T>) => void;

export type SortingState = Array<{ id: string; desc: boolean }>;
export type ColumnFiltersState = Array<{ id: string; value: unknown }>;
export type PaginationState = { pageIndex: number; pageSize: number };
export type RowSelectionState = Record<string, boolean>;

function functionalUpdate<T>(updater: Updater<T>, old: T): T {
  return typeof updater === 'function' ? (updater as (old: T) => T)(old) : updater;
}

export interface UseDataTableOptions<TData> {
  data: TData[];
  getRowId?: (row: TData, index: number) => string;
  totalCount?: number;

  sorting?: SortingState;
  defaultSorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;

  columnFilters?: ColumnFiltersState;
  defaultColumnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;

  globalFilter?: string;
  defaultGlobalFilter?: string;
  onGlobalFilterChange?: OnChangeFn<string>;

  pagination?: PaginationState;
  defaultPagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;

  rowSelection?: RowSelectionState;
  defaultRowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

export interface DataTableRow<TData> {
  id: string;
  original: TData;
  getIsSelected: () => boolean;
  toggleSelected: () => void;
}

export interface UseDataTableReturn<TData> {
  rows: DataTableRow<TData>[];

  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;

  columnFilters: ColumnFiltersState;
  setColumnFilters: OnChangeFn<ColumnFiltersState>;

  globalFilter: string;
  setGlobalFilter: OnChangeFn<string>;

  pagination: PaginationState;
  setPagination: OnChangeFn<PaginationState>;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  getCanNextPage: () => boolean;
  getCanPreviousPage: () => boolean;
  getPageCount: () => number;

  rowSelection: RowSelectionState;
  setRowSelection: OnChangeFn<RowSelectionState>;
  getIsAllRowsSelected: () => boolean;
  getIsSomeRowsSelected: () => boolean;
  toggleAllRowsSelected: () => void;
}

export function useDataTable<TData>(opts: UseDataTableOptions<TData>): UseDataTableReturn<TData> {
  // ── State slices ────────────────────────────────────────────────────────────

  const [sorting, setSortingRaw] = useControllableState(
    opts.sorting,
    opts.defaultSorting ?? [],
    opts.onSortingChange ? (v: SortingState) => opts.onSortingChange!(v) : undefined,
  );

  const [columnFilters, setColumnFiltersRaw] = useControllableState(
    opts.columnFilters,
    opts.defaultColumnFilters ?? [],
    opts.onColumnFiltersChange ? (v: ColumnFiltersState) => opts.onColumnFiltersChange!(v) : undefined,
  );

  const [globalFilter, setGlobalFilterRaw] = useControllableState(
    opts.globalFilter,
    opts.defaultGlobalFilter ?? '',
    opts.onGlobalFilterChange ? (v: string) => opts.onGlobalFilterChange!(v) : undefined,
  );

  const [pagination, setPaginationRaw] = useControllableState(
    opts.pagination,
    opts.defaultPagination ?? { pageIndex: 0, pageSize: 10 },
    opts.onPaginationChange ? (v: PaginationState) => opts.onPaginationChange!(v) : undefined,
  );

  const [rowSelection, setRowSelectionRaw] = useControllableState(
    opts.rowSelection,
    opts.defaultRowSelection ?? {},
    opts.onRowSelectionChange ? (v: RowSelectionState) => opts.onRowSelectionChange!(v) : undefined,
  );

  // ── Updater-aware public setters ────────────────────────────────────────────

  const setSorting: OnChangeFn<SortingState> = useCallback(
    u => setSortingRaw(functionalUpdate(u, sorting)),
    [sorting, setSortingRaw],
  );

  const setColumnFilters: OnChangeFn<ColumnFiltersState> = useCallback(
    u => setColumnFiltersRaw(functionalUpdate(u, columnFilters)),
    [columnFilters, setColumnFiltersRaw],
  );

  const setGlobalFilter: OnChangeFn<string> = useCallback(
    u => setGlobalFilterRaw(functionalUpdate(u, globalFilter)),
    [globalFilter, setGlobalFilterRaw],
  );

  const setPagination: OnChangeFn<PaginationState> = useCallback(
    u => setPaginationRaw(functionalUpdate(u, pagination)),
    [pagination, setPaginationRaw],
  );

  const setRowSelection: OnChangeFn<RowSelectionState> = useCallback(
    u => setRowSelectionRaw(functionalUpdate(u, rowSelection)),
    [rowSelection, setRowSelectionRaw],
  );

  // ── Rows ────────────────────────────────────────────────────────────────────

  const rows = useMemo<DataTableRow<TData>[]>(
    () =>
      opts.data.map((original, i) => {
        const id = opts.getRowId ? opts.getRowId(original, i) : String(i);
        return {
          id,
          original,
          getIsSelected: () => !!rowSelection[id],
          toggleSelected: () => setRowSelection(old => ({ ...old, [id]: !old[id] })),
        };
      }),
    [opts.data, opts.getRowId, rowSelection, setRowSelection],
  );

  // ── Pagination helpers ──────────────────────────────────────────────────────

  const getPageCount = useCallback(
    () => (opts.totalCount != null ? Math.ceil(opts.totalCount / pagination.pageSize) : 0),
    [opts.totalCount, pagination.pageSize],
  );

  const getCanNextPage = useCallback(
    () => pagination.pageIndex < getPageCount() - 1,
    [pagination.pageIndex, getPageCount],
  );

  const getCanPreviousPage = useCallback(() => pagination.pageIndex > 0, [pagination.pageIndex]);

  const nextPage = useCallback(() => {
    if (getCanNextPage()) {
      setPagination(p => ({ ...p, pageIndex: p.pageIndex + 1 }));
    }
  }, [getCanNextPage, setPagination]);

  const previousPage = useCallback(
    () => setPagination(p => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) })),
    [setPagination],
  );

  const setPageSize = useCallback(
    (size: number) => {
      if (size > 0) {
        setPagination(() => ({ pageIndex: 0, pageSize: size }));
      }
    },
    [setPagination],
  );

  // ── Selection helpers ───────────────────────────────────────────────────────

  const getIsAllRowsSelected = useCallback(
    () => rows.length > 0 && rows.every(r => !!rowSelection[r.id]),
    [rows, rowSelection],
  );

  const getIsSomeRowsSelected = useCallback(
    () => rows.some(r => !!rowSelection[r.id]) && !getIsAllRowsSelected(),
    [rows, rowSelection, getIsAllRowsSelected],
  );

  const toggleAllRowsSelected = useCallback(() => {
    setRowSelection(getIsAllRowsSelected() ? {} : Object.fromEntries(rows.map(r => [r.id, true])));
  }, [rows, getIsAllRowsSelected, setRowSelection]);

  return {
    rows,

    sorting,
    setSorting,

    columnFilters,
    setColumnFilters,

    globalFilter,
    setGlobalFilter,

    pagination,
    setPagination,
    nextPage,
    previousPage,
    setPageSize,
    getCanNextPage,
    getCanPreviousPage,
    getPageCount,

    rowSelection,
    setRowSelection,
    getIsAllRowsSelected,
    getIsSomeRowsSelected,
    toggleAllRowsSelected,
  };
}
