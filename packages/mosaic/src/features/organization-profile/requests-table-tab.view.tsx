import * as stylex from '@stylexjs/stylex';
import { useRef } from 'react';

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
  const table = useDataTable({ data: requests, getRowId, totalCount });
  const sortHeader = (column: RequestsTableSort['column']): Pick<TableHeaderCellProps, 'sort' | 'onSort'> => ({
    sort: sort?.column === column ? sort.direction : 'none',
    onSort: onSortChange
      ? () => {
          table.setRowSelection({});
          onSortChange(
            sort?.column !== column
              ? { column, direction: 'ascending' }
              : sort.direction === 'ascending'
                ? { column, direction: 'descending' }
                : null,
          );
        }
      : undefined,
  });
  return (
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
            value={searchValue}
            onChange={event => {
              table.setRowSelection({});
              onSearchChange(event.currentTarget.value);
            }}
          />
          {searchValue ? (
            <InputGroup.End>
              <Button
                aria-label={m.clearSearch}
                onClick={() => {
                  table.setRowSelection({});
                  onSearchChange('');
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
          {isLoading ? (
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
                      <div {...stylex.props(styles.actions)}>
                        {onDecline ? (
                          <SubmitButton
                            type='button'
                            size='sm'
                            disabled={request.pendingAction === 'accept'}
                            isPending={request.pendingAction === 'decline'}
                            pendingLabel={m.declining}
                            variant='outline'
                            color='neutral'
                            aria-label={fill(m.declineRequest, { name: request.name ?? request.email })}
                            onClick={() => onDecline(request.id)}
                          >
                            {m.decline}
                          </SubmitButton>
                        ) : null}
                        {onAccept ? (
                          <SubmitButton
                            type='button'
                            size='sm'
                            disabled={request.pendingAction === 'decline'}
                            isPending={request.pendingAction === 'accept'}
                            pendingLabel={m.accepting}
                            aria-label={fill(m.acceptRequest, { name: request.name ?? request.email })}
                            onClick={() => onAccept(request.id)}
                          >
                            {m.accept}
                          </SubmitButton>
                        ) : null}
                      </div>
                    </Table.Cell>
                  ) : null}
                </Table.Row>
              );
            })
          )}
        </Table.Body>
      </Table.Root>
      {totalCount > pageSize || (totalCount > 0 && onPageSizeChange) ? (
        <Pagination
          page={page}
          pageSize={pageSize}
          totalItems={totalCount}
          label={m.pagination}
          pageSizeLabel={m.pageSize}
          previousPageLabel={m.previousPage}
          nextPageLabel={m.nextPage}
          onChange={next => {
            table.setRowSelection({});
            onPageChange(next);
          }}
          onPageSizeChange={
            onPageSizeChange
              ? next => {
                  table.setRowSelection({});
                  onPageSizeChange(next);
                  onPageChange(1);
                }
              : undefined
          }
        />
      ) : null}
    </div>
  );
}
