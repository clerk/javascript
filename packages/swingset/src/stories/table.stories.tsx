import { Badge } from '@clerk/mosaic/components/badge';
import { Button } from '@clerk/mosaic/components/button';
import { EmptyState } from '@clerk/mosaic/components/empty-state';
import { Icon } from '@clerk/mosaic/components/icon';
import { Menu } from '@clerk/mosaic/components/menu';
import type { TableSort } from '@clerk/mosaic/components/table';
import { Table } from '@clerk/mosaic/components/table';
import { VisuallyHidden } from '@clerk/mosaic/components/visually-hidden';
import type { OnChangeFn, SortingState } from '@clerk/mosaic/primitives/hooks';
import { useDataTable } from '@clerk/mosaic/primitives/hooks';
import * as React from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './table.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Table',
  status: 'wip',
  layout: 'wide',
  source: 'packages/mosaic/src/components/table/table.tsx',
};

type ApiKey = {
  id: string;
  name: string;
  environment: 'Production' | 'Development';
  lastUsed: string;
  lastUsedAt: number;
  created: string;
  createdAt: number;
};

const apiKeys: ApiKey[] = [
  {
    id: 'k1',
    name: 'Web app',
    environment: 'Production',
    lastUsed: '2 minutes ago',
    lastUsedAt: Date.UTC(2026, 4, 1, 9, 58),
    created: 'Jan 4, 2026',
    createdAt: Date.UTC(2026, 0, 4),
  },
  {
    id: 'k2',
    name: 'Mobile app',
    environment: 'Production',
    lastUsed: '1 hour ago',
    lastUsedAt: Date.UTC(2026, 4, 1, 9),
    created: 'Feb 12, 2026',
    createdAt: Date.UTC(2026, 1, 12),
  },
  {
    id: 'k3',
    name: 'CI pipeline',
    environment: 'Development',
    lastUsed: 'Yesterday',
    lastUsedAt: Date.UTC(2026, 3, 30),
    created: 'Mar 3, 2026',
    createdAt: Date.UTC(2026, 2, 3),
  },
  {
    id: 'k4',
    name: 'Local testing',
    environment: 'Development',
    lastUsed: 'Never',
    lastUsedAt: 0,
    created: 'Apr 21, 2026',
    createdAt: Date.UTC(2026, 3, 21),
  },
];

const sortKeys = {
  name: (key: ApiKey) => key.name,
  lastUsed: (key: ApiKey) => key.lastUsedAt,
  created: (key: ApiKey) => key.createdAt,
};

type SortableColumn = keyof typeof sortKeys;

const isSortableColumn = (id: string): id is SortableColumn => id in sortKeys;

function compare(a: string | number, b: string | number) {
  return typeof a === 'string' || typeof b === 'string' ? String(a).localeCompare(String(b)) : a - b;
}

function sortFor(sorting: SortingState, column: SortableColumn): TableSort {
  const current = sorting[0];
  if (!current || current.id !== column) {
    return 'none';
  }
  return current.desc ? 'descending' : 'ascending';
}

function cycleSort(setSorting: OnChangeFn<SortingState>, column: SortableColumn) {
  setSorting(sorting => {
    const current = sorting[0];
    if (!current || current.id !== column) {
      return [{ id: column, desc: false }];
    }
    return current.desc ? [] : [{ id: column, desc: true }];
  });
}

function sortRows(rows: ApiKey[], sorting: SortingState) {
  const current = sorting[0];
  if (!current || !isSortableColumn(current.id)) {
    return rows;
  }
  const key = sortKeys[current.id];
  const sorted = [...rows].sort((a, b) => compare(key(a), key(b)));
  return current.desc ? sorted.reverse() : sorted;
}

function useSortedApiKeys(data: ApiKey[]) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const sorted = React.useMemo(() => sortRows(data, sorting), [data, sorting]);
  return { sorting, setSorting, sorted };
}

export function Default() {
  const { sorting, setSorting, sorted } = useSortedApiKeys(apiKeys);
  const table = useDataTable({
    data: sorted,
    getRowId: row => row.id,
    sorting,
    onSortingChange: setSorting,
  });

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.SelectAllCell
            aria-label='Select all keys'
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={() => table.toggleAllRowsSelected()}
          />
          <Table.HeaderCell
            sort={sortFor(table.sorting, 'name')}
            onSort={() => cycleSort(table.setSorting, 'name')}
          >
            Name
          </Table.HeaderCell>
          <Table.HeaderCell
            sort={sortFor(table.sorting, 'lastUsed')}
            onSort={() => cycleSort(table.setSorting, 'lastUsed')}
          >
            Last used
          </Table.HeaderCell>
          <Table.HeaderCell
            sort={sortFor(table.sorting, 'created')}
            onSort={() => cycleSort(table.setSorting, 'created')}
          >
            Created
          </Table.HeaderCell>
          <Table.HeaderCell align='end'>
            <VisuallyHidden>Actions</VisuallyHidden>
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {table.rows.map(row => (
          <Table.Row
            key={row.id}
            selected={row.getIsSelected()}
          >
            <Table.SelectCell
              aria-label={`Select ${row.original.name}`}
              checked={row.getIsSelected()}
              onToggleSelected={row.toggleSelected}
            />
            <Table.Cell>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {row.original.name}
                <Badge color={row.original.environment === 'Production' ? 'positive' : 'neutral'}>
                  {row.original.environment}
                </Badge>
              </span>
            </Table.Cell>
            <Table.Cell>{row.original.lastUsed}</Table.Cell>
            <Table.Cell>{row.original.created}</Table.Cell>
            <Table.Cell align='end'>
              <Menu.Root placement='bottom-end'>
                <Menu.Trigger aria-label={`Manage ${row.original.name}`} />
                <Menu.Popup>
                  <Menu.Item label='Revoke'>
                    <Menu.Label>Revoke</Menu.Label>
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Root>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

export function Sorting() {
  const { sorting, setSorting, sorted } = useSortedApiKeys(apiKeys);

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell
            sort={sortFor(sorting, 'name')}
            onSort={() => cycleSort(setSorting, 'name')}
          >
            Name
          </Table.HeaderCell>
          <Table.HeaderCell
            sort={sortFor(sorting, 'created')}
            onSort={() => cycleSort(setSorting, 'created')}
          >
            Created
          </Table.HeaderCell>
          <Table.HeaderCell>Environment</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sorted.map(key => (
          <Table.Row key={key.id}>
            <Table.Cell>{key.name}</Table.Cell>
            <Table.Cell>{key.created}</Table.Cell>
            <Table.Cell>{key.environment}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

export function Selection() {
  const table = useDataTable({ data: apiKeys, getRowId: row => row.id });

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.SelectAllCell
            aria-label='Select all keys'
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={() => table.toggleAllRowsSelected()}
          />
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Last used</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {table.rows.map(row => (
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
            <Table.Cell>{row.original.lastUsed}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

export function Empty() {
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Last used</Table.HeaderCell>
          <Table.HeaderCell>Created</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Empty>
          <EmptyState.Root>
            <EmptyState.Icon name='magnifying-glass' />
            <EmptyState.Label>No API keys</EmptyState.Label>
            <EmptyState.Description>
              Create a key to start making requests from your application.
            </EmptyState.Description>
            <EmptyState.Actions>
              <Button size='sm'>
                <Icon
                  name='plus'
                  placement='inline-start'
                />
                Create key
              </Button>
            </EmptyState.Actions>
          </EmptyState.Root>
        </Table.Empty>
      </Table.Body>
    </Table.Root>
  );
}

export function Overflow() {
  const columns = ['Name', 'Environment', 'Last used', 'Created', 'Expires', 'Created by', 'Scopes', 'Requests'];

  return (
    <div style={{ maxWidth: 480 }}>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            {columns.map(column => (
              <Table.HeaderCell key={column}>{column}</Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {apiKeys.map(key => (
            <Table.Row key={key.id}>
              <Table.Cell>{key.name}</Table.Cell>
              <Table.Cell>{key.environment}</Table.Cell>
              <Table.Cell>{key.lastUsed}</Table.Cell>
              <Table.Cell>{key.created}</Table.Cell>
              <Table.Cell>Never</Table.Cell>
              <Table.Cell>cameron@clerk.com</Table.Cell>
              <Table.Cell>read, write</Table.Cell>
              <Table.Cell align='end'>12,408</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
}
