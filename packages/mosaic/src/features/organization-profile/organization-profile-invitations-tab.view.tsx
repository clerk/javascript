import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';
import React from 'react';

import { Avatar } from '../../components/avatar';
import { Button } from '../../components/button';
import { EmptyState } from '../../components/empty-state';
import { Icon } from '../../components/icon';
import { Menu } from '../../components/menu';
import type { TableSort } from '../../components/table';
import { Table } from '../../components/table';
import { VisuallyHidden } from '../../components/visually-hidden';
import type { OnChangeFn, SortingState } from '../../primitives/hooks';
import { useDataTable } from '../../primitives/hooks';
import { colorVars } from '../../tokens.stylex';
import type { OrganizationProfileBulkOverlay } from './organization-profile-bulk-actions.view';
import { OrganizationProfileBulkActions } from './organization-profile-bulk-actions.view';
import {
  hasMembersPager,
  MEMBERS_PAGE_SIZE,
  OrganizationProfileMembersPager,
} from './organization-profile-members-pager.view';
import { styles } from './organization-profile-members-panel.styles';
import type { OrganizationInvitation, OrganizationRole } from './organization-profile-members-panel.types';
import { OrganizationProfileRoleControl } from './organization-profile-role-control.view';

const sortKeys = {
  name: (invitation: OrganizationInvitation) => invitation.email,
  role: (invitation: OrganizationInvitation) => invitation.role,
  invited: (invitation: OrganizationInvitation) => invitation.invitedAt,
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

function sortInvitations(invitations: OrganizationInvitation[], sorting: SortingState) {
  const current = sorting[0];
  if (!current || !isSortableColumn(current.id)) {
    return invitations;
  }
  const key = sortKeys[current.id];
  const sorted = [...invitations].sort((a, b) => compare(key(a), key(b)));
  return current.desc ? sorted.reverse() : sorted;
}

export interface OrganizationProfileInvitationsTabViewProps {
  invitations: OrganizationInvitation[];
  roles: OrganizationRole[];
  /** The active search, applied to the invitee email. */
  search: string;
  /** The active role filter, or `null` for all roles. */
  roleFilter: string | null;
  /** Where and how the floating bulk bar is pinned. */
  overlay: OrganizationProfileBulkOverlay | null;
  /** Change the role of the selected invitations. Omitted hides the bulk affordance. */
  onChangeRole?: (invitationIds: string[], role: string) => void;
  /** Revoke one or more invitations. Omitted hides the affordances that call it. */
  onRevoke?: (invitationIds: string[]) => void;
  /** Opens the invite flow, from the empty state. Inert while absent. */
  onInvite?: () => void;
  onClearFilters?: () => void;
}

export function OrganizationProfileInvitationsTabView({
  invitations,
  roles,
  search,
  roleFilter,
  overlay,
  onChangeRole,
  onRevoke,
  onInvite,
  onClearFilters,
}: OrganizationProfileInvitationsTabViewProps): ReactElement {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: MEMBERS_PAGE_SIZE });

  const query = search.trim().toLowerCase();
  const filtered = React.useMemo(
    () =>
      invitations.filter(
        invitation =>
          (query === '' || invitation.email.toLowerCase().includes(query)) &&
          (roleFilter === null || invitation.role === roleFilter),
      ),
    [invitations, query, roleFilter],
  );
  const sorted = React.useMemo(() => sortInvitations(filtered, sorting), [filtered, sorting]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pagination.pageSize));
  const pageIndex = Math.min(pagination.pageIndex, pageCount - 1);
  const pageStart = pageIndex * pagination.pageSize;
  const pageRows = sorted.slice(pageStart, pageStart + pagination.pageSize);

  const table = useDataTable({
    data: pageRows,
    getRowId: row => row.id,
    totalCount: filtered.length,
    sorting,
    onSortingChange: setSorting,
  });

  const allSelected = table.rows.length > 0 && table.rows.every(row => row.getIsSelected());
  const someSelected = table.rows.some(row => row.getIsSelected());
  const toggleAll = () => {
    const next = { ...table.rowSelection };
    for (const row of table.rows) {
      next[row.id] = !allSelected;
    }
    table.setRowSelection(next);
  };
  // Selection survives paging, but not filtering: a row the current filters hide is not something
  // a bulk action should reach.
  const visibleIds = React.useMemo(() => new Set(filtered.map(invitation => invitation.id)), [filtered]);
  const selectedIds = Object.entries(table.rowSelection)
    .filter(([id, selected]) => selected && visibleIds.has(id))
    .map(([id]) => id);
  const selectedCount = selectedIds.length;
  const clearSelection = () => table.setRowSelection({});

  const isFiltered = query !== '' || roleFilter !== null;

  return (
    <>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.SelectAllCell
              aria-label='Select all invitations on this page'
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onChange={toggleAll}
            />
            <Table.HeaderCell
              sort={sortFor(table.sorting, 'name')}
              onSort={() => cycleSort(table.setSorting, 'name')}
              xstyle={styles.nameColumn}
            >
              Name
            </Table.HeaderCell>
            <Table.HeaderCell
              sort={sortFor(table.sorting, 'role')}
              onSort={() => cycleSort(table.setSorting, 'role')}
            >
              Role
            </Table.HeaderCell>
            <Table.HeaderCell
              sort={sortFor(table.sorting, 'invited')}
              onSort={() => cycleSort(table.setSorting, 'invited')}
            >
              Invited
            </Table.HeaderCell>
            <Table.HeaderCell align='end'>
              <VisuallyHidden>Actions</VisuallyHidden>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {table.rows.length === 0 ? (
            <Table.Empty>
              <div {...stylex.props(styles.empty)}>
                <EmptyState.Root>
                  <EmptyState.Icon name='envelope' />
                  <EmptyState.Label>{isFiltered ? 'No invitations found' : 'No pending invitations'}</EmptyState.Label>
                  <EmptyState.Description>
                    {isFiltered
                      ? 'No pending invitations match your search.'
                      : 'Invite teammates by email and they’ll show up here until they accept.'}
                  </EmptyState.Description>
                  {(isFiltered && onClearFilters) || (!isFiltered && onInvite) ? (
                    <EmptyState.Actions>
                      {isFiltered ? (
                        <Button
                          variant='outline'
                          color='neutral'
                          onClick={onClearFilters}
                        >
                          Clear filters
                        </Button>
                      ) : (
                        <Button onClick={onInvite}>Invite member</Button>
                      )}
                    </EmptyState.Actions>
                  ) : null}
                </EmptyState.Root>
              </div>
            </Table.Empty>
          ) : (
            table.rows.map(row => (
              <Table.Row
                key={row.id}
                selected={row.getIsSelected()}
              >
                <Table.SelectCell
                  aria-label={`Select invitation for ${row.original.email}`}
                  checked={row.getIsSelected()}
                  onToggleSelected={row.toggleSelected}
                />
                <Table.Cell xstyle={styles.nameColumn}>
                  <div {...stylex.props(styles.member)}>
                    <Avatar.Root
                      size='sm'
                      bordered={Boolean(row.original.imageUrl)}
                      aria-hidden
                      xstyle={row.original.imageUrl ? undefined : styles.invitationAvatar}
                    >
                      {row.original.imageUrl ? (
                        <>
                          <Avatar.Image
                            src={row.original.imageUrl}
                            alt=''
                          />
                          <Avatar.Fallback />
                        </>
                      ) : (
                        <>
                          <svg
                            viewBox='0 0 32 32'
                            fill='none'
                            aria-hidden
                            {...stylex.props(styles.invitationAvatarRing)}
                          >
                            <circle
                              cx='16'
                              cy='16'
                              r='14.5'
                              stroke={colorVars['--cl-color-border']}
                              strokeWidth='1.5'
                              strokeDasharray='4 4'
                              strokeLinecap='round'
                            />
                          </svg>
                          <Icon
                            name='user-2'
                            size='sm'
                          />
                        </>
                      )}
                    </Avatar.Root>
                    <span {...stylex.props(styles.email)}>{row.original.email}</span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <OrganizationProfileRoleControl
                    value={row.original.role}
                    roles={roles}
                    onChangeRole={onChangeRole ? role => onChangeRole([row.original.id], role) : undefined}
                  />
                </Table.Cell>
                <Table.Cell>{row.original.invitedLabel}</Table.Cell>
                <Table.Cell align='end'>
                  {onRevoke ? (
                    <Menu.Root placement='bottom-end'>
                      <Menu.Trigger aria-label={`Manage invitation for ${row.original.email}`} />
                      <Menu.Popup>
                        <Menu.Item
                          label='Revoke invitation'
                          color='negative'
                          onClick={() => onRevoke([row.original.id])}
                        >
                          <Menu.Label>Revoke invitation</Menu.Label>
                        </Menu.Item>
                      </Menu.Popup>
                    </Menu.Root>
                  ) : null}
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>

      {hasMembersPager(filtered.length) ? (
        <OrganizationProfileMembersPager
          page={pageIndex + 1}
          pageSize={pagination.pageSize}
          totalItems={filtered.length}
          onChange={page => setPagination(state => ({ ...state, pageIndex: page - 1 }))}
          onPageSizeChange={pageSize => setPagination({ pageIndex: 0, pageSize })}
        />
      ) : null}

      {selectedCount > 0 && overlay?.mode !== 'viewport' ? <div {...stylex.props(styles.bulkSpacer)} /> : null}

      <OrganizationProfileBulkActions
        count={selectedCount}
        roles={roles}
        overlay={overlay}
        onChangeRole={
          onChangeRole
            ? role => {
                onChangeRole(selectedIds, role);
                clearSelection();
              }
            : undefined
        }
        onRemove={
          onRevoke
            ? () => {
                onRevoke(selectedIds);
                clearSelection();
              }
            : undefined
        }
        removeLabel='Remove selected invitations'
        onDismiss={clearSelection}
        aria-label='Invitation bulk actions'
      />
    </>
  );
}
