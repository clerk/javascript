import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
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
import { skeletonStyles } from '../../styles/skeleton.styles';
import { SkeletonText } from '../../utils/skeleton-text';
import { truncateWithEndVisible } from '../../utils/truncate-text-with-end-visible';
import { styles } from './api-keys-table.styles';
import type { APIKey, APIKeysTableMessages, APIKeysTableViewProps } from './api-keys-table.types';
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
  skeleton = false,
  refetchSkeleton = false,
}: APIKeysTableViewProps) {
  const lastChange = useRef<'page' | 'search'>('page');
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
  const columnCount = 3 + Number(Boolean(onRevoke)) + Number(Boolean(onBulkAction));
  const rowsSkeleton = refetchSkeleton && isFetching && !skeleton && !isLoading;
  const remaining = totalCount - (page - 1) * pageSize;
  const placeholderRows = placeholderAPIKeys(
    lastChange.current === 'page' && remaining > 0 ? Math.min(pageSize, remaining) : PLACEHOLDER_ROW_COUNT,
  );
  const query = searchValue.trim();
  const bones = skeleton || rowsSkeleton;
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
      <Table.Cell skeleton={false}>
        <APIKeyMetadata
          messages={m}
          apiKey={apiKey}
          skeleton={bones}
        />
      </Table.Cell>
      <Table.Cell noWrap>{apiKey.createdAtLabel}</Table.Cell>
      <Table.Cell noWrap>{apiKey.lastUsedAtLabel ?? m.neverUsed}</Table.Cell>
      {onRevoke ? (
        <Table.Cell
          align='end'
          skeleton={false}
          xstyle={bones && styles.actionsSkeleton}
        >
          {bones ? null : (
            <APIKeyActions
              messages={m}
              apiKey={apiKey}
              registerTrigger={removalFocus.registerTrigger}
              onSelect={key => revokeKey.open(key)}
            />
          )}
        </Table.Cell>
      ) : null}
    </Table.Row>
  );
  const emptyState = query
    ? { label: m.empty, description: fill(m.emptyDescription, { query }) }
    : { label: m.noKeys, description: m.noKeysDescription };
  return (
    <>
      <div {...mergeStyleProps(themeProps('api-keys-table', { skeleton }), stylex.props(styles.root))}>
        {skeleton || rowsSkeleton ? <VisuallyHidden role='status'>{m.loading}</VisuallyHidden> : null}
        {skeleton ? (
          <Table.Toolbar aria-hidden>
            <Bone xstyle={styles.searchSkeleton} />
            {onCreate ? <Bone xstyle={styles.createSkeleton} /> : null}
          </Table.Toolbar>
        ) : (
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
        )}
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
              <Table.HeaderCell {...sortHeader('name')}>{m.name}</Table.HeaderCell>
              <Table.HeaderCell {...sortHeader('createdAt')}>{m.createdAt}</Table.HeaderCell>
              <Table.HeaderCell {...sortHeader('lastUsed')}>{m.lastUsed}</Table.HeaderCell>
              {onRevoke ? (
                <Table.HeaderCell
                  align='end'
                  skeleton={false}
                >
                  <VisuallyHidden>{m.actions}</VisuallyHidden>
                </Table.HeaderCell>
              ) : null}
            </Table.Row>
          </Table.Header>
          <Table.Body skeleton={rowsSkeleton || undefined}>
            {rowsSkeleton ? (
              placeholderRows.map(apiKey => renderRow(apiKey))
            ) : isLoading && !skeleton ? (
              <Table.Empty colSpan={columnCount}>
                <span role='status'>
                  <Spinner />
                  <VisuallyHidden>{m.loading}</VisuallyHidden>
                </span>
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
      {onRevoke && !skeleton ? (
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

function Bone({ xstyle }: { xstyle: stylex.StyleXStyles }) {
  return <span {...stylex.props(skeletonStyles.bone, skeletonStyles.shimmer, xstyle)} />;
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
  const text = (content: ReactNode) => (skeleton ? <SkeletonText>{content}</SkeletonText> : content);
  return (
    <div {...stylex.props(styles.metadata)}>
      <Text xstyle={styles.name}>{text(apiKey.name)}</Text>
      <Text
        size='xs'
        color='foreground-secondary'
      >
        {text(
          <>
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
          </>,
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
