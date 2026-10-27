import { Badge } from '@clerk/mosaic/components/badge';
import { Button } from '@clerk/mosaic/components/button';
import { Card } from '@clerk/mosaic/components/card';
import { DataList } from '@clerk/mosaic/components/data-list';
import { Dialog } from '@clerk/mosaic/components/dialog';
import { EmptyState } from '@clerk/mosaic/components/empty-state';
import { Icon } from '@clerk/mosaic/components/icon';
import { Menu } from '@clerk/mosaic/components/menu';
import type { TableSort } from '@clerk/mosaic/components/table';
import { Table } from '@clerk/mosaic/components/table';
import { VisuallyHidden } from '@clerk/mosaic/components/visually-hidden';
import { MagnifyingGlass } from '@clerk/mosaic/icons/glyphs/magnifying-glass';
import { Plus } from '@clerk/mosaic/icons/glyphs/plus';
import * as React from 'react';

import type { StoryMeta } from '@/lib/types';

// Exposes this file's own source (via the `?raw` webpack rule) so each `<Story>` example
// renders a code footer with its function's source. See `StoryModule.__source`.
export { default as __source } from './table.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'Table',
  status: 'stable',
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

const isSortableColumn = (column: string): column is keyof typeof sortKeys => column in sortKeys;

function compare(a: string | number, b: string | number) {
  return typeof a === 'string' || typeof b === 'string' ? String(a).localeCompare(String(b)) : a - b;
}

function sortRows(rows: ApiKey[], sort: TableSort | null) {
  if (!sort || !isSortableColumn(sort.column)) {
    return rows;
  }
  const key = sortKeys[sort.column];
  const sorted = [...rows].sort((a, b) => compare(key(a), key(b)));
  return sort.direction === 'descending' ? sorted.reverse() : sorted;
}

const keyValue = (key: ApiKey) => key.id;

export function Default() {
  const [sort, setSort] = React.useState<TableSort | null>(null);

  return (
    <Table.Root
      aria-label='API keys'
      selectionMode='multiple'
      sort={sort}
      onSortChange={setSort}
    >
      <Table.Header>
        <Table.SelectionColumn aria-label='Select all keys' />
        <Table.Column
          value='name'
          sortable
          rowHeader
        >
          Name
        </Table.Column>
        <Table.Column
          value='lastUsed'
          sortable
        >
          Last used
        </Table.Column>
        <Table.Column
          value='created'
          sortable
        >
          Created
        </Table.Column>
        <Table.Column align='end'>
          <VisuallyHidden>Actions</VisuallyHidden>
        </Table.Column>
      </Table.Header>
      <Table.Body
        items={sortRows(apiKeys, sort)}
        itemToStringValue={keyValue}
      >
        {key => (
          <Table.Row>
            <Table.SelectionCell aria-label='Select' />
            <Table.Cell>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {key.name}
                <Badge color={key.environment === 'Production' ? 'positive' : 'neutral'}>{key.environment}</Badge>
              </span>
            </Table.Cell>
            <Table.Cell>{key.lastUsed}</Table.Cell>
            <Table.Cell>{key.created}</Table.Cell>
            <Table.Cell align='end'>
              <Menu.Root placement='bottom-end'>
                <Menu.Trigger aria-label={`Manage ${key.name}`} />
                <Menu.Popup>
                  <Menu.Item label='Revoke'>
                    <Menu.Label>Revoke</Menu.Label>
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Root>
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table.Root>
  );
}

export function Search() {
  const [search, setSearch] = React.useState('');
  const filtered = apiKeys.filter(key => key.name.toLowerCase().includes(search.trim().toLowerCase()));
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Table.Toolbar>
        <Table.Search
          label='Search API keys'
          clearLabel='Clear search'
          value={search}
          onValueChange={setSearch}
        />
        <Button>Create API key</Button>
      </Table.Toolbar>
      <Table.Root aria-label='API keys'>
        <Table.Header>
          <Table.Column>Name</Table.Column>
          <Table.Column>Created</Table.Column>
        </Table.Header>
        <Table.Body
          items={filtered}
          itemToStringValue={keyValue}
          renderEmptyState={() => (
            <EmptyState.Root role='status'>
              <EmptyState.Label>No API keys found</EmptyState.Label>
            </EmptyState.Root>
          )}
        >
          {key => (
            <Table.Row>
              <Table.Cell>{key.name}</Table.Cell>
              <Table.Cell noWrap>{key.created}</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </div>
  );
}

export function Sorting() {
  const [sort, setSort] = React.useState<TableSort | null>(null);

  return (
    <Table.Root
      aria-label='API keys'
      sort={sort}
      onSortChange={setSort}
    >
      <Table.Header>
        <Table.Column
          value='name'
          sortable
        >
          Name
        </Table.Column>
        <Table.Column
          value='created'
          sortable
        >
          Created
        </Table.Column>
        <Table.Column>Environment</Table.Column>
      </Table.Header>
      <Table.Body
        items={sortRows(apiKeys, sort)}
        itemToStringValue={keyValue}
      >
        {key => (
          <Table.Row>
            <Table.Cell>{key.name}</Table.Cell>
            <Table.Cell>{key.created}</Table.Cell>
            <Table.Cell>{key.environment}</Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table.Root>
  );
}

export function Selection() {
  return (
    <Table.Root
      aria-label='API keys'
      selectionMode='multiple'
    >
      <Table.Header>
        <Table.SelectionColumn aria-label='Select all keys' />
        <Table.Column rowHeader>Name</Table.Column>
        <Table.Column>Last used</Table.Column>
      </Table.Header>
      <Table.Body
        items={apiKeys}
        itemToStringValue={keyValue}
      >
        {key => (
          <Table.Row disabled={key.id === 'k4'}>
            <Table.SelectionCell aria-label='Select' />
            <Table.Cell>{key.name}</Table.Cell>
            <Table.Cell>{key.lastUsed}</Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table.Root>
  );
}

export function Empty() {
  return (
    <Table.Root aria-label='API keys'>
      <Table.Header>
        <Table.Column>Name</Table.Column>
        <Table.Column>Last used</Table.Column>
        <Table.Column>Created</Table.Column>
      </Table.Header>
      <Table.Body
        items={[]}
        itemToStringValue={keyValue}
        renderEmptyState={() => (
          <EmptyState.Root>
            <EmptyState.Icon glyph={MagnifyingGlass} />
            <EmptyState.Label>No API keys</EmptyState.Label>
            <EmptyState.Description>
              Create a key to start making requests from your application.
            </EmptyState.Description>
            <EmptyState.Actions>
              <Button size='sm'>
                <Icon
                  glyph={Plus}
                  placement='inline-start'
                />
                Create key
              </Button>
            </EmptyState.Actions>
          </EmptyState.Root>
        )}
      >
        {key => (
          <Table.Row>
            <Table.Cell>{key.name}</Table.Cell>
            <Table.Cell>{key.lastUsed}</Table.Cell>
            <Table.Cell>{key.created}</Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table.Root>
  );
}

type Endpoint = { path: string; requests: string; children?: Endpoint[] };

const endpoints: Endpoint[] = [
  {
    path: '/v1/users',
    requests: '18,204',
    children: [
      { path: '/v1/users/{id}', requests: '12,880' },
      { path: '/v1/users/{id}/sessions', requests: '3,410' },
    ],
  },
  {
    path: '/v1/organizations',
    requests: '4,129',
    children: [{ path: '/v1/organizations/{id}/members', requests: '2,006' }],
  },
  { path: '/v1/jwks', requests: '913' },
];

export function TreeRows() {
  return (
    <Table.Root
      aria-label='Endpoints'
      defaultExpanded={['/v1/users']}
    >
      <Table.Header>
        <Table.Column rowHeader>Endpoint</Table.Column>
        <Table.Column align='end'>Requests</Table.Column>
      </Table.Header>
      <Table.Body
        items={endpoints}
        itemToStringValue={endpoint => endpoint.path}
        itemToChildren={endpoint => endpoint.children}
      >
        {endpoint => (
          <Table.Row>
            <Table.Cell>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  paddingInlineStart: 'calc(var(--table-row-depth) * 1.5rem)',
                }}
              >
                <Table.ExpandButton aria-label='Expand' />
                {endpoint.path}
              </span>
            </Table.Cell>
            <Table.Cell align='end'>{endpoint.requests}</Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table.Root>
  );
}

export function Overflow() {
  const columns = ['Name', 'Environment', 'Last used', 'Created', 'Expires', 'Created by', 'Scopes', 'Requests'];

  return (
    <div style={{ maxWidth: 480 }}>
      <Table.Root aria-label='API keys'>
        <Table.Header>
          {columns.map(column => (
            <Table.Column key={column}>{column}</Table.Column>
          ))}
        </Table.Header>
        <Table.Body
          items={apiKeys}
          itemToStringValue={keyValue}
        >
          {key => (
            <Table.Row>
              <Table.Cell>{key.name}</Table.Cell>
              <Table.Cell>{key.environment}</Table.Cell>
              <Table.Cell>{key.lastUsed}</Table.Cell>
              <Table.Cell>{key.created}</Table.Cell>
              <Table.Cell>Never</Table.Cell>
              <Table.Cell>cameron@clerk.com</Table.Cell>
              <Table.Cell>read, write</Table.Cell>
              <Table.Cell align='end'>12,408</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </div>
  );
}

export function StickyColumn() {
  const columns = ['Environment', 'Last used', 'Created', 'Expires', 'Created by', 'Scopes'];

  return (
    <div style={{ maxWidth: 480 }}>
      <Table.Root
        aria-label='API keys'
        selectionMode='multiple'
        defaultSelection={['k2']}
      >
        <Table.Header>
          <Table.Column>Name</Table.Column>
          {columns.map(column => (
            <Table.Column key={column}>{column}</Table.Column>
          ))}
          <Table.Column sticky='end'>
            <VisuallyHidden>Actions</VisuallyHidden>
          </Table.Column>
        </Table.Header>
        <Table.Body
          items={apiKeys}
          itemToStringValue={keyValue}
        >
          {key => (
            <Table.Row>
              <Table.Cell noWrap>{key.name}</Table.Cell>
              <Table.Cell>{key.environment}</Table.Cell>
              <Table.Cell noWrap>{key.lastUsed}</Table.Cell>
              <Table.Cell noWrap>{key.created}</Table.Cell>
              <Table.Cell>Never</Table.Cell>
              <Table.Cell>cameron@clerk.com</Table.Cell>
              <Table.Cell noWrap>read, write</Table.Cell>
              <Table.Cell
                sticky='end'
                align='end'
              >
                <Menu.Root placement='bottom-end'>
                  <Menu.Trigger aria-label={`Manage ${key.name}`} />
                  <Menu.Popup>
                    <Menu.Item label='Revoke'>
                      <Menu.Label>Revoke</Menu.Label>
                    </Menu.Item>
                  </Menu.Popup>
                </Menu.Root>
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </div>
  );
}

export function ColumnWidths() {
  return (
    <Table.Root
      aria-label='API keys'
      layout='fixed'
      minWidth='36rem'
      selectionMode='multiple'
    >
      <Table.Header>
        <Table.SelectionColumn aria-label='Select all keys' />
        <Table.Column rowHeader>Name</Table.Column>
        <Table.Column width='9rem'>Last used</Table.Column>
        <Table.Column width='9rem'>Created</Table.Column>
        <Table.Column
          align='end'
          width='4rem'
        >
          <VisuallyHidden>Actions</VisuallyHidden>
        </Table.Column>
      </Table.Header>
      <Table.Body
        items={apiKeys}
        itemToStringValue={keyValue}
      >
        {key => (
          <Table.Row>
            <Table.SelectionCell aria-label='Select' />
            <Table.Cell>{key.name}</Table.Cell>
            <Table.Cell noWrap>{key.lastUsed}</Table.Cell>
            <Table.Cell noWrap>{key.created}</Table.Cell>
            <Table.Cell align='end'>
              <Menu.Root placement='bottom-end'>
                <Menu.Trigger aria-label={`Manage ${key.name}`} />
                <Menu.Popup>
                  <Menu.Item label='Revoke'>
                    <Menu.Label>Revoke</Menu.Label>
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Root>
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table.Root>
  );
}

const keyDetails = Dialog.createHandle<ApiKey>();

export function ClickableRows() {
  return (
    <>
      <Table.Root aria-label='API keys'>
        <Table.Header>
          <Table.Column>Name</Table.Column>
          <Table.Column>Environment</Table.Column>
          <Table.Column>Last used</Table.Column>
          <Table.Column align='end'>
            <VisuallyHidden>Actions</VisuallyHidden>
          </Table.Column>
        </Table.Header>
        <Table.Body
          items={apiKeys}
          itemToStringValue={keyValue}
        >
          {key => <ClickableKeyRow apiKey={key} />}
        </Table.Body>
      </Table.Root>
      <Dialog.Root handle={keyDetails}>
        {({ payload }) =>
          payload === undefined ? null : (
            <Dialog.Popup
              variant='card'
              compactPlacement='center'
            >
              <Card.Root
                elevation='overlay'
                renderBranding={false}
              >
                <Card.Header>
                  <Card.Title>{payload.name}</Card.Title>
                  <Card.Description>API key</Card.Description>
                </Card.Header>
                <Card.Content>
                  <DataList.Root>
                    <DataList.Item>
                      <DataList.Label>Environment</DataList.Label>
                      <DataList.Value>{payload.environment}</DataList.Value>
                    </DataList.Item>
                    <DataList.Item>
                      <DataList.Label>Last used</DataList.Label>
                      <DataList.Value>{payload.lastUsed}</DataList.Value>
                    </DataList.Item>
                    <DataList.Item>
                      <DataList.Label>Created</DataList.Label>
                      <DataList.Value>{payload.created}</DataList.Value>
                    </DataList.Item>
                  </DataList.Root>
                </Card.Content>
                <Card.Footer>
                  <Dialog.Close
                    render={
                      <Button
                        color='neutral'
                        fullWidth
                        variant='outline'
                      />
                    }
                  >
                    Close
                  </Dialog.Close>
                </Card.Footer>
              </Card.Root>
            </Dialog.Popup>
          )
        }
      </Dialog.Root>
    </>
  );
}

function ClickableKeyRow({ apiKey }: { apiKey: ApiKey }) {
  const trigger = React.useRef<HTMLButtonElement>(null);
  return (
    <Table.Row onClick={() => trigger.current?.click()}>
      <Table.Cell>
        <Dialog.Trigger
          ref={trigger}
          handle={keyDetails}
          payload={apiKey}
          render={<Button variant='link' />}
        >
          {apiKey.name}
        </Dialog.Trigger>
      </Table.Cell>
      <Table.Cell>
        <Badge color={apiKey.environment === 'Production' ? 'positive' : 'neutral'}>{apiKey.environment}</Badge>
      </Table.Cell>
      <Table.Cell>{apiKey.lastUsed}</Table.Cell>
      <Table.Cell align='end'>
        <Menu.Root placement='bottom-end'>
          <Menu.Trigger aria-label={`Manage ${apiKey.name}`} />
          <Menu.Popup>
            <Menu.Item label='Revoke'>
              <Menu.Label>Revoke</Menu.Label>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Root>
      </Table.Cell>
    </Table.Row>
  );
}
