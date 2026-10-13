import * as stylex from '@stylexjs/stylex';
import { useMemo, useRef, useState } from 'react';

import { Destructive } from '../../blocks/destructive';
import { Button } from '../../components/button';
import { EmptyState } from '../../components/empty-state';
import { Menu } from '../../components/menu';
import { Pagination } from '../../components/pagination';
import { Spinner } from '../../components/spinner';
import { Table } from '../../components/table';
import { Text } from '../../components/text';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useListRemovalFocus } from '../../hooks/use-list-removal-focus';
import { useServerDataTable } from '../../hooks/use-server-data-table';
import { fill } from '../../localization';
import { mergeStyleProps, themeProps } from '../../props';
import { truncateWithEndVisible } from '../../utils/truncate-text-with-end-visible';
import { styles } from './api-keys-table.styles';
import type { APIKey, APIKeysTableMessages, APIKeysTableViewProps } from './api-keys-table.types';
import { CreateAPIKeyDialog } from './create-api-key.dialog';

const getRowId = (row: APIKey) => row.id;

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
  onCreate,
  createDialog,
  onRevoke,
  onBulkAction,
  sort,
  onSortChange,
  isLoading,
  isFetching = false,
  isError = false,
  onRetry,
}: APIKeysTableViewProps) {
  const searchInput = useRef<HTMLInputElement>(null);
  const createButton = useRef<HTMLButtonElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: apiKeys.map(getRowId),
    onRemove: onRevoke,
    fallback: () => createButton.current ?? searchInput.current,
  });
  const revokeKey = useMemo(() => Destructive.createHandle<APIKey>(), []);
  const { table, sortHeader, pagination } = useServerDataTable({
    data: apiKeys,
    totalCount,
    getRowId,
    sortableColumns: ['name', 'createdAt', 'lastUsed'],
    sort,
    onSortChange,
    page,
    pageSize,
    onPageChange,
    onPageSizeChange,
    searchValue,
    onSearchChange,
  });
  const columnCount = 3 + Number(Boolean(onRevoke)) + Number(Boolean(onBulkAction));
  const query = searchValue.trim();
  const emptyState = query
    ? { label: m.empty, description: fill(m.emptyDescription, { query }) }
    : { label: m.noKeys, description: m.noKeysDescription };
  return (
    <>
      <div {...mergeStyleProps(themeProps('api-keys-table'), stylex.props(styles.root))}>
        <Table.Toolbar>
          <Table.Search
            ref={searchInput}
            label={m.search}
            clearLabel={m.clearSearch}
            value={table.globalFilter}
            onValueChange={table.setGlobalFilter}
          />
          {onCreate ? (
            <Button
              ref={createButton}
              onClick={onCreate}
            >
              {m.create}
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
              <Table.HeaderCell {...sortHeader('name')}>{m.name}</Table.HeaderCell>
              <Table.HeaderCell {...sortHeader('createdAt')}>{m.createdAt}</Table.HeaderCell>
              <Table.HeaderCell {...sortHeader('lastUsed')}>{m.lastUsed}</Table.HeaderCell>
              {onRevoke ? (
                <Table.HeaderCell align='end'>
                  <VisuallyHidden>{m.actions}</VisuallyHidden>
                </Table.HeaderCell>
              ) : null}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {/* TODO: Replace with a shared Table.Loading built on a Mosaic Skeleton component (skeleton rows sized to the columns). */}
            {isLoading ? (
              <Table.Empty colSpan={columnCount}>
                <span role='status'>
                  <Spinner />
                  <VisuallyHidden>{m.loading}</VisuallyHidden>
                </span>
              </Table.Empty>
            ) : isError ? (
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
            ) : table.rows.length === 0 ? (
              <Table.Empty colSpan={columnCount}>
                <EmptyState.Root>
                  <EmptyState.Icon name='key' />
                  <EmptyState.Label>{emptyState.label}</EmptyState.Label>
                  <EmptyState.Description>{emptyState.description}</EmptyState.Description>
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
                      aria-label={fill(m.select, { name: row.original.name })}
                      checked={row.getIsSelected()}
                      onToggleSelected={row.toggleSelected}
                    />
                  ) : null}
                  <Table.Cell>
                    <APIKeyMetadata
                      messages={m}
                      apiKey={row.original}
                    />
                  </Table.Cell>
                  <Table.Cell noWrap>
                    <Text>{row.original.createdAtLabel}</Text>
                  </Table.Cell>
                  <Table.Cell noWrap>
                    <Text>{row.original.lastUsedAtLabel ?? m.neverUsed}</Text>
                  </Table.Cell>
                  {onRevoke ? (
                    <Table.Cell align='end'>
                      <APIKeyActions
                        messages={m}
                        apiKey={row.original}
                        registerTrigger={removalFocus.registerTrigger}
                        onSelect={apiKey => revokeKey.open(apiKey)}
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
      {createDialog ? <CreateAPIKeyDialog {...createDialog} /> : null}
      {onRevoke ? (
        <Destructive
          handle={revokeKey}
          title={apiKey => fill(m.revokeTitle, { name: apiKey.name })}
          description={m.revokeDescription}
          fieldLabel={apiKey => fill(m.revokeFieldLabel, { name: apiKey.name })}
          confirmationValue={apiKey => apiKey.name}
          actionLabel={m.revoke}
          cancelLabel={m.cancel}
          onDelete={apiKey => removalFocus.remove(apiKey.id)}
          errorFallback={m.revokeError}
          finalFocus={removalFocus.finalFocus}
        />
      ) : null}
    </>
  );
}

function APIKeyMetadata({ messages: m, apiKey }: { messages: APIKeysTableMessages; apiKey: APIKey }) {
  return (
    <div {...stylex.props(styles.metadata)}>
      <Text xstyle={styles.name}>{apiKey.name}</Text>
      <Text
        size='xs'
        color='foreground-secondary'
      >
        {truncateWithEndVisible(apiKey.id, 10, 4)} ·{' '}
        <Text
          render={<span />}
          size='xs'
          color={apiKey.expiresAtLabel === null ? 'foreground-secondary' : 'warning'}
        >
          {apiKey.expiresAtLabel === null
            ? m.neverExpires
            : fill(m.expires, {
                expiresDate: apiKey.expiresAtLabel,
              })}
        </Text>
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
  registerTrigger: (id: string) => (element: HTMLButtonElement | null) => void;
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
