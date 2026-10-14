import * as stylex from '@stylexjs/stylex';
import { type Ref, useMemo, useRef } from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { ActionMenu } from '../../components/action-menu';
import { Avatar } from '../../components/avatar';
import { Button } from '../../components/button';
import { EmptyState } from '../../components/empty-state';
import { Icon } from '../../components/icon';
import { Item } from '../../components/item';
import { Pagination } from '../../components/pagination';
import { Spinner } from '../../components/spinner';
import { Table } from '../../components/table';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useListRemovalFocus } from '../../hooks/use-list-removal-focus';
import { useServerDataTable } from '../../hooks/use-server-data-table';
import { fill, useMessages } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import type { InvitationsTableTabViewProps, OrganizationProfileInvitation } from './invitations-table-tab.types';
import { tableTabStyles } from './table-tab.styles';

const getRowId = (invitation: OrganizationProfileInvitation) => invitation.id;

export function InvitationsTableTabView({
  invitations,
  onInvite,
  onRevoke,
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
  const inviteButton = useRef<HTMLButtonElement>(null);
  const tableContainer = useRef<HTMLDivElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: invitations.map(getRowId),
    onRemove: onRevoke,
    fallback: () => inviteButton.current ?? tableContainer.current,
  });
  const revokeDialog = useMemo(() => Confirmation.createHandle<OrganizationProfileInvitation>(), []);
  const { table, pagination } = useServerDataTable({
    data: invitations,
    totalCount,
    getRowId,
    sortableColumns: [],
    page,
    pageSize,
    onPageChange,
    searchValue: '',
    onSearchChange: () => {},
  });
  const columnCount = 3 + Number(Boolean(onRevoke)) + Number(Boolean(onBulkAction));
  return (
    <>
      <div
        {...mergeStyleProps(themeProps('invitations-table-tab'), stylex.props(tableTabStyles.root))}
        ref={tableContainer}
        tabIndex={-1}
        role='group'
        aria-label={m.title}
      >
        {onInvite ? (
          <Table.Toolbar>
            <Button
              ref={inviteButton}
              onClick={onInvite}
            >
              <Icon name='plus' />
              {m.invite}
            </Button>
          </Table.Toolbar>
        ) : null}
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
              <Table.HeaderCell>{m.email}</Table.HeaderCell>
              <Table.HeaderCell>{m.invitedAt}</Table.HeaderCell>
              <Table.HeaderCell>{m.roleLabel}</Table.HeaderCell>
              {onRevoke ? (
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
            onRevokeClick={onRevoke ? invitation => revokeDialog.open(invitation) : undefined}
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
      {onRevoke ? (
        <Confirmation
          handle={revokeDialog}
          title={invitation => fill(m.revokeTitle, { name: invitation.email })}
          description={m.revokeDescription}
          actionLabel={m.revoke}
          cancelLabel={m.cancel}
          onConfirm={invitation => removalFocus.remove(invitation.id)}
          errorFallback={m.revokeError}
          finalFocus={removalFocus.finalFocus}
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
  if (isError) {
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
            <EmptyState.Icon name='envelope' />
            <EmptyState.Label>{m.noInvitations}</EmptyState.Label>
            <EmptyState.Description>{m.noInvitationsDescription}</EmptyState.Description>
          </EmptyState.Root>
        </Table.Empty>
      </Table.Body>
    );
  }
  return (
    <Table.Body>
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
            <Item.Root>
              <Item.Media>
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
              </Item.Media>
              <Item.Content>
                <Item.Label>{row.original.email}</Item.Label>
              </Item.Content>
            </Item.Root>
          </Table.Cell>
          <Table.Cell noWrap>{row.original.invitedAtLabel}</Table.Cell>
          <Table.Cell>{row.original.roleLabel}</Table.Cell>
          {onRevokeClick ? (
            <Table.Cell align='end'>
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
            </Table.Cell>
          ) : null}
        </Table.Row>
      ))}
    </Table.Body>
  );
}
