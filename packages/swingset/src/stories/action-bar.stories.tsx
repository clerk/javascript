import { ActionBar } from '@clerk/mosaic/components/action-bar';
import { Button } from '@clerk/mosaic/components/button';
import { Icon } from '@clerk/mosaic/components/icon';
import { Menu } from '@clerk/mosaic/components/menu';
import { Table } from '@clerk/mosaic/components/table';
import { useDataTable } from '@clerk/mosaic/primitives/hooks';
import { useId } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './action-bar.stories?raw';

export const meta: StoryMeta = {
  group: 'Components',
  title: 'ActionBar',
  status: 'wip',
  layout: 'wide',
  source: 'packages/mosaic/src/components/action-bar/action-bar.tsx',
};

const members = [
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
];

/**
 * The bar rests on the table's bottom edge. The example sits in a short scroll container, as a
 * `Profile` content column does in a dialog: select a few rows and scroll up, and the bar stays
 * pinned to the foot of the container until the table's edge comes back into view.
 */
export function Default() {
  const tableId = useId();
  const table = useDataTable({ data: members, getRowId: row => row.id });
  const count = Object.values(table.rowSelection).filter(Boolean).length;
  const clearSelection = () => table.setRowSelection({});

  return (
    <div style={{ height: 420, width: '100%', overflowY: 'auto', padding: 16 }}>
      <ActionBar.Anchor>
        <Table.Root id={tableId}>
          <Table.Header>
            <Table.Row>
              <Table.SelectAllCell
                aria-label='Select all members'
                checked={table.getIsAllRowsSelected()}
                indeterminate={table.getIsSomeRowsSelected()}
                onChange={() => table.toggleAllRowsSelected()}
              />
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Role</Table.HeaderCell>
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
                <Table.Cell>{row.original.role}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
        <ActionBar.Root
          open={count > 0}
          aria-label='Bulk actions'
          aria-controls={tableId}
        >
          <ActionBar.Count>{count} selected</ActionBar.Count>
          <ActionBar.Separator />
          <Menu.Root placement='top'>
            <Menu.Trigger
              render={
                <Button
                  variant='ghost'
                  size='md'
                />
              }
            >
              Change role
              <Icon
                name='chevron-down'
                placement='inline-end'
              />
            </Menu.Trigger>
            <Menu.Popup>
              <Menu.Item
                label='Admin'
                onClick={clearSelection}
              >
                <Menu.Label>Admin</Menu.Label>
              </Menu.Item>
              <Menu.Item
                label='Member'
                onClick={clearSelection}
              >
                <Menu.Label>Member</Menu.Label>
              </Menu.Item>
            </Menu.Popup>
          </Menu.Root>
          <ActionBar.Separator />
          <Button
            color='negative'
            variant='ghost'
            shape='square'
            size='md'
            aria-label='Remove selected'
            onClick={clearSelection}
          >
            <Icon name='trash' />
          </Button>
          <ActionBar.Separator />
          <ActionBar.Dismiss onClick={clearSelection} />
        </ActionBar.Root>
      </ActionBar.Anchor>
      <p style={{ marginBlock: 32 }}>1–10 of 10</p>
    </div>
  );
}
