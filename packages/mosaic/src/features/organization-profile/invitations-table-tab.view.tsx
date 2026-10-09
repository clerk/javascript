import * as stylex from '@stylexjs/stylex';
import { useMemo, useRef } from 'react';

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

// eslint-disable-next-line sonarjs/cognitive-complexity -- The invitation table renders independent states and optional controls in one view.
export function InvitationsTableTabView({
  invitations,
  onInvite,
  onRevoke,
  totalCount,
  page,
  pageSize = 10,
  searchValue = '',
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
}: InvitationsTableTabViewProps) {
  const m = useMessages('invitationsTableTab');
  const columnCount = 3 + Number(Boolean(onRevoke)) + Number(Boolean(onBulkAction));
  const query = searchValue.trim();
  const searchInput = useRef<HTMLInputElement>(null);
  const inviteButton = useRef<HTMLButtonElement>(null);
  const tableContainer = useRef<HTMLDivElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: invitations.map(getRowId),
    onRemove: onRevoke,
    fallback: () => inviteButton.current ?? searchInput.current ?? tableContainer.current,
  });
  const revokeDialog = useMemo(() => Confirmation.createHandle<OrganizationProfileInvitation>(), []);
  const { table, sortHeader, pagination } = useServerDataTable({
    data: invitations,
    totalCount,
    getRowId,
    sortableColumns: ['email', 'invitedAt', 'roleLabel'],
    sort,
    onSortChange,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    searchValue,
    onSearchChange: onSearchChange ?? (() => {}),
  });
  return (
    <>
      <div
        {...mergeStyleProps(themeProps('invitations-table-tab'), stylex.props(tableTabStyles.root))}
        ref={tableContainer}
        tabIndex={-1}
        role='group'
        aria-label={m.title}
      >
        {onSearchChange || onInvite ? (
          <Table.Toolbar>
            {onSearchChange ? (
              <Table.Search
                ref={searchInput}
                label={m.search}
                clearLabel={m.clearSearch}
                value={table.globalFilter}
                onValueChange={table.setGlobalFilter}
              />
            ) : null}
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
        ) : null}
        {isError && table.rows.length > 0 ? (
          <p role='alert'>
            {m.loadError} {onRetry ? <Button onClick={onRetry}>{m.retry}</Button> : null}
          </p>
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
              <Table.HeaderCell {...sortHeader('email')}>{m.email}</Table.HeaderCell>
              <Table.HeaderCell {...sortHeader('invitedAt')}>{m.invitedAt}</Table.HeaderCell>
              <Table.HeaderCell {...sortHeader('roleLabel')}>{m.roleLabel}</Table.HeaderCell>
              {onRevoke ? (
                <Table.HeaderCell align='end'>
                  <VisuallyHidden>{m.actions}</VisuallyHidden>
                </Table.HeaderCell>
              ) : null}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? (
              <Table.Empty colSpan={columnCount}>
                <span role='status'>
                  <Spinner />
                  <VisuallyHidden>{m.loading}</VisuallyHidden>
                </span>
              </Table.Empty>
            ) : isError && table.rows.length === 0 ? (
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
            ) : table.rows.length === 0 ? (
              <Table.Empty colSpan={columnCount}>
                <EmptyState.Root role='status'>
                  <EmptyState.Icon name='envelope' />
                  <EmptyState.Label>{query ? m.empty : m.noInvitations}</EmptyState.Label>
                  <EmptyState.Description>
                    {query ? fill(m.emptyDescription, { query }) : m.noInvitationsDescription}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Empty>
            ) : (
              table.rows.map(row => (
                <Table.Row
                  key={row.id}
                  selected={Boolean(onBulkAction) && row.getIsSelected()}
                >
                  {onBulkAction ? (
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
                  {onRevoke ? (
                    <Table.Cell align='end'>
                      <ActionMenu
                        label={fill(m.manage, { name: row.original.email })}
                        triggerRef={removalFocus.registerTrigger(row.original.id)}
                        actions={[
                          {
                            label: m.revoke,
                            color: 'negative',
                            onClick: () => revokeDialog.open(row.original),
                          },
                        ]}
                      />
                    </Table.Cell>
                  ) : null}
                </Table.Row>
              ))
            )}
          </Table.Body>
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
