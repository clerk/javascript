import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';
import React from 'react';

import { Avatar } from '../../components/avatar';
import { Button } from '../../components/button';
import { EmptyState } from '../../components/empty-state';
import type { TableSort } from '../../components/table';
import { Table } from '../../components/table';
import { VisuallyHidden } from '../../components/visually-hidden';
import type { OnChangeFn, SortingState } from '../../primitives/hooks';
import { useDataTable } from '../../primitives/hooks';
import type { OrganizationProfileBulkOverlay } from './organization-profile-bulk-actions.view';
import { OrganizationProfileBulkActions } from './organization-profile-bulk-actions.view';
import {
  hasMembersPager,
  MEMBERS_PAGE_SIZE,
  OrganizationProfileMembersPager,
} from './organization-profile-members-pager.view';
import { styles } from './organization-profile-members-panel.styles';
import type { OrganizationRequest, OrganizationRole } from './organization-profile-members-panel.types';
import { OrganizationProfileRoleControl } from './organization-profile-role-control.view';

const sortKeys = {
  name: (request: OrganizationRequest) => request.name,
  role: (request: OrganizationRequest) => request.role,
  requested: (request: OrganizationRequest) => request.requestedAt,
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

function sortRequests(requests: OrganizationRequest[], sorting: SortingState) {
  const current = sorting[0];
  if (!current || !isSortableColumn(current.id)) {
    return requests;
  }
  const key = sortKeys[current.id];
  const sorted = [...requests].sort((a, b) => compare(key(a), key(b)));
  return current.desc ? sorted.reverse() : sorted;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() ?? '')
    .join('');
}

export interface OrganizationProfileRequestsTabViewProps {
  requests: OrganizationRequest[];
  roles: OrganizationRole[];
  /** The active search, applied to the requester name and email. */
  search: string;
  /** The active role filter, or `null` for all roles. */
  roleFilter: string | null;
  /** Where and how the floating bulk bar is pinned. */
  overlay: OrganizationProfileBulkOverlay | null;
  /** Change the role the selected requests would be accepted with. Omitted hides the bulk affordance. */
  onChangeRole?: (requestIds: string[], role: string) => void;
  /** Accept a single request. Omitted hides the affordance. */
  onAccept?: (requestId: string) => void;
  /** Decline one or more requests. Omitted hides the affordances that call it. */
  onDecline?: (requestIds: string[]) => void;
  onClearFilters?: () => void;
}

export function OrganizationProfileRequestsTabView({
  requests,
  roles,
  search,
  roleFilter,
  overlay,
  onChangeRole,
  onAccept,
  onDecline,
  onClearFilters,
}: OrganizationProfileRequestsTabViewProps): ReactElement {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: MEMBERS_PAGE_SIZE });

  const query = search.trim().toLowerCase();
  const filtered = React.useMemo(
    () =>
      requests.filter(
        request =>
          (query === '' || request.name.toLowerCase().includes(query) || request.email.toLowerCase().includes(query)) &&
          (roleFilter === null || request.role === roleFilter),
      ),
    [requests, query, roleFilter],
  );
  const sorted = React.useMemo(() => sortRequests(filtered, sorting), [filtered, sorting]);

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
  const selectedIds = Object.entries(table.rowSelection)
    .filter(([, selected]) => selected)
    .map(([id]) => id);
  const selectedCount = selectedIds.length;
  const clearSelection = () => table.setRowSelection({});

  const isFiltered = query !== '' || roleFilter !== null;

  return (
    <>
      <Table.Root fade={false}>
        <Table.Header>
          <Table.Row>
            <Table.SelectAllCell
              aria-label='Select all requests on this page'
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
              sort={sortFor(table.sorting, 'requested')}
              onSort={() => cycleSort(table.setSorting, 'requested')}
            >
              Requested
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
                  <EmptyState.Icon name='users' />
                  <EmptyState.Label>{isFiltered ? 'No requests found' : 'No pending requests'}</EmptyState.Label>
                  <EmptyState.Description>
                    {isFiltered
                      ? 'No pending requests match your search.'
                      : 'Requests to join this organization will show up here.'}
                  </EmptyState.Description>
                  {isFiltered && onClearFilters ? (
                    <EmptyState.Actions>
                      <Button
                        variant='outline'
                        color='neutral'
                        onClick={onClearFilters}
                      >
                        Clear filters
                      </Button>
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
                  aria-label={`Select request from ${row.original.name}`}
                  checked={row.getIsSelected()}
                  onToggleSelected={row.toggleSelected}
                />
                <Table.Cell xstyle={styles.nameColumn}>
                  <div {...stylex.props(styles.member)}>
                    <Avatar.Root
                      size='sm'
                      aria-hidden
                    >
                      {row.original.imageUrl ? (
                        <Avatar.Image
                          src={row.original.imageUrl}
                          alt=''
                        />
                      ) : null}
                      <Avatar.Fallback>{initials(row.original.name)}</Avatar.Fallback>
                    </Avatar.Root>
                    <div {...stylex.props(styles.memberText)}>
                      <span {...stylex.props(styles.name)}>{row.original.name}</span>
                      <span {...stylex.props(styles.email)}>{row.original.email}</span>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <OrganizationProfileRoleControl
                    value={row.original.role}
                    roles={roles}
                    onChangeRole={onChangeRole ? role => onChangeRole([row.original.id], role) : undefined}
                  />
                </Table.Cell>
                <Table.Cell>{row.original.requestedLabel}</Table.Cell>
                <Table.Cell align='end'>
                  {onAccept || onDecline ? (
                    <div {...stylex.props(styles.actions)}>
                      {onDecline ? (
                        <Button
                          variant='outline'
                          color='neutral'
                          size='sm'
                          onClick={() => onDecline([row.original.id])}
                        >
                          Decline
                        </Button>
                      ) : null}
                      {onAccept ? (
                        <Button
                          size='sm'
                          onClick={() => onAccept(row.original.id)}
                        >
                          Accept
                        </Button>
                      ) : null}
                    </div>
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

      {selectedCount > 0 ? <div {...stylex.props(styles.bulkSpacer)} /> : null}

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
          onDecline
            ? () => {
                onDecline(selectedIds);
                clearSelection();
              }
            : undefined
        }
        removeLabel='Remove selected requests'
        onDismiss={clearSelection}
        aria-label='Request bulk actions'
      />
    </>
  );
}
