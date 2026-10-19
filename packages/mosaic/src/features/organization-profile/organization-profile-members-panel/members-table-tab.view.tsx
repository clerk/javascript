import { inertProps } from '@clerk/shared/inert';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { ActionMenu } from '../../../components/action-menu';
import { Avatar } from '../../../components/avatar';
import { Badge } from '../../../components/badge';
import { Banner } from '../../../components/banner';
import { Button } from '../../../components/button';
import { EmptyState } from '../../../components/empty-state';
import { Entity } from '../../../components/entity';
import { Icon } from '../../../components/icon';
import { Pagination } from '../../../components/pagination';
import { Select } from '../../../components/select';
import { Skeleton, SkeletonContext } from '../../../components/skeleton';
import { Table } from '../../../components/table';
import { VisuallyHidden } from '../../../components/visually-hidden';
import { useServerDataTable } from '../../../hooks/use-server-data-table';
import { ExclamationCircle } from '../../../icons/glyphs/exclamation-circle';
import { Plus } from '../../../icons/glyphs/plus';
import { Users } from '../../../icons/glyphs/users';
import { fill, useMessages } from '../../../localization';
import { mergeStyleProps, themeProps } from '../../../props';
import { styles } from './members-table-tab.styles';
import type { MembersTableTabViewProps, OrganizationProfileMember } from './members-table-tab.types';
import { canManageMember } from './members-table-tab.utils';
import { tableTabStyles } from './table-tab.styles';

const getRowId = (member: OrganizationProfileMember) => member.id;

export function MembersTableTabView({
  members,
  roles,
  searchInputRef,
  inviteButtonRef,
  onInvite,
  isInviteDisabled,
  registerTrigger,
  remove,
  finalFocus,
  onChangeRole,
  totalCount,
  page,
  pageSize,
  searchValue,
  onSearchChange,
  onPageChange,
  onBulkAction,
  isLoading,
  isFetching = false,
  isError = false,
  onRetry,
  hasRoleSetMigration = false,
  isChangingRole = false,
  roleError,
}: MembersTableTabViewProps) {
  const m = useMessages('membersTableTab');
  const { table, pagination } = useServerDataTable({
    data: isLoading ? PLACEHOLDER_MEMBERS : members,
    totalCount,
    getRowId,
    isRowSelectable: canManageMember,
    sortableColumns: [],
    page,
    pageSize,
    onPageChange,
    searchValue,
    onSearchChange,
  });
  const columnCount = 3 + Number(Boolean(remove)) + Number(Boolean(onBulkAction));
  const query = searchValue.trim();
  const removeAndClearSelection = remove
    ? {
        ...remove,
        confirm: (member: OrganizationProfileMember) => {
          table.setRowSelection({});
          remove.confirm(member);
        },
      }
    : undefined;
  return (
    <>
      <div {...mergeStyleProps(themeProps('members-table-tab'), stylex.props(tableTabStyles.root))}>
        <VisuallyHidden role='status'>{isLoading ? m.loading : m.loaded}</VisuallyHidden>
        <Table.Toolbar>
          <Table.Search
            ref={searchInputRef}
            label={m.search}
            clearLabel={m.clearSearch}
            value={table.globalFilter}
            onValueChange={table.setGlobalFilter}
          />
          {onInvite ? (
            <Button
              ref={inviteButtonRef}
              disabled={isInviteDisabled}
              focusableWhenDisabled
              onClick={onInvite}
            >
              <Icon glyph={Plus} />
              {m.invite}
            </Button>
          ) : null}
        </Table.Toolbar>
        <MembersTableNotices
          hasRoleSetMigration={hasRoleSetMigration}
          roleError={roleError}
        />
        <Table.Root
          aria-label={m.title}
          aria-busy={isLoading || isFetching}
        >
          <Table.Header>
            <Table.Row>
              {onBulkAction ? (
                <Table.SelectAllCell
                  aria-label={m.selectAll}
                  checked={table.getIsAllRowsSelected()}
                  indeterminate={table.getIsSomeRowsSelected()}
                  onChange={table.toggleAllRowsSelected}
                />
              ) : null}
              <Table.HeaderCell>{m.name}</Table.HeaderCell>
              <Table.HeaderCell>{m.joinedAt}</Table.HeaderCell>
              <Table.HeaderCell>{m.role}</Table.HeaderCell>
              {remove ? (
                <Table.HeaderCell align='end'>
                  <VisuallyHidden>{m.actions}</VisuallyHidden>
                </Table.HeaderCell>
              ) : null}
            </Table.Row>
          </Table.Header>
          <MembersTableBody
            rows={table.rows}
            columnCount={columnCount}
            query={query}
            isLoading={isLoading}
            isError={isError}
            onRetry={onRetry}
            roles={roles}
            hasBulkAction={Boolean(onBulkAction)}
            onChangeRole={onChangeRole}
            isChangingRole={isChangingRole}
            onRemoveClick={remove ? member => remove.open(member) : undefined}
            registerTrigger={registerTrigger}
          />
        </Table.Root>
        {pagination ? (
          <Pagination
            {...pagination}
            label={m.pagination}
            pageSizeLabel={m.pageSize}
            previousPageLabel={m.previousPage}
            nextPageLabel={m.nextPage}
          />
        ) : null}
      </div>
      {removeAndClearSelection ? (
        <Confirmation
          controller={removeAndClearSelection}
          title={member => fill(m.removeTitle, { name: member.name })}
          description={m.removeDescription}
          actionLabel={m.remove}
          cancelLabel={m.cancel}
          finalFocus={finalFocus}
        />
      ) : null}
    </>
  );
}

function MembersTableNotices({
  hasRoleSetMigration,
  roleError,
}: Pick<MembersTableTabViewProps, 'hasRoleSetMigration' | 'roleError'>) {
  const m = useMessages('membersTableTab');
  return (
    <>
      {hasRoleSetMigration ? (
        <Banner.Root
          color='warning'
          role='status'
        >
          <Banner.Label>{m.roleSetMigration}</Banner.Label>
        </Banner.Root>
      ) : null}
      {roleError ? (
        <Banner.Root
          color='negative'
          role='alert'
        >
          <Banner.Label>{roleError}</Banner.Label>
        </Banner.Root>
      ) : null}
    </>
  );
}

function MembersTableBody({
  rows,
  columnCount,
  query,
  isLoading,
  isError,
  onRetry,
  roles,
  hasBulkAction,
  onChangeRole,
  isChangingRole,
  onRemoveClick,
  registerTrigger,
}: {
  rows: Array<{ original: OrganizationProfileMember; getIsSelected: () => boolean; toggleSelected: () => void }>;
  columnCount: number;
  query: string;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  roles: MembersTableTabViewProps['roles'];
  hasBulkAction: boolean;
  onChangeRole?: MembersTableTabViewProps['onChangeRole'];
  isChangingRole: boolean;
  onRemoveClick?: (member: OrganizationProfileMember) => void;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
}) {
  const m = useMessages('membersTableTab');
  if (!isLoading && isError) {
    return (
      <Table.Body>
        <Table.Empty colSpan={columnCount}>
          <EmptyState.Root role='alert'>
            <EmptyState.Icon glyph={ExclamationCircle} />
            <EmptyState.Label>{m.loadError}</EmptyState.Label>
            {onRetry ? (
              <EmptyState.Actions>
                <Button onClick={onRetry}>{m.retry}</Button>
              </EmptyState.Actions>
            ) : null}
          </EmptyState.Root>
        </Table.Empty>
      </Table.Body>
    );
  }
  if (rows.length === 0) {
    return (
      <Table.Body>
        <Table.Empty colSpan={columnCount}>
          <EmptyState.Root role='status'>
            <EmptyState.Icon glyph={Users} />
            <EmptyState.Label>{query ? m.empty : m.noMembers}</EmptyState.Label>
            <EmptyState.Description>
              {query ? fill(m.emptyDescription, { query }) : m.noMembersDescription}
            </EmptyState.Description>
          </EmptyState.Root>
        </Table.Empty>
      </Table.Body>
    );
  }
  return (
    <SkeletonContext.Provider value={isLoading}>
      <Table.Body {...(isLoading ? { 'aria-hidden': true, ...inertProps(true) } : {})}>
        {rows.map(row => (
          <MemberRow
            key={row.original.id}
            member={row.original}
            roles={roles}
            selected={row.getIsSelected()}
            onToggleSelected={hasBulkAction ? row.toggleSelected : undefined}
            onChangeRole={onChangeRole}
            isChangingRole={isChangingRole}
            onRemoveClick={onRemoveClick ? () => onRemoveClick(row.original) : undefined}
            triggerRef={registerTrigger(row.original.id)}
            skeleton={isLoading}
          />
        ))}
      </Table.Body>
    </SkeletonContext.Provider>
  );
}

function MemberRow({
  member,
  roles,
  selected,
  onToggleSelected,
  onChangeRole,
  isChangingRole,
  onRemoveClick,
  triggerRef,
  skeleton,
}: {
  member: OrganizationProfileMember;
  roles: MembersTableTabViewProps['roles'];
  selected: boolean;
  onToggleSelected?: () => void;
  onChangeRole?: MembersTableTabViewProps['onChangeRole'];
  isChangingRole: boolean;
  onRemoveClick?: () => void;
  triggerRef?: Ref<HTMLButtonElement>;
  skeleton: boolean;
}) {
  const m = useMessages('membersTableTab');
  const manageable = canManageMember(member);
  return (
    <Table.Row
      selected={Boolean(onToggleSelected) && manageable && selected}
      aria-disabled={member.isDeprovisioned || undefined}
      xstyle={member.isDeprovisioned && styles.deprovisionedRow}
    >
      {onToggleSelected ? (
        <Table.SelectCell
          aria-label={fill(m.select, { name: member.name })}
          checked={manageable && selected}
          disabled={!manageable}
          onToggleSelected={manageable ? onToggleSelected : undefined}
        />
      ) : null}
      <Table.Cell>
        <Entity.Root>
          <Skeleton>
            <Entity.Media>
              <Avatar.Root
                size='fit'
                aria-hidden
              >
                {member.imageUrl ? (
                  <Avatar.Image
                    src={member.imageUrl}
                    alt=''
                  />
                ) : null}
                <Avatar.Fallback />
              </Avatar.Root>
            </Entity.Media>
          </Skeleton>
          <Entity.Content>
            <Entity.Label>
              <Skeleton>{member.name}</Skeleton>
              {skeleton ? null : <MemberBadge member={member} />}
            </Entity.Label>
            <Entity.Description>
              <Skeleton>{member.email}</Skeleton>
            </Entity.Description>
          </Entity.Content>
        </Entity.Root>
      </Table.Cell>
      <Table.Cell noWrap>
        <Skeleton>{member.joinedAtLabel}</Skeleton>
      </Table.Cell>
      <Table.Cell>
        <MemberRole
          member={member}
          roles={roles}
          onChangeRole={onChangeRole}
          isChangingRole={isChangingRole}
          skeleton={skeleton}
        />
      </Table.Cell>
      {onRemoveClick ? (
        <Table.Cell align='end'>
          {manageable ? (
            <Skeleton visible={false}>
              <ActionMenu
                label={fill(m.manage, { name: member.name })}
                triggerRef={triggerRef}
                disabled={isChangingRole}
                actions={[{ label: m.remove, color: 'negative', onClick: onRemoveClick }]}
              />
            </Skeleton>
          ) : null}
        </Table.Cell>
      ) : null}
    </Table.Row>
  );
}

function MemberBadge({ member }: { member: OrganizationProfileMember }) {
  const m = useMessages('membersTableTab');
  if (member.isCurrentUser) {
    return <Badge>{m.you}</Badge>;
  }
  if (member.isDeprovisioned) {
    return <Badge>{m.deprovisioned}</Badge>;
  }
  if (member.isBanned) {
    return <Badge color='negative'>{m.banned}</Badge>;
  }
  return null;
}

function MemberRole({
  member,
  roles,
  onChangeRole,
  isChangingRole,
  skeleton,
}: {
  member: OrganizationProfileMember;
  roles: MembersTableTabViewProps['roles'];
  onChangeRole?: MembersTableTabViewProps['onChangeRole'];
  isChangingRole: boolean;
  skeleton: boolean;
}) {
  const m = useMessages('membersTableTab');
  if (skeleton) {
    return <Skeleton>{member.roleLabel}</Skeleton>;
  }
  if (!onChangeRole || member.isDeprovisioned || !roles.some(role => role.value === member.role)) {
    return member.roleLabel;
  }
  return (
    <Select.Root
      items={roles}
      value={member.role}
      onValueChange={value => value && onChangeRole(member.id, value)}
    >
      <Select.Trigger
        variant='ghost'
        disabled={member.isCurrentUser || isChangingRole}
        aria-label={fill(m.changeRole, { name: member.name })}
        placeholder={member.roleLabel}
      />
      <Select.Popup />
    </Select.Root>
  );
}

const PLACEHOLDER_MEMBERS: OrganizationProfileMember[] = [
  {
    id: 'orgmem_placeholder_1',
    name: 'Jordan Reyes',
    email: 'jordan.reyes@northwind.co',
    joinedAtLabel: 'Mar 12, 2026',
    role: 'org:admin',
    roleLabel: 'Admin',
  },
  {
    id: 'orgmem_placeholder_2',
    name: 'Priya Nair',
    email: 'priya.nair@northwind.co',
    joinedAtLabel: 'Apr 3, 2026',
    role: 'org:member',
    roleLabel: 'Member',
  },
  {
    id: 'orgmem_placeholder_3',
    name: 'Sam Whitfield',
    email: 'sam.whitfield@northwind.co',
    joinedAtLabel: 'May 21, 2026',
    role: 'org:member',
    roleLabel: 'Member',
  },
];
