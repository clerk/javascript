import * as stylex from '@stylexjs/stylex';
import { useMemo, useRef } from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { Button } from '../../components/button';
import { EmptyState } from '../../components/empty-state';
import { Icon } from '../../components/icon';
import { InputGroup } from '../../components/input-group';
import { Menu } from '../../components/menu';
import { Pagination } from '../../components/pagination';
import { Profile } from '../../components/profile';
import { Spinner } from '../../components/spinner';
import type { TableHeaderCellProps } from '../../components/table';
import { Table } from '../../components/table';
import { Text } from '../../components/text';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useListRemovalFocus } from '../../hooks/useListRemovalFocus';
import { fill, useMessages } from '../../localization';
import { useDataTable } from '../../primitives/hooks';
import { mergeStyleProps, themeProps } from '../../props';
import { truncateWithEndVisible } from '../../utils/truncateTextWithEndVisible';
import { styles } from './organization-profile-api-keys-panel.styles';
import type {
  OrganizationProfileAPIKey,
  OrganizationProfileAPIKeySort,
  OrganizationProfileApiKeysPanelViewProps,
} from './organization-profile-api-keys-panel.types';
import { OrganizationProfileCreateAPIKeyDialog } from './organization-profile-create-api-key.dialog';

const getRowId = (row: OrganizationProfileAPIKey) => row.id;

export function OrganizationProfileApiKeysPanelView({
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
}: OrganizationProfileApiKeysPanelViewProps) {
  const m = useMessages('organizationProfileApiKeysPanel');
  const searchInput = useRef<HTMLInputElement>(null);
  const createButton = useRef<HTMLButtonElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: apiKeys.map(getRowId),
    onRemove: onRevoke,
    fallback: () => createButton.current ?? searchInput.current,
  });
  const revokeKey = useMemo(() => Confirmation.createHandle<OrganizationProfileAPIKey>(), []);
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
  const sortHeader = (
    column: OrganizationProfileAPIKeySort['column'],
  ): Pick<TableHeaderCellProps, 'sort' | 'onSort'> => {
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
  const query = searchValue.trim();
  const emptyState = query
    ? { label: m.empty, description: fill(m.emptyDescription, { query }) }
    : { label: m.noKeys, description: m.noKeysDescription };
  return (
    <>
      <div {...mergeStyleProps(themeProps('organization-profile-api-keys-panel'), stylex.props(styles.root))}>
        <Profile.PageTitle>{m.title}</Profile.PageTitle>
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
              autoComplete='off'
              type='search'
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
          {onCreate ? (
            <Button
              ref={createButton}
              onClick={onCreate}
            >
              {m.create}
            </Button>
          ) : null}
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
                    <div {...stylex.props(styles.metadata)}>
                      <Text xstyle={styles.name}>{row.original.name}</Text>
                      <Text
                        size='xs'
                        color='foreground-secondary'
                      >
                        {truncateWithEndVisible(row.original.id, 10, 4)} ·{' '}
                        <Text
                          render={<span />}
                          size='xs'
                          color={row.original.expiresAtLabel === null ? 'foreground-secondary' : 'warning'}
                        >
                          {row.original.expiresAtLabel === null
                            ? m.neverExpires
                            : fill(m.expires, {
                                expiresDate: row.original.expiresAtLabel,
                              })}
                        </Text>
                      </Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell xstyle={styles.dateCell}>
                    <Text>{row.original.createdAtLabel}</Text>
                  </Table.Cell>
                  <Table.Cell xstyle={styles.dateCell}>
                    <Text>{row.original.lastUsedAtLabel ?? m.neverUsed}</Text>
                  </Table.Cell>
                  {onRevoke ? (
                    <Table.Cell align='end'>
                      <APIKeyActions
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
        {table.getPageCount() > 1 || (totalCount > 0 && onPageSizeChange) ? (
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
      {createDialog ? <OrganizationProfileCreateAPIKeyDialog {...createDialog} /> : null}
      {onRevoke ? (
        <Confirmation
          handle={revokeKey}
          title={apiKey => fill(m.revokeTitle, { name: apiKey.name })}
          description={m.revokeDescription}
          actionLabel={m.revoke}
          cancelLabel={m.cancel}
          onConfirm={async apiKey => {
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

function APIKeyActions({
  apiKey,
  registerTrigger,
  onSelect,
}: {
  apiKey: OrganizationProfileAPIKey;
  registerTrigger: (id: string) => (element: HTMLButtonElement | null) => void;
  onSelect: (key: OrganizationProfileAPIKey) => void;
}) {
  const m = useMessages('organizationProfileApiKeysPanel');
  const triggerRef = useRef(registerTrigger(apiKey.id));
  return (
    <Menu.Root placement='bottom-end'>
      <Menu.Trigger
        ref={triggerRef.current}
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
