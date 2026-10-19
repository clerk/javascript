import { inertProps } from '@clerk/shared/inert';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';

import { Confirmation } from '../../../blocks/confirmation';
import { ActionMenu } from '../../../components/action-menu';
import { Avatar } from '../../../components/avatar';
import { Button } from '../../../components/button';
import { EmptyState } from '../../../components/empty-state';
import { Entity } from '../../../components/entity';
import { Icon } from '../../../components/icon';
import { Pagination } from '../../../components/pagination';
import { Skeleton, SkeletonContext } from '../../../components/skeleton';
import { Table } from '../../../components/table';
import { VisuallyHidden } from '../../../components/visually-hidden';
import { useServerDataTable } from '../../../hooks/use-server-data-table';
import { Envelope } from '../../../icons/glyphs/envelope';
import { ExclamationCircle } from '../../../icons/glyphs/exclamation-circle';
import { Plus } from '../../../icons/glyphs/plus';
import { fill, useMessages } from '../../../localization';
import { mergeStyleProps, themeProps } from '../../../props';
import type { InvitationsTableTabViewProps, OrganizationProfileInvitation } from './invitations-table-tab.types';
import { tableTabStyles } from './table-tab.styles';

const getRowId = (invitation: OrganizationProfileInvitation) => invitation.id;

export function InvitationsTableTabView({
  invitations,
  inviteButtonRef,
  tableContainerRef,
  onInvite,
  isInviteDisabled,
  registerTrigger,
  revoke,
  finalFocus,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onBulkAction,
  isLoading,
  isFetching = false,
  isError = false,
  onRetry,
}: InvitationsTableTabViewProps) {
  const m = useMessages('invitationsTableTab');
  const { table, pagination } = useServerDataTable({
    data: isLoading ? PLACEHOLDER_INVITATIONS : invitations,
    totalCount,
    getRowId,
    sortableColumns: [],
    page,
    pageSize,
    onPageChange,
    searchValue: '',
    onSearchChange: () => {},
  });
  const columnCount = 3 + Number(Boolean(revoke)) + Number(Boolean(onBulkAction));
  return (
    <>
      <div
        {...mergeStyleProps(themeProps('invitations-table-tab'), stylex.props(tableTabStyles.root))}
        ref={tableContainerRef}
        tabIndex={-1}
        role='group'
        aria-label={m.title}
      >
        <VisuallyHidden role='status'>{isLoading ? m.loading : m.loaded}</VisuallyHidden>
        {onInvite ? (
          <Table.Toolbar>
            <Button
              ref={inviteButtonRef}
              disabled={isInviteDisabled}
              focusableWhenDisabled
              onClick={onInvite}
            >
              <Icon glyph={Plus} />
              {m.invite}
            </Button>
          </Table.Toolbar>
        ) : null}
        <Table.Root
          layout='fixed'
          aria-label={m.title}
          aria-busy={isLoading || isFetching}
        >
          <Table.ColumnGroup>
            {onBulkAction ? <Table.Column /> : null}
            <Table.Column />
            <Table.Column width='9rem' />
            <Table.Column width='8rem' />
            {revoke ? <Table.Column width='4rem' /> : null}
          </Table.ColumnGroup>
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
              <Table.HeaderCell>{m.email}</Table.HeaderCell>
              <Table.HeaderCell>{m.invitedAt}</Table.HeaderCell>
              <Table.HeaderCell>{m.roleLabel}</Table.HeaderCell>
              {revoke ? (
                <Table.HeaderCell align='end'>
                  <VisuallyHidden>{m.actions}</VisuallyHidden>
                </Table.HeaderCell>
              ) : null}
            </Table.Row>
          </Table.Header>
          <InvitationsTableBody
            rows={table.rows}
            columnCount={columnCount}
            isLoading={isLoading}
            isError={isError}
            onRetry={onRetry}
            hasBulkAction={Boolean(onBulkAction)}
            onRevokeClick={revoke ? invitation => revoke.open(invitation) : undefined}
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
      {revoke ? (
        <Confirmation
          controller={revoke}
          title={invitation => fill(m.revokeTitle, { name: invitation.email })}
          description={m.revokeDescription}
          actionLabel={m.revoke}
          cancelLabel={m.cancel}
          finalFocus={finalFocus}
        />
      ) : null}
    </>
  );
}

function InvitationsTableBody({
  rows,
  columnCount,
  isLoading,
  isError,
  onRetry,
  hasBulkAction,
  onRevokeClick,
  registerTrigger,
}: {
  rows: Array<{
    id: string;
    original: OrganizationProfileInvitation;
    getIsSelected: () => boolean;
    toggleSelected: () => void;
  }>;
  columnCount: number;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
  hasBulkAction: boolean;
  onRevokeClick?: (invitation: OrganizationProfileInvitation) => void;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
}) {
  const m = useMessages('invitationsTableTab');
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
            <EmptyState.Icon glyph={Envelope} />
            <EmptyState.Label>{m.noInvitations}</EmptyState.Label>
            <EmptyState.Description>{m.noInvitationsDescription}</EmptyState.Description>
          </EmptyState.Root>
        </Table.Empty>
      </Table.Body>
    );
  }
  return (
    <SkeletonContext.Provider value={isLoading}>
      <Table.Body {...(isLoading ? { 'aria-hidden': true, ...inertProps(true) } : {})}>
        {rows.map(row => (
          <Table.Row
            key={row.id}
            selected={hasBulkAction && row.getIsSelected()}
          >
            {hasBulkAction ? (
              <Table.SelectCell
                aria-label={fill(m.select, { name: row.original.email })}
                checked={row.getIsSelected()}
                onToggleSelected={row.toggleSelected}
              />
            ) : null}
            <Table.Cell>
              <Entity.Root>
                <Skeleton shape='pill'>
                  <Entity.Media>
                    <Avatar.Root
                      size='fit'
                      aria-hidden
                    >
                      {row.original.imageUrl ? (
                        <Avatar.Image
                          src={row.original.imageUrl}
                          alt=''
                        />
                      ) : null}
                      <Avatar.Fallback />
                    </Avatar.Root>
                  </Entity.Media>
                </Skeleton>
                <Entity.Content>
                  <Entity.Label>
                    <Skeleton>{row.original.email}</Skeleton>
                  </Entity.Label>
                </Entity.Content>
              </Entity.Root>
            </Table.Cell>
            <Table.Cell noWrap>
              <Skeleton>{row.original.invitedAtLabel}</Skeleton>
            </Table.Cell>
            <Table.Cell>
              <Skeleton>{row.original.roleLabel}</Skeleton>
            </Table.Cell>
            {onRevokeClick ? (
              <Table.Cell align='end'>
                <Skeleton visible={false}>
                  <ActionMenu
                    label={fill(m.manage, { name: row.original.email })}
                    triggerRef={registerTrigger(row.original.id)}
                    actions={[
                      {
                        label: m.revoke,
                        color: 'negative',
                        onClick: () => onRevokeClick(row.original),
                      },
                    ]}
                  />
                </Skeleton>
              </Table.Cell>
            ) : null}
          </Table.Row>
        ))}
      </Table.Body>
    </SkeletonContext.Provider>
  );
}

const PLACEHOLDER_INVITATIONS: OrganizationProfileInvitation[] = [
  {
    id: 'orginv_placeholder_1',
    email: 'jordan.reyes@northwind.co',
    invitedAtLabel: 'Mar 12, 2026',
    roleLabel: 'Member',
  },
  {
    id: 'orginv_placeholder_2',
    email: 'priya.nair@northwind.co',
    invitedAtLabel: 'Apr 3, 2026',
    roleLabel: 'Admin',
  },
  {
    id: 'orginv_placeholder_3',
    email: 'sam.whitfield@northwind.co',
    invitedAtLabel: 'May 21, 2026',
    roleLabel: 'Member',
  },
];
