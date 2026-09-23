import { ActionBar } from '@clerk/mosaic/components/action-bar';
import { Button } from '@clerk/mosaic/components/button';
import { Dialog } from '@clerk/mosaic/components/dialog';
import { Icon } from '@clerk/mosaic/components/icon';
import { Menu } from '@clerk/mosaic/components/menu';
import { Profile } from '@clerk/mosaic/components/profile';
import { Table } from '@clerk/mosaic/components/table';
import { useDataTable } from '@clerk/mosaic/primitives/hooks';
import type { ComponentProps } from 'react';
import { useId, useRef } from 'react';

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
  { id: 'gavin', name: 'Gavin Belson', role: 'Admin' },
  { id: 'laurie', name: 'Laurie Bream', role: 'Member' },
  { id: 'erlich', name: 'Erlich Bachman', role: 'Member' },
  { id: 'big-head', name: 'Nelson Bighetti', role: 'Member' },
  { id: 'carla', name: 'Carla Walton', role: 'Member' },
  { id: 'russ', name: 'Russ Hanneman', role: 'Admin' },
  { id: 'peter', name: 'Peter Gregory', role: 'Member' },
  { id: 'ron', name: 'Ron LaFlamme', role: 'Member' },
];

function MembersTable({ rows = 10 }: { rows?: number }) {
  const tableId = useId();
  const selectAllRef = useRef<HTMLInputElement>(null);
  const table = useDataTable({ data: members.slice(0, rows), getRowId: row => row.id });
  const count = Object.values(table.rowSelection).filter(Boolean).length;
  const clearSelection = () => table.setRowSelection({});

  return (
    <ActionBar.Anchor>
      <Table.Root id={tableId}>
        <Table.Header>
          <Table.Row>
            <Table.SelectAllCell
              ref={selectAllRef}
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
        returnFocus={selectAllRef}
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
  );
}

/** Select rows and scroll: the bar stays pinned until the table's bottom edge comes into view. */
export function Default() {
  return (
    <div style={{ height: 420, width: '100%', overflowY: 'auto', padding: 16 }}>
      <MembersTable />
      <p style={{ marginBlock: 32 }}>1–10 of 10</p>
    </div>
  );
}

function MembersProfile(props: Partial<ComponentProps<typeof Profile.Root>>) {
  return (
    <Profile.Root
      value='members'
      {...props}
    >
      <Profile.Title>Workspace</Profile.Title>
      <Profile.Nav>
        <Profile.NavItem
          value='members'
          icon={
            <Icon
              name='users'
              size='sm'
            />
          }
        >
          Members
        </Profile.NavItem>
      </Profile.Nav>
      <Profile.Content>
        <Profile.ContentPanel value='members'>
          <div style={{ display: 'grid', gap: 24 }}>
            <Profile.PageTitle>Members</Profile.PageTitle>
            <MembersTable rows={members.length} />
            <p>1–18 of 18</p>
          </div>
        </Profile.ContentPanel>
      </Profile.Content>
    </Profile.Root>
  );
}

/** In a profile dialog the bar pins to the foot of the content column. */
export function InDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button />}>Manage workspace</Dialog.Trigger>
      <Dialog.Popup variant='profile'>
        <MembersProfile />
      </Dialog.Popup>
    </Dialog.Root>
  );
}

/** Inline, the page scrolls, so the bar pins to the foot of the viewport. */
export function Inline() {
  return <MembersProfile elevation='flush' />;
}
