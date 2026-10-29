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
import { Table } from '../../../components/table';
import { VisuallyHidden } from '../../../components/visually-hidden';
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
  isFetching = false,
  isError = false,
  onRetry,
  hasRoleSetMigration = false,
  isChangingRole = false,
  roleError,
}: MembersTableTabViewProps) {
  const m = useMessages('membersTableTab');
  const query = searchValue.trim();
  const showPagination = Math.ceil(totalCount / pageSize) > 1;
  return (
    <>
      <div {...mergeStyleProps(themeProps('members-table-tab'), stylex.props(tableTabStyles.root))}>
        {isError ? null : <VisuallyHidden role='status'>{m.loaded}</VisuallyHidden>}
        <Table.Toolbar>
          <Table.Search
            ref={searchInputRef}
            label={m.search}
            clearLabel={m.clearSearch}
            value={searchValue}
            onValueChange={onSearchChange}
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
          layout='fixed'
          minWidth='37rem'
          aria-label={m.title}
          aria-busy={isFetching}
          selectionMode={onBulkAction ? 'multiple' : 'none'}
        >
          <Table.Header>
            {onBulkAction ? <Table.SelectionColumn aria-label={m.selectAll} /> : null}
            <Table.Column>{m.name}</Table.Column>
            <Table.Column width='9rem'>{m.joinedAt}</Table.Column>
            <Table.Column width='10rem'>{m.role}</Table.Column>
            {remove ? (
              <Table.Column
                align='end'
                width='4rem'
              >
                <VisuallyHidden>{m.actions}</VisuallyHidden>
              </Table.Column>
            ) : null}
          </Table.Header>
          <MembersTableBody
            members={isError ? [] : members}
            query={query}
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
        {showPagination ? (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalCount}
            disabled={isFetching}
            onChange={onPageChange}
            label={m.pagination}
            pageSizeLabel={m.pageSize}
            previousPageLabel={m.previousPage}
            nextPageLabel={m.nextPage}
          />
        ) : null}
      </div>
      {remove ? (
        <Confirmation
          controller={remove}
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
  members,
  query,
  isError,
  onRetry,
  roles,
  hasBulkAction,
  onChangeRole,
  isChangingRole,
  onRemoveClick,
  registerTrigger,
}: {
  members: OrganizationProfileMember[];
  query: string;
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
  return (
    <Table.Body
      items={members}
      itemToStringValue={getRowId}
      renderEmptyState={() =>
        isError ? (
          <EmptyState.Root role='alert'>
            <EmptyState.Icon glyph={ExclamationCircle} />
            <EmptyState.Label>{m.loadError}</EmptyState.Label>
            {onRetry ? (
              <EmptyState.Actions>
                <Button onClick={onRetry}>{m.retry}</Button>
              </EmptyState.Actions>
            ) : null}
          </EmptyState.Root>
        ) : (
          <EmptyState.Root role='status'>
            <EmptyState.Icon glyph={Users} />
            <EmptyState.Label>{query ? m.empty : m.noMembers}</EmptyState.Label>
            <EmptyState.Description>
              {query ? fill(m.emptyDescription, { query }) : m.noMembersDescription}
            </EmptyState.Description>
          </EmptyState.Root>
        )
      }
    >
      {member => (
        <MemberRow
          member={member}
          roles={roles}
          hasBulkAction={hasBulkAction}
          onChangeRole={onChangeRole}
          isChangingRole={isChangingRole}
          onRemoveClick={onRemoveClick ? () => onRemoveClick(member) : undefined}
          triggerRef={registerTrigger(member.id)}
        />
      )}
    </Table.Body>
  );
}

function MemberRow({
  member,
  roles,
  hasBulkAction,
  onChangeRole,
  isChangingRole,
  onRemoveClick,
  triggerRef,
}: {
  member: OrganizationProfileMember;
  roles: MembersTableTabViewProps['roles'];
  hasBulkAction: boolean;
  onChangeRole?: MembersTableTabViewProps['onChangeRole'];
  isChangingRole: boolean;
  onRemoveClick?: () => void;
  triggerRef?: Ref<HTMLButtonElement>;
}) {
  const m = useMessages('membersTableTab');
  const manageable = canManageMember(member);
  return (
    <Table.Row
      disabled={!manageable}
      xstyle={member.isDeprovisioned && styles.deprovisionedRow}
    >
      {hasBulkAction ? <Table.SelectionCell aria-label={fill(m.select, { name: member.name })} /> : null}
      <Table.Cell>
        <Entity.Root>
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
          <Entity.Content>
            <Entity.Label>
              {member.name}
              {member.isCurrentUser ? (
                <Badge color='neutral'>{m.you}</Badge>
              ) : member.isDeprovisioned ? (
                <Badge>{m.deprovisioned}</Badge>
              ) : member.isBanned ? (
                <Badge color='negative'>{m.banned}</Badge>
              ) : null}
            </Entity.Label>
            <Entity.Description>{member.email}</Entity.Description>
          </Entity.Content>
        </Entity.Root>
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
              disabled={isChangingRole}
              actions={[{ label: m.remove, color: 'negative', onClick: onRemoveClick }]}
            />
          ) : null}
        </Table.Cell>
      ) : null}
    </Table.Row>
  );
}
