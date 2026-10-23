import type { PaginationProps } from '../components/pagination';
import type { TableHeaderCellProps } from '../components/table';
import { functionalUpdate, type PaginationState, type SortingState, useDataTable } from '../primitives/hooks';

export interface ServerDataTableSort<TColumn extends string> {
  column: TColumn;
  direction: 'ascending' | 'descending';
}

export type ServerDataTablePagination = Required<
  Pick<PaginationProps, 'page' | 'pageSize' | 'totalItems' | 'onChange'>
> &
  Pick<PaginationProps, 'onPageSizeChange'>;

export function useServerDataTable<TData, TColumn extends string>({
  data,
  totalCount,
  getRowId,
  isRowSelectable,
  sortableColumns,
  sort,
  onSortChange,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchValue,
  onSearchChange,
}: {
  data: TData[];
  totalCount: number;
  getRowId: (row: TData) => string;
  isRowSelectable?: (row: TData) => boolean;
  sortableColumns: readonly TColumn[];
  sort?: ServerDataTableSort<TColumn> | null;
  onSortChange?: (sort: ServerDataTableSort<TColumn> | null) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}) {
  const sorting: SortingState = sort ? [{ id: sort.column, desc: sort.direction === 'descending' }] : [];
  const pagination: PaginationState = { pageIndex: page - 1, pageSize };

  const table = useDataTable({
    data,
    totalCount,
    getRowId,
    isRowSelectable,
    sorting,
    onSortingChange: onSortChange
      ? update => {
          const active = functionalUpdate(update, sorting)[0];
          const column = sortableColumns.find(c => c === active?.id);
          table.setRowSelection({});
          onSortChange(active && column ? { column, direction: active.desc ? 'descending' : 'ascending' } : null);
        }
      : undefined,
    pagination,
    onPaginationChange: update => {
      const next = functionalUpdate(update, pagination);
      table.setRowSelection({});
      if (next.pageSize !== pageSize) {
        onPageSizeChange?.(next.pageSize);
      }
      onPageChange(next.pageIndex + 1);
    },
    globalFilter: searchValue,
    onGlobalFilterChange: update => {
      table.setRowSelection({});
      onSearchChange(functionalUpdate(update, searchValue));
    },
  });

  const sortHeader = (column: TColumn): Pick<TableHeaderCellProps, 'sort' | 'onSort'> => {
    const active = table.sorting[0];
    return {
      sort: active?.id === column ? (active.desc ? 'descending' : 'ascending') : 'none',
      onSort: onSortChange
        ? () =>
            table.setSorting(current => {
              const active = current[0];
              if (active?.id !== column) {
                return [{ id: column, desc: false }];
              }
              return active.desc ? [] : [{ id: column, desc: true }];
            })
        : undefined,
    };
  };

  const showPagination = table.getPageCount() > 1 || (totalCount > 0 && Boolean(onPageSizeChange));
  const paginationProps: ServerDataTablePagination | null = showPagination
    ? {
        page: table.pagination.pageIndex + 1,
        pageSize: table.pagination.pageSize,
        totalItems: totalCount,
        onChange: next => table.setPagination(current => ({ ...current, pageIndex: next - 1 })),
        onPageSizeChange: onPageSizeChange ? next => table.setPagination({ pageIndex: 0, pageSize: next }) : undefined,
      }
    : null;

  return { table, sortHeader, pagination: paginationProps };
}
