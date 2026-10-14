import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';
import { useRef, useState } from 'react';

import { Destructive } from '../../blocks/destructive';
import { Button } from '../../components/button';
import { EmptyState } from '../../components/empty-state';
import { Menu } from '../../components/menu';
import { Pagination } from '../../components/pagination';
import { Skeleton } from '../../components/skeleton';
import { Spinner } from '../../components/spinner';
import { Table } from '../../components/table';
import { Text } from '../../components/text';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useServerDataTable } from '../../hooks/use-server-data-table';
import { fill } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import { truncateWithEndVisible } from '../../utils/truncate-text-with-end-visible';
import { styles } from './api-keys-table.styles';
import type { APIKey, APIKeysTableMessages, APIKeysTableSort, APIKeysTableViewProps } from './api-keys-table.types';
import { CreateAPIKeyDialog } from './create-api-key.dialog';

const getRowId = (row: APIKey) => row.id;

const PLACEHOLDER_ROW_COUNT = 3;

const PLACEHOLDER_NAMES = ['Production server', 'CI pipeline', 'Analytics'];

export function placeholderAPIKeys(count: number): APIKey[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `ak_placeholder${index}`,
    name: PLACEHOLDER_NAMES[index % PLACEHOLDER_NAMES.length] ?? '',
    createdAtLabel: 'Jan 5, 2026',
    expiresAtLabel: null,
    lastUsedAtLabel: '2 minutes ago',
  }));
}

export function APIKeysTableView({
  messages: m,
  apiKeys,
  totalCount,
  page,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  searchValue,
  onSearchChange,
  searchInputRef,
  createButtonRef,
  onCreate,
  createDialog,
  registerTrigger,
  revoke,
  finalFocus,
  onBulkAction,
  sort,
  onSortChange,
  isLoading,
  isFetching = false,
  isError = false,
  onRetry,
  skeleton = false,
  refetchSkeleton = false,
}: APIKeysTableViewProps) {
  const lastChange = useRef<'page' | 'search'>('page');
  const { table, sortHeader, pagination } = useServerDataTable({
    data: apiKeys,
    totalCount,
    getRowId,
    sortableColumns: ['name', 'createdAt', 'lastUsed'],
    sort,
    onSortChange: onSortChange
      ? next => {
          lastChange.current = 'page';
          onSortChange(next);
        }
      : undefined,
    page,
    pageSize,
    onPageChange: next => {
      lastChange.current = 'page';
      onPageChange(next);
    },
    onPageSizeChange,
    searchValue,
    onSearchChange: value => {
      lastChange.current = 'search';
      onSearchChange(value);
    },
  });
  const columnCount = 3 + Number(Boolean(revoke)) + Number(Boolean(onBulkAction));
  const headerSort = (column: APIKeysTableSort['column']) => (skeleton ? {} : sortHeader(column));
  const rowsSkeleton = refetchSkeleton && isFetching && !skeleton && !isLoading;
  const remaining = totalCount - (page - 1) * pageSize;
  const placeholderRows = placeholderAPIKeys(
    lastChange.current === 'page' && remaining > 0 ? Math.min(pageSize, remaining) : PLACEHOLDER_ROW_COUNT,
  );
  const renderRow = (apiKey: APIKey, row?: (typeof table.rows)[number]) => (
    <Table.Row
      key={apiKey.id}
      selected={Boolean(onBulkAction) && Boolean(row?.getIsSelected())}
    >
      {onBulkAction ? (
        <Table.SelectCell
          aria-label={fill(m.select, { name: apiKey.name })}
          checked={Boolean(row?.getIsSelected())}
          onToggleSelected={row?.toggleSelected}
        />
      ) : null}
      <Table.Cell>
        <APIKeyMetadata
          messages={m}
          apiKey={apiKey}
        />
      </Table.Cell>
      <Table.Cell noWrap>
        <Skeleton>{apiKey.createdAtLabel}</Skeleton>
      </Table.Cell>
      <Table.Cell noWrap>
        <Skeleton>{apiKey.lastUsedAtLabel ?? m.neverUsed}</Skeleton>
      </Table.Cell>
      {revoke ? (
        <Table.Cell align='end'>
          <Skeleton visible={false}>
            <APIKeyActions
              messages={m}
              apiKey={apiKey}
              registerTrigger={registerTrigger}
              onSelect={key => revoke.open(key)}
            />
          </Skeleton>
        </Table.Cell>
      ) : null}
    </Table.Row>
  );
  const query = searchValue.trim();
  const emptyState = query
    ? { label: m.empty, description: fill(m.emptyDescription, { query }) }
    : { label: m.noKeys, description: m.noKeysDescription };
  return (
    <>
      <div {...mergeStyleProps(themeProps('api-keys-table', { skeleton }), stylex.props(styles.root))}>
        <VisuallyHidden role='status'>{skeleton || rowsSkeleton || isLoading ? m.loading : m.loaded}</VisuallyHidden>
        <Table.Toolbar>
          <Skeleton show={skeleton}>
            <Table.Search
              ref={searchInputRef}
              label={m.search}
              clearLabel={m.clearSearch}
              value={table.globalFilter}
              onValueChange={table.setGlobalFilter}
            />
          </Skeleton>
          {onCreate ? (
            <Skeleton show={skeleton}>
              <Button
                ref={createButtonRef}
                onClick={onCreate}
              >
                {m.create}
              </Button>
            </Skeleton>
          ) : null}
        </Table.Toolbar>
        <Table.Root
          skeleton={skeleton}
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
              <Table.HeaderCell {...headerSort('name')}>
                <Skeleton>{m.name}</Skeleton>
              </Table.HeaderCell>
              <Table.HeaderCell {...headerSort('createdAt')}>
                <Skeleton>{m.createdAt}</Skeleton>
              </Table.HeaderCell>
              <Table.HeaderCell {...headerSort('lastUsed')}>
                <Skeleton>{m.lastUsed}</Skeleton>
              </Table.HeaderCell>
              {revoke ? (
                <Table.HeaderCell align='end'>
                  <VisuallyHidden>{m.actions}</VisuallyHidden>
                </Table.HeaderCell>
              ) : null}
            </Table.Row>
          </Table.Header>
          <Table.Body skeleton={rowsSkeleton || undefined}>
            {/* TODO: Replace with a shared Table.Loading built on a Mosaic Skeleton component (skeleton rows sized to the columns). */}
            {rowsSkeleton ? (
              placeholderRows.map(apiKey => renderRow(apiKey))
            ) : isLoading && !skeleton ? (
              <Table.Empty colSpan={columnCount}>
                <Spinner />
              </Table.Empty>
            ) : isError && !skeleton ? (
              <Table.Empty colSpan={columnCount}>
                <EmptyState.Root>
                  <EmptyState.Icon name='exclamation-circle' />
                  <EmptyState.Label>{m.loadError}</EmptyState.Label>
                  <EmptyState.Description>{m.loadErrorDescription}</EmptyState.Description>
                  {onRetry ? (
                    <EmptyState.Actions>
                      <Button
                        variant='outline'
                        color='neutral'
                        onClick={onRetry}
                      >
                        {m.retry}
                      </Button>
                    </EmptyState.Actions>
                  ) : null}
                </EmptyState.Root>
              </Table.Empty>
            ) : table.rows.length === 0 && !skeleton ? (
              <Table.Empty colSpan={columnCount}>
                <EmptyState.Root>
                  <EmptyState.Icon name='key' />
                  <EmptyState.Label>{emptyState.label}</EmptyState.Label>
                  <EmptyState.Description>{emptyState.description}</EmptyState.Description>
                </EmptyState.Root>
              </Table.Empty>
            ) : (
              table.rows.map(row => renderRow(row.original, row))
            )}
          </Table.Body>
        </Table.Root>
        {pagination && !skeleton ? (
          <Pagination
            {...pagination}
            label={m.pagination}
            pageSizeLabel={m.pageSize}
            previousPageLabel={m.previousPage}
            nextPageLabel={m.nextPage}
          />
        ) : null}
      </div>
      {createDialog && !skeleton ? <CreateAPIKeyDialog {...createDialog} /> : null}
      {revoke && !skeleton ? (
        <Destructive
          controller={revoke}
          title={apiKey => fill(m.revokeTitle, { name: apiKey.name })}
          description={m.revokeDescription}
          fieldLabel={apiKey => fill(m.revokeFieldLabel, { name: apiKey.name })}
          confirmationValue={apiKey => apiKey.name}
          actionLabel={m.revoke}
          cancelLabel={m.cancel}
          finalFocus={finalFocus}
        />
      ) : null}
    </>
  );
}

function APIKeyMetadata({ messages: m, apiKey }: { messages: APIKeysTableMessages; apiKey: APIKey }) {
  return (
    <div {...stylex.props(styles.metadata)}>
      <Text xstyle={styles.name}>
        <Skeleton>{apiKey.name}</Skeleton>
      </Text>
      <Text
        size='xs'
        color='foreground-secondary'
      >
        <Skeleton>
          {truncateWithEndVisible(apiKey.id, 10, 4)} ·{' '}
          {apiKey.expiresAtLabel === null ? (
            m.neverExpires
          ) : (
            <Text
              render={<span />}
              size='xs'
              color='warning'
            >
              {fill(m.expires, { expiresDate: apiKey.expiresAtLabel })}
            </Text>
          )}
        </Skeleton>
      </Text>
    </div>
  );
}

function APIKeyActions({
  messages: m,
  apiKey,
  registerTrigger,
  onSelect,
}: {
  messages: APIKeysTableMessages;
  apiKey: APIKey;
  registerTrigger: (id: string) => Ref<HTMLButtonElement>;
  onSelect: (key: APIKey) => void;
}) {
  const [triggerRef] = useState(() => registerTrigger(apiKey.id));
  return (
    <Menu.Root placement='bottom-end'>
      <Menu.Trigger
        ref={triggerRef}
        aria-label={fill(m.manage, { name: apiKey.name })}
      />
      <Menu.Popup>
        <Menu.Item
          color='negative'
          label={m.revoke}
          onClick={() => onSelect(apiKey)}
        >
          <Menu.Label>{m.revoke}</Menu.Label>
        </Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  );
}
