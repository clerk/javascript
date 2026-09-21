import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';
import React from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { Avatar } from '../../components/avatar';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { EmptyState } from '../../components/empty-state';
import { Icon } from '../../components/icon';
import { InputGroup } from '../../components/input-group';
import { Menu } from '../../components/menu';
import { Profile } from '../../components/profile';
import { Select } from '../../components/select';
import type { TableSort } from '../../components/table';
import { Table } from '../../components/table';
import { Tabs } from '../../components/tabs';
import { VisuallyHidden } from '../../components/visually-hidden';
import type { OnChangeFn, SortingState } from '../../primitives/hooks';
import { useDataTable } from '../../primitives/hooks';
import { mergeStyleProps, themeProps } from '../../props';
import type { OrganizationProfileBulkOverlay } from './organization-profile-bulk-actions.view';
import { OrganizationProfileBulkActions } from './organization-profile-bulk-actions.view';
import { OrganizationProfileInvitationsTabView } from './organization-profile-invitations-tab.view';
import {
  hasMembersPager,
  MEMBERS_PAGE_SIZE,
  OrganizationProfileMembersPager,
} from './organization-profile-members-pager.view';
import { styles } from './organization-profile-members-panel.styles';
import type {
  OrganizationMember,
  OrganizationProfileMembersPanelViewProps,
  OrganizationProfileMembersTab,
} from './organization-profile-members-panel.types';
import { OrganizationProfileRequestsTabView } from './organization-profile-requests-tab.view';
import { OrganizationProfileRoleControl } from './organization-profile-role-control.view';

export type {
  OrganizationInvitation,
  OrganizationMember,
  OrganizationProfileMembersPanelViewProps,
  OrganizationRequest,
  OrganizationRole,
} from './organization-profile-members-panel.types';

const ALL_ROLES = 'all';

const sortKeys = {
  name: (member: OrganizationMember) => member.name,
  role: (member: OrganizationMember) => member.role,
  added: (member: OrganizationMember) => member.addedAt,
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

function sortMembers(members: OrganizationMember[], sorting: SortingState) {
  const current = sorting[0];
  if (!current || !isSortableColumn(current.id)) {
    return members;
  }
  const key = sortKeys[current.id];
  const sorted = [...members].sort((a, b) => compare(key(a), key(b)));
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

function MemberCell({ member, isCurrentUser }: { member: OrganizationMember; isCurrentUser: boolean }): ReactElement {
  return (
    <div {...stylex.props(styles.member)}>
      <Avatar.Root
        size='sm'
        aria-hidden
      >
        {member.imageUrl ? (
          <Avatar.Image
            src={member.imageUrl}
            alt=''
          />
        ) : null}
        <Avatar.Fallback>{initials(member.name)}</Avatar.Fallback>
      </Avatar.Root>
      <div {...stylex.props(styles.memberText)}>
        <span {...stylex.props(styles.name)}>
          {member.name}
          {isCurrentUser ? <span {...stylex.props(styles.you)}> (you)</span> : null}
        </span>
        <span {...stylex.props(styles.email)}>{member.email}</span>
      </div>
    </div>
  );
}

export function OrganizationProfileMembersPanelView({
  members,
  invitations = [],
  requests = [],
  roles,
  defaultTab = 'members',
  currentUserId,
  onChangeRole,
  onRemoveMembers,
  onChangeInvitationRole,
  onRevokeInvitation,
  onChangeRequestRole,
  onAcceptRequest,
  onDeclineRequest,
  onInvite,
}: OrganizationProfileMembersPanelViewProps): ReactElement {
  const [activeTab, setActiveTab] = React.useState<OrganizationProfileMembersTab>(defaultTab);
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: MEMBERS_PAGE_SIZE });
  const [removeIds, setRemoveIds] = React.useState<string[] | null>(null);

  // Where the bulk bar floats. In a dialog it pins to the profile's non-scrolling frame (a
  // positioned element) so it clears the scroll region's bottom fade. Embedded, that frame is not a
  // positioning context, so the bar pins to the window instead — centered, like a modal's bar —
  // rather than tracking the content column. With no profile at all it renders inline.
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [overlay, setOverlay] = React.useState<OrganizationProfileBulkOverlay | null>(null);
  React.useEffect(() => {
    const content = rootRef.current?.closest<HTMLElement>('.cl-profile-content');
    if (!content) {
      setOverlay(null);
      return;
    }
    const bounded = getComputedStyle(content).position !== 'static';
    setOverlay(bounded ? { container: content, mode: 'frame' } : { container: document.body, mode: 'viewport' });
  }, []);

  const query = search.trim().toLowerCase();

  const filteredMembers = React.useMemo(
    () =>
      members.filter(
        member =>
          (query === '' || member.name.toLowerCase().includes(query) || member.email.toLowerCase().includes(query)) &&
          (roleFilter === null || member.role === roleFilter),
      ),
    [members, query, roleFilter],
  );

  const sorted = React.useMemo(() => sortMembers(filteredMembers, sorting), [filteredMembers, sorting]);

  // A change to the active list can leave the current page out of range; reset to the first.
  React.useEffect(() => {
    setPagination(state => ({ ...state, pageIndex: 0 }));
  }, [query, roleFilter, activeTab]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pagination.pageSize));
  const pageIndex = Math.min(pagination.pageIndex, pageCount - 1);
  const pageStart = pageIndex * pagination.pageSize;
  const pageRows = sorted.slice(pageStart, pageStart + pagination.pageSize);

  const table = useDataTable({
    data: pageRows,
    getRowId: row => row.id,
    totalCount: filteredMembers.length,
    sorting,
    onSortingChange: setSorting,
  });

  // The viewer cannot act on themselves, so their row is never part of a selection.
  const selectableRows = table.rows.filter(row => row.original.id !== currentUserId);
  const allSelectableSelected = selectableRows.length > 0 && selectableRows.every(row => row.getIsSelected());
  const someSelectableSelected = selectableRows.some(row => row.getIsSelected());
  const toggleAllSelectable = () => {
    const next = { ...table.rowSelection };
    for (const row of selectableRows) {
      next[row.id] = !allSelectableSelected;
    }
    table.setRowSelection(next);
  };

  // Selection survives paging, but not filtering: a row the current filters hide is not something
  // a bulk action should reach.
  const visibleIds = React.useMemo(() => new Set(filteredMembers.map(member => member.id)), [filteredMembers]);
  const selectedIds = Object.entries(table.rowSelection)
    .filter(([id, selected]) => selected && id !== currentUserId && visibleIds.has(id))
    .map(([id]) => id);
  const selectedCount = selectedIds.length;

  const clearSelection = () => table.setRowSelection({});

  const isFiltered = query !== '' || roleFilter !== null;

  const clearFilters = () => {
    setSearch('');
    setRoleFilter(null);
  };

  const confirmRemove = () => {
    if (removeIds) {
      onRemoveMembers?.(removeIds);
      const removed = new Set(removeIds);
      table.setRowSelection(Object.fromEntries(Object.entries(table.rowSelection).filter(([id]) => !removed.has(id))));
    }
    setRemoveIds(null);
  };
  const removeCount = removeIds?.length ?? 0;

  const roleItems = [{ value: ALL_ROLES, label: 'All Roles' }, ...roles];

  const requestCount = requests.length;

  return (
    <div
      ref={rootRef}
      {...mergeStyleProps(
        themeProps('organization-profile-members-panel'),
        stylex.props(styles.root, activeTab === 'members' && selectedCount > 0 && styles.rootWithBulkBar),
      )}
    >
      <Profile.PageTitle>Members</Profile.PageTitle>

      <div {...stylex.props(styles.header)}>
        <Tabs.Root
          value={activeTab}
          onValueChange={value => setActiveTab(value as OrganizationProfileMembersTab)}
        >
          <Tabs.List>
            <Tabs.Tab value='members'>Members</Tabs.Tab>
            <Tabs.Tab value='invitations'>Invitations</Tabs.Tab>
            <Tabs.Tab value='requests'>
              Requests
              {requestCount > 0 ? <Badge color='neutral'>{requestCount}</Badge> : null}
            </Tabs.Tab>
            <Tabs.Indicator />
          </Tabs.List>
        </Tabs.Root>

        <div {...stylex.props(styles.toolbar)}>
          <div {...stylex.props(styles.toolbarStart)}>
            <div {...stylex.props(styles.toolbarSearch)}>
              <InputGroup.Root
                size='md'
                xstyle={styles.toolbarSearchControl}
              >
                <InputGroup.Start>
                  <Icon name='magnifying-glass' />
                </InputGroup.Start>
                <InputGroup.Input
                  placeholder='Search'
                  aria-label='Search members'
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  xstyle={styles.toolbarSearchInput}
                />
                {search ? (
                  <InputGroup.End>
                    <Button
                      aria-label='Clear search'
                      onClick={() => setSearch('')}
                    >
                      <Icon name='x' />
                    </Button>
                  </InputGroup.End>
                ) : null}
              </InputGroup.Root>
            </div>
            <Select.Root
              items={roleItems}
              value={roleFilter ?? ALL_ROLES}
              onValueChange={value => setRoleFilter(value === ALL_ROLES ? null : value)}
            >
              <Select.Trigger
                aria-label='Filter by role'
                placeholder='All Roles'
                render={
                  <Button
                    variant='outline'
                    color='neutral'
                    size='md'
                  />
                }
                xstyle={styles.toolbarControl}
              />
              <Select.Popup />
            </Select.Root>
          </div>
          <div {...stylex.props(styles.toolbarActions)}>
            <Button
              size='md'
              onClick={() => onInvite?.()}
              xstyle={styles.toolbarControl}
            >
              <Icon
                name='plus'
                placement='inline-start'
              />
              Invite
            </Button>
          </div>
        </div>
      </div>

      {activeTab === 'members' ? (
        <>
          <Table.Root fade={false}>
            <Table.Header>
              <Table.Row>
                <Table.SelectAllCell
                  aria-label='Select all members on this page'
                  checked={allSelectableSelected}
                  indeterminate={someSelectableSelected && !allSelectableSelected}
                  onChange={toggleAllSelectable}
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
                  sort={sortFor(table.sorting, 'added')}
                  onSort={() => cycleSort(table.setSorting, 'added')}
                >
                  Added
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
                      <EmptyState.Label>{isFiltered ? 'No members found' : 'No members yet'}</EmptyState.Label>
                      <EmptyState.Description>
                        {isFiltered
                          ? 'Your search did not return any results.'
                          : 'Invite people to add them to this organization.'}
                      </EmptyState.Description>
                      {isFiltered || onInvite ? (
                        <EmptyState.Actions>
                          {isFiltered ? (
                            <Button
                              variant='outline'
                              color='neutral'
                              onClick={clearFilters}
                            >
                              Clear filters
                            </Button>
                          ) : (
                            <Button onClick={onInvite}>Send invite</Button>
                          )}
                        </EmptyState.Actions>
                      ) : null}
                    </EmptyState.Root>
                  </div>
                </Table.Empty>
              ) : (
                table.rows.map(row => {
                  const isCurrentUser = row.original.id === currentUserId;
                  return (
                    <Table.Row
                      key={row.id}
                      selected={row.getIsSelected()}
                    >
                      <Table.SelectCell
                        aria-label={isCurrentUser ? 'You cannot be selected' : `Select ${row.original.name}`}
                        checked={!isCurrentUser && row.getIsSelected()}
                        disabled={isCurrentUser}
                        onToggleSelected={isCurrentUser ? undefined : row.toggleSelected}
                      />
                      <Table.Cell xstyle={styles.nameColumn}>
                        <MemberCell
                          member={row.original}
                          isCurrentUser={isCurrentUser}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <OrganizationProfileRoleControl
                          value={row.original.role}
                          roles={roles}
                          onChangeRole={
                            isCurrentUser || !onChangeRole ? undefined : role => onChangeRole([row.original.id], role)
                          }
                        />
                      </Table.Cell>
                      <Table.Cell>{row.original.addedLabel}</Table.Cell>
                      <Table.Cell align='end'>
                        {onRemoveMembers && !isCurrentUser ? (
                          <Menu.Root placement='bottom-end'>
                            <Menu.Trigger aria-label={`Manage ${row.original.name}`} />
                            <Menu.Popup>
                              <Menu.Item
                                label='Remove from organization'
                                color='negative'
                                onClick={() => setRemoveIds([row.original.id])}
                              >
                                <Menu.Label>Remove from organization</Menu.Label>
                              </Menu.Item>
                            </Menu.Popup>
                          </Menu.Root>
                        ) : null}
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              )}
            </Table.Body>
          </Table.Root>

          {hasMembersPager(filteredMembers.length) ? (
            <OrganizationProfileMembersPager
              page={pageIndex + 1}
              pageSize={pagination.pageSize}
              totalItems={filteredMembers.length}
              onChange={page => setPagination(state => ({ ...state, pageIndex: page - 1 }))}
              onPageSizeChange={pageSize => setPagination({ pageIndex: 0, pageSize })}
            />
          ) : null}

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
            onRemove={onRemoveMembers ? () => setRemoveIds(selectedIds) : undefined}
            removeLabel='Remove selected members'
            onDismiss={clearSelection}
            aria-label='Member bulk actions'
          />
        </>
      ) : null}

      {activeTab === 'invitations' ? (
        <OrganizationProfileInvitationsTabView
          invitations={invitations}
          roles={roles}
          search={search}
          roleFilter={roleFilter}
          overlay={overlay}
          onChangeRole={onChangeInvitationRole}
          onRevoke={onRevokeInvitation}
          onInvite={onInvite}
          onClearFilters={clearFilters}
        />
      ) : null}

      {activeTab === 'requests' ? (
        <OrganizationProfileRequestsTabView
          requests={requests}
          roles={roles}
          search={search}
          roleFilter={roleFilter}
          overlay={overlay}
          onChangeRole={onChangeRequestRole}
          onAccept={onAcceptRequest}
          onDecline={onDeclineRequest}
          onClearFilters={clearFilters}
        />
      ) : null}

      {onRemoveMembers ? (
        <Confirmation
          open={removeIds !== null}
          onOpenChange={open => {
            if (!open) {
              setRemoveIds(null);
            }
          }}
          color='negative'
          title={`Remove ${removeCount} ${removeCount === 1 ? 'member' : 'members'}`}
          description='They will lose access to this workspace and its applications.'
          actionLabel='Remove members'
          cancelLabel='Cancel'
          onConfirm={confirmRemove}
        />
      ) : null}
    </div>
  );
}
