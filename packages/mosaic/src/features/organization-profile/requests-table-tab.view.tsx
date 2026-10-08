import * as stylex from '@stylexjs/stylex';
import { useRef, useState } from 'react';

import { Avatar } from '../../components/avatar';
import { Button, SubmitButton } from '../../components/button';
import { EmptyState } from '../../components/empty-state';
import { Icon } from '../../components/icon';
import { Item } from '../../components/item';
import { Pagination } from '../../components/pagination';
import { Section } from '../../components/section';
import { Spinner } from '../../components/spinner';
import { Table } from '../../components/table';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useListRemovalFocus } from '../../hooks/use-list-removal-focus';
import { usePendingAction } from '../../hooks/use-pending-action';
import { useServerDataTable } from '../../hooks/use-server-data-table';
import { fill, useMessages } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import { styles } from './requests-table-tab.styles';
import type { OrganizationProfileRequest, RequestsTableTabViewProps } from './requests-table-tab.types';
import { tableTabStyles } from './table-tab.styles';

const getRowId = (request: OrganizationProfileRequest) => request.id;

export function RequestsTableTabView({
  requests,
  onInvite,
  onAccept,
  onDecline,
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
}: RequestsTableTabViewProps) {
  const m = useMessages('requestsTableTab');
  const hasActions = Boolean(onAccept || onDecline);
  const columnCount = 2 + Number(hasActions) + Number(Boolean(onBulkAction));
  const query = searchValue.trim();
  const searchInput = useRef<HTMLInputElement>(null);
  const inviteButton = useRef<HTMLButtonElement>(null);
  const acceptFocus = useListRemovalFocus({
    ids: requests.map(getRowId),
    onRemove: onAccept,
    fallback: () => inviteButton.current ?? searchInput.current,
  });
  const declineFocus = useListRemovalFocus({
    ids: requests.map(getRowId),
    onRemove: onDecline,
    fallback: () => inviteButton.current ?? searchInput.current,
  });
  const { table, sortHeader, pagination } = useServerDataTable({
    data: requests,
    totalCount,
    getRowId,
    sortableColumns: ['email', 'requestedAt'],
    sort,
    onSortChange,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    searchValue,
    onSearchChange,
  });
  return (
    <div {...mergeStyleProps(themeProps('requests-table-tab'), stylex.props(tableTabStyles.root))}>
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
            <Table.HeaderCell {...sortHeader('requestedAt')}>{m.requestedAt}</Table.HeaderCell>
            {hasActions ? (
              <Table.HeaderCell align='end'>
                <VisuallyHidden>{m.actions}</VisuallyHidden>
              </Table.HeaderCell>
            ) : null}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading || (isFetching && table.rows.length === 0) ? (
            <Table.Empty colSpan={columnCount}>
              <span role='status'>
                <Spinner />
                <VisuallyHidden>{m.loading}</VisuallyHidden>
              </span>
            </Table.Empty>
          ) : table.rows.length === 0 ? (
            <Table.Empty colSpan={columnCount}>
              <EmptyState.Root>
                <EmptyState.Icon name='users' />
                <EmptyState.Label>{query ? m.empty : m.noRequests}</EmptyState.Label>
                <EmptyState.Description>
                  {query ? fill(m.emptyDescription, { query }) : m.noRequestsDescription}
                </EmptyState.Description>
              </EmptyState.Root>
            </Table.Empty>
          ) : (
            table.rows.map(row => {
              const request = row.original;
              return (
                <Table.Row
                  key={request.id}
                  selected={Boolean(onBulkAction) && row.getIsSelected()}
                >
                  {onBulkAction ? (
                    <Table.SelectCell
                      aria-label={fill(m.select, { name: request.email })}
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
                          {request.imageUrl ? (
                            <Avatar.Image
                              src={request.imageUrl}
                              alt=''
                            />
                          ) : null}
                          <Avatar.Fallback />
                        </Avatar.Root>
                      </Item.Media>
                      <Item.Content>
                        <Item.Label>{request.name ?? request.email}</Item.Label>
                        {request.name ? <Item.Description>{request.email}</Item.Description> : null}
                      </Item.Content>
                    </Item.Root>
                  </Table.Cell>
                  <Table.Cell noWrap>{request.requestedAtLabel}</Table.Cell>
                  {hasActions ? (
                    <Table.Cell align='end'>
                      <RequestActions
                        request={request}
                        onAccept={
                          onAccept
                            ? async () => {
                                await acceptFocus.remove(request.id);
                                acceptFocus.finalFocus()?.focus();
                              }
                            : undefined
                        }
                        onDecline={
                          onDecline
                            ? async () => {
                                await declineFocus.remove(request.id);
                                declineFocus.finalFocus()?.focus();
                              }
                            : undefined
                        }
                        registerAcceptTrigger={acceptFocus.registerTrigger}
                        registerDeclineTrigger={declineFocus.registerTrigger}
                      />
                    </Table.Cell>
                  ) : null}
                </Table.Row>
              );
            })
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
  );
}

function RequestActions({
  request,
  onAccept,
  onDecline,
  registerAcceptTrigger,
  registerDeclineTrigger,
}: {
  request: OrganizationProfileRequest;
  onAccept?: () => void | Promise<void>;
  onDecline?: () => void | Promise<void>;
  registerAcceptTrigger: (id: string) => (element: HTMLButtonElement | null) => void;
  registerDeclineTrigger: (id: string) => (element: HTMLButtonElement | null) => void;
}) {
  const m = useMessages('requestsTableTab');
  const [acceptRef] = useState(() => registerAcceptTrigger(request.id));
  const [declineRef] = useState(() => registerDeclineTrigger(request.id));
  const actions = usePendingAction<'accept' | 'decline'>();
  const pendingAction = request.pendingAction ?? actions.pendingKey;
  const decide = (key: 'accept' | 'decline', action: () => void | Promise<void>, errorFallback: string) => {
    if (pendingAction) {
      return;
    }
    void actions.run(key, action, { errorFallback });
  };
  return (
    <>
      <div {...stylex.props(styles.actions)}>
        {onDecline ? (
          <SubmitButton
            ref={declineRef}
            type='button'
            size='sm'
            disabled={pendingAction === 'accept'}
            isPending={pendingAction === 'decline'}
            pendingLabel={m.declining}
            variant='outline'
            color='neutral'
            aria-label={fill(m.declineRequest, { name: request.name ?? request.email })}
            onClick={() => decide('decline', onDecline, m.declineError)}
          >
            {m.decline}
          </SubmitButton>
        ) : null}
        {onAccept ? (
          <SubmitButton
            ref={acceptRef}
            type='button'
            size='sm'
            disabled={pendingAction === 'decline'}
            isPending={pendingAction === 'accept'}
            pendingLabel={m.accepting}
            aria-label={fill(m.acceptRequest, { name: request.name ?? request.email })}
            onClick={() => decide('accept', onAccept, m.acceptError)}
          >
            {m.accept}
          </SubmitButton>
        ) : null}
      </div>
      <Section.Error>{actions.error}</Section.Error>
    </>
  );
}
