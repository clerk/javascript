import * as stylex from '@stylexjs/stylex';
import { useMemo, useRef, useState } from 'react';

import { Destructive } from '../../blocks/destructive';
import { Button } from '../../components/button';
import { EmptyState } from '../../components/empty-state';
import { Menu } from '../../components/menu';
import { Pagination } from '../../components/pagination';
import { Spinner } from '../../components/spinner';
import type { TableHeaderCellProps } from '../../components/table';
import { Table } from '../../components/table';
import { Text } from '../../components/text';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useListRemovalFocus } from '../../hooks/use-list-removal-focus';
import { useSkeletonWave } from '../../hooks/use-skeleton-wave';
import { fill } from '../../localization';
import { useDataTable } from '../../primitives/hooks';
import { mergeStyleProps, themeProps } from '../../props';
import { skeletonStyles } from '../../styles/skeleton.styles';
import { truncateWithEndVisible } from '../../utils/truncate-text-with-end-visible';
import { styles } from './api-keys-table.styles';
import type { APIKey, APIKeysTableMessages, APIKeysTableSort, APIKeysTableViewProps } from './api-keys-table.types';
import { CreateAPIKeyDialog } from './create-api-key.dialog';

const getRowId = (row: APIKey) => row.id;

const PLACEHOLDER_ROW_COUNT = 3;

export function placeholderAPIKeys(count: number): APIKey[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `placeholder_${index}`,
    name: 'API key',
    createdAtLabel: '',
    expiresAtLabel: null,
    lastUsedAtLabel: null,
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
  const pagination = { pageIndex: page - 1, pageSize };
  const table = useDataTable({
    data: apiKeys,
    totalCount,
    getRowId,
    sorting: sort ? [{ id: sort.column, desc: sort.direction === 'descending' }] : [],
    onSortingChange: onSortChange
      ? update => {
          const next = typeof update === 'function' ? update(table.sorting) : update;
          const active = next[0];
          lastChange.current = 'page';
          table.setRowSelection({});
          onSortChange(
            active && (active.id === 'name' || active.id === 'createdAt' || active.id === 'lastUsed')
              ? { column: active.id, direction: active.desc ? 'descending' : 'ascending' }
              : null,
          );
        }
      : undefined,
    pagination,
    onPaginationChange: update => {
      const next = typeof update === 'function' ? update(pagination) : update;
      lastChange.current = 'page';
      table.setRowSelection({});
      if (next.pageSize !== pageSize) {
        onPageSizeChange?.(next.pageSize);
      }
      onPageChange(next.pageIndex + 1);
    },
    globalFilter: searchValue,
    onGlobalFilterChange: update => {
      lastChange.current = 'search';
      table.setRowSelection({});
      onSearchChange(typeof update === 'function' ? update(searchValue) : update);
    },
  });
  const sortHeader = (column: APIKeysTableSort['column']): Pick<TableHeaderCellProps, 'sort' | 'onSort'> => {
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
        <div {...stylex.props(styles.metadata)}>
          {bones ? (
            <>
              <Bone
                line
                xstyle={styles.nameSkeleton}
              />
              <Bone
                line
                xstyle={styles.metadataSkeleton}
              />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </Table.Cell>
      <Table.Cell noWrap>
        <Text>{apiKey.createdAtLabel}</Text>
      </Table.Cell>
      <Table.Cell noWrap>
        <Text>{apiKey.lastUsedAtLabel ?? m.neverUsed}</Text>
      </Table.Cell>
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
        {!skeleton && (table.getPageCount() > 1 || (totalCount > 0 && onPageSizeChange)) ? (
          <Pagination
            page={table.pagination.pageIndex + 1}
            pageSize={table.pagination.pageSize}
            totalItems={totalCount}
            onPageSizeChange={
              onPageSizeChange ? next => table.setPagination({ pageIndex: 0, pageSize: next }) : undefined
            }
            label={m.pagination}
            pageSizeLabel={m.pageSize}
            previousPageLabel={m.previousPage}
            nextPageLabel={m.nextPage}
            onChange={next => table.setPagination(current => ({ ...current, pageIndex: next - 1 }))}
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
          onDelete={async apiKey => {
            try {
              await removalFocus.remove(apiKey.id);
            } catch (error) {
              throw error instanceof Error ? error : new Error(m.revokeError);
            }
          }}
          finalFocus={removalFocus.finalFocus}
        />
      ) : null}
    </>
  );
}

function Bone({ line = false, xstyle }: { line?: boolean; xstyle: stylex.StyleXStyles }) {
  const wave = useSkeletonWave<HTMLSpanElement>(true);

  return (
    <span
      ref={wave}
      {...stylex.props(skeletonStyles.bone, skeletonStyles.wave, line && skeletonStyles.line, xstyle)}
    />
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
