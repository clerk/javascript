import * as stylex from '@stylexjs/stylex';
import { type Ref, useEffect, useMemo, useRef } from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { ActionMenu } from '../../components/action-menu';
import { Avatar } from '../../components/avatar';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { EmptyState } from '../../components/empty-state';
import { Icon } from '../../components/icon';
import { Item } from '../../components/item';
import { Pagination } from '../../components/pagination';
import { Select } from '../../components/select';
import { Spinner } from '../../components/spinner';
import { Table } from '../../components/table';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useListRemovalFocus } from '../../hooks/use-list-removal-focus';
import { useServerDataTable } from '../../hooks/use-server-data-table';
import { fill, useMessages } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import { styles } from './members-table-tab.styles';
import type { MembersTableTabViewProps, OrganizationProfileMember } from './members-table-tab.types';
import { tableTabStyles } from './table-tab.styles';

const getRowId = (member: OrganizationProfileMember) => member.id;
const canManageMember = (member: OrganizationProfileMember) => !member.isCurrentUser && !member.isDeprovisioned;

export function MembersTableTabView({
  members,
  roles,
  onInvite,
  onRemove,
  onChangeRole,
  totalCount,
  page,
  pageSize = 10,
  searchValue,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onBulkAction,
  sort,
  onSortChange,
  isLoading,
  isFetching = false,
  isError = false,
  onRetry,
  isRolesError = false,
  onRetryRoles,
  hasRoleSetMigration = false,
  isChangingRole = false,
  roleError,
}: MembersTableTabViewProps) {
  const m = useMessages('membersTableTab');
  const searchInput = useRef<HTMLInputElement>(null);
  const inviteButton = useRef<HTMLButtonElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: members.filter(canManageMember).map(getRowId),
    onRemove,
    fallback: () => inviteButton.current ?? searchInput.current,
  });
  const removeDialog = useMemo(() => Confirmation.createHandle<OrganizationProfileMember>(), []);
  const { table, sortHeader, pagination } = useServerDataTable({
    data: members,
    totalCount,
    getRowId,
    isRowSelectable: canManageMember,
    sortableColumns: ['name', 'joinedAt', 'role'],
    sort,
    onSortChange,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    searchValue,
    onSearchChange,
  });
  const resetSelection = useRef(table.setRowSelection);
  useEffect(() => {
    resetSelection.current = table.setRowSelection;
  }, [table.setRowSelection]);
  useEffect(() => {
    resetSelection.current({});
  }, [page, pageSize, searchValue, sort?.column, sort?.direction]);
  const columnCount = 3 + Number(Boolean(onRemove)) + Number(Boolean(onBulkAction));
  const query = searchValue.trim();
  return (
    <>
      <div {...mergeStyleProps(themeProps('members-table-tab'), stylex.props(tableTabStyles.root))}>
        <Table.Toolbar>
          <Table.Search
            ref={searchInput}
            label={m.search}
            clearLabel={m.clearSearch}
            value={table.globalFilter}
            onValueChange={table.setGlobalFilter}
          />
          {onInvite ? (
            <Button
              ref={inviteButton}
              onClick={onInvite}
            >
              <Icon name='plus' />
              {m.invite}
            </Button>
          ) : null}
        </Table.Toolbar>
        <MembersTableNotices
          hasRoleSetMigration={hasRoleSetMigration}
          hasLoadError={isError && table.rows.length > 0}
          onRetry={onRetry}
          isRolesError={isRolesError}
          onRetryRoles={onRetryRoles}
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
              <Table.HeaderCell {...sortHeader('name')}>{m.name}</Table.HeaderCell>
              <Table.HeaderCell {...sortHeader('joinedAt')}>{m.joinedAt}</Table.HeaderCell>
              <Table.HeaderCell {...sortHeader('role')}>{m.role}</Table.HeaderCell>
              {onRemove ? (
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
            onRemoveClick={onRemove ? member => removeDialog.open(member) : undefined}
            registerTrigger={removalFocus.registerTrigger}
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
      {onRemove ? (
        <Confirmation
          handle={removeDialog}
          title={member => fill(m.removeTitle, { name: member.name })}
          description={m.removeDescription}
          actionLabel={m.remove}
          cancelLabel={m.cancel}
          onConfirm={member => removalFocus.remove(member.id)}
          errorFallback={m.removeError}
          finalFocus={removalFocus.finalFocus}
        />
      ) : null}
    </>
  );
}

function MembersTableNotices({
  hasRoleSetMigration,
  hasLoadError,
  onRetry,
  isRolesError,
  onRetryRoles,
  roleError,
}: Pick<MembersTableTabViewProps, 'hasRoleSetMigration' | 'onRetry' | 'isRolesError' | 'onRetryRoles' | 'roleError'> & {
  hasLoadError: boolean;
}) {
  const m = useMessages('membersTableTab');
  return (
    <>
      {hasRoleSetMigration ? <p role='status'>{m.roleSetMigration}</p> : null}
      {hasLoadError ? (
        <p role='alert'>
          {m.loadError} {onRetry ? <Button onClick={onRetry}>{m.retry}</Button> : null}
        </p>
      ) : null}
      {isRolesError ? (
        <p role='alert'>
          {m.rolesError} {onRetryRoles ? <Button onClick={onRetryRoles}>{m.retry}</Button> : null}
        </p>
      ) : null}
      {roleError ? <p role='alert'>{roleError}</p> : null}
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
  if (isLoading) {
    return (
      <Table.Body>
        <Table.Empty colSpan={columnCount}>
          <span role='status'>
            <Spinner />
            <VisuallyHidden>{m.loading}</VisuallyHidden>
          </span>
        </Table.Empty>
      </Table.Body>
    );
  }
  if (isError && rows.length === 0) {
    return (
      <Table.Body>
        <Table.Empty colSpan={columnCount}>
          <EmptyState.Root role='alert'>
            <EmptyState.Icon name='exclamation-circle' />
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
            <EmptyState.Icon name='users' />
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
    <Table.Body>
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
        />
      ))}
    </Table.Body>
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
}: {
  member: OrganizationProfileMember;
  roles: MembersTableTabViewProps['roles'];
  selected: boolean;
  onToggleSelected?: () => void;
  onChangeRole?: MembersTableTabViewProps['onChangeRole'];
  isChangingRole: boolean;
  onRemoveClick?: () => void;
  triggerRef: Ref<HTMLButtonElement>;
}) {
  const m = useMessages('membersTableTab');
  const manageable = canManageMember(member);
  return (
    <Table.Row selected={Boolean(onToggleSelected) && manageable && selected}>
      {onToggleSelected ? (
        <Table.SelectCell
          aria-label={fill(m.select, { name: member.name })}
          checked={manageable && selected}
          disabled={!manageable}
          onToggleSelected={manageable ? onToggleSelected : undefined}
        />
      ) : null}
      <Table.Cell>
        <Item.Root>
          <Item.Media>
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
          </Item.Media>
          <Item.Content>
            <Item.Label xstyle={styles.name}>
              {member.name}
              {member.isCurrentUser ? (
                <Badge>{m.you}</Badge>
              ) : member.isDeprovisioned ? (
                <Badge>{m.deprovisioned}</Badge>
              ) : member.isBanned ? (
                <Badge color='negative'>{m.banned}</Badge>
              ) : null}
            </Item.Label>
            <Item.Description>{member.email}</Item.Description>
          </Item.Content>
        </Item.Root>
      </Table.Cell>
      <Table.Cell noWrap>{member.joinedAtLabel}</Table.Cell>
      <Table.Cell>
        {onChangeRole && !member.isDeprovisioned && roles.some(role => role.value === member.role) ? (
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
        ) : (
          member.roleLabel
        )}
      </Table.Cell>
      {onRemoveClick ? (
        <Table.Cell align='end'>
          {manageable ? (
            <ActionMenu
              label={fill(m.manage, { name: member.name })}
              triggerRef={triggerRef}
              actions={[{ label: m.remove, color: 'negative', onClick: onRemoveClick }]}
            />
          ) : null}
        </Table.Cell>
      ) : null}
    </Table.Row>
  );
}
