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
  pageSize,
  onPageChange,
  onBulkAction,
  isLoading,
  isFetching = false,
  isError = false,
  onRetry,
}: RequestsTableTabViewProps) {
  const m = useMessages('requestsTableTab');
  const inviteButton = useRef<HTMLButtonElement>(null);
  const tableContainer = useRef<HTMLDivElement>(null);
  const acceptFocus = useListRemovalFocus({
    ids: requests.map(getRowId),
    onRemove: onAccept,
    fallback: () => inviteButton.current ?? tableContainer.current,
  });
  const declineFocus = useListRemovalFocus({
    ids: requests.map(getRowId),
    onRemove: onDecline,
    fallback: () => inviteButton.current ?? tableContainer.current,
  });
  const { table, pagination } = useServerDataTable({
    data: requests,
    totalCount,
    getRowId,
    sortableColumns: [],
    page,
    pageSize,
    onPageChange,
    searchValue: '',
    onSearchChange: () => {},
  });
  const hasActions = Boolean(onAccept || onDecline);
  const columnCount = 2 + Number(hasActions) + Number(Boolean(onBulkAction));
  return (
    <div
      {...mergeStyleProps(themeProps('requests-table-tab'), stylex.props(tableTabStyles.root))}
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
            <Table.HeaderCell>{m.requestedAt}</Table.HeaderCell>
            {hasActions ? (
              <Table.HeaderCell align='end'>
                <VisuallyHidden>{m.actions}</VisuallyHidden>
              </Table.HeaderCell>
            ) : null}
          </Table.Row>
        </Table.Header>
        <RequestsTableBody
          rows={table.rows}
          columnCount={columnCount}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          onRetry={onRetry}
          hasActions={hasActions}
          hasBulkAction={Boolean(onBulkAction)}
          onAccept={onAccept}
          onDecline={onDecline}
          onAcceptRow={async id => {
            await acceptFocus.remove(id);
            acceptFocus.finalFocus()?.focus();
          }}
          onDeclineRow={async id => {
            await declineFocus.remove(id);
            declineFocus.finalFocus()?.focus();
          }}
          registerAcceptTrigger={acceptFocus.registerTrigger}
          registerDeclineTrigger={declineFocus.registerTrigger}
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
  );
}

function RequestsTableBody({
  rows,
  columnCount,
  isLoading,
  isFetching,
  isError,
  onRetry,
  hasActions,
  hasBulkAction,
  onAccept,
  onDecline,
  onAcceptRow,
  onDeclineRow,
  registerAcceptTrigger,
  registerDeclineTrigger,
}: {
  rows: Array<{
    id: string;
    original: OrganizationProfileRequest;
    getIsSelected: () => boolean;
    toggleSelected: () => void;
  }>;
  columnCount: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  onRetry?: () => void;
  hasActions: boolean;
  hasBulkAction: boolean;
  onAccept?: RequestsTableTabViewProps['onAccept'];
  onDecline?: RequestsTableTabViewProps['onDecline'];
  onAcceptRow: (id: string) => Promise<void>;
  onDeclineRow: (id: string) => Promise<void>;
  registerAcceptTrigger: (id: string) => (element: HTMLButtonElement | null) => void;
  registerDeclineTrigger: (id: string) => (element: HTMLButtonElement | null) => void;
}) {
  const m = useMessages('requestsTableTab');
  if (isLoading || (isFetching && rows.length === 0)) {
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
            <EmptyState.Icon name='users' />
            <EmptyState.Label>{m.noRequests}</EmptyState.Label>
            <EmptyState.Description>{m.noRequestsDescription}</EmptyState.Description>
          </EmptyState.Root>
        </Table.Empty>
      </Table.Body>
    );
  }
  return (
    <Table.Body>
      {rows.map(row => {
        const request = row.original;
        return (
          <Table.Row
            key={request.id}
            selected={hasBulkAction && row.getIsSelected()}
          >
            {hasBulkAction ? (
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
                  onAccept={onAccept ? () => onAcceptRow(request.id) : undefined}
                  onDecline={onDecline ? () => onDeclineRow(request.id) : undefined}
                  registerAcceptTrigger={registerAcceptTrigger}
                  registerDeclineTrigger={registerDeclineTrigger}
                />
              </Table.Cell>
            ) : null}
          </Table.Row>
        );
      })}
    </Table.Body>
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
