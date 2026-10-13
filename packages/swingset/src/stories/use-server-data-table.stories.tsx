import { Pagination } from '@clerk/mosaic/components/pagination';
import { Table } from '@clerk/mosaic/components/table';
import type { ServerDataTableSort } from '@clerk/mosaic/hooks/use-server-data-table';
import { useServerDataTable } from '@clerk/mosaic/hooks/use-server-data-table';
import * as React from 'react';

import { useChaosFixture } from '@/components/ChaosProvider';
import { chaosName, chaosRows } from '@/lib/chaos';
import type { StoryMeta } from '@/lib/types';

export const meta: StoryMeta = {
  group: 'Hooks',
  status: 'stable',
  title: 'useServerDataTable',
  layout: 'wide',
  source: 'packages/mosaic/src/hooks/use-server-data-table.ts',
};

type Member = { id: string; name: string; role: string };
type Column = 'name' | 'role';

const members: Member[] = [
  { id: 'kyle', name: 'Kyle Mac', role: 'Member' },
  { id: 'austin', name: 'Austin Calvelage', role: 'Member' },
  { id: 'colin', name: 'Colin Sidoti', role: 'Admin' },
  { id: 'max', name: 'Max Yinger', role: 'Member' },
  { id: 'preston', name: 'Preston Booth', role: 'Member' },
  { id: 'richard', name: 'Richard Hendricks', role: 'Member' },
  { id: 'monica', name: 'Monica Hall', role: 'Admin' },
  { id: 'jared', name: 'Jared Dunn', role: 'Member' },
  { id: 'dinesh', name: 'Dinesh Chugtai', role: 'Member' },
  { id: 'steve', name: 'Steve Hayes', role: 'Admin' },
  { id: 'gavin', name: 'Gavin Belson', role: 'Admin' },
  { id: 'laurie', name: 'Laurie Bream', role: 'Member' },
  { id: 'erlich', name: 'Erlich Bachman', role: 'Member' },
  { id: 'big-head', name: 'Nelson Bighetti', role: 'Member' },
  { id: 'carla', name: 'Carla Walton', role: 'Member' },
  { id: 'russ', name: 'Russ Hanneman', role: 'Admin' },
  { id: 'peter', name: 'Peter Gregory', role: 'Member' },
  { id: 'ron', name: 'Ron LaFlamme', role: 'Member' },
];

function queryMembers({
  rows,
  query,
  sort,
  page,
  pageSize,
}: {
  rows: Member[];
  query: string;
  sort: ServerDataTableSort<Column> | null;
  page: number;
  pageSize: number;
}) {
  const needle = query.trim().toLowerCase();
  const matches = rows.filter(member => member.name.toLowerCase().includes(needle));
  const sorted = sort
    ? [...matches].sort(
        (a, b) => a[sort.column].localeCompare(b[sort.column]) * (sort.direction === 'ascending' ? 1 : -1),
      )
    : matches;
  const start = (page - 1) * pageSize;
  return { data: sorted.slice(start, start + pageSize), totalCount: matches.length };
}

export function Default() {
  const fixture = useChaosFixture(members, rows =>
    chaosRows(rows).map((row, index) => ({ ...row, name: chaosName(index) })),
  );
  const [query, setQuery] = React.useState('');
  const [sort, setSort] = React.useState<ServerDataTableSort<Column> | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  const { data, totalCount } = queryMembers({ rows: fixture, query, sort, page, pageSize });

  const { table, sortHeader, pagination } = useServerDataTable({
    data,
    totalCount,
    getRowId: row => row.id,
    sortableColumns: ['name', 'role'],
    sort,
    onSortChange: setSort,
    page,
    pageSize,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    searchValue: query,
    onSearchChange: next => {
      setQuery(next);
      setPage(1);
    },
  });

  return (
    <div>
      <Table.Toolbar>
        <Table.Search
          label='Search members'
          clearLabel='Clear search'
          value={table.globalFilter}
          onValueChange={table.setGlobalFilter}
        />
      </Table.Toolbar>
      <Table.Root aria-label='Members'>
        <Table.Header>
          <Table.Row>
            <Table.SelectAllCell
              aria-label='Select all members'
              checked={table.getIsAllRowsSelected()}
              indeterminate={table.getIsSomeRowsSelected()}
              onChange={() => table.toggleAllRowsSelected()}
            />
            <Table.HeaderCell {...sortHeader('name')}>Name</Table.HeaderCell>
            <Table.HeaderCell {...sortHeader('role')}>Role</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {table.rows.length === 0 ? (
            <Table.Empty colSpan={3}>No members match “{query}”.</Table.Empty>
          ) : (
            table.rows.map(row => (
              <Table.Row
                key={row.id}
                selected={row.getIsSelected()}
              >
                <Table.SelectCell
                  aria-label={`Select ${row.original.name}`}
                  checked={row.getIsSelected()}
                  onToggleSelected={row.toggleSelected}
                />
                <Table.Cell>{row.original.name}</Table.Cell>
                <Table.Cell>{row.original.role}</Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>
      {pagination ? (
        <Pagination
          {...pagination}
          pageSizeOptions={[5, 10, 20]}
        />
      ) : null}
    </div>
  );
}
