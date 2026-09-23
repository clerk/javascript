import * as stylex from '@stylexjs/stylex';
import { useMemo, useRef, useState } from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { Avatar } from '../../components/avatar';
import { Button, SubmitButton } from '../../components/button';
import { EmptyState } from '../../components/empty-state';
import { Icon } from '../../components/icon';
import { InputGroup } from '../../components/input-group';
import { Pagination } from '../../components/pagination';
import { panelStyles } from '../../components/profile';
import { Spinner } from '../../components/spinner';
import { Table, type TableHeaderCellProps } from '../../components/table';
import { Text } from '../../components/text';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useListRemovalFocus } from '../../hooks/useListRemovalFocus';
import { fill, useMessages } from '../../localization';
import { useDataTable } from '../../primitives/hooks';
import { mergeStyleProps, themeProps } from '../../props';
import { styles } from './requests-table-tab.styles';
import type {
  OrganizationProfileRequest,
  RequestsTableSort,
  RequestsTableTabViewProps,
} from './requests-table-tab.types';

const getRowId = (request: OrganizationProfileRequest) => request.id;

export function RequestsTableTabView({
  requests,
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
  const acceptRequest = useMemo(() => Confirmation.createHandle<OrganizationProfileRequest>(), []);
  const declineRequest = useMemo(() => Confirmation.createHandle<OrganizationProfileRequest>(), []);
  const acceptFocus = useListRemovalFocus({
    ids: requests.map(getRowId),
    onRemove: onAccept,
    fallback: () => searchInput.current,
  });
  const declineFocus = useListRemovalFocus({
    ids: requests.map(getRowId),
    onRemove: onDecline,
    fallback: () => searchInput.current,
  });
  const pagination = { pageIndex: page - 1, pageSize };
  const table = useDataTable({
    data: requests,
    totalCount,
    getRowId,
    sorting: sort ? [{ id: sort.column, desc: sort.direction === 'descending' }] : [],
    onSortingChange: onSortChange
      ? update => {
          const next = typeof update === 'function' ? update(table.sorting) : update;
          const active = next[0];
          table.setRowSelection({});
          onSortChange(
            active && (active.id === 'email' || active.id === 'requestedAt')
              ? { column: active.id, direction: active.desc ? 'descending' : 'ascending' }
              : null,
          );
        }
      : undefined,
    pagination,
    onPaginationChange: update => {
      const next = typeof update === 'function' ? update(pagination) : update;
      table.setRowSelection({});
      if (next.pageSize !== pageSize) {
        onPageSizeChange?.(next.pageSize);
      }
      onPageChange(next.pageIndex + 1);
    },
    globalFilter: searchValue,
    onGlobalFilterChange: update => {
      table.setRowSelection({});
      onSearchChange(typeof update === 'function' ? update(searchValue) : update);
    },
  });
  const sortHeader = (column: RequestsTableSort['column']): Pick<TableHeaderCellProps, 'sort' | 'onSort'> => {
    const active = table.sorting[0];
    return {
      sort: active?.id === column ? (active.desc ? 'descending' : 'ascending') : 'none',
      onSort: onSortChange
        ? () =>
            table.setSorting(current => {
              const active = current[0];
              if (active?.id !== column) {
                return [{ id: column, desc: false }];
              }
              return active.desc ? [] : [{ id: column, desc: true }];
            })
        : undefined,
    };
  };
  return (
    <>
      <div {...mergeStyleProps(themeProps('requests-table-tab'), stylex.props(panelStyles.root))}>
        <div {...stylex.props(styles.toolbar)}>
          <InputGroup.Root
            size='md'
            xstyle={styles.search}
          >
            <InputGroup.Start>
              <Icon name='magnifying-glass' />
            </InputGroup.Start>
            <InputGroup.Input
              ref={searchInput}
              type='search'
              autoComplete='off'
              aria-label={m.search}
              placeholder={m.search}
              value={table.globalFilter}
              onChange={event => table.setGlobalFilter(event.currentTarget.value)}
            />
            {table.globalFilter ? (
              <InputGroup.End>
                <Button
                  aria-label={m.clearSearch}
                  onClick={() => {
                    table.setGlobalFilter('');
                    searchInput.current?.focus();
                  }}
                >
                  <Icon name='x' />
                </Button>
              </InputGroup.End>
            ) : null}
          </InputGroup.Root>
        </div>
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
                      <div {...stylex.props(styles.identity)}>
                        <Avatar.Root
                          size='sm'
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
                        <div {...stylex.props(styles.metadata)}>
                          <Text xstyle={styles.name}>{request.name ?? request.email}</Text>
                          {request.name ? (
                            <Text
                              size='xs'
                              color='foreground-secondary'
                            >
                              {request.email}
                            </Text>
                          ) : null}
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell xstyle={styles.dateCell}>{request.requestedAtLabel}</Table.Cell>
                    {hasActions ? (
                      <Table.Cell align='end'>
                        <RequestActions
                          request={request}
                          onAccept={onAccept ? () => acceptRequest.open(request) : undefined}
                          onDecline={onDecline ? () => declineRequest.open(request) : undefined}
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
        {table.getPageCount() > 1 || (totalCount > 0 && onPageSizeChange) ? (
          <Pagination
            page={table.pagination.pageIndex + 1}
            pageSize={table.pagination.pageSize}
            totalItems={totalCount}
            label={m.pagination}
            pageSizeLabel={m.pageSize}
            previousPageLabel={m.previousPage}
            nextPageLabel={m.nextPage}
            onChange={next => table.setPagination(current => ({ ...current, pageIndex: next - 1 }))}
            onPageSizeChange={
              onPageSizeChange ? next => table.setPagination({ pageIndex: 0, pageSize: next }) : undefined
            }
          />
        ) : null}
      </div>
      {onAccept ? (
        <Confirmation
          handle={acceptRequest}
          color='primary'
          title={request => fill(m.acceptTitle, { name: request.name ?? request.email })}
          description={m.acceptDescription}
          actionLabel={m.accept}
          cancelLabel={m.cancel}
          onConfirm={async request => {
            try {
              await acceptFocus.remove(request.id);
            } catch (error) {
              throw error instanceof Error ? error : new Error(m.acceptError);
            }
          }}
          finalFocus={acceptFocus.finalFocus}
        />
      ) : null}

      {onDecline ? (
        <Confirmation
          handle={declineRequest}
          color='negative'
          title={request => fill(m.declineTitle, { name: request.name ?? request.email })}
          description={m.declineDescription}
          actionLabel={m.decline}
          cancelLabel={m.cancel}
          onConfirm={async request => {
            try {
              await declineFocus.remove(request.id);
            } catch (error) {
              throw error instanceof Error ? error : new Error(m.declineError);
            }
          }}
          finalFocus={declineFocus.finalFocus}
        />
      ) : null}
    </>
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
  onAccept?: () => void;
  onDecline?: () => void;
  registerAcceptTrigger: (id: string) => (element: HTMLButtonElement | null) => void;
  registerDeclineTrigger: (id: string) => (element: HTMLButtonElement | null) => void;
}) {
  const m = useMessages('requestsTableTab');
  const [acceptRef] = useState(() => registerAcceptTrigger(request.id));
  const [declineRef] = useState(() => registerDeclineTrigger(request.id));
  return (
    <div {...stylex.props(styles.actions)}>
      {onDecline ? (
        <SubmitButton
          ref={declineRef}
          type='button'
          size='sm'
          disabled={request.pendingAction === 'accept'}
          isPending={request.pendingAction === 'decline'}
          pendingLabel={m.declining}
          variant='outline'
          color='neutral'
          aria-label={fill(m.declineRequest, { name: request.name ?? request.email })}
          onClick={onDecline}
        >
          {m.decline}
        </SubmitButton>
      ) : null}
      {onAccept ? (
        <SubmitButton
          ref={acceptRef}
          type='button'
          size='sm'
          disabled={request.pendingAction === 'decline'}
          isPending={request.pendingAction === 'accept'}
          pendingLabel={m.accepting}
          aria-label={fill(m.acceptRequest, { name: request.name ?? request.email })}
          onClick={onAccept}
        >
          {m.accept}
        </SubmitButton>
      ) : null}
    </div>
  );
}
