import * as stylex from '@stylexjs/stylex';
import { useMemo, useRef } from 'react';

import { Confirmation } from '../../blocks/confirmation';
import { ActionMenu } from '../../components/action-menu';
import { Avatar } from '../../components/avatar';
import { Button } from '../../components/button';
import { EmptyState } from '../../components/empty-state';
import { Icon } from '../../components/icon';
import { Item } from '../../components/item';
import { Pagination } from '../../components/pagination';
import { panelStyles } from '../../components/profile';
import { Spinner } from '../../components/spinner';
import { Table, type TableHeaderCellProps } from '../../components/table';
import { VisuallyHidden } from '../../components/visually-hidden';
import { useListRemovalFocus } from '../../hooks/useListRemovalFocus';
import { fill, useMessages } from '../../localization';
import { useDataTable } from '../../primitives/hooks';
import { mergeStyleProps, themeProps } from '../../props';
import type {
  InvitationsTableSort,
  InvitationsTableTabViewProps,
  OrganizationProfileInvitation,
} from './invitations-table-tab.types';

const getRowId = (invitation: OrganizationProfileInvitation) => invitation.id;

export function InvitationsTableTabView({
  invitations,
  onInvite,
  onRevoke,
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
}: InvitationsTableTabViewProps) {
  const m = useMessages('invitationsTableTab');
  const columnCount = 3 + Number(Boolean(onRevoke)) + Number(Boolean(onBulkAction));
  const query = searchValue.trim();
  const searchInput = useRef<HTMLInputElement>(null);
  const inviteButton = useRef<HTMLButtonElement>(null);
  const removalFocus = useListRemovalFocus({
    ids: invitations.map(getRowId),
    onRemove: onRevoke,
    fallback: () => inviteButton.current ?? searchInput.current,
  });
  const revokeDialog = useMemo(() => Confirmation.createHandle<OrganizationProfileInvitation>(), []);
  const pagination = { pageIndex: page - 1, pageSize };
  const table = useDataTable({
    data: invitations,
    totalCount,
    getRowId,
    sorting: sort ? [{ id: sort.column, desc: sort.direction === 'descending' }] : [],
    onSortingChange: onSortChange
      ? update => {
          const next = typeof update === 'function' ? update(table.sorting) : update;
          const active = next[0];
          table.setRowSelection({});
          onSortChange(
            active && (active.id === 'email' || active.id === 'invitedAt' || active.id === 'roleLabel')
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
  const sortHeader = (column: InvitationsTableSort['column']): Pick<TableHeaderCellProps, 'sort' | 'onSort'> => {
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
      <div {...mergeStyleProps(themeProps('invitations-table-tab'), stylex.props(panelStyles.root))}>
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
              <Table.HeaderCell {...sortHeader('invitedAt')}>{m.invitedAt}</Table.HeaderCell>
              <Table.HeaderCell {...sortHeader('roleLabel')}>{m.roleLabel}</Table.HeaderCell>
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
                <EmptyState.Root role='status'>
                  <EmptyState.Icon name='envelope' />
                  <EmptyState.Label>{query ? m.empty : m.noInvitations}</EmptyState.Label>
                  <EmptyState.Description>
                    {query ? fill(m.emptyDescription, { query }) : m.noInvitationsDescription}
                  </EmptyState.Description>
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
                      aria-label={fill(m.select, { name: row.original.email })}
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
                          {row.original.imageUrl ? (
                            <Avatar.Image
                              src={row.original.imageUrl}
                              alt=''
                            />
                          ) : null}
                          <Avatar.Fallback />
                        </Avatar.Root>
                      </Item.Media>
                      <Item.Content>
                        <Item.Label>{row.original.email}</Item.Label>
                      </Item.Content>
                    </Item.Root>
                  </Table.Cell>
                  <Table.Cell noWrap>{row.original.invitedAtLabel}</Table.Cell>
                  <Table.Cell>{row.original.roleLabel}</Table.Cell>
                  {onRevoke ? (
                    <Table.Cell align='end'>
                      <ActionMenu
                        label={fill(m.manage, { name: row.original.email })}
                        triggerRef={removalFocus.registerTrigger(row.original.id)}
                        actions={[
                          {
                            label: m.revoke,
                            color: 'negative',
                            onClick: () => revokeDialog.open(row.original),
                          },
                        ]}
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
      {onRevoke ? (
        <Confirmation
          handle={revokeDialog}
          title={invitation => fill(m.revokeTitle, { name: invitation.email })}
          description={m.revokeDescription}
          actionLabel={m.revoke}
          cancelLabel={m.cancel}
          onConfirm={async invitation => {
            try {
              await removalFocus.remove(invitation.id);
            } catch (error) {
              throw error instanceof Error && error.message.trim() ? error : new Error(m.revokeError);
            }
          }}
          finalFocus={removalFocus.finalFocus}
        />
      ) : null}
    </>
  );
}
