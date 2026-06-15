import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useDataTable } from './use-data-table';

type Person = { id: number; name: string; role: string };

const DATA: Person[] = [
  { id: 1, name: 'Alice', role: 'Admin' },
  { id: 2, name: 'Bob', role: 'Member' },
  { id: 3, name: 'Carol', role: 'Admin' },
];

describe('useDataTable', () => {
  describe('rows', () => {
    it('maps data to enriched row objects with stable string ids', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA }));

      expect(result.current.rows).toHaveLength(3);
      expect(result.current.rows[0].id).toBe('0');
      expect(result.current.rows[1].id).toBe('1');
      expect(result.current.rows[2].id).toBe('2');
    });

    it('exposes original data on each row', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA }));

      expect(result.current.rows[0].original).toBe(DATA[0]);
      expect(result.current.rows[2].original).toBe(DATA[2]);
    });

    it('updates when data changes', () => {
      const { result, rerender } = renderHook(({ data }) => useDataTable({ data }), {
        initialProps: { data: DATA },
      });

      expect(result.current.rows).toHaveLength(3);

      rerender({ data: DATA.slice(0, 2) });

      expect(result.current.rows).toHaveLength(2);
    });

    it('returns empty rows for empty data', () => {
      const { result } = renderHook(() => useDataTable({ data: [] }));

      expect(result.current.rows).toHaveLength(0);
    });
  });

  describe('sorting', () => {
    it('defaults to empty sorting state', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA }));

      expect(result.current.sorting).toEqual([]);
    });

    it('uses defaultSorting for initial state', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA, defaultSorting: [{ id: 'name', desc: false }] }));

      expect(result.current.sorting).toEqual([{ id: 'name', desc: false }]);
    });

    it('updates sorting via setSorting with a value', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA }));

      act(() => result.current.setSorting([{ id: 'name', desc: true }]));

      expect(result.current.sorting).toEqual([{ id: 'name', desc: true }]);
    });

    it('updates sorting via setSorting with a functional updater', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA, defaultSorting: [{ id: 'name', desc: false }] }));

      act(() => result.current.setSorting(old => [{ ...old[0], desc: true }]));

      expect(result.current.sorting).toEqual([{ id: 'name', desc: true }]);
    });

    it('fires onSortingChange with resolved value', () => {
      const onSortingChange = vi.fn();
      const { result } = renderHook(() => useDataTable({ data: DATA, onSortingChange }));

      act(() => result.current.setSorting([{ id: 'role', desc: false }]));

      expect(onSortingChange).toHaveBeenCalledWith([{ id: 'role', desc: false }]);
    });

    it('respects controlled sorting prop', () => {
      const controlled = [{ id: 'name', desc: false }];
      const { result } = renderHook(() => useDataTable({ data: DATA, sorting: controlled }));

      act(() => result.current.setSorting([]));

      // Stays controlled — internal state does not override
      expect(result.current.sorting).toEqual(controlled);
    });
  });

  describe('columnFilters', () => {
    it('defaults to empty filters', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA }));

      expect(result.current.columnFilters).toEqual([]);
    });

    it('sets a filter with a value', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA }));

      act(() => result.current.setColumnFilters([{ id: 'role', value: 'Admin' }]));

      expect(result.current.columnFilters).toEqual([{ id: 'role', value: 'Admin' }]);
    });

    it('sets a filter with a functional updater', () => {
      const { result } = renderHook(() =>
        useDataTable({ data: DATA, defaultColumnFilters: [{ id: 'role', value: 'Admin' }] }),
      );

      act(() => result.current.setColumnFilters(old => [...old, { id: 'name', value: 'Alice' }]));

      expect(result.current.columnFilters).toEqual([
        { id: 'role', value: 'Admin' },
        { id: 'name', value: 'Alice' },
      ]);
    });

    it('fires onColumnFiltersChange with resolved value', () => {
      const onColumnFiltersChange = vi.fn();
      const { result } = renderHook(() => useDataTable({ data: DATA, onColumnFiltersChange }));

      act(() => result.current.setColumnFilters([{ id: 'role', value: 'Member' }]));

      expect(onColumnFiltersChange).toHaveBeenCalledWith([{ id: 'role', value: 'Member' }]);
    });
  });

  describe('globalFilter', () => {
    it('defaults to empty string', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA }));

      expect(result.current.globalFilter).toBe('');
    });

    it('sets globalFilter', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA }));

      act(() => result.current.setGlobalFilter('alice'));

      expect(result.current.globalFilter).toBe('alice');
    });

    it('fires onGlobalFilterChange', () => {
      const onGlobalFilterChange = vi.fn();
      const { result } = renderHook(() => useDataTable({ data: DATA, onGlobalFilterChange }));

      act(() => result.current.setGlobalFilter('bob'));

      expect(onGlobalFilterChange).toHaveBeenCalledWith('bob');
    });
  });

  describe('pagination', () => {
    it('defaults to pageIndex 0 and pageSize 10', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA }));

      expect(result.current.pagination).toEqual({ pageIndex: 0, pageSize: 10 });
    });

    it('uses defaultPagination for initial state', () => {
      const { result } = renderHook(() =>
        useDataTable({ data: DATA, defaultPagination: { pageIndex: 2, pageSize: 25 } }),
      );

      expect(result.current.pagination).toEqual({ pageIndex: 2, pageSize: 25 });
    });

    it('getPageCount returns 0 when totalCount is undefined', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA }));

      expect(result.current.getPageCount()).toBe(0);
    });

    it('getPageCount computes from totalCount and pageSize', () => {
      const { result } = renderHook(() =>
        useDataTable({ data: DATA, totalCount: 55, defaultPagination: { pageIndex: 0, pageSize: 10 } }),
      );

      expect(result.current.getPageCount()).toBe(6);
    });

    it('getCanNextPage is false on the last page', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: DATA,
          totalCount: 10,
          defaultPagination: { pageIndex: 0, pageSize: 10 },
        }),
      );

      expect(result.current.getCanNextPage()).toBe(false);
    });

    it('getCanNextPage is true when more pages exist', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: DATA,
          totalCount: 20,
          defaultPagination: { pageIndex: 0, pageSize: 10 },
        }),
      );

      expect(result.current.getCanNextPage()).toBe(true);
    });

    it('getCanPreviousPage is false on page 0', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA }));

      expect(result.current.getCanPreviousPage()).toBe(false);
    });

    it('getCanPreviousPage is true on page > 0', () => {
      const { result } = renderHook(() =>
        useDataTable({ data: DATA, defaultPagination: { pageIndex: 1, pageSize: 10 } }),
      );

      expect(result.current.getCanPreviousPage()).toBe(true);
    });

    it('nextPage increments pageIndex', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: DATA,
          totalCount: 30,
          defaultPagination: { pageIndex: 0, pageSize: 10 },
        }),
      );

      act(() => result.current.nextPage());

      expect(result.current.pagination.pageIndex).toBe(1);
    });

    it('previousPage decrements pageIndex', () => {
      const { result } = renderHook(() =>
        useDataTable({ data: DATA, defaultPagination: { pageIndex: 2, pageSize: 10 } }),
      );

      act(() => result.current.previousPage());

      expect(result.current.pagination.pageIndex).toBe(1);
    });

    it('setPageSize updates pageSize and resets pageIndex to 0', () => {
      const { result } = renderHook(() =>
        useDataTable({ data: DATA, defaultPagination: { pageIndex: 3, pageSize: 10 } }),
      );

      act(() => result.current.setPageSize(25));

      expect(result.current.pagination).toEqual({ pageIndex: 0, pageSize: 25 });
    });

    it('fires onPaginationChange when page changes', () => {
      const onPaginationChange = vi.fn();
      const { result } = renderHook(() =>
        useDataTable({
          data: DATA,
          totalCount: 30,
          defaultPagination: { pageIndex: 0, pageSize: 10 },
          onPaginationChange,
        }),
      );

      act(() => result.current.nextPage());

      expect(onPaginationChange).toHaveBeenCalledWith({ pageIndex: 1, pageSize: 10 });
    });
  });

  describe('row selection', () => {
    it('defaults to no rows selected', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA }));

      expect(result.current.rowSelection).toEqual({});
    });

    it('row.getIsSelected() returns false by default', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA }));

      expect(result.current.rows[0].getIsSelected()).toBe(false);
    });

    it('row.toggleSelected() selects the row', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA }));

      act(() => result.current.rows[0].toggleSelected());

      expect(result.current.rows[0].getIsSelected()).toBe(true);
      expect(result.current.rowSelection).toEqual({ '0': true });
    });

    it('row.toggleSelected() deselects an already-selected row', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA, defaultRowSelection: { '0': true } }));

      act(() => result.current.rows[0].toggleSelected());

      expect(result.current.rows[0].getIsSelected()).toBe(false);
    });

    it('getIsAllRowsSelected() returns false when no rows selected', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA }));

      expect(result.current.getIsAllRowsSelected()).toBe(false);
    });

    it('getIsAllRowsSelected() returns true when all rows selected', () => {
      const { result } = renderHook(() =>
        useDataTable({ data: DATA, defaultRowSelection: { '0': true, '1': true, '2': true } }),
      );

      expect(result.current.getIsAllRowsSelected()).toBe(true);
    });

    it('getIsAllRowsSelected() returns false for empty data', () => {
      const { result } = renderHook(() => useDataTable({ data: [] }));

      expect(result.current.getIsAllRowsSelected()).toBe(false);
    });

    it('getIsSomeRowsSelected() returns true on partial selection', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA, defaultRowSelection: { '1': true } }));

      expect(result.current.getIsSomeRowsSelected()).toBe(true);
    });

    it('getIsSomeRowsSelected() returns false when nothing selected', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA }));

      expect(result.current.getIsSomeRowsSelected()).toBe(false);
    });

    it('toggleAllRowsSelected() selects all rows', () => {
      const { result } = renderHook(() => useDataTable({ data: DATA }));

      act(() => result.current.toggleAllRowsSelected());

      expect(result.current.getIsAllRowsSelected()).toBe(true);
      expect(result.current.rowSelection).toEqual({ '0': true, '1': true, '2': true });
    });

    it('toggleAllRowsSelected() deselects all when all are selected', () => {
      const { result } = renderHook(() =>
        useDataTable({ data: DATA, defaultRowSelection: { '0': true, '1': true, '2': true } }),
      );

      act(() => result.current.toggleAllRowsSelected());

      expect(result.current.rowSelection).toEqual({});
    });

    it('fires onRowSelectionChange when selection changes', () => {
      const onRowSelectionChange = vi.fn();
      const { result } = renderHook(() => useDataTable({ data: DATA, onRowSelectionChange }));

      act(() => result.current.rows[1].toggleSelected());

      expect(onRowSelectionChange).toHaveBeenCalledWith({ '1': true });
    });
  });
});
