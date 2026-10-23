import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { type ServerDataTableSort, useServerDataTable } from '../use-server-data-table';

type Row = { id: string };
type Column = 'name' | 'createdAt';

const ROWS: Row[] = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

function setup(overrides: Partial<Parameters<typeof useServerDataTable<Row, Column>>[0]> = {}) {
  const props = {
    data: ROWS,
    totalCount: 3,
    getRowId: (row: Row) => row.id,
    sortableColumns: ['name', 'createdAt'] as const,
    page: 1,
    pageSize: 10,
    onPageChange: vi.fn(),
    searchValue: '',
    onSearchChange: vi.fn(),
    ...overrides,
  };
  const hook = renderHook(() => useServerDataTable<Row, Column>(props));
  return { ...hook, props };
}

describe('useServerDataTable', () => {
  describe('sortHeader', () => {
    it('reflects the sort prop on the active column only', () => {
      const { result } = setup({ sort: { column: 'name', direction: 'descending' }, onSortChange: vi.fn() });

      expect(result.current.sortHeader('name').sort).toBe('descending');
      expect(result.current.sortHeader('createdAt').sort).toBe('none');
    });

    it.each<[ServerDataTableSort<Column> | null, ServerDataTableSort<Column> | null]>([
      [null, { column: 'name', direction: 'ascending' }],
      [
        { column: 'name', direction: 'ascending' },
        { column: 'name', direction: 'descending' },
      ],
      [{ column: 'name', direction: 'descending' }, null],
      [
        { column: 'createdAt', direction: 'descending' },
        { column: 'name', direction: 'ascending' },
      ],
    ])('cycles from %j to %j', (sort, expected) => {
      const onSortChange = vi.fn();
      const { result } = setup({ sort, onSortChange });

      act(() => result.current.sortHeader('name').onSort?.());

      expect(onSortChange).toHaveBeenCalledWith(expected);
    });

    it('is not sortable without onSortChange', () => {
      const { result } = setup();

      expect(result.current.sortHeader('name').onSort).toBeUndefined();
    });

    it('reports null for a column that is not sortable', () => {
      const onSortChange = vi.fn();
      const { result } = setup({ onSortChange });

      act(() => result.current.table.setSorting([{ id: 'other', desc: false }]));

      expect(onSortChange).toHaveBeenCalledWith(null);
    });
  });

  describe('pagination', () => {
    it('is hidden for a single page without a page size control', () => {
      const { result } = setup();

      expect(result.current.pagination).toBeNull();
    });

    it('is shown when there is more than one page', () => {
      const { result } = setup({ totalCount: 25 });

      expect(result.current.pagination).toMatchObject({ page: 1, pageSize: 10, totalItems: 25 });
      expect(result.current.pagination?.onPageSizeChange).toBeUndefined();
    });

    it('is shown for a single page when the page size can change', () => {
      const { result } = setup({ onPageSizeChange: vi.fn() });

      expect(result.current.pagination).not.toBeNull();
    });

    it('is hidden when there are no rows, even with a page size control', () => {
      const { result } = setup({ data: [], totalCount: 0, onPageSizeChange: vi.fn() });

      expect(result.current.pagination).toBeNull();
    });

    it('reports a 1-based page', () => {
      const { result, props } = setup({ totalCount: 25, page: 2 });

      expect(result.current.pagination?.page).toBe(2);
      act(() => result.current.pagination?.onChange(3));

      expect(props.onPageChange).toHaveBeenCalledWith(3);
    });

    it('returns to the first page when the page size changes', () => {
      const onPageSizeChange = vi.fn();
      const { result, props } = setup({ totalCount: 25, page: 2, onPageSizeChange });

      act(() => result.current.pagination?.onPageSizeChange?.(25));

      expect(onPageSizeChange).toHaveBeenCalledWith(25);
      expect(props.onPageChange).toHaveBeenCalledWith(1);
    });
  });

  it('forwards search changes', () => {
    const { result, props } = setup();

    act(() => result.current.table.setGlobalFilter('ali'));

    expect(props.onSearchChange).toHaveBeenCalledWith('ali');
  });

  describe('selection', () => {
    function selectAll(result: { current: ReturnType<typeof useServerDataTable<Row, Column>> }) {
      act(() => result.current.table.toggleAllRowsSelected());
      expect(result.current.table.getIsAllRowsSelected()).toBe(true);
    }

    it('clears when the sort changes', () => {
      const { result } = setup({ onSortChange: vi.fn() });
      selectAll(result);

      act(() => result.current.sortHeader('name').onSort?.());

      expect(result.current.table.rowSelection).toEqual({});
    });

    it('clears when the page changes', () => {
      const { result } = setup({ totalCount: 25 });
      selectAll(result);

      act(() => result.current.pagination?.onChange(2));

      expect(result.current.table.rowSelection).toEqual({});
    });

    it('clears when the search changes', () => {
      const { result } = setup();
      selectAll(result);

      act(() => result.current.table.setGlobalFilter('ali'));

      expect(result.current.table.rowSelection).toEqual({});
    });

    it('skips rows that are not selectable', () => {
      const { result } = setup({ isRowSelectable: row => row.id !== 'b' });

      act(() => result.current.table.toggleAllRowsSelected());

      expect(result.current.table.rowSelection).toEqual({ a: true, c: true });
    });
  });
});
