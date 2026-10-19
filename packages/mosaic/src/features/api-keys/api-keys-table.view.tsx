import { inertProps } from '@clerk/shared/inert';
import * as stylex from '@stylexjs/stylex';
import type { Ref } from 'react';
import { useState } from 'react';

import { Destructive } from '../../blocks/destructive';
import { Button } from '../../components/button';
import { EmptyState } from '../../components/empty-state';
import { Menu } from '../../components/menu';
import { Pagination } from '../../components/pagination';
import { Skeleton, SkeletonContext } from '../../components/skeleton';
import { Table } from '../../components/table';
import { Text } from '../../components/text';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useServerDataTable } from '../../hooks/use-server-data-table';
import { ExclamationCircle } from '../../icons/glyphs/exclamation-circle';
import { Key } from '../../icons/glyphs/key';
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
}: APIKeysTableViewProps) {
  const { table, sortHeader, pagination } = useServerDataTable({
    data: isLoading ? PLACEHOLDER_API_KEYS : apiKeys,
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
  const columnCount = 3 + Number(Boolean(revoke)) + Number(Boolean(onBulkAction));
  const query = searchValue.trim();
  const emptyState = query
    ? { label: m.empty, description: fill(m.emptyDescription, { query }) }
    : { label: m.noKeys, description: m.noKeysDescription };
  return (
    <>
      <div {...mergeStyleProps(themeProps('api-keys-table'), stylex.props(styles.root))}>
        <VisuallyHidden role='status'>{isLoading ? m.loading : m.loaded}</VisuallyHidden>
        <Table.Toolbar>
          <Table.Search
            ref={searchInputRef}
            label={m.search}
            clearLabel={m.clearSearch}
            value={table.globalFilter}
            onValueChange={table.setGlobalFilter}
          />
          {onCreate ? (
            <Button
              ref={createButtonRef}
              onClick={onCreate}
            >
              {m.create}
            </Button>
          ) : null}
        </Table.Toolbar>
        <Table.Root
          layout='fixed'
          aria-label={m.title}
          aria-busy={isLoading || isFetching}
        >
          <Table.ColumnGroup>
            {onBulkAction ? <Table.Column /> : null}
            <Table.Column />
            <Table.Column width='9rem' />
            <Table.Column width='9rem' />
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
              <Table.HeaderCell {...sortHeader('name')}>{m.name}</Table.HeaderCell>
              <Table.HeaderCell {...sortHeader('createdAt')}>{m.createdAt}</Table.HeaderCell>
              <Table.HeaderCell {...sortHeader('lastUsed')}>{m.lastUsed}</Table.HeaderCell>
              {revoke ? (
                <Table.HeaderCell align='end'>
                  <VisuallyHidden>{m.actions}</VisuallyHidden>
                </Table.HeaderCell>
              ) : null}
            </Table.Row>
          </Table.Header>
          <SkeletonContext.Provider value={isLoading}>
            <Table.Body {...(isLoading ? { 'aria-hidden': true, ...inertProps(true) } : {})}>
              {!isLoading && isError ? (
                <Table.Empty colSpan={columnCount}>
                  <EmptyState.Root>
                    <EmptyState.Icon glyph={ExclamationCircle} />
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
                    <EmptyState.Icon glyph={Key} />
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
                        skeleton={isLoading}
                      />
                    </Table.Cell>
                    <Table.Cell noWrap>
                      <Text>
                        <Skeleton>{row.original.createdAtLabel}</Skeleton>
                      </Text>
                    </Table.Cell>
                    <Table.Cell noWrap>
                      <Text>
                        <Skeleton>{row.original.lastUsedAtLabel ?? m.neverUsed}</Skeleton>
                      </Text>
                    </Table.Cell>
                    {revoke ? (
                      <Table.Cell align='end'>
                        <Skeleton visible={false}>
                          <APIKeyActions
                            messages={m}
                            apiKey={row.original}
                            registerTrigger={registerTrigger}
                            onSelect={apiKey => revoke.open(apiKey)}
                          />
                        </Skeleton>
                      </Table.Cell>
                    ) : null}
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </SkeletonContext.Provider>
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
      {revoke ? (
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

function APIKeyMetadata({
  messages: m,
  apiKey,
  skeleton,
}: {
  messages: APIKeysTableMessages;
  apiKey: APIKey;
  skeleton: boolean;
}) {
  const id = truncateWithEndVisible(apiKey.id, 10, 4);
  const expiry =
    apiKey.expiresAtLabel === null
      ? m.neverExpires
      : fill(m.expires, {
          expiresDate: apiKey.expiresAtLabel,
        });
  return (
    <div {...stylex.props(styles.metadata)}>
      <Text xstyle={styles.name}>
        <Skeleton>{apiKey.name}</Skeleton>
      </Text>
      <Text
        size='xs'
        color='foreground-secondary'
      >
        {skeleton ? (
          <Skeleton>{`${id} · ${expiry}`}</Skeleton>
        ) : (
          <>
            {id} ·{' '}
            <Text
              render={<span />}
              size='xs'
              color={apiKey.expiresAtLabel === null ? 'foreground-secondary' : 'warning'}
            >
              {expiry}
            </Text>
          </>
        )}
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

const PLACEHOLDER_API_KEYS: APIKey[] = [
  {
    id: 'ak_placeholder0000000000000001',
    name: 'Production',
    createdAtLabel: 'Mar 12, 2026',
    expiresAtLabel: 'Mar 12, 2027',
    lastUsedAtLabel: '5 minutes ago',
  },
  {
    id: 'ak_placeholder0000000000000002',
    name: 'Deploy script',
    createdAtLabel: 'Mar 18, 2026',
    expiresAtLabel: null,
    lastUsedAtLabel: null,
  },
  {
    id: 'ak_placeholder0000000000000003',
    name: 'Reporting',
    createdAtLabel: 'Apr 2, 2026',
    expiresAtLabel: null,
    lastUsedAtLabel: '3 hours ago',
  },
];
